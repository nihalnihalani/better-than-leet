const SESSION_HEADER = 'x-session-token';
const SESSION_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

// In-memory store of valid session tokens with expiry
const sessions = new Map<string, number>();

// Cleanup expired sessions periodically
let cleanupInterval: ReturnType<typeof setInterval> | null = null;
function ensureCleanup() {
    if (cleanupInterval) return;
    cleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [token, expiry] of sessions) {
            if (now > expiry) sessions.delete(token);
        }
    }, 60_000); // Every minute
    // Allow Node to exit without waiting for this interval
    if (typeof cleanupInterval === 'object' && 'unref' in cleanupInterval) {
        cleanupInterval.unref();
    }
}

/**
 * Generate a new session token and store it server-side
 */
export function generateSessionToken(): string {
    ensureCleanup();
    const token = crypto.randomUUID();
    sessions.set(token, Date.now() + SESSION_TTL_MS);
    return token;
}

/**
 * Validate a session token from request headers.
 * Returns true if valid, false otherwise.
 * In development without any sessions registered, allows all requests.
 */
export function validateSession(req: { headers: { get(name: string): string | null } }): boolean {
    const token = req.headers.get(SESSION_HEADER);

    // In dev mode or if no sessions have been created yet, allow through
    if (sessions.size === 0) return true;

    if (!token) return false;

    const expiry = sessions.get(token);
    if (!expiry) return false;

    if (Date.now() > expiry) {
        sessions.delete(token);
        return false;
    }

    return true;
}

/** Header name clients should use */
export { SESSION_HEADER };
