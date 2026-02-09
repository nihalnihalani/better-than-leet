/**
 * Pipeline Integration Tests
 *
 * Tests for the full voice-code-analysis pipeline and component interactions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CodeHistory } from '../code-history';
import { ReportGenerator } from '../reporting';
import { validateRequest, ExecuteCodeRequestSchema, AutoFixRequestSchema } from '../schemas';

// Mock external dependencies
vi.mock('../gemini', () => ({
    analyzeCodeWithGemini: vi.fn().mockResolvedValue({
        score: 8,
        security_score: 9,
        complexity: 'medium',
        issues: [],
        security_issues: [],
        reasoning_trace: 'Mock analysis'
    }),
    autoFixCode: vi.fn().mockResolvedValue({
        fixedCode: 'def fixed(): pass',
        dependencies: []
    })
}));

vi.mock('../agent-reasoning', () => ({
    agentReasoning: {
        getEvaluation: vi.fn().mockResolvedValue('Mock evaluation summary')
    }
}));

describe('Code History Pipeline', () => {
    let history: CodeHistory;

    beforeEach(() => {
        history = new CodeHistory();
    });

    describe('Undo/Redo Operations', () => {
        it('should track code changes through the pipeline', () => {
            // Initial code
            history.push({ code: 'def hello(): pass', source: 'initial' });

            // User edits
            history.push({ code: 'def hello(): print("hi")', source: 'user' });

            // Auto-fix applies changes
            history.push({
                code: 'def hello():\n    """Say hello."""\n    print("hi")',
                source: 'autofix',
                metadata: { fixReason: 'Added docstring' }
            });

            expect(history.getLength()).toBe(3);
            expect(history.canUndo()).toBe(true);
            expect(history.canRedo()).toBe(false);
        });

        it('should allow undoing auto-fix operations', () => {
            history.push({ code: 'original', source: 'initial' });
            history.push({ code: 'user edit', source: 'user' });
            history.push({ code: 'auto fixed', source: 'autofix' });

            // Undo the auto-fix
            const restored = history.undo();
            expect(restored?.code).toBe('user edit');
            expect(restored?.source).toBe('user');

            // Redo should bring back auto-fix
            const redone = history.redo();
            expect(redone?.code).toBe('auto fixed');
            expect(redone?.source).toBe('autofix');
        });

        it('should find and undo last auto-fix', () => {
            history.push({ code: 'initial', source: 'initial' });
            history.push({ code: 'first fix', source: 'autofix' });
            history.push({ code: 'user edit', source: 'user' });
            history.push({ code: 'second fix', source: 'autofix' });

            const lastAutofix = history.findLastAutofix();
            expect(lastAutofix?.snapshot.code).toBe('second fix');

            // Undo to before last autofix
            const beforeFix = history.undoLastAutofix();
            expect(beforeFix?.code).toBe('user edit');
        });

        it('should handle rapid consecutive edits', () => {
            history.push({ code: 'start', source: 'initial' });

            // Simulate rapid typing
            for (let i = 0; i < 100; i++) {
                history.push({ code: `code version ${i}`, source: 'user' });
            }

            // History should be capped at maxHistory (50)
            expect(history.getLength()).toBeLessThanOrEqual(50);

            // Should still be able to undo/redo
            expect(history.canUndo()).toBe(true);

            const current = history.getCurrent();
            expect(current?.code).toBe('code version 99');
        });

        it('should not duplicate identical consecutive code', () => {
            history.push({ code: 'same code', source: 'initial' });
            history.push({ code: 'same code', source: 'user' });
            history.push({ code: 'same code', source: 'user' });

            // Should only have 1 entry (duplicates skipped)
            expect(history.getLength()).toBe(1);
        });

        it('should provide accurate statistics', () => {
            history.push({ code: 'initial', source: 'initial' });
            history.push({ code: 'edit 1', source: 'user' });
            history.push({ code: 'fix 1', source: 'autofix' });
            history.push({ code: 'edit 2', source: 'user' });
            history.push({ code: 'fix 2', source: 'autofix' });

            const stats = history.getStats();
            expect(stats.totalSnapshots).toBe(5);
            expect(stats.autofixCount).toBe(2);
            expect(stats.userEditCount).toBe(2);
        });
    });
});

describe('Schema Validation Pipeline', () => {
    describe('Execute Code Request', () => {
        it('should validate correct execute request', () => {
            const result = validateRequest(ExecuteCodeRequestSchema, {
                workspaceId: 'ws-123',
                code: 'print("hello")',
                language: 'python'
            });

            expect(result.success).toBe(true);
            expect(result.data?.workspaceId).toBe('ws-123');
        });

        it('should reject empty code', () => {
            const result = validateRequest(ExecuteCodeRequestSchema, {
                workspaceId: 'ws-123',
                code: '',
                language: 'python'
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain('empty');
        });

        it('should reject missing workspace ID', () => {
            const result = validateRequest(ExecuteCodeRequestSchema, {
                code: 'print("hello")',
                language: 'python'
            });

            expect(result.success).toBe(false);
        });

        it('should reject invalid language', () => {
            const result = validateRequest(ExecuteCodeRequestSchema, {
                workspaceId: 'ws-123',
                code: 'print("hello")',
                language: 'rust' // Not in valid languages
            });

            expect(result.success).toBe(false);
        });

        it('should apply default language when not provided', () => {
            const result = validateRequest(ExecuteCodeRequestSchema, {
                workspaceId: 'ws-123',
                code: 'print("hello")'
            });

            expect(result.success).toBe(true);
            expect(result.data?.language).toBe('python');
        });
    });

    describe('Auto-Fix Request', () => {
        it('should validate correct auto-fix request', () => {
            const result = validateRequest(AutoFixRequestSchema, {
                code: 'def broken():\nprint("hi")',
                error: 'IndentationError: expected an indented block',
                language: 'python'
            });

            expect(result.success).toBe(true);
        });

        it('should reject missing error message', () => {
            const result = validateRequest(AutoFixRequestSchema, {
                code: 'def broken():\nprint("hi")',
                language: 'python'
            });

            expect(result.success).toBe(false);
        });
    });

    describe('Path Validation Security', () => {
        it('should reject directory traversal attempts', async () => {
            const { PathSchema } = await import('../schemas');

            const maliciousPath = '../../../etc/passwd';
            const result = PathSchema.safeParse(maliciousPath);

            expect(result.success).toBe(false);
        });

        it('should reject null bytes in paths', async () => {
            const { PathSchema } = await import('../schemas');

            const nullBytePath = 'file\x00.txt';
            const result = PathSchema.safeParse(nullBytePath);

            expect(result.success).toBe(false);
        });

        it('should accept valid paths', async () => {
            const { PathSchema } = await import('../schemas');

            const validPath = 'src/components/App.tsx';
            const result = PathSchema.safeParse(validPath);

            expect(result.success).toBe(true);
        });
    });
});

describe('Report Generation Pipeline', () => {
    let generator: ReportGenerator;

    beforeEach(() => {
        generator = new ReportGenerator();
    });

    describe('Integrity Scoring', () => {
        it('should calculate high integrity for natural typing', async () => {
            // Mock store state would be needed for full test
            // Testing the markdown generation instead
            const mockReport = {
                candidateName: 'Test Candidate',
                position: 'Software Engineer',
                date: '2025-01-22',
                duration: 45,
                overallRecommendation: 'HIRE' as const,
                confidence: 85,
                codeQuality: {
                    overall: 8,
                    correctness: 9,
                    efficiency: 8,
                    codeStyle: 7,
                    edgeCases: 8,
                    breakdown: ['Good solution']
                },
                integrityScore: {
                    overall: 95,
                    tabSwitches: 2,
                    pasteEvents: 1,
                    largePastes: 0,
                    codeOriginality: 95,
                    typingPattern: 'natural' as const,
                    flags: []
                },
                agentEvaluation: 'Good performance'
            };

            const markdown = generator.generateMarkdown(mockReport);

            expect(markdown).toContain('HIRE');
            expect(markdown).toContain('95/100');
            expect(markdown).toContain('natural');
        });

        it('should flag suspicious behavior', () => {
            const mockReport = {
                candidateName: 'Test',
                position: 'Engineer',
                date: '2025-01-22',
                duration: 45,
                overallRecommendation: 'NO_HIRE' as const,
                confidence: 95,
                codeQuality: {
                    overall: 7,
                    correctness: 7,
                    efficiency: 7,
                    codeStyle: 7,
                    edgeCases: 7,
                    breakdown: []
                },
                integrityScore: {
                    overall: 50,
                    tabSwitches: 15,
                    pasteEvents: 10,
                    largePastes: 5,
                    codeOriginality: 40,
                    typingPattern: 'suspicious' as const,
                    flags: [
                        '15 tab switches (suspicious)',
                        '5 large paste events (high concern)',
                        'Code originality score: 40%'
                    ]
                },
                agentEvaluation: 'Concerns noted'
            };

            const markdown = generator.generateMarkdown(mockReport);

            expect(markdown).toContain('NO HIRE');
            expect(markdown).toContain('suspicious');
            expect(markdown).toContain('tab switches');
            expect(markdown).toContain('Flags');
        });
    });

    describe('Markdown Generation', () => {
        it('should include all required sections', () => {
            const mockReport = {
                candidateName: 'John Doe',
                position: 'Senior Engineer',
                date: '2025-01-22',
                duration: 60,
                overallRecommendation: 'STRONG_HIRE' as const,
                confidence: 92,
                codeQuality: {
                    overall: 9,
                    correctness: 9,
                    efficiency: 9,
                    codeStyle: 9,
                    edgeCases: 9,
                    breakdown: ['Excellent']
                },
                integrityScore: {
                    overall: 98,
                    tabSwitches: 0,
                    pasteEvents: 0,
                    largePastes: 0,
                    codeOriginality: 99,
                    typingPattern: 'natural' as const,
                    flags: []
                },
                agentEvaluation: 'Outstanding candidate'
            };

            const markdown = generator.generateMarkdown(mockReport);

            // Check all required sections
            expect(markdown).toContain('# Interview Report');
            expect(markdown).toContain('Code Quality Score');
            expect(markdown).toContain('Integrity Score');
            expect(markdown).toContain('AI Agent Evaluation');
            expect(markdown).toContain('John Doe');
            expect(markdown).toContain('Senior Engineer');
        });
    });
});

describe('Full Pipeline Concurrent Requests', () => {
    it('should handle multiple concurrent validation requests', async () => {
        const requests = Array(20).fill(null).map((_, i) => ({
            workspaceId: `ws-${i}`,
            code: `print(${i})`,
            language: 'python'
        }));

        const validations = requests.map(req =>
            validateRequest(ExecuteCodeRequestSchema, req)
        );

        const results = await Promise.all(validations.map(v => Promise.resolve(v)));

        expect(results.every(r => r.success)).toBe(true);
        expect(results).toHaveLength(20);
    });

    it('should handle mixed valid/invalid concurrent requests', async () => {
        const requests = [
            { workspaceId: 'ws-1', code: 'valid code' },
            { workspaceId: '', code: 'invalid - empty ws id' },
            { workspaceId: 'ws-2', code: '' },
            { workspaceId: 'ws-3', code: 'valid again' },
        ];

        const results = requests.map(req =>
            validateRequest(ExecuteCodeRequestSchema, req)
        );

        expect(results[0].success).toBe(true);
        expect(results[1].success).toBe(false);
        expect(results[2].success).toBe(false);
        expect(results[3].success).toBe(true);
    });
});
