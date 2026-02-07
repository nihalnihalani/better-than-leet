import { daytonaService, CreateWorkspaceOptions } from '@/lib/daytona';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { DEFAULT_AUTO_STOP_INTERVAL } from '@/lib/constants';
import { CreateWorkspaceRequestSchema, validateRequest } from '@/lib/schemas';
import { validateSession } from '@/lib/auth';

export async function POST(request: Request) {
  if (!validateSession(request)) {
    return errorResponse('Unauthorized', 401, 'AUTH_ERROR');
  }

  try {
    const body = await request.json();

    // Validate request using Zod schema
    const validation = validateRequest(CreateWorkspaceRequestSchema, body);
    if (!validation.success) {
      return errorResponse(validation.error || 'Invalid request', 400, 'VALIDATION_ERROR');
    }

    const {
      language,
      networkAllowList,
      autoStopInterval,
      autoArchiveInterval,
      labels,
      envVars,
      installCodeRabbit,
      timeout,
    } = validation.data!;

    const options: CreateWorkspaceOptions = {
      language,
      networkAllowList,
      autoStopInterval: autoStopInterval ?? DEFAULT_AUTO_STOP_INTERVAL,
      autoArchiveInterval,
      labels,
      envVars,
      installCodeRabbit: installCodeRabbit !== false, // Default to true
      timeout,
    };

    const workspace = await daytonaService.createWorkspace(options);
    return successResponse(workspace);
  } catch (error) {
    return handleApiError(error, 'API Create Workspace Error');
  }
}
