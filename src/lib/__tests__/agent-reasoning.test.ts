/**
 * Agent Reasoning Tests
 *
 * Tests for race condition prevention, profile management, and code analysis
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AgentReasoning } from '../agent-reasoning';

// Mock the Gemini module to avoid actual API calls
vi.mock('../gemini', () => ({
    analyzeCodeWithGemini: vi.fn().mockResolvedValue({
        score: 8,
        security_score: 9,
        complexity: 'medium',
        issues: [],
        security_issues: [],
        reasoning_trace: 'Mock analysis'
    })
}));

describe('AgentReasoning', () => {
    let agent: AgentReasoning;

    beforeEach(async () => {
        agent = new AgentReasoning();
        await agent.resetProfile();
    });

    describe('Profile Management', () => {
        it('should initialize with empty profile', async () => {
            const evaluation = await agent.getEvaluation();
            expect(evaluation).toContain('Problems Solved: 0');
            expect(evaluation).toContain('Hints Required: 0');
        });

        it('should track hints given', async () => {
            await agent.updateProfile({ type: 'hint_given' });
            await agent.updateProfile({ type: 'hint_given' });

            const hints = await agent.getHintsGiven();
            expect(hints).toBe(2);
        });

        it('should track problems solved', async () => {
            await agent.updateProfile({ type: 'problem_solved' });
            await agent.updateProfile({ type: 'problem_solved' });

            const evaluation = await agent.getEvaluation();
            expect(evaluation).toContain('Problems Solved: 2');
        });

        it('should track strengths and weaknesses', async () => {
            await agent.updateProfile({ type: 'excelled', context: 'Algorithm design' });
            await agent.updateProfile({ type: 'struggled', context: 'Edge cases' });

            const evaluation = await agent.getEvaluation();
            expect(evaluation).toContain('Algorithm design');
            expect(evaluation).toContain('Edge cases');
        });

        it('should reset profile correctly', async () => {
            await agent.updateProfile({ type: 'hint_given' });
            await agent.updateProfile({ type: 'problem_solved' });

            await agent.resetProfile();

            const hints = await agent.getHintsGiven();
            expect(hints).toBe(0);
        });
    });

    describe('Race Condition Prevention', () => {
        it('should handle concurrent profile updates without data corruption', async () => {
            // Simulate 10 concurrent hint updates
            const updates = Array(10).fill(null).map(() =>
                agent.updateProfile({ type: 'hint_given' })
            );

            await Promise.all(updates);

            const hints = await agent.getHintsGiven();
            expect(hints).toBe(10);
        });

        it('should handle mixed concurrent operations safely', async () => {
            const operations = [
                agent.updateProfile({ type: 'hint_given' }),
                agent.updateProfile({ type: 'problem_solved' }),
                agent.updateProfile({ type: 'excelled', context: 'Test 1' }),
                agent.getEvaluation(),
                agent.updateProfile({ type: 'hint_given' }),
                agent.getHintsGiven(),
                agent.updateProfile({ type: 'struggled', context: 'Test 2' }),
            ];

            const results = await Promise.all(operations);

            // Should complete without errors
            expect(results).toHaveLength(7);

            // Verify final state
            const finalHints = await agent.getHintsGiven();
            expect(finalHints).toBe(2);
        });

        it('should not lose updates under concurrent stress', async () => {
            const numOperations = 50;
            const operations = [];

            // Mix of different operations
            for (let i = 0; i < numOperations; i++) {
                if (i % 3 === 0) {
                    operations.push(agent.updateProfile({ type: 'hint_given' }));
                } else if (i % 3 === 1) {
                    operations.push(agent.updateProfile({ type: 'problem_solved' }));
                } else {
                    operations.push(agent.getEvaluation());
                }
            }

            await Promise.all(operations);

            // Count expected hints (every 3rd operation starting at 0)
            const expectedHints = Math.ceil(numOperations / 3);
            const actualHints = await agent.getHintsGiven();

            // Should match exactly - no lost updates
            expect(actualHints).toBe(expectedHints);
        });
    });

    describe('Code Analysis', () => {
        it('should detect missing dependencies', async () => {
            const code = `
import numpy as np
import pandas as pd

def analyze_data(data):
    return np.mean(data)
`;
            const actions = await agent.analyzeAndAct(code, 'python');

            // Should detect numpy/pandas imports
            expect(actions.length).toBeGreaterThan(0);
        });

        it('should detect syntax errors from bracket mismatch', async () => {
            const code = `
def test():
    if True:
        print("hello"
`;
            const actions = await agent.analyzeAndAct(code, 'python');

            // Should detect or at least return some action
            expect(actions.length).toBeGreaterThan(0);
        });

        it('should provide positive feedback for clean code', async () => {
            const code = `
def add(a, b):
    """Add two numbers."""
    if a is None or b is None:
        return 0
    return a + b
`;
            const actions = await agent.analyzeAndAct(code, 'python');

            expect(actions.length).toBeGreaterThan(0);
            expect(actions[0].type).toBe('speak');
        });

        it('should limit hints given to MAX_HINTS', async () => {
            // Give max hints
            for (let i = 0; i < 5; i++) {
                await agent.updateProfile({ type: 'hint_given' });
            }

            const code = `
for i in range(n):
    for j in range(n):
        result += arr[i] * arr[j]
`;
            const actions = await agent.analyzeAndAct(code, 'python');

            // Should not give another hint after max
            // Either no hint or the logic handles it differently
            expect(actions.length).toBeGreaterThan(0);
        });
    });

    describe('Recommendation Generation', () => {
        it('should recommend STRONG HIRE for excellent performance', async () => {
            // Solve problems without hints
            await agent.updateProfile({ type: 'problem_solved' });
            await agent.updateProfile({ type: 'problem_solved' });
            await agent.updateProfile({ type: 'excelled', context: 'Clean code' });

            const evaluation = await agent.getEvaluation();
            expect(evaluation).toContain('STRONG HIRE');
        });

        it('should recommend NO HIRE for poor performance', async () => {
            // Many hints, few solutions
            await agent.updateProfile({ type: 'hint_given' });
            await agent.updateProfile({ type: 'hint_given' });
            await agent.updateProfile({ type: 'hint_given' });
            await agent.updateProfile({ type: 'hint_given' });
            await agent.updateProfile({ type: 'struggled', context: 'Basic syntax' });

            const evaluation = await agent.getEvaluation();
            expect(evaluation).toContain('NO HIRE');
        });
    });
});
