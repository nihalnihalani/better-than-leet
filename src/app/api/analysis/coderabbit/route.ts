import { codeRabbitService } from '@/lib/coderabbit';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { CodeRabbitRequestSchema, WorkspaceIdSchema, validateRequest } from '@/lib/schemas';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // If only workspaceId is provided, analyze sandbox
    if (body.workspaceId && !body.code) {
      const wsValidation = validateRequest(WorkspaceIdSchema, body.workspaceId);
      if (!wsValidation.success) {
        return errorResponse(wsValidation.error || 'Invalid workspace ID', 400, 'VALIDATION_ERROR');
      }
      const review = await codeRabbitService.analyzeSandbox(body.workspaceId);
      return successResponse(review);
    }

    // Validate full request with code
    const validation = validateRequest(CodeRabbitRequestSchema, body);
    if (!validation.success) {
      return errorResponse(validation.error || 'Invalid request', 400, 'VALIDATION_ERROR');
    }

    const { code, language, workspaceId } = validation.data!;

    // If workspaceId is provided with code, analyze sandbox
    if (workspaceId) {
      const review = await codeRabbitService.analyzeSandbox(workspaceId);
      return successResponse(review);
    }

    const review = await codeRabbitService.analyzeCode(code, language || 'python');
    return successResponse(review);
  } catch (error) {
    return handleApiError(error, 'CodeRabbit Analysis Error');
  }
}
