import { daytonaService } from '@/lib/daytona';
import * as Sentry from "@sentry/nextjs";
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { TestCodeRequestSchema, validateRequest } from '@/lib/schemas';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request using Zod schema
    const validation = validateRequest(TestCodeRequestSchema, body);
    if (!validation.success) {
      return errorResponse(validation.error || 'Invalid request', 400, 'VALIDATION_ERROR');
    }

    const { workspaceId, testCode, language, timeout } = validation.data!;

    // Use codeRun for direct execution (no file needed for tests)
    // This is cleaner and doesn't leave test files behind
    const result = await daytonaService.executeCode(
      workspaceId,
      testCode,
      language || 'python',
      timeout || 60000 // 60 second timeout for tests
    );

    // We don't treat non-zero exit code as a server error here,
    // as it might just mean tests failed.
    return successResponse({
      stdout: result.stdout,
      stderr: result.stderr,
      isError: result.exitCode !== 0,
    });
  } catch (error) {
    Sentry.captureException(error);
    return handleApiError(error, 'API Agent Test Error');
  }
}
