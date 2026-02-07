import { Problem } from '@/data/problems';

function formatPythonValue(val: any): string {
    if (val === null) return 'None';
    if (Array.isArray(val)) return `[${val.map(formatPythonValue).join(', ')}]`;
    if (typeof val === 'string') return `"${val}"`;
    return String(val);
}

function formatJSValue(val: any): string {
    if (val === null) return 'null';
    if (Array.isArray(val)) return `[${val.map(formatJSValue).join(', ')}]`;
    if (typeof val === 'string') return `"${val}"`;
    return String(val);
}

function generatePythonTestCode(problem: Problem, userCode: string): string {
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

function generateJSTestCode(problem: Problem, userCode: string): string {
    const fnName = problem.functionNameJS || problem.functionName;
    const testCalls = problem.testCases.map((tc, i) => {
        const argsStr = tc.inputs.map(formatJSValue).join(', ');
        const expectedStr = formatJSValue(tc.expected);

        return `
try {
    const result = ${fnName}(${argsStr});
    const expected = ${expectedStr};
    if (JSON.stringify(result) === JSON.stringify(expected)) {
        console.log("✓ Test ${i + 1} passed");
    } else {
        console.log("✗ Test ${i + 1} failed: expected " + JSON.stringify(expected) + ", got " + JSON.stringify(result));
    }
} catch (e) {
    console.log("✗ Test ${i + 1} error: " + e.message);
}`;
    }).join('\n');

    return `${userCode}\n\nconsole.log("\\n=== Running Tests ===");\n${testCalls}\nconsole.log("\\n=== Tests Complete ===");`;
}

export function generateTestCode(problem: Problem, userCode: string, language: string = 'python'): string {
    if (language === 'javascript') {
        return generateJSTestCode(problem, userCode);
    }
    return generatePythonTestCode(problem, userCode);
}
