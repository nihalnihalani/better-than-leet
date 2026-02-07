import { NextRequest, NextResponse } from 'next/server';
import { generateInterviewReport, InterviewReportData } from '@/lib/gemini';
import { rateLimiter, getRateLimitConfig } from '@/lib/rate-limiter';
import { validateSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
    // Session auth check
    if (!validateSession(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const config = getRateLimitConfig('/api/interview/report');
    const rateLimitResult = rateLimiter.check(`${ip}:/api/interview/report`, config);

    if (!rateLimitResult.success) {
        return NextResponse.json(
            {
                error: 'Too many requests',
                friendlyMessage: {
                    title: 'Rate Limit Exceeded',
                    message: `Please wait ${Math.ceil(rateLimitResult.resetTime / 1000)} seconds before generating another report.`,
                    details: 'Report generation is resource-intensive. Please try again in a moment.'
                }
            },
            { status: 429 }
        );
    }

    try {
        const reportData: InterviewReportData = await req.json();

        // Validate required fields based on interview mode
        const isSystemDesign = reportData.interviewMode === 'system-design';
        
        if (!isSystemDesign && (!reportData.code || !reportData.language)) {
            return NextResponse.json(
                { error: 'Missing required fields: code and language are required for coding interviews' },
                { status: 400 }
            );
        }

        console.log('📊 Generating interview report...');
        console.log(`- Interview mode: ${reportData.interviewMode || 'coding'}`);
        console.log(`- Transcript entries: ${reportData.transcript?.length || 0}`);
        if (isSystemDesign) {
            console.log(`- Diagram nodes: ${reportData.diagramNodes?.length || 0}`);
            console.log(`- Diagram edges: ${reportData.diagramEdges?.length || 0}`);
        } else {
            console.log(`- Test results: ${reportData.testResults?.length || 0}`);
            console.log(`- Code length: ${reportData.code?.length || 0} chars`);
        }

        const report = await generateInterviewReport(reportData);

        console.log('✅ Interview report generated successfully');

        return NextResponse.json({
            success: true,
            data: { report }
        });
    } catch (error) {
        console.error('❌ Interview report generation failed:', error);

        return NextResponse.json(
            {
                error: 'Failed to generate interview report',
                friendlyMessage: {
                    title: 'Report Generation Failed',
                    message: error instanceof Error ? error.message : 'An unknown error occurred',
                    details: 'The AI service may be temporarily unavailable. Please try again.'
                }
            },
            { status: 500 }
        );
    }
}
