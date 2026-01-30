import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimiter, getRateLimitConfig } from '@/lib/rate-limiter';

/**
 * Next.js Middleware for Rate Limiting
 *
 * Applies token bucket rate limiting to all API routes.
 * Uses client IP as the rate limit key.
 */
export function middleware(request: NextRequest) {
  // Only apply to API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Skip rate limiting in development if desired
  // Uncomment the following to disable in development:
  // if (process.env.NODE_ENV === 'development') {
  //   return NextResponse.next();
  // }

  // Get client identifier
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const clientIP = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';

  const path = request.nextUrl.pathname;
  const key = `${clientIP}:${path}`;

  // Get config for this endpoint
  const config = getRateLimitConfig(path);

  // Check rate limit
  const result = rateLimiter.check(key, config);

  if (!result.success) {
    // Rate limited - return 429
    const retryAfter = Math.ceil(result.resetTime / 1000);

    return NextResponse.json(
      {
        success: false,
        error: 'Too many requests. Please slow down.',
        code: 'RATE_LIMITED',
        retryable: true,
        retryAfter: retryAfter,
        friendlyMessage: {
          title: 'Slow Down',
          message: 'You\'re making requests too quickly.',
          action: `Please wait ${retryAfter} seconds before trying again.`
        }
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(config.tokens),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(retryAfter),
          'Retry-After': String(retryAfter)
        }
      }
    );
  }

  // Allow request - add rate limit headers
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', String(config.tokens));
  response.headers.set('X-RateLimit-Remaining', String(result.remaining));

  return response;
}

// Configure which routes this middleware applies to
export const config = {
  matcher: '/api/:path*',
};
