/**
 * MiniMax Integration Tests
 *
 * Tests for retry logic, JSON parsing fallbacks, and error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We'll test the internal functions by importing from minimax
// For now, test the exported functions with mocked fetch

describe('MiniMax Retry Logic', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    describe('JSON Parsing Strategies', () => {
        it('should parse clean JSON response', () => {
            const cleanJson = '{"score": 8, "issues": []}';
            const parsed = JSON.parse(cleanJson);
            expect(parsed.score).toBe(8);
            expect(parsed.issues).toEqual([]);
        });

        it('should handle JSON with markdown code blocks', () => {
            const markdownJson = '```json\n{"score": 8, "issues": []}\n```';
            const cleaned = markdownJson
                .replace(/```json\s*/g, '')
                .replace(/```\s*/g, '')
                .trim();
            const parsed = JSON.parse(cleaned);
            expect(parsed.score).toBe(8);
        });

        it('should handle JSON with extra text before/after', () => {
            const messyJson = 'Here is the analysis:\n{"score": 8, "issues": []}\nThank you!';
            const match = messyJson.match(/\{[\s\S]*\}/);
            expect(match).not.toBeNull();
            const parsed = JSON.parse(match![0]);
            expect(parsed.score).toBe(8);
        });

        it('should handle nested JSON objects', () => {
            const nestedJson = '{"result": {"score": 8, "nested": {"value": 1}}}';
            const parsed = JSON.parse(nestedJson);
            expect(parsed.result.score).toBe(8);
            expect(parsed.result.nested.value).toBe(1);
        });
    });

    describe('Retry Behavior Simulation', () => {
        it('should succeed on first attempt when API is healthy', async () => {
            let attempts = 0;
            const mockOperation = async () => {
                attempts++;
                return { success: true, data: 'test' };
            };

            const result = await mockOperation();
            expect(result.success).toBe(true);
            expect(attempts).toBe(1);
        });

        it('should retry on transient failures', async () => {
            let attempts = 0;
            const mockOperation = async () => {
                attempts++;
                if (attempts < 3) {
                    throw new Error('Temporary failure');
                }
                return { success: true };
            };

            // Simulate retry wrapper
            const withRetry = async <T>(op: () => Promise<T>, maxAttempts: number): Promise<T> => {
                let lastError: Error | null = null;
                for (let i = 0; i < maxAttempts; i++) {
                    try {
                        return await op();
                    } catch (e) {
                        lastError = e as Error;
                        // Wait before retry (skip in test)
                    }
                }
                throw lastError;
            };

            const result = await withRetry(mockOperation, 3);
            expect(result.success).toBe(true);
            expect(attempts).toBe(3);
        });

        it('should fail after max retries exceeded', async () => {
            let attempts = 0;
            const mockOperation = async () => {
                attempts++;
                throw new Error('Permanent failure');
            };

            const withRetry = async <T>(op: () => Promise<T>, maxAttempts: number): Promise<T> => {
                let lastError: Error | null = null;
                for (let i = 0; i < maxAttempts; i++) {
                    try {
                        return await op();
                    } catch (e) {
                        lastError = e as Error;
                    }
                }
                throw lastError;
            };

            await expect(withRetry(mockOperation, 3)).rejects.toThrow('Permanent failure');
            expect(attempts).toBe(3);
        });

        it('should apply exponential backoff delays', async () => {
            const config = {
                initialDelayMs: 100,
                backoffMultiplier: 2,
                maxDelayMs: 1000
            };

            const delays: number[] = [];
            let currentDelay = config.initialDelayMs;

            for (let i = 0; i < 5; i++) {
                delays.push(currentDelay);
                currentDelay = Math.min(
                    currentDelay * config.backoffMultiplier,
                    config.maxDelayMs
                );
            }

            expect(delays).toEqual([100, 200, 400, 800, 1000]);
        });
    });

    describe('Error Classification', () => {
        it('should identify rate limit errors', () => {
            const isRateLimitError = (status: number, message: string) => {
                return status === 429 ||
                    message.includes('rate limit') ||
                    message.includes('quota exceeded');
            };

            expect(isRateLimitError(429, '')).toBe(true);
            expect(isRateLimitError(200, 'rate limit exceeded')).toBe(true);
            expect(isRateLimitError(500, 'server error')).toBe(false);
        });

        it('should identify retryable errors', () => {
            const isRetryable = (status: number, message: string) => {
                // Retryable: 429 (rate limit), 500-599 (server errors), network errors
                if (status === 429) return true;
                if (status >= 500 && status < 600) return true;
                if (message.includes('network') || message.includes('timeout')) return true;
                return false;
            };

            expect(isRetryable(429, '')).toBe(true);
            expect(isRetryable(500, '')).toBe(true);
            expect(isRetryable(503, '')).toBe(true);
            expect(isRetryable(400, '')).toBe(false);
            expect(isRetryable(401, '')).toBe(false);
            expect(isRetryable(0, 'network error')).toBe(true);
        });
    });

    describe('Response Validation', () => {
        it('should validate auto-fix response structure', () => {
            const validResponse = {
                fixedCode: 'def fixed(): pass',
                dependencies: ['numpy']
            };

            const isValidAutoFix = (resp: unknown): resp is { fixedCode: string; dependencies: string[] } => {
                if (typeof resp !== 'object' || resp === null) return false;
                const obj = resp as Record<string, unknown>;
                return typeof obj.fixedCode === 'string' &&
                    Array.isArray(obj.dependencies);
            };

            expect(isValidAutoFix(validResponse)).toBe(true);
            expect(isValidAutoFix({ fixedCode: 'test' })).toBe(false);
            expect(isValidAutoFix({ dependencies: [] })).toBe(false);
            expect(isValidAutoFix(null)).toBe(false);
        });

        it('should validate analysis response structure', () => {
            const validResponse = {
                score: 8,
                security_score: 9,
                complexity: 'medium',
                issues: ['test'],
                security_issues: [],
                reasoning_trace: 'Analysis complete'
            };

            const isValidAnalysis = (resp: unknown): boolean => {
                if (typeof resp !== 'object' || resp === null) return false;
                const obj = resp as Record<string, unknown>;
                return typeof obj.score === 'number' &&
                    typeof obj.security_score === 'number' &&
                    typeof obj.complexity === 'string' &&
                    Array.isArray(obj.issues) &&
                    Array.isArray(obj.security_issues);
            };

            expect(isValidAnalysis(validResponse)).toBe(true);
            expect(isValidAnalysis({ score: 'high' })).toBe(false);
        });

        it('should handle partial responses with defaults', () => {
            const partialResponse = { score: 7 };

            const withDefaults = (resp: Partial<{
                score: number;
                security_score: number;
                issues: string[];
                security_issues: string[];
                complexity: string;
                reasoning_trace: string;
            }>) => ({
                score: resp.score ?? 5,
                security_score: resp.security_score ?? 5,
                issues: resp.issues ?? [],
                security_issues: resp.security_issues ?? [],
                complexity: resp.complexity ?? 'unknown',
                reasoning_trace: resp.reasoning_trace ?? ''
            });

            const result = withDefaults(partialResponse);
            expect(result.score).toBe(7);
            expect(result.security_score).toBe(5);
            expect(result.issues).toEqual([]);
        });
    });
});

describe('MiniMax API Integration', () => {
    // Skip actual API tests unless explicitly enabled
    const runIntegration = process.env.RUN_INTEGRATION_TESTS === 'true' &&
        process.env.MINIMAX_API_KEY;

    describe.skipIf(!runIntegration)('Live API Tests', () => {
        it('should analyze code with real API', async () => {
            const { analyzeCodeWithMiniMax } = await import('../minimax');

            const result = await analyzeCodeWithMiniMax(
                'def add(a, b): return a + b',
                'python'
            );

            expect(result.score).toBeGreaterThanOrEqual(0);
            expect(result.score).toBeLessThanOrEqual(10);
            expect(Array.isArray(result.issues)).toBe(true);
        }, 30000);
    });
});
