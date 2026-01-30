import { Daytona, Sandbox, CreateSandboxFromSnapshotParams } from '@daytonaio/sdk';
import {
  DEFAULT_AUTO_STOP_INTERVAL,
  DEFAULT_AUTO_ARCHIVE_INTERVAL,
  DEFAULT_EXECUTION_TIMEOUT,
  DEFAULT_CREATE_TIMEOUT,
  DEFAULT_RETRY_CONFIG,
  CODERABBIT_INSTALL_CMD,
  CODERABBIT_INSTALL_TIMEOUT,
} from './constants';

// ============================================================================
// Type Definitions
// ============================================================================

export interface WorkspaceConfig {
  language: 'python' | 'typescript' | 'javascript';
  id: string;
  name?: string;
  labels?: Record<string, string>;
}

export interface CreateWorkspaceOptions {
  language: 'python' | 'typescript' | 'javascript';
  networkAllowList?: string;
  autoStopInterval?: number;
  autoArchiveInterval?: number;
  labels?: Record<string, string>;
  envVars?: Record<string, string>;
  installCodeRabbit?: boolean;
  timeout?: number;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  artifacts?: {
    charts?: unknown[];
  };
}

export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

export interface FileInfo {
  name: string;
  path: string;
  size: number;
  isDirectory: boolean;
  modTime?: string;
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validates and sanitizes a file path to prevent directory traversal attacks.
 * Allows absolute paths since they are valid within an isolated sandbox environment.
 * @throws Error if the path is invalid or potentially malicious
 */
function sanitizePath(path: string): string {
  if (!path || typeof path !== 'string') {
    throw new Error('Invalid path: path cannot be empty');
  }

  // Check for directory traversal attempts
  if (path.includes('..')) {
    throw new Error('Invalid path: directory traversal sequences (..) are not allowed');
  }

  // Check for null bytes (security issue)
  if (path.includes('\0')) {
    throw new Error('Invalid path: null bytes are not allowed');
  }

  // Allow alphanumeric, underscore, dash, dot, and forward slash
  // Absolute paths starting with / are allowed in sandbox environments
  // BUT they must be within allowed directories to prevent system access
  const ALLOWED_PREFIXES = ['/home', '/workspaces', '/tmp', '/app', '/usr/src/app'];
  
  const validPathPattern = /^[a-zA-Z0-9_\-./]+$/;
  if (!validPathPattern.test(path)) {
    throw new Error('Invalid path: only alphanumeric characters, underscore, dash, dot, and forward slash are allowed');
  }

  if (path.startsWith('/')) {
    const isAllowed = ALLOWED_PREFIXES.some(prefix => path.startsWith(prefix));
    if (!isAllowed) {
      throw new Error(`Invalid path: Absolute paths must start with: ${ALLOWED_PREFIXES.join(', ')}`);
    }
  }

  return path;
}

/**
 * Validates and sanitizes a package name to prevent command injection.
 * @throws Error if the package name is invalid or potentially malicious
 */
function sanitizePackageName(packageName: string): string {
  if (!packageName || packageName.trim().length === 0) {
    throw new Error('Invalid package name: name cannot be empty');
  }

  if (packageName.length > 100) {
    throw new Error('Invalid package name: name exceeds maximum length of 100 characters');
  }

  const validPackagePattern = /^[a-zA-Z0-9_\-@/.]+$/;
  if (!validPackagePattern.test(packageName)) {
    throw new Error('Invalid package name: only alphanumeric characters, dash, underscore, @, /, and dot are allowed');
  }

  return packageName;
}

// ============================================================================
// Daytona Service Class
// ============================================================================

export class DaytonaService {
  private daytona: Daytona | null = null;
  private workspaceCache: Map<string, { sandbox: Sandbox; timestamp: number }> = new Map();
  private readonly CACHE_TTL_MS = 30000; // 30 seconds

  constructor() {
    // Daytona client initialization is deferred until first real use
    // to allow mock mode to work without credentials
  }

  // ==========================================================================
  // Private Utility Methods
  // ==========================================================================

  private isMockMode(): boolean {
    return process.env.NEXT_PUBLIC_USE_MOCK_DAYTONA === 'true';
  }

