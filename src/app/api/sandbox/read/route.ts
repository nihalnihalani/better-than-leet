import { daytonaService } from '@/lib/daytona';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { ReadFileRequestSchema, validateRequest } from '@/lib/schemas';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request using Zod schema
    const validation = validateRequest(ReadFileRequestSchema, body);
    if (!validation.success) {
      return errorResponse(validation.error || 'Invalid request', 400, 'VALIDATION_ERROR');
    }

    const { workspaceId, path } = validation.data!;

    const content = await daytonaService.readFile(workspaceId, path);
    return successResponse({ content });
  } catch (error) {
    return handleApiError(error, 'API Read File Error');
  }
}
