/**
 * Client-side API helper that attaches session auth tokens to requests.
 */

const SESSION_HEADER = 'x-session-token';
let sessionToken: string | null = null;

/**
 * Initialize the session by fetching a token from the server.
 * Call once on page load.
 */
export async function initSession(): Promise<string | null> {
    try {
        const res = await fetch('/api/auth/session', { method: 'POST' });
        const data = await res.json();
        if (data.data?.token) {
            sessionToken = data.data.token;
            return sessionToken;
        }
    } catch (err) {
        console.warn('Failed to init session:', err);
    }
    return null;
}

/**
 * Get the current session token (for manual use).
 */
export function getSessionToken(): string | null {
    return sessionToken;
}

/**
 * Wrapper around fetch that automatically attaches the session token header.
 */
export function authFetch(url: string, init?: RequestInit): Promise<Response> {
    const headers = new Headers(init?.headers);
    if (sessionToken) {
        headers.set(SESSION_HEADER, sessionToken);
    }
    return fetch(url, { ...init, headers });
}
