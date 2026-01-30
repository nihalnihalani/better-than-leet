import { analyzeCodeWithMiniMax } from '@/lib/minimax';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { AnalysisReviewRequestSchema, validateRequest } from '@/lib/schemas';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request using Zod schema
    const validation = validateRequest(AnalysisReviewRequestSchema, body);
    if (!validation.success) {
      return errorResponse(validation.error || 'Invalid request', 400, 'VALIDATION_ERROR');
    }

    const { code, language } = validation.data!;

    const analysis = await analyzeCodeWithMiniMax(code, language || 'python');
    return successResponse(analysis);
  } catch (error) {
    return handleApiError(error, 'Analysis Error');
  }
}
