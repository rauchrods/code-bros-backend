export const generateTestCode = (userCode, example, problem, language) => {
  switch (language) {
    case "javascript":
      return generateJavaScriptTest(userCode, example, problem);
    case "python":
      return generatePythonTest(userCode, example, problem);
    case "java":
      return generateJavaTest(userCode, example, problem);
    case "cpp":
      return generateCppTest(userCode, example, problem);
    default:
      throw new Error(`Unsupported language: ${language}`);
  }
};

const parseInput = (input) => {
  const params = {};
  const parts = input.split(",").map((p) => p.trim());

  parts.forEach((part) => {
    const equalIndex = part.indexOf("=");
    if (equalIndex === -1) return;

    const key = part.substring(0, equalIndex).trim();
    const value = part.substring(equalIndex + 1).trim();

    try {
      params[key] = JSON.parse(value);
    } catch {
      params[key] = value.replace(/['"]/g, "");
    }
  });

  return params;
};

const generateJavaScriptTest = (userCode, example, problem) => {
  const params = parseInput(example.input);
  const expectedOutput = example.output;
  const functionName = problem.id.replace(/-([a-z])/g, (_, letter) =>
    letter.toUpperCase()
  );
  const args = Object.values(params)
    .map((v) => JSON.stringify(v))
    .join(", ");

  return `
${userCode}

try {
  const result = ${functionName}(${args});
  const expected = ${expectedOutput};
  const resultStr = JSON.stringify(result);
  const expectedStr = JSON.stringify(expected);
  
  if (resultStr === expectedStr) {
    console.log('PASS');
  } else {
    console.log('FAIL: Expected ' + expectedStr + ' but got ' + resultStr);
  }
} catch (error) {
  console.log('ERROR: ' + error.message);
}
`;
};

const generatePythonTest = (userCode, example, problem) => {
  const params = parseInput(example.input);
  const expectedOutput = example.output;
  const functionName = problem.id.replace(/-/g, "_");
  const args = Object.values(params)
    .map((v) => JSON.stringify(v))
    .join(", ");

  return `
import json

${userCode}

try:
    result = ${functionName}(${args})
    expected = ${expectedOutput}
    
    result_str = json.dumps(result, sort_keys=True)
    expected_str = json.dumps(expected, sort_keys=True)
    
    if result_str == expected_str:
        print('PASS')
    else:
        print(f'FAIL: Expected {expected_str} but got {result_str}')
except Exception as e:
    print(f'ERROR: {str(e)}')
`;
};

const generateJavaTest = (userCode, example, problem) => {
  const params = parseInput(example.input);
  const functionName = problem.id.replace(/-([a-z])/g, (_, letter) =>
    letter.toUpperCase()
  );
  const paramValues = Object.values(params);
  const firstParam = paramValues[0];
  const secondParam = paramValues[1];

  let testCall = "";
  let arrayDeclaration = "";

  if (Array.isArray(firstParam)) {
    arrayDeclaration = `int[] nums = {${firstParam.join(",")}};`;

    if (problem.id === "two-sum") {
      const expected = JSON.parse(example.output);
      testCall = `
        int target = ${secondParam};
        int[] result = solution.${functionName}(nums, target);
        int[] expected = {${expected.join(",")}};
        boolean passed = java.util.Arrays.equals(result, expected);
      `;
    }
  }

  return `
import java.util.*;

class Solution {
    ${userCode}
}

public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();
        try {
            ${arrayDeclaration}
            ${testCall}
            
            if (passed) {
                System.out.println("PASS");
            } else {
                System.out.println("FAIL");
            }
        } catch (Exception e) {
            System.out.println("ERROR: " + e.getMessage());
        }
    }
}
`;
};

const generateCppTest = (userCode, example, problem) => {
  const params = parseInput(example.input);
  const paramValues = Object.values(params);
  const firstParam = paramValues[0];
  const secondParam = paramValues[1];

  let testCall = "";

  if (Array.isArray(firstParam)) {
    const expected = JSON.parse(example.output);
    const functionName = problem.id.replace(/-([a-z])/g, (_, letter) =>
      letter.toUpperCase()
    );

    testCall = `
    vector<int> nums = {${firstParam.join(",")}};
    int target = ${secondParam};
    vector<int> result = ${functionName}(nums, target);
    vector<int> expected = {${expected.join(",")}};
    bool passed = (result == expected);
    `;
  }

  return `
#include <iostream>
#include <vector>
#include <string>
using namespace std;

${userCode}

int main() {
    try {
        ${testCall}
        
        if (passed) {
            cout << "PASS" << endl;
        } else {
            cout << "FAIL" << endl;
        }
    } catch (exception& e) {
        cout << "ERROR: " << e.what() << endl;
    }
    return 0;
}
`;
};
