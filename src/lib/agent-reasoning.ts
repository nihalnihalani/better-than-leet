import { Mutex } from 'async-mutex';
import { analyzeCodeWithMiniMax } from './minimax';
import { COMPLEXITY_HIGH, COMPLEXITY_MEDIUM, MAX_HINTS } from './constants';

/**
 * Advanced Agent Reasoning System
 * Provides multi-step decision making and autonomous actions for the interview agent
 *
 * Thread Safety: Uses async-mutex to protect candidateProfile from race conditions
 * when multiple concurrent calls to analyzeAndAct() or updateProfile() occur.
 */

export interface AgentAction {
    type: 'speak' | 'install' | 'execute' | 'test' | 'analyze' | 'hint' | 'verify';
    content?: string;
    package?: string;
    manager?: 'pip' | 'npm';
    code?: string;
    expectedOutput?: string;
    level?: 'subtle' | 'direct' | 'solution';
}

export interface CodeAnalysis {
    hasMissingDependency: boolean;
    missingPackages: string[];
    complexityScore: number;
    hasEdgeCaseIssues: boolean;
    hasSyntaxErrors: boolean;
    hasLogicErrors: boolean;
    optimizationOpportunities: string[];
    securityIssues: string[];
}

export interface CandidateProfile {
    strengths: string[];
    weaknesses: string[];
    hintsGiven: number;
    problemsSolved: number;
    averageTimeToSolve: number;
    needsEncouragement: boolean;
}

export class AgentReasoning {
    private candidateProfile: CandidateProfile = {
        strengths: [],
        weaknesses: [],
        hintsGiven: 0,
        problemsSolved: 0,
        averageTimeToSolve: 0,
        needsEncouragement: false,
    };

    // Mutex to protect candidateProfile from concurrent modifications
    private profileMutex = new Mutex();

    /**
     * Analyze code and determine next actions
     * Thread-safe: Uses mutex to protect profile reads/writes
     */
    async analyzeAndAct(code: string, language: string = 'python'): Promise<AgentAction[]> {
        const analysis = await this.deepAnalysis(code, language);
        const actions: AgentAction[] = [];

        // Priority 1: Handle missing dependencies
        if (analysis.hasMissingDependency && analysis.missingPackages.length > 0) {
            const pkg = analysis.missingPackages[0];
            actions.push(
                {
                    type: 'speak',
                    content: `I notice you're trying to use ${pkg}. Let me install that for you.`
                },
                {
                    type: 'install',
                    package: pkg,
                    manager: this.detectPackageManager(code, language)
                },
                {
                    type: 'speak',
                    content: `Great! ${pkg} is installed. Try running your code again.`
                }
            );
            return actions;
        }

        // Priority 2: Handle syntax errors
        if (analysis.hasSyntaxErrors) {
            actions.push({
                type: 'speak',
                content: 'I see a syntax error. Check your brackets and indentation.',
            });
            return actions;
        }

        // Priority 3: Handle logic errors with testing
        if (analysis.hasLogicErrors) {
            actions.push(
                {
                    type: 'speak',
                    content: 'Let me run some tests to verify your logic...',
                },
                {
                    type: 'test',
                    code: this.generateTestCode(code),
                }
            );
            return actions;
        }

        // Priority 4: Complexity optimization (protected by mutex)
        if (analysis.complexityScore > (COMPLEXITY_HIGH - 1)) {
            const shouldGiveHint = await this.profileMutex.runExclusive(async () => {
                if (this.candidateProfile.hintsGiven < MAX_HINTS) {
                    this.candidateProfile.hintsGiven++;
                    return true;
                }
                return false;
            });

            if (shouldGiveHint) {
                const hint = this.generateComplexityHint(analysis);
                actions.push({
                    type: 'hint',
                    level: 'subtle',
                    content: hint,
                });
                return actions;
            }
        }

        // Priority 5: Edge case handling
        if (analysis.hasEdgeCaseIssues) {
            actions.push({
                type: 'speak',
                content: 'Your solution works for the basic case. Have you considered edge cases like empty input or very large numbers?',
            });
            return actions;
        }

        // Priority 6: Security issues
        if (analysis.securityIssues.length > 0) {
            actions.push({
                type: 'speak',
                content: `I noticed a potential security issue: ${analysis.securityIssues[0]}. Can you address that?`,
            });
            return actions;
        }

        // Priority 7: Optimization opportunities
        if (analysis.optimizationOpportunities.length > 0) {
            actions.push({
                type: 'speak',
                content: `Good solution! ${analysis.optimizationOpportunities[0]}`,
            });
            return actions;
        }

        // Default: Positive feedback
        actions.push({
            type: 'speak',
            content: 'Looking good! Your code is clean and efficient.',
        });

        return actions;
    }

