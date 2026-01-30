import { daytonaService } from '@/lib/daytona';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { ListFilesQuerySchema, FileOperationRequestSchema, validateRequest } from '@/lib/schemas';

// GET - List files in a directory
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      workspaceId: searchParams.get('workspaceId') || '',
      path: searchParams.get('path') || '.',
    };

    // Validate query params using Zod schema
    const validation = validateRequest(ListFilesQuerySchema, queryParams);
    if (!validation.success) {
      return errorResponse(validation.error || 'Invalid request', 400, 'VALIDATION_ERROR');
    }

    const { workspaceId, path } = validation.data!;

    const files = await daytonaService.listFiles(workspaceId, path);
    return successResponse({ files });
  } catch (error) {
    return handleApiError(error, 'API List Files Error');
  }
}

// POST - Create directory or perform other file operations
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request using Zod schema
    const validation = validateRequest(FileOperationRequestSchema, body);
    if (!validation.success) {
      return errorResponse(validation.error || 'Invalid request', 400, 'VALIDATION_ERROR');
    }

    const { workspaceId, path, operation, mode, recursive } = validation.data!;

    switch (operation) {
      case 'createDirectory':
        await daytonaService.createDirectory(workspaceId, path, mode);
        return successResponse({ created: true, path });

      case 'delete':
        await daytonaService.deleteFile(workspaceId, path, recursive);
        return successResponse({ deleted: true, path });

      default:
        return errorResponse(
          `Invalid operation. Must be one of: createDirectory, delete`,
          400,
          'INVALID_OPERATION'
        );
    }
  } catch (error) {
    return handleApiError(error, 'API File Operation Error');
  }
}
