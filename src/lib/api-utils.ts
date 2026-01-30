import { NextResponse } from 'next/server';
import { getUserFriendlyError, FriendlyError } from './error-messages';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  retryable?: boolean;
  friendlyMessage?: FriendlyError;
}

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(
  message: string,
  status = 500,
  code?: string,
  retryable = false,
  additionalData?: Record<string, unknown>
) {
  const errorCode = code || 'INTERNAL_ERROR';
  const friendlyMessage = getUserFriendlyError(errorCode, message);

  return NextResponse.json(
    {
      success: false,
      error: message,
      code: errorCode,
      retryable,
      friendlyMessage,
      // Include technical details only in development
      technicalDetails: process.env.NODE_ENV === 'development' ? message : undefined,
      ...additionalData
    },
    { status }
  );
}

/**
 * Determines if an error is retryable based on its message
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes('timeout') ||
      msg.includes('network') ||
      msg.includes('connection') ||
      msg.includes('temporarily') ||
      msg.includes('econnreset') ||
      msg.includes('econnrefused') ||
      msg.includes('rate limit') ||
      msg.includes('overloaded') ||
      msg.includes('503') ||
      msg.includes('429')
    );
  }
  return false;
}

/**
 * Maps error to appropriate HTTP status code
 */
function getErrorStatus(error: unknown): number {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('not found')) return 404;
    if (msg.includes('unauthorized') || msg.includes('forbidden')) return 403;
    if (msg.includes('invalid')) return 400;
    if (msg.includes('timeout')) return 504;
    if (msg.includes('rate limit') || msg.includes('429')) return 429;
    if (msg.includes('too large')) return 413;
  }
  return 500;
}

/**
 * Maps error to appropriate error code
 */
function getErrorCode(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('timeout')) return 'TIMEOUT';
    if (msg.includes('not found')) return 'NOT_FOUND';
    if (msg.includes('unauthorized')) return 'UNAUTHORIZED';
    if (msg.includes('forbidden')) return 'FORBIDDEN';
    if (msg.includes('invalid')) return 'INVALID_REQUEST';
    if (msg.includes('rate limit') || msg.includes('429')) return 'RATE_LIMITED';
    if (msg.includes('network') || msg.includes('connection')) return 'NETWORK_ERROR';
    if (msg.includes('workspace')) return 'WORKSPACE_ERROR';
    if (msg.includes('execution')) return 'EXECUTION_ERROR';
    if (msg.includes('analysis')) return 'ANALYSIS_FAILED';
    if (msg.includes('too large')) return 'CODE_TOO_LARGE';
  }
  return 'INTERNAL_ERROR';
}

/**
 * Standard API error handler with user-friendly messages
 */
export function handleApiError(error: unknown, context: string) {
  console.error(`${context}:`, error);

  const message = error instanceof Error ? error.message : 'Internal Server Error';
  const retryable = isRetryableError(error);
  const status = getErrorStatus(error);
  const code = getErrorCode(error);

  return errorResponse(message, status, code, retryable);
}

/**
 * Create a standardized API error for specific error types
 */
export function createApiError(
  code: string,
  message: string,
  status: number = 500,
  retryable: boolean = false
) {
  return errorResponse(message, status, code, retryable);
}

/**
 * Validation error helper
 */
export function validationError(message: string, field?: string) {
  return errorResponse(
    field ? `${field}: ${message}` : message,
    400,
    'VALIDATION_ERROR',
    false
  );
}

/**
 * Not found error helper
 */
export function notFoundError(resource: string) {
  return errorResponse(
    `${resource} not found`,
    404,
    'NOT_FOUND',
    false
  );
}

/**
 * Timeout error helper
 */
export function timeoutError(operation: string) {
  return errorResponse(
    `${operation} timed out`,
    504,
    'TIMEOUT',
    true
  );
}
