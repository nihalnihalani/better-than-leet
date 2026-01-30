import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DaytonaService } from './daytona';

const {
  mockCreate,
  mockGet,
  mockExecuteCommand,
  mockCodeRun,
  mockUploadFile,
  mockDownloadFile,
  mockListFiles,
  mockCreateFolder,
  mockDeleteFile,
  mockDelete,
  mockSetLabels,
  mockRefreshData,
  mockRefreshActivity,
} = vi.hoisted(() => {
  return {
    mockCreate: vi.fn(),
    mockGet: vi.fn(),
    mockExecuteCommand: vi.fn(),
    mockCodeRun: vi.fn(),
    mockUploadFile: vi.fn(),
    mockDownloadFile: vi.fn(),
    mockListFiles: vi.fn(),
    mockCreateFolder: vi.fn(),
    mockDeleteFile: vi.fn(),
    mockDelete: vi.fn(),
    mockSetLabels: vi.fn(),
    mockRefreshData: vi.fn(),
    mockRefreshActivity: vi.fn(),
  };
});

vi.mock('@daytonaio/sdk', () => {
  return {
    Daytona: class {
      constructor() {
        return {
          create: mockCreate,
          get: mockGet,
        };
      }
    },
    Sandbox: class {},
  };
});

describe('DaytonaService', () => {
  let service: DaytonaService;
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };

    // Setup comprehensive mock workspace
    const mockWorkspace = {
      id: 'test-workspace-id',
      name: 'test-workspace',
      labels: {},
      state: 'started',
      cpu: 2,
      memory: 4,
      disk: 20,
      process: {
        executeCommand: mockExecuteCommand,
        codeRun: mockCodeRun,
      },
      fs: {
        uploadFile: mockUploadFile,
        downloadFile: mockDownloadFile,
        listFiles: mockListFiles,
        createFolder: mockCreateFolder,
        deleteFile: mockDeleteFile,
      },
      delete: mockDelete,
      setLabels: mockSetLabels,
      refreshData: mockRefreshData,
      refreshActivity: mockRefreshActivity,
    };

    mockCreate.mockResolvedValue(mockWorkspace);
    mockGet.mockResolvedValue(mockWorkspace);
    mockExecuteCommand.mockResolvedValue({ result: 'success', exitCode: 0 });
    mockCodeRun.mockResolvedValue({ result: 'code output', exitCode: 0 });
    mockUploadFile.mockResolvedValue(undefined);
    mockDownloadFile.mockResolvedValue(Buffer.from('file content'));
    mockListFiles.mockResolvedValue([
      { name: 'main.py', size: 100, isDir: false },
      { name: 'tests', size: 0, isDir: true },
    ]);
    mockCreateFolder.mockResolvedValue(undefined);
    mockDeleteFile.mockResolvedValue(undefined);
    mockDelete.mockResolvedValue(undefined);
    mockSetLabels.mockResolvedValue({ env: 'test' });
    mockRefreshData.mockResolvedValue(undefined);
    mockRefreshActivity.mockResolvedValue(undefined);

    // Provide default keys to avoid warnings during instantiation
    process.env.DAYTONA_API_KEY = 'dummy';
    process.env.DAYTONA_API_URL = 'dummy';

    service = new DaytonaService();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('createWorkspace', () => {
    it('should create a workspace with options object', async () => {
      process.env.NEXT_PUBLIC_USE_MOCK_DAYTONA = 'false';

      const result = await service.createWorkspace({
        language: 'python',
        autoStopInterval: 30,
        labels: { env: 'test' },
      });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          language: 'python',
          autoStopInterval: 30,
          labels: { env: 'test' },
        }),
        expect.any(Object)
      );
      expect(result.id).toBe('test-workspace-id');
      expect(result.language).toBe('python');
    });

    it('should skip CodeRabbit installation when disabled', async () => {
      process.env.NEXT_PUBLIC_USE_MOCK_DAYTONA = 'false';

      await service.createWorkspace({
        language: 'python',
        installCodeRabbit: false,
      });

      // CodeRabbit install command should not be called
      expect(mockExecuteCommand).not.toHaveBeenCalled();
    });

    it('should install CodeRabbit by default', async () => {
      process.env.NEXT_PUBLIC_USE_MOCK_DAYTONA = 'false';

      await service.createWorkspace({ language: 'python' });

      // CodeRabbit install should be called
      expect(mockExecuteCommand).toHaveBeenCalledWith(
        expect.stringContaining('coderabbit'),
        undefined,
        undefined,
        expect.any(Number)
      );
    });

    it('should return mock data when mock mode is enabled', async () => {
      process.env.NEXT_PUBLIC_USE_MOCK_DAYTONA = 'true';

      const result = await service.createWorkspace({ language: 'python' });

      expect(mockCreate).not.toHaveBeenCalled();
      expect(result).toEqual({
        id: 'mock-ws-123',
        language: 'python',
        labels: undefined,
      });
    });
  });

  describe('executeCode with codeRun', () => {
    it('should use codeRun for direct execution', async () => {
      process.env.NEXT_PUBLIC_USE_MOCK_DAYTONA = 'false';

      const result = await service.executeCode(
        'ws-123',
        'print("hello")',
        'python'
      );

      expect(mockCodeRun).toHaveBeenCalledWith(
        'print("hello")',
        {},
        expect.any(Number)
      );
      expect(result.stdout).toBe('code output');
      expect(result.exitCode).toBe(0);
    });

    it('should handle execution errors', async () => {
      process.env.NEXT_PUBLIC_USE_MOCK_DAYTONA = 'false';

      mockCodeRun.mockResolvedValueOnce({ result: 'SyntaxError', exitCode: 1 });

      const result = await service.executeCode('ws-123', 'bad code', 'python');

      expect(result.exitCode).toBe(1);
      expect(result.stdout).toBe('SyntaxError');
    });

    it('should return mock data when mock mode is enabled', async () => {
      process.env.NEXT_PUBLIC_USE_MOCK_DAYTONA = 'true';

      const result = await service.executeCode(
        'ws-123',
        'print("hello")',
        'python'
      );

      expect(mockCodeRun).not.toHaveBeenCalled();
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Mock Output');
    });
  });

  describe('executeCodeWithFile', () => {
    it('should save file then execute', async () => {
      process.env.NEXT_PUBLIC_USE_MOCK_DAYTONA = 'false';

      const result = await service.executeCodeWithFile(
        'ws-123',
        'print("hello")',
        'python'
      );

      // Should upload file first
      expect(mockUploadFile).toHaveBeenCalledWith(
        expect.any(Buffer),
        'main.py'
      );
      // Then execute command
      expect(mockExecuteCommand).toHaveBeenCalledWith(
        'python main.py',
        undefined,
        undefined,
        expect.any(Number)
      );
      expect(result.exitCode).toBe(0);
    });

    it('should use custom filename', async () => {
      process.env.NEXT_PUBLIC_USE_MOCK_DAYTONA = 'false';

      await service.executeCodeWithFile(
        'ws-123',
        'print("hello")',
        'python',
        'custom.py'
      );

      expect(mockUploadFile).toHaveBeenCalledWith(
        expect.any(Buffer),
        'custom.py'
      );
      expect(mockExecuteCommand).toHaveBeenCalledWith(
        'python custom.py',
        undefined,
        undefined,
        expect.any(Number)
      );
    });
  });

  describe('file operations with SDK', () => {
    it('should use uploadFile for saveFile', async () => {
      process.env.NEXT_PUBLIC_USE_MOCK_DAYTONA = 'false';

      await service.saveFile('ws-123', 'test.py', 'print("hello")');

      expect(mockUploadFile).toHaveBeenCalledWith(
        expect.any(Buffer),
        'test.py'
      );
    });

    it('should use downloadFile for readFile', async () => {
      process.env.NEXT_PUBLIC_USE_MOCK_DAYTONA = 'false';

      const content = await service.readFile('ws-123', 'test.py');

      expect(mockDownloadFile).toHaveBeenCalledWith('test.py');
      expect(content).toBe('file content');
    });

    it('should use listFiles for directory listing', async () => {
      process.env.NEXT_PUBLIC_USE_MOCK_DAYTONA = 'false';

      const files = await service.listFiles('ws-123', '.');

      expect(mockListFiles).toHaveBeenCalledWith('.');
      expect(files).toHaveLength(2);
      expect(files[0].name).toBe('main.py');
      expect(files[1].name).toBe('tests');
      expect(files[1].isDirectory).toBe(true);
    });

    it('should use createFolder for createDirectory', async () => {
      process.env.NEXT_PUBLIC_USE_MOCK_DAYTONA = 'false';

      await service.createDirectory('ws-123', 'src', '755');

      expect(mockCreateFolder).toHaveBeenCalledWith('src', '755');
    });

    it('should use deleteFile for file deletion', async () => {
      process.env.NEXT_PUBLIC_USE_MOCK_DAYTONA = 'false';

      await service.deleteFile('ws-123', 'temp.py', false);

      expect(mockDeleteFile).toHaveBeenCalledWith('temp.py', false);
    });
  });

  describe('workspace management', () => {
    it('should get workspace info', async () => {
      process.env.NEXT_PUBLIC_USE_MOCK_DAYTONA = 'false';

      const info = await service.getWorkspaceInfo('ws-123');

      expect(mockRefreshData).toHaveBeenCalled();
      expect(info.id).toBe('test-workspace-id');
      expect(info.state).toBe('started');
    });

    it('should set workspace labels', async () => {
      process.env.NEXT_PUBLIC_USE_MOCK_DAYTONA = 'false';

      await service.setWorkspaceLabels('ws-123', { env: 'prod' });

      expect(mockSetLabels).toHaveBeenCalledWith({ env: 'prod' });
    });

    it('should refresh workspace activity', async () => {
      process.env.NEXT_PUBLIC_USE_MOCK_DAYTONA = 'false';

      await service.refreshWorkspaceActivity('ws-123');

      expect(mockRefreshActivity).toHaveBeenCalled();
    });

    it('should cleanup workspace', async () => {
      process.env.NEXT_PUBLIC_USE_MOCK_DAYTONA = 'false';

      await service.cleanupWorkspace('ws-123');

      expect(mockDelete).toHaveBeenCalled();
    });
  });

  describe('retry logic', () => {
    it('should retry on transient failures', async () => {
      process.env.NEXT_PUBLIC_USE_MOCK_DAYTONA = 'false';

      mockDownloadFile
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(Buffer.from('content'));

      const content = await service.readFile('ws-123', 'test.py');

      expect(mockDownloadFile).toHaveBeenCalledTimes(3);
      expect(content).toBe('content');
    });

    it('should not retry on auth errors', async () => {
      process.env.NEXT_PUBLIC_USE_MOCK_DAYTONA = 'false';

      mockDownloadFile.mockRejectedValue(new Error('Unauthorized'));

      await expect(service.readFile('ws-123', 'test.py'))
        .rejects.toThrow('Unauthorized');

      expect(mockDownloadFile).toHaveBeenCalledTimes(1);
    });

    it('should not retry on invalid path errors', async () => {
      process.env.NEXT_PUBLIC_USE_MOCK_DAYTONA = 'false';

      mockDownloadFile.mockRejectedValue(new Error('Invalid path'));

      await expect(service.readFile('ws-123', 'test.py'))
        .rejects.toThrow('Invalid path');

      expect(mockDownloadFile).toHaveBeenCalledTimes(1);
    });
  });

  describe('path validation', () => {
    it('should reject paths with directory traversal', async () => {
      process.env.NEXT_PUBLIC_USE_MOCK_DAYTONA = 'false';

      await expect(service.readFile('ws-123', '../etc/passwd'))
        .rejects.toThrow('directory traversal');
    });

    it('should allow absolute paths in sandbox environment', async () => {
      process.env.NEXT_PUBLIC_USE_MOCK_DAYTONA = 'false';

      // Absolute paths are allowed in isolated sandbox environments
      const result = await service.readFile('ws-123', '/tmp/test.txt');

      expect(mockDownloadFile).toHaveBeenCalledWith('/tmp/test.txt');
      expect(result).toBe('file content');
    });
  });

  describe('package installation', () => {
    it('should install pip packages', async () => {
      process.env.NEXT_PUBLIC_USE_MOCK_DAYTONA = 'false';

      const result = await service.installPackage('ws-123', 'requests', 'pip');

      expect(mockExecuteCommand).toHaveBeenCalledWith(
        'pip install requests',
        undefined,
        undefined,
        expect.any(Number)
      );
      expect(result.exitCode).toBe(0);
    });

    it('should install npm packages', async () => {
      process.env.NEXT_PUBLIC_USE_MOCK_DAYTONA = 'false';

      const result = await service.installPackage('ws-123', 'lodash', 'npm');

      expect(mockExecuteCommand).toHaveBeenCalledWith(
        'npm install lodash',
        undefined,
        undefined,
        expect.any(Number)
      );
      expect(result.exitCode).toBe(0);
    });

    it('should reject invalid package names', async () => {
      process.env.NEXT_PUBLIC_USE_MOCK_DAYTONA = 'false';

      const result = await service.installPackage('ws-123', 'pkg; rm -rf /', 'pip');

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Invalid package name');
    });
  });
});
