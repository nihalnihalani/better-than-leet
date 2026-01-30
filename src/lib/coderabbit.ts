// src/lib/coderabbit.ts

import { daytonaService } from './daytona';

export interface CodeRabbitReview {
  summary: string;
  walkthrough: string[];
  issues: {
    severity: 'high' | 'medium' | 'low';
    message: string;
    line?: number;
  }[];
}

// Helper to determine if mock mode should be used
// Defaults to mock mode (safe) unless explicitly set to 'false'
function shouldUseMock(): boolean {
  const mockEnv = process.env.NEXT_PUBLIC_USE_MOCK_CODERABBIT;
  // Use mock if env var is not set OR if it's not explicitly 'false'
  return !mockEnv || mockEnv.toLowerCase() !== 'false';
}

export class CodeRabbitService {
  async analyzeSandbox(workspaceId: string): Promise<CodeRabbitReview> {
      const useMock = shouldUseMock();
      
      if (useMock) {
          console.log(`[CodeRabbit] Analyzing sandbox ${workspaceId} (MOCK)...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          return this.getMockReview("def mock_code(): pass");
      }

      console.log(`[CodeRabbit] Analyzing sandbox ${workspaceId} (REAL)...`);
      // Run CodeRabbit CLI in the sandbox
      // Assuming 'coderabbit' is in PATH or we use full path. 
      // We run review --plain to get text output.
      const result = await daytonaService.executeCommand(workspaceId, 'coderabbit review --plain');
      
      if (result.exitCode !== 0) {
          console.error("CodeRabbit CLI failed:", result.stderr);
          throw new Error(`CodeRabbit CLI failed: ${result.stderr}`);
      }

      // Parse the plain text output into a structured review
      // This is a simplification. Real CLI output parsing would depend on the format.
      // For now, we wrap the raw output in a basic structure.
      return this.parseCLIOutput(result.stdout);
  }

  private parseCLIOutput(output: string): CodeRabbitReview {
      // Basic parsing logic - treat lines as issues or summary
      // This is a placeholder for actual parsing of the CLI output
      return {
          summary: "CodeRabbit Analysis Result",
          walkthrough: ["Analysis completed via CLI."],
          issues: [
              {
                  severity: 'medium',
                  message: output.slice(0, 200) + (output.length > 200 ? "..." : ""),
                  line: 0
              }
          ]
      };
  }

  async analyzeCode(code: string, language: string): Promise<CodeRabbitReview> {
    const useMock = shouldUseMock();

    if (useMock) {
        console.log(`[CodeRabbit] Analyzing ${language} code (MOCK)...`);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.getMockReview(code);
    }

    // Real implementation placeholder
    console.log(`[CodeRabbit] Analyzing ${language} code (REAL)...`);
    // In a real scenario, this would SSH into the Daytona sandbox and run the CLI.
    // For now, fallback to mock until CLI is configured
    return this.getMockReview(code);
  }

  private getMockReview(code: string): CodeRabbitReview {
    const isPython = code.includes('def ') || code.includes('import ');
    
    return {
      summary: "I've reviewed your code changes. The logic seems sound, but there are a few opportunities for optimization and better error handling.",
      walkthrough: [
        "Analyzed the main algorithm structure.",
        "Checked for time complexity bottlenecks.",
        "Verified variable naming conventions.",
        "Scanned for potential edge cases."
      ],
      issues: [
        {
          severity: 'medium',
          message: "Consider adding type hints (if Python 3.5+) or stricter types to improve readability and tooling support.",
          line: 1
        },
        {
          severity: 'low',
          message: "A few variable names could be more descriptive to explain their intent.",
          line: 3
        }
      ]
    };
  }
}

export const codeRabbitService = new CodeRabbitService();