    /**
     * Deep code analysis using MiniMax AI with fallback to heuristics
     */
    private async deepAnalysis(code: string, language: string): Promise<CodeAnalysis> {
        // Initial fallback analysis structure
        const analysis: CodeAnalysis = {
            hasMissingDependency: false,
            missingPackages: [],
            complexityScore: 0,
            hasEdgeCaseIssues: false,
            hasSyntaxErrors: false,
            hasLogicErrors: false,
            optimizationOpportunities: [],
            securityIssues: [],
        };

        try {
            // Use MiniMax for deep semantic analysis
            const aiResult = await analyzeCodeWithMiniMax(code, language);

            // Map AI result to our internal structure
            analysis.complexityScore = aiResult.score ? (10 - aiResult.score) * 2 : 0; // Inverse score mapping

            // Heuristic for missing dependencies (MiniMax might miss specific import checks)
            const importMatches = code.match(/import\s+(\w+)|from\s+(\w+)\s+import/g);
            const commonPackages = ['numpy', 'pandas', 'requests', 'flask', 'django', 'matplotlib', 'scipy'];
            if (importMatches) {
                importMatches.forEach((match) => {
                    const pkg = match.match(/(?:import|from)\s+(\w+)/)?.[1];
                    if (pkg && commonPackages.includes(pkg.toLowerCase())) {
                        analysis.hasMissingDependency = true;
                        analysis.missingPackages.push(pkg.toLowerCase());
                    }
                });
            }

            // Map AI issues to categories
            if (aiResult.issues && aiResult.issues.length > 0) {
                aiResult.issues.forEach((issue: string) => {
                    const lowerIssue = issue.toLowerCase();
                    if (lowerIssue.includes('syntax') || lowerIssue.includes('indentation')) {
                        analysis.hasSyntaxErrors = true;
                    } else if (lowerIssue.includes('logic') || lowerIssue.includes('bug')) {
                        analysis.hasLogicErrors = true;
                    } else if (lowerIssue.includes('edge case') || lowerIssue.includes('empty')) {
                        analysis.hasEdgeCaseIssues = true;
                    } else {
                        // Treat generic issues as optimization opportunities or general feedback
                        analysis.optimizationOpportunities.push(issue);
                    }
                });
            }

            if (aiResult.security_issues && aiResult.security_issues.length > 0) {
                analysis.securityIssues = aiResult.security_issues;
            }

            // Fallback: If AI fails to detect complexity but we see nested loops
            const nestedLoops = (code.match(/for\s+.*:\s*\n\s+for\s+/g) || []).length;
            if (nestedLoops > 0 && analysis.complexityScore < 5) {
                analysis.complexityScore = Math.min(10, nestedLoops * 3 + 5);
            }

        } catch (error) {
            console.error("AI Analysis failed, falling back to heuristics", error);
            // Fallback to original heuristics if AI fails
            this.runHeuristics(code, analysis);
        }

        return analysis;
    }

    private runHeuristics(code: string, analysis: CodeAnalysis) {
        // Simple syntax check
        const openBrackets = (code.match(/[\(\[\{]/g) || []).length;
        const closeBrackets = (code.match(/[\)\]\}]/g) || []).length;
        if (openBrackets !== closeBrackets) {
            analysis.hasSyntaxErrors = true;
        }

        // Complexity analysis (nested loops)
        const nestedLoops = (code.match(/for\s+.*:\s*\n\s+for\s+/g) || []).length;
        analysis.complexityScore = Math.min(10, nestedLoops * 3 + 5);

        // Edge case detection
        const hasNullCheck = code.includes('if not') || code.includes('is None');
        const hasEmptyCheck = code.includes('len(') && code.includes('== 0');
        if (!hasNullCheck && !hasEmptyCheck && code.includes('def ')) {
            analysis.hasEdgeCaseIssues = true;
        }

        // Security checks
        if (code.includes('eval(') || code.includes('exec(')) {
            analysis.securityIssues.push('Using eval() or exec() can be dangerous.');
        }
    }

