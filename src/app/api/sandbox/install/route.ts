import { daytonaService } from '@/lib/daytona';
import * as Sentry from "@sentry/nextjs";
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { InstallPackageRequestSchema, validateRequest } from '@/lib/schemas';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request using Zod schema
    const validation = validateRequest(InstallPackageRequestSchema, body);
    if (!validation.success) {
      return errorResponse(validation.error || 'Invalid request', 400, 'VALIDATION_ERROR');
    }

    const { workspaceId, packageName, manager } = validation.data!;

    const result = await daytonaService.installPackage(workspaceId, packageName, manager);

    if (result.exitCode !== 0) {
      console.error(`Package installation failed: ${result.stderr}`);
    }

    return successResponse({
      stdout: result.stdout,
      stderr: result.stderr,
      isError: result.exitCode !== 0
    });
  } catch (error) {
    Sentry.captureException(error);
    return handleApiError(error, 'API Install Package Error');
  }
}
