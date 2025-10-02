import { executeCode } from './codeExecutionService.js';
import { generateTestCode } from '../utils/testCodeGenerator.js';

export const validateTestCases = async (userCode, language, problem) => {
  const testResults = [];
  let passedCount = 0;
  let failedCount = 0;

  try {
    for (let i = 0; i < problem.examples.length; i++) {
      const example = problem.examples[i];
      const testCode = generateTestCode(userCode, example, problem, language);
      const result = await executeCode(testCode, language);

      const output = result.stdout?.trim() || '';
      const passed = output.includes('PASS');

      testResults.push({
        testCase: i + 1,
        input: example.input,
        expectedOutput: example.output,
        actualOutput: output || result.stderr || 'No output',
        passed,
        executionTime: result.time,
        memory: result.memory,
        error: result.stderr || null,
      });

      if (passed) {
        passedCount++;
      } else {
        failedCount++;
      }
    }

    const allPassed = failedCount === 0;

    return {
      allPassed,
      passedCount,
      failedCount,
      totalTests: problem.examples.length,
      testResults,
      message: allPassed
        ? 'All test cases passed!'
        : `${failedCount} test case(s) failed`,
    };
  } catch (error) {
    console.error('Test validation error:', error);
    throw new Error('Failed to validate test cases');
  }
};