    /**
     * Generate test code for hidden testing
     */
    private generateTestCode(code: string): string {
        // Extract function name
        const funcMatch = code.match(/def\s+(\w+)\s*\(/);
        const funcName = funcMatch ? funcMatch[1] : 'solution';

        return `
${code}

# Hidden test cases
test_cases = [
    ([], []),  # Empty input
    ([1], [1]),  # Single element
    ([1, 2, 3], [1, 2, 3]),  # Basic case
    (list(range(1000)), list(range(1000))),  # Large input
]

print("Running hidden tests...")
for i, (input_val, expected) in enumerate(test_cases):
    try:
        result = ${funcName}(input_val)
        if result == expected:
            print(f"Test {i+1}: PASS")
        else:
            print(f"Test {i+1}: FAIL - Expected {expected}, got {result}")
    except Exception as e:
        print(f"Test {i+1}: ERROR - {str(e)}")
`;
    }

    /**
     * Generate complexity hint based on analysis
     */
    private generateComplexityHint(analysis: CodeAnalysis): string {
        if (analysis.complexityScore > COMPLEXITY_HIGH) {
            return 'This approach works, but has O(n²) complexity. Can you think of a way to solve it in O(n) using a hash map?';
        } else if (analysis.complexityScore > COMPLEXITY_MEDIUM) {
            return 'Good progress! There might be a more efficient approach. Consider what data structure could help you avoid nested loops.';
        }
        return 'Your solution is efficient. Nice work!';
    }

    /**
     * Detect package manager based on code
     */
    private detectPackageManager(code: string, language: string): 'pip' | 'npm' {
        if (language === 'typescript' || language === 'javascript') return 'npm';
        if (language === 'python') return 'pip';

        // Fallback heuristics
        if (code.includes('import ') || code.includes('from ')) return 'pip';
        if (code.includes('require(') || code.includes('import {')) return 'npm';
        return 'pip';
    }

    /**
     * Update candidate profile based on performance
     * Thread-safe: Uses mutex to protect profile modifications
     */
    async updateProfile(event: {
        type: 'hint_given' | 'problem_solved' | 'struggled' | 'excelled';
        context?: string;
    }): Promise<void> {
        await this.profileMutex.runExclusive(async () => {
            switch (event.type) {
                case 'hint_given':
                    this.candidateProfile.hintsGiven++;
                    break;
                case 'problem_solved':
                    this.candidateProfile.problemsSolved++;
                    break;
                case 'struggled':
                    this.candidateProfile.needsEncouragement = true;
                    if (event.context) {
                        this.candidateProfile.weaknesses.push(event.context);
                    }
                    break;
                case 'excelled':
                    if (event.context) {
                        this.candidateProfile.strengths.push(event.context);
                    }
                    break;
            }
        });
    }

    /**
     * Get candidate evaluation summary
     * Thread-safe: Uses mutex to protect profile reads
     */
    async getEvaluation(): Promise<string> {
        return await this.profileMutex.runExclusive(async () => {
            const { strengths, weaknesses, hintsGiven, problemsSolved } = this.candidateProfile;

            let evaluation = `Candidate Performance Summary:\n\n`;
            evaluation += `Problems Solved: ${problemsSolved}\n`;
            evaluation += `Hints Required: ${hintsGiven}\n\n`;

            if (strengths.length > 0) {
                evaluation += `Strengths:\n${strengths.map(s => `- ${s}`).join('\n')}\n\n`;
            }

            if (weaknesses.length > 0) {
                evaluation += `Areas for Improvement:\n${weaknesses.map(w => `- ${w}`).join('\n')}\n\n`;
            }

            // Overall recommendation
            const score = (problemsSolved * 10) - (hintsGiven * 2);
            if (score >= 8) {
                evaluation += `Recommendation: STRONG HIRE - Excellent problem-solving skills with minimal guidance needed.`;
            } else if (score >= 5) {
                evaluation += `Recommendation: HIRE - Solid performance with good potential.`;
            } else if (score >= 3) {
                evaluation += `Recommendation: MAYBE - Shows promise but needs more development.`;
            } else {
                evaluation += `Recommendation: NO HIRE - Struggled significantly with basic concepts.`;
            }

            return evaluation;
        });
    }

    /**
     * Reset candidate profile (for testing or new sessions)
     * Thread-safe: Uses mutex to protect profile modifications
     */
    async resetProfile(): Promise<void> {
        await this.profileMutex.runExclusive(async () => {
            this.candidateProfile = {
                strengths: [],
                weaknesses: [],
                hintsGiven: 0,
                problemsSolved: 0,
                averageTimeToSolve: 0,
                needsEncouragement: false,
            };
        });
    }

    /**
     * Get current hints count (for UI display)
     * Thread-safe: Uses mutex to protect profile reads
     */
    async getHintsGiven(): Promise<number> {
        return await this.profileMutex.runExclusive(async () => {
            return this.candidateProfile.hintsGiven;
        });
    }
}

// Singleton instance
export const agentReasoning = new AgentReasoning();
