import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter, getRateLimitConfig } from '@/lib/rate-limiter';
import { validateSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const config = getRateLimitConfig('/api/gemini/session');
    const rateLimitResult = rateLimiter.check(`${ip}:/api/gemini/session`, config);

    if (!rateLimitResult.success) {
        return NextResponse.json(
            {
                error: 'Too many requests',
                friendlyMessage: {
                    title: 'Rate Limit Exceeded',
                    message: `Please wait ${Math.ceil(rateLimitResult.resetTime / 1000)} seconds before requesting a new session.`,
                }
            },
            { status: 429 }
        );
    }

    // Session auth check
    if (!validateSession(req)) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    // Read key from server-side env (NOT NEXT_PUBLIC_)
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: 'Gemini API key not configured on server' },
            { status: 500 }
        );
    }

    return NextResponse.json({
        success: true,
        data: { apiKey: apiKey.trim() },
    });
}
