import { NextResponse } from 'next/server';
import { generatePracticeInterviewFeedback, PracticeInterviewData } from '@/lib/minimax';
import * as Sentry from '@sentry/nextjs';

export async function POST(request: Request) {
  try {
    const data: PracticeInterviewData = await request.json();

    // Validate required fields
    if (!data.code || !data.language) {
      return NextResponse.json(
        { error: 'Missing required fields: code and language are required' },
        { status: 400 }
      );
    }

    // Generate coaching feedback
    const feedback = await generatePracticeInterviewFeedback(data);

    return NextResponse.json({ feedback });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Practice interview feedback API error:', error);

    return NextResponse.json(
      { error: 'Failed to generate coaching feedback' },
      { status: 500 }
    );
  }
}
