import { describe, it, expect } from 'vitest';
import { daytonaService } from './daytona';

// Only run if we have a real API key and we explicitly want to run integration tests
const runIntegration = process.env.RUN_INTEGRATION_TESTS === 'true' && process.env.DAYTONA_API_KEY;

describe.skipIf(!runIntegration)('DaytonaService Integration', () => {
  it('should create and cleanup a real workspace', async () => {
    try {
      // 1. Create
      console.log('Creating integration workspace...');
      const workspace = await daytonaService.createWorkspace({ language: 'python' });
      expect(workspace.id).toBeDefined();

      // 2. Execute simple code
      console.log(`Executing code in ${workspace.id}...`);
      const result = await daytonaService.executeCode(workspace.id, 'print("integration test")', 'python');
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('integration test');

      // 3. Cleanup
      console.log(`Cleaning up ${workspace.id}...`);
      await daytonaService.cleanupWorkspace(workspace.id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Skip test gracefully if there are resource limits
      if (errorMessage.includes('disk limit') ||
          errorMessage.includes('limit exceeded') ||
          errorMessage.includes('Maximum allowed')) {
        console.log('⚠️ Skipping test due to Daytona resource limits:', errorMessage);
        console.log('💡 Consider archiving unused sandboxes at https://app.daytona.io/dashboard');
        return; // Skip gracefully instead of failing
      }

      // Re-throw other errors
      throw error;
    }
  }, 120000); // Long timeout for real provisioning
});
