#!/usr/bin/env node

/**
 * Integration Test Script
 * Tests Daytona and Gemini integrations against a running server
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

function log(message) {
  console.log(message);
}

function addResult(name, status, details = '') {
  results.tests.push({ name, status, details });
  if (status === 'passed') results.passed++;
  else if (status === 'failed') results.failed++;
  else results.skipped++;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// Test: Server Health
// ============================================================================
async function testServerHealth() {
  log('\n=== Test: Server Health ===');
  try {
    const res = await fetch(BASE_URL);
    if (res.ok) {
      log('✅ Server is responding');
      addResult('Server Health', 'passed');
      return true;
    } else {
      log(`❌ Server returned ${res.status}`);
      addResult('Server Health', 'failed', `Status: ${res.status}`);
      return false;
    }
  } catch (error) {
    log(`❌ Server not reachable: ${error.message}`);
    addResult('Server Health', 'failed', error.message);
    return false;
  }
}

// ============================================================================
// Test: Daytona Workspace Creation
// ============================================================================
async function testDaytonaWorkspace() {
  log('\n=== Test: Daytona Workspace Creation ===');

  if (!process.env.DAYTONA_API_KEY) {
    log('⏭️  Skipped (DAYTONA_API_KEY not set)');
    addResult('Daytona Workspace', 'skipped', 'No API key');
    return null;
  }

  try {
    const res = await fetch(`${BASE_URL}/api/sandbox/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: 'python' })
    });

    const data = await res.json();
    const workspaceId = data.id || data.data?.id;

    if (workspaceId) {
      log(`✅ Workspace created: ${workspaceId}`);
      addResult('Daytona Workspace', 'passed', workspaceId);
      return workspaceId;
    } else {
      const errorMsg = data.error || 'Unknown error';
      // Handle quota/limit errors as warnings, not failures
      if (errorMsg.includes('limit exceeded') || errorMsg.includes('quota')) {
        log(`⚠️ Workspace creation skipped (quota limit): ${errorMsg.substring(0, 60)}`);
        addResult('Daytona Workspace', 'skipped', 'Quota limit');
        return null;
      }
      log(`❌ Failed to create workspace: ${JSON.stringify(data).substring(0, 100)}`);
      addResult('Daytona Workspace', 'failed', errorMsg);
      return null;
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`);
    addResult('Daytona Workspace', 'failed', error.message);
    return null;
  }
}

// ============================================================================
// Test: Code Execution
// ============================================================================
async function testCodeExecution(workspaceId) {
  log('\n=== Test: Code Execution ===');

  if (!workspaceId) {
    log('⏭️  Skipped (no workspace)');
    addResult('Code Execution', 'skipped', 'No workspace');
    return false;
  }

  try {
    const res = await fetch(`${BASE_URL}/api/sandbox/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workspaceId,
        code: 'print("Hello from CI!")\nprint(2 + 2)',
        language: 'python'
      })
    });

    const data = await res.json();
    const stdout = data.stdout || data.data?.stdout;

    if (stdout && stdout.includes('Hello from CI')) {
      log(`✅ Code execution works: ${stdout.trim().substring(0, 50)}`);
      addResult('Code Execution', 'passed');
      return true;
    } else {
      log(`❌ Unexpected output: ${JSON.stringify(data).substring(0, 100)}`);
      addResult('Code Execution', 'failed', 'Unexpected output');
      return false;
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`);
    addResult('Code Execution', 'failed', error.message);
    return false;
  }
}

// ============================================================================
// Test: File Operations
// ============================================================================
async function testFileOperations(workspaceId) {
  log('\n=== Test: File Operations ===');

  if (!workspaceId) {
    log('⏭️  Skipped (no workspace)');
    addResult('File Operations', 'skipped', 'No workspace');
    return false;
  }

  try {
    // Write a file
    await fetch(`${BASE_URL}/api/sandbox/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workspaceId,
        code: "with open('ci_test.txt', 'w') as f: f.write('CI Test Content')",
        language: 'python'
      })
    });

    // Read the file
    const readRes = await fetch(`${BASE_URL}/api/sandbox/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, path: 'ci_test.txt' })
    });

    const readData = await readRes.json();
    const content = readData.content || readData.data?.content;

    if (content && content.includes('CI Test')) {
      log('✅ File operations work');
      addResult('File Operations', 'passed');
      return true;
    } else {
      log(`❌ File read failed: ${JSON.stringify(readData).substring(0, 100)}`);
      addResult('File Operations', 'failed', 'Read failed');
      return false;
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`);
    addResult('File Operations', 'failed', error.message);
    return false;
  }
}

// ============================================================================
// Test: Gemini Analysis
// ============================================================================
async function testGeminiAnalysis() {
  log('\n=== Test: Gemini Analysis ===');

  if (!process.env.GEMINI_API_KEY) {
    log('⏭️  Skipped (GEMINI_API_KEY not set)');
    addResult('Gemini Analysis', 'skipped', 'No API key');
    return false;
  }

  try {
    const res = await fetch(`${BASE_URL}/api/analysis/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'def add(a, b): return a + b',
        language: 'python'
      })
    });

    const data = await res.json();
    const result = data.data || data;

    if (result.score !== undefined) {
      log(`✅ Gemini analysis works - Score: ${result.score}/10`);
      addResult('Gemini Analysis', 'passed', `Score: ${result.score}`);
      return true;
    } else {
      log(`❌ Analysis failed: ${JSON.stringify(data).substring(0, 100)}`);
      addResult('Gemini Analysis', 'failed', data.error || 'Unknown error');
      return false;
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`);
    addResult('Gemini Analysis', 'failed', error.message);
    return false;
  }
}

// ============================================================================
// Test: Hidden Test Execution
// ============================================================================
async function testHiddenTests(workspaceId) {
  log('\n=== Test: Hidden Test Execution ===');

  if (!workspaceId) {
    log('⏭️  Skipped (no workspace)');
    addResult('Hidden Tests', 'skipped', 'No workspace');
    return false;
  }

  try {
    const res = await fetch(`${BASE_URL}/api/sandbox/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workspaceId,
        testCode: `
def solution(x):
    return x * 2

assert solution(5) == 10
assert solution(0) == 0
print("All tests passed!")
`
      })
    });

    const data = await res.json();
    const stdout = data.stdout || data.data?.stdout;

    if (stdout && stdout.includes('All tests passed')) {
      log('✅ Hidden test execution works');
      addResult('Hidden Tests', 'passed');
      return true;
    } else {
      log(`❌ Test execution failed: ${JSON.stringify(data).substring(0, 100)}`);
      addResult('Hidden Tests', 'failed', 'Test failed');
      return false;
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`);
    addResult('Hidden Tests', 'failed', error.message);
    return false;
  }
}

// ============================================================================
// Main Test Runner
// ============================================================================
async function runTests() {
  log('🚀 Starting Integration Tests');
  log(`📍 Server: ${BASE_URL}`);
  log(`🔑 Daytona API: ${process.env.DAYTONA_API_KEY ? 'Configured' : 'Not configured'}`);
  log(`🔑 Gemini API: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Not configured'}`);

  // Wait for server to be ready
  await sleep(2000);

  // Run tests
  const serverOk = await testServerHealth();
  if (!serverOk) {
    log('\n❌ Server not healthy, aborting tests');
    process.exit(1);
  }

  const workspaceId = await testDaytonaWorkspace();
  await testCodeExecution(workspaceId);
  await testFileOperations(workspaceId);
  await testHiddenTests(workspaceId);
  await testGeminiAnalysis();

  // Summary
  log('\n========================================');
  log('📊 Test Summary');
  log('========================================');
  log(`✅ Passed:  ${results.passed}`);
  log(`❌ Failed:  ${results.failed}`);
  log(`⏭️  Skipped: ${results.skipped}`);
  log('========================================\n');

  // Exit with appropriate code
  if (results.failed > 0) {
    log('❌ Some tests failed!');
    process.exit(1);
  } else {
    log('✅ All tests passed!');
    process.exit(0);
  }
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
