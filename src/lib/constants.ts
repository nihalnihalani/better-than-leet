/**
 * Application Constants
 * Centralized configuration values to avoid magic numbers and strings
 */

// Wizard Mode Script - Demo interview prompts
export const WIZARD_SCRIPT = [
  "Hi there! I'm Alexis. Today we're going to work on reversing a linked list. Can you start by defining the Node class?",
  "Great start. Now, how would you handle the prev pointer in the reversal function?",
  "Hmm, take a look at line 15. Are we updating the head reference correctly?",
  "Excellent work. You nailed the pointer manipulation."
];

// Integrity Shield Thresholds
export const LARGE_PASTE_THRESHOLD = 50;

// Code Complexity Thresholds
export const COMPLEXITY_HIGH = 8;
export const COMPLEXITY_MEDIUM = 6;
export const MAX_HINTS = 3;

// Timeout Values (in milliseconds)
export const DEFAULT_EXECUTION_TIMEOUT = 30000;
export const DEFAULT_CREATE_TIMEOUT = 60; // seconds

// Daytona Configuration
export const DEFAULT_AUTO_STOP_INTERVAL = 30; // minutes
export const DEFAULT_AUTO_ARCHIVE_INTERVAL = 60; // minutes
export const DEFAULT_NETWORK_ALLOW_LIST = ''; // Empty = allow all

// Retry Configuration
export const DEFAULT_RETRY_CONFIG = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
} as const;

// AI Retry Configuration
export const AI_RETRY_CONFIG = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 8000,
  backoffMultiplier: 2,
} as const;

// CodeRabbit CLI Configuration
export const CODERABBIT_INSTALL_CMD = 'curl -fsSL https://cli.coderabbit.ai/install.sh | sh';
export const CODERABBIT_INSTALL_TIMEOUT = 60000; // 60 seconds

// Voice Configuration
export const DEFAULT_VOICE_ID = "cgSgspJ2msm6clMCkdW9"; // Default Jessica voice

// Keyboard Shortcuts
export const WIZARD_SHORTCUT = { ctrl: true, shift: true, key: 'X' };
