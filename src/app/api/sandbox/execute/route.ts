import { daytonaService } from '@/lib/daytona';
import * as Sentry from "@sentry/nextjs";
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { DEFAULT_EXECUTION_TIMEOUT } from '@/lib/constants';
import { ExecuteCodeRequestSchema, validateRequest } from '@/lib/schemas';
import { validateSession } from '@/lib/auth';

export async function POST(request: Request) {
  if (!validateSession(request)) {
    return errorResponse('Unauthorized', 401, 'AUTH_ERROR');
  }

  try {
    const body = await request.json();

    // Validate request using Zod schema
    const validation = validateRequest(ExecuteCodeRequestSchema, body);
    if (!validation.success) {
      return errorResponse(validation.error || 'Invalid request', 400, 'VALIDATION_ERROR');
    }

    const {
      workspaceId,
      code,
      language,
      timeout,
      useFile,
    } = validation.data!;

    const lang = language || 'python';
    const timeoutMs = timeout || DEFAULT_EXECUTION_TIMEOUT;

    // Use codeRun by default (faster), fall back to file-based if requested
    const result = useFile
      ? await daytonaService.executeCodeWithFile(workspaceId, code, lang, undefined, timeoutMs)
      : await daytonaService.executeCode(workspaceId, code, lang, timeoutMs);

    // Sentry Monitoring for Runtime Errors
    if (result.exitCode !== 0 || result.stderr) {
      Sentry.withScope((scope) => {
        scope.setTag("section", "sandbox_execution");
        scope.setTag("language", lang);
        scope.setExtra("workspaceId", workspaceId);
        scope.setExtra("stdout", result.stdout);
        scope.setExtra("stderr", result.stderr);
        Sentry.captureException(new Error(`Sandbox Runtime Error: ${result.stderr || 'Non-zero exit code'}`));
      });
    }

    return successResponse({
      stdout: result.stdout,
      stderr: result.stderr,
      isError: result.exitCode !== 0,
      artifacts: result.artifacts,
    });
  } catch (error) {
    Sentry.captureException(error);
    return handleApiError(error, 'API Execute Code Error');
  }
}