  private getDaytona(): Daytona {
    if (this.daytona) {
      return this.daytona;
    }

    const apiKey = process.env.DAYTONA_API_KEY;
    const apiUrl = process.env.DAYTONA_API_URL;

    if (!apiKey || !apiUrl) {
      throw new Error('Daytona credentials missing: DAYTONA_API_KEY and DAYTONA_API_URL must be set');
    }

    this.daytona = new Daytona({
      apiKey: apiKey,
      apiUrl: apiUrl,
    });

    return this.daytona;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private isNonRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes('unauthorized') ||
        message.includes('forbidden') ||
        message.includes('invalid') ||
        (message.includes('not found') && !message.includes('temporarily'))
      );
    }
    return false;
  }

  private async withRetry<T>(
    operation: () => Promise<T>,
    config: RetryConfig = DEFAULT_RETRY_CONFIG,
    operationName: string = 'operation'
  ): Promise<T> {
    let lastError: Error | undefined;
    let delay = config.initialDelayMs;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (this.isNonRetryableError(error)) {
          throw lastError;
        }

        if (attempt < config.maxAttempts) {
          console.warn(
            `${operationName} failed (attempt ${attempt}/${config.maxAttempts}): ${lastError.message}. Retrying in ${delay}ms...`
          );
          await this.sleep(delay);
          delay = Math.min(delay * config.backoffMultiplier, config.maxDelayMs);
        }
      }
    }

    throw new Error(
      `${operationName} failed after ${config.maxAttempts} attempts: ${lastError?.message}`
    );
  }

  private async getWorkspace(workspaceId: string): Promise<Sandbox> {
    const cached = this.workspaceCache.get(workspaceId);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < this.CACHE_TTL_MS) {
      return cached.sandbox;
    }

    const sandbox = await this.getDaytona().get(workspaceId);
    this.workspaceCache.set(workspaceId, { sandbox, timestamp: now });
    return sandbox;
  }

  private invalidateCache(workspaceId: string): void {
    this.workspaceCache.delete(workspaceId);
  }

  // ==========================================================================
  // Workspace Management
  // ==========================================================================

  async createWorkspace(options: CreateWorkspaceOptions): Promise<WorkspaceConfig> {
    if (this.isMockMode()) {
      console.log('Mocking Daytona createWorkspace');
      await this.sleep(1500);
      return {
        id: 'mock-ws-123',
        language: options.language,
        labels: options.labels,
      };
    }

    return this.withRetry(async () => {
      const createParams: CreateSandboxFromSnapshotParams = {
        language: options.language,
        networkAllowList: options.networkAllowList,
        autoStopInterval: options.autoStopInterval ?? DEFAULT_AUTO_STOP_INTERVAL,
        autoArchiveInterval: options.autoArchiveInterval ?? DEFAULT_AUTO_ARCHIVE_INTERVAL,
        labels: options.labels,
        envVars: options.envVars,
      };

      const workspace = await this.getDaytona().create(
        createParams,
        { timeout: options.timeout ?? DEFAULT_CREATE_TIMEOUT }
      );

      // Optionally install CodeRabbit CLI
      if (options.installCodeRabbit !== false) {
        try {
          console.log(`Installing CodeRabbit CLI in workspace ${workspace.id}...`);
          const timeoutSec = Math.ceil(CODERABBIT_INSTALL_TIMEOUT / 1000);
          const result = await workspace.process.executeCommand(
            CODERABBIT_INSTALL_CMD,
            undefined,
            undefined,
            timeoutSec
          );
          if (result.exitCode !== 0) {
            console.warn(`CodeRabbit CLI installation returned non-zero exit code: ${result.exitCode}`);
          }
        } catch (error) {
          console.warn('CodeRabbit CLI installation failed (non-fatal):', error);
          // Don't fail workspace creation if CodeRabbit install fails
        }
      }

      return {
        id: workspace.id,
        language: options.language,
        name: workspace.name,
        labels: workspace.labels,
      };
    }, DEFAULT_RETRY_CONFIG, 'createWorkspace');
  }

  async getWorkspaceInfo(workspaceId: string): Promise<{
    id: string;
    name: string;
    state: string;
    labels: Record<string, string>;
    cpu: number;
    memory: number;
    disk: number;
  }> {
    if (this.isMockMode()) {
      return {
        id: workspaceId,
        name: 'mock-workspace',
        state: 'started',
        labels: {},
        cpu: 2,
        memory: 4,
        disk: 20,
      };
    }

    const workspace = await this.getWorkspace(workspaceId);
    await workspace.refreshData();

    return {
      id: workspace.id,
      name: workspace.name,
      state: workspace.state || 'unknown',
      labels: workspace.labels,
      cpu: workspace.cpu,
      memory: workspace.memory,
      disk: workspace.disk,
    };
  }

  async setWorkspaceLabels(
    workspaceId: string,
    labels: Record<string, string>
  ): Promise<void> {
    if (this.isMockMode()) {
      console.log(`Mocking setWorkspaceLabels: ${JSON.stringify(labels)}`);
      return;
    }

    const workspace = await this.getWorkspace(workspaceId);
    await workspace.setLabels(labels);
    this.invalidateCache(workspaceId);
  }

  async refreshWorkspaceActivity(workspaceId: string): Promise<void> {
    if (this.isMockMode()) {
      console.log('Mocking refreshWorkspaceActivity');
      return;
    }

    const workspace = await this.getWorkspace(workspaceId);
    await workspace.refreshActivity();
  }

  async cleanupWorkspace(workspaceId: string): Promise<void> {
    if (this.isMockMode()) {
      console.log('Mocking Daytona cleanupWorkspace');
      return;
    }

    try {
      const workspace = await this.getWorkspace(workspaceId);
      await workspace.delete();
      this.invalidateCache(workspaceId);
    } catch (error) {
      console.error('Failed to cleanup workspace:', error);
    }
  }

  // ==========================================================================
  // File Operations (Using SDK fs methods)
  // ==========================================================================

  async saveFile(workspaceId: string, path: string, content: string): Promise<void> {
    if (this.isMockMode()) {
      console.log(`Mocking saveFile: ${path}`);
      return;
    }

    return this.withRetry(async () => {
      const sanitizedPath = sanitizePath(path);
      const workspace = await this.getWorkspace(workspaceId);

      // Use SDK's uploadFile method instead of shell command
      await workspace.fs.uploadFile(
        Buffer.from(content, 'utf-8'),
        sanitizedPath
      );
    }, DEFAULT_RETRY_CONFIG, 'saveFile');
  }

  async readFile(workspaceId: string, path: string): Promise<string> {
    if (this.isMockMode()) {
      console.log(`Mocking readFile: ${path}`);
      return "def main():\n    print('Hello from mock file')";
    }

    return this.withRetry(async () => {
      const sanitizedPath = sanitizePath(path);
      const workspace = await this.getWorkspace(workspaceId);

      // Use SDK's downloadFile method instead of cat command
      const buffer = await workspace.fs.downloadFile(sanitizedPath);
      return buffer.toString('utf-8');
    }, DEFAULT_RETRY_CONFIG, 'readFile');
  }

  async listFiles(workspaceId: string, path: string): Promise<FileInfo[]> {
    if (this.isMockMode()) {
      console.log(`Mocking listFiles: ${path}`);
      return [
        { name: 'main.py', path: 'main.py', size: 100, isDirectory: false },
      ];
    }

    return this.withRetry(async () => {
      const sanitizedPath = sanitizePath(path);
      const workspace = await this.getWorkspace(workspaceId);

      const files = await workspace.fs.listFiles(sanitizedPath);
      return files.map(f => ({
        name: f.name,
        path: `${sanitizedPath}/${f.name}`.replace(/^\.\//, ''),
        size: f.size || 0,
        isDirectory: f.isDir || false,
        modTime: f.modTime,
      }));
    }, DEFAULT_RETRY_CONFIG, 'listFiles');
  }

  async createDirectory(workspaceId: string, path: string, mode: string = '755'): Promise<void> {
    if (this.isMockMode()) {
      console.log(`Mocking createDirectory: ${path}`);
      return;
    }

    return this.withRetry(async () => {
      const sanitizedPath = sanitizePath(path);
      const workspace = await this.getWorkspace(workspaceId);
      await workspace.fs.createFolder(sanitizedPath, mode);
    }, DEFAULT_RETRY_CONFIG, 'createDirectory');
  }

  async deleteFile(workspaceId: string, path: string, recursive: boolean = false): Promise<void> {
    if (this.isMockMode()) {
      console.log(`Mocking deleteFile: ${path}`);
      return;
    }

    return this.withRetry(async () => {
      const sanitizedPath = sanitizePath(path);
      const workspace = await this.getWorkspace(workspaceId);
      await workspace.fs.deleteFile(sanitizedPath, recursive);
    }, DEFAULT_RETRY_CONFIG, 'deleteFile');
  }

  // ==========================================================================
  // Code Execution
  // ==========================================================================

  /**
   * Executes code directly using SDK's codeRun method (no file needed).
   * This is faster than file-based execution for simple code snippets.
   */
  async executeCode(
    workspaceId: string,
    code: string,
    language: string,
    timeoutMs: number = DEFAULT_EXECUTION_TIMEOUT
  ): Promise<ExecutionResult> {
    if (this.isMockMode()) {
      console.log('Mocking Daytona executeCode');
      await this.sleep(500);
      return {
        stdout: `Mock Output for ${language}:\n${code}\nResult: Success`,
        stderr: '',
        exitCode: 0,
      };
    }

    try {
      const workspace = await this.getWorkspace(workspaceId);
      const timeoutSec = Math.ceil(timeoutMs / 1000);

      // Use codeRun() for direct code execution - no need to save file first!
      const response = await workspace.process.codeRun(code, {}, timeoutSec);

      return {
        stdout: response.result,
        stderr: '',
        exitCode: response.exitCode,
        artifacts: response.artifacts,
      };
    } catch (error) {
      console.error('Failed to execute code:', error);
      return {
        stdout: '',
        stderr: error instanceof Error ? error.message : String(error),
        exitCode: 1,
      };
    }
  }

  /**
   * Executes code by saving it to a file first, then running the file.
   * Use this when you need the code to persist as a file.
   */
  async executeCodeWithFile(
    workspaceId: string,
    code: string,
    language: string,
    filename?: string,
    timeoutMs: number = DEFAULT_EXECUTION_TIMEOUT
  ): Promise<ExecutionResult> {
    if (this.isMockMode()) {
      console.log('Mocking Daytona executeCodeWithFile');
      await this.sleep(500);
      return {
        stdout: `Mock Output for ${language}`,
        stderr: '',
        exitCode: 0,
      };
    }

    try {
      // Determine filename and command based on language
      let file = filename;
      let command: string;

      if (language === 'python') {
        file = file || 'main.py';
        command = `python ${file}`;
      } else if (language === 'javascript' || language === 'typescript') {
        file = file || 'index.js';
        command = `node ${file}`;
      } else {
        throw new Error(`Unsupported language: ${language}`);
      }

      // 1. Save code to file using SDK
      await this.saveFile(workspaceId, file, code);

      // 2. Execute the file
      const workspace = await this.getWorkspace(workspaceId);
      const timeoutSec = Math.ceil(timeoutMs / 1000);
      const response = await workspace.process.executeCommand(
        command,
        undefined,
        undefined,
        timeoutSec
      );

      return {
        stdout: response.result,
        stderr: '',
        exitCode: response.exitCode,
        artifacts: response.artifacts,
      };
    } catch (error) {
      console.error('Failed to execute code with file:', error);
      return {
        stdout: '',
        stderr: error instanceof Error ? error.message : String(error),
        exitCode: 1,
      };
    }
  }

  // ==========================================================================
  // Command Execution
  // ==========================================================================

  async executeCommand(
    workspaceId: string,
    command: string,
    options?: {
      cwd?: string;
      env?: Record<string, string>;
      timeout?: number;
    }
  ): Promise<ExecutionResult> {
    if (this.isMockMode()) {
      console.log(`Mocking executeCommand: ${command}`);
      return { stdout: 'Mock Command Output', stderr: '', exitCode: 0 };
    }

    try {
      const workspace = await this.getWorkspace(workspaceId);
      const timeoutSec = options?.timeout ? Math.ceil(options.timeout / 1000) : undefined;

      const response = await workspace.process.executeCommand(
        command,
        options?.cwd,
        options?.env,
        timeoutSec
      );

      return {
        stdout: response.result,
        stderr: '',
        exitCode: response.exitCode,
      };
    } catch (error) {
      console.error('Failed to execute command:', error);
      return {
        stdout: '',
        stderr: error instanceof Error ? error.message : String(error),
        exitCode: 1,
      };
    }
  }

  // ==========================================================================
  // Package Installation
  // ==========================================================================

  async installPackage(
    workspaceId: string,
    packageName: string,
    manager: 'pip' | 'npm'
  ): Promise<ExecutionResult> {
    if (this.isMockMode()) {
      console.log(`Mocking installPackage: ${manager} install ${packageName}`);
      await this.sleep(2000);
      return { stdout: `Successfully installed ${packageName}`, stderr: '', exitCode: 0 };
    }

    try {
      const sanitizedPackageName = sanitizePackageName(packageName);

      let command = '';
      if (manager === 'pip') {
        command = `pip install ${sanitizedPackageName}`;
      } else if (manager === 'npm') {
        command = `npm install ${sanitizedPackageName}`;
      } else {
        throw new Error(`Unsupported package manager: ${manager}`);
      }

      console.log(`Installing ${packageName} via ${manager} in ${workspaceId}...`);

      const result = await this.executeCommand(workspaceId, command, {
        timeout: 120000, // 2 minute timeout for package installs
      });

      return result;
    } catch (error) {
      console.error('Failed to install package:', error);
      return {
        stdout: '',
        stderr: error instanceof Error ? error.message : String(error),
        exitCode: 1,
      };
    }
  }
}

export const daytonaService = new DaytonaService();
