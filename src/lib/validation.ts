/**
 * Shared validation utilities for API routes
 */

// Valid programming languages supported by the platform
export const VALID_LANGUAGES = ['python', 'typescript', 'javascript'] as const;
export type ValidLanguage = typeof VALID_LANGUAGES[number];

// Valid package managers
export const VALID_MANAGERS = ['pip', 'npm'] as const;
export type ValidManager = typeof VALID_MANAGERS[number];

// Maximum code size (100KB)
export const MAX_CODE_SIZE = 100 * 1024;

// Maximum TTS text length (5000 chars)
export const MAX_TTS_LENGTH = 5000;

// Timeout constraints
export const MIN_TIMEOUT = 1000; // 1 second
export const MAX_TIMEOUT = 300000; // 5 minutes

/**
 * Validates if the provided language is a supported programming language
 * @param lang - The language string to validate
 * @returns true if the language is valid, false otherwise
 */
export function isValidLanguage(lang: string): lang is ValidLanguage {
  return VALID_LANGUAGES.includes(lang as ValidLanguage);
}

/**
 * Validates if the provided path is safe (no directory traversal)
 * Allows both relative and absolute paths within the sandbox.
 * @param path - The file path to validate
 * @returns true if the path is safe, false otherwise
 */
export function isValidPath(path: string): boolean {
  if (!path || typeof path !== 'string') {
    return false;
  }
  // Check for directory traversal attempts
  if (path.includes('..')) {
    return false;
  }
  // Check for null bytes (security issue)
  if (path.includes('\0')) {
    return false;
  }
  // Normalize and validate path segments
  const segments = path.split('/').filter(s => s.length > 0);
  // Reject paths with suspicious patterns
  for (const segment of segments) {
    // Reject hidden files starting with . (except current dir)
    // Allow .env, .gitignore type files but not .. traversal
    if (segment === '.' || segment === '..') {
      return false;
    }
  }
  return true;
}

/**
 * Validates if the package name contains only safe characters
 * Safe characters: alphanumeric, @, /, -, _, .
 * @param name - The package name to validate
 * @returns true if the package name is valid, false otherwise
 */
export function isValidPackageName(name: string): boolean {
  if (!name || typeof name !== 'string') {
    return false;
  }
  // Package names can only contain alphanumeric, @, /, -, _, .
  const safePackageNameRegex = /^[a-zA-Z0-9@/_\-\.]+$/;
  return safePackageNameRegex.test(name);
}

/**
 * Validates if the code is non-empty and within size limits
 * @param code - The code string to validate
 * @param maxLength - Maximum allowed length in bytes (defaults to MAX_CODE_SIZE)
 * @returns true if the code is valid, false otherwise
 */
export function isValidCode(code: string, maxLength: number = MAX_CODE_SIZE): boolean {
  if (!code || typeof code !== 'string') {
    return false;
  }
  // Check if code is non-empty (after trimming)
  if (code.trim().length === 0) {
    return false;
  }
  // Check size limit (using byte length for accurate size check)
  const byteLength = new TextEncoder().encode(code).length;
  if (byteLength > maxLength) {
    return false;
  }
  return true;
}

/**
 * Validates if the package manager is valid
 * @param manager - The package manager string to validate
 * @returns true if the manager is valid, false otherwise
 */
export function isValidManager(manager: string): manager is ValidManager {
  return VALID_MANAGERS.includes(manager as ValidManager);
}

/**
 * Validates if a workspace ID is valid (non-empty string)
 * @param workspaceId - The workspace ID to validate
 * @returns true if the workspace ID is valid, false otherwise
 */
export function isValidWorkspaceId(workspaceId: string): boolean {
  if (!workspaceId || typeof workspaceId !== 'string') {
    return false;
  }
  return workspaceId.trim().length > 0;
}

/**
 * Validates text for TTS (max 5000 characters)
 * @param text - The text to validate
 * @returns true if the text is valid for TTS, false otherwise
 */
export function isValidTTSText(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }
  if (text.trim().length === 0) {
    return false;
  }
  return text.length <= MAX_TTS_LENGTH;
}

/**
 * Validates if a timeout value is within acceptable bounds
 * @param timeout - The timeout value in milliseconds
 * @returns true if the timeout is valid, false otherwise
 */
export function isValidTimeout(timeout: number): boolean {
  return (
    typeof timeout === 'number' &&
    !isNaN(timeout) &&
    timeout >= MIN_TIMEOUT &&
    timeout <= MAX_TIMEOUT
  );
}

/**
 * Validates if labels are a valid Record<string, string>
 * @param labels - The labels to validate
 * @returns true if labels are valid, false otherwise
 */
export function isValidLabels(labels: unknown): labels is Record<string, string> {
  if (!labels || typeof labels !== 'object' || Array.isArray(labels)) {
    return false;
  }
  return Object.entries(labels as Record<string, unknown>).every(
    ([key, value]) =>
      typeof key === 'string' &&
      typeof value === 'string' &&
      key.length <= 63 &&
      value.length <= 255
  );
}

/**
 * Validates if a workspace name is DNS-compatible
 * @param name - The workspace name to validate
 * @returns true if the name is valid, false otherwise
 */
export function isValidWorkspaceName(name: string): boolean {
  if (!name || typeof name !== 'string') {
    return false;
  }
  // DNS-compatible name: lowercase alphanumeric and hyphens, 1-63 chars
  const validNamePattern = /^[a-z0-9][a-z0-9-]{0,61}[a-z0-9]?$/;
  return validNamePattern.test(name);
}
