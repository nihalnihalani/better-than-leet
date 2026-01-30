import { NextRequest } from 'next/server';
import { generateAutoFix } from '@/lib/minimax';
import { daytonaService } from '@/lib/daytona';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { AutoFixRequestSchema, validateRequest } from '@/lib/schemas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request using Zod schema
    const validation = validateRequest(AutoFixRequestSchema, body);
    if (!validation.success) {
      return errorResponse(validation.error || 'Invalid request', 400, 'VALIDATION_ERROR');
    }

    const { code, error, language, workspaceId } = validation.data!;

    const result = await generateAutoFix(code, error, language || 'python');

    if (!result) {
      return errorResponse('Failed to generate fix', 500, 'FIX_GENERATION_FAILED');
    }

    const { fixedCode, dependencies } = result;
    const installedPackages: string[] = [];

    if (dependencies && dependencies.length > 0 && workspaceId) {
      // Determine package manager based on language
      const manager = (language === 'javascript' || language === 'typescript') ? 'npm' : 'pip';

      for (const dep of dependencies) {
        console.log(`Auto-installing dependency: ${dep}`);
        await daytonaService.installPackage(workspaceId, dep, manager);
        installedPackages.push(dep);
      }
    }

    return successResponse({ fixedCode, installedPackages });
  } catch (error) {
    return handleApiError(error, 'AutoFix API Error');
  }
}
