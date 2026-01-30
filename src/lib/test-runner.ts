import { Problem } from '@/data/problems';

function formatPythonValue(val: any): string {
    if (val === null) return 'None';
    if (Array.isArray(val)) return `[${val.map(formatPythonValue).join(', ')}]`;
    if (typeof val === 'string') return `"${val}"`;
    return String(val);
}

export function generateTestCode(problem: Problem, userCode: string): string {
    const testCalls = problem.testCases.map((tc, i) => {
        const argsStr = tc.inputs.map(formatPythonValue).join(', ');
        const expectedStr = formatPythonValue(tc.expected);

        return `
try:
    result = ${problem.functionName}(${argsStr})
    expected = ${expectedStr}
    if result == expected:
        print(f"✓ Test ${i + 1} passed")
    else:
        print(f"✗ Test ${i + 1} failed: expected {expected}, got {result}")
except Exception as e:
    print(f"✗ Test ${i + 1} error: {e}")
`;
    }).join('\n');

    return `${userCode}\n\nprint("\\n=== Running Tests ===\")\n${testCalls}\nprint("\\n=== Tests Complete ===\")`;
}
