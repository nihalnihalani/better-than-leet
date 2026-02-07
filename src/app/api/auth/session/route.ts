import { NextResponse } from 'next/server';
import { generateSessionToken } from '@/lib/auth';

/**
 * Create a new session token for the client.
 * Called once when the interview page loads.
 */
export async function POST() {
    const token = generateSessionToken();

    return NextResponse.json({
        success: true,
        data: { token },
    });
}
