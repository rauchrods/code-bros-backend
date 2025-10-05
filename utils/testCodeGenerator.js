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

const generateJavaScriptTest = (userCode, example, problem) => {
  const functionName = problem.functionName;
  const args = Object.values(example.input)
    .map((v) => JSON.stringify(v))
    .join(", ");
  const expected = JSON.stringify(example.output);

  console.log("args:", args);
  console.log("expected:", expected);

  return `
${userCode}

try {
  const result = ${functionName}(${args});
  const expected = ${expected};
  const resultStr = JSON.stringify(result);
  const expectedStr = JSON.stringify(expected);

  console.log(resultStr);
  
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
  const functionName = problem.id.replace(/-/g, "_");
  const args = Object.values(example.input)
    .map((v) => JSON.stringify(v))
    .join(", ");
  const expected = JSON.stringify(example.output);

  return `
import json

${userCode}

try:
    result = ${functionName}(${args})
    expected = ${expected}
    
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
  const functionName = problem.functionName;
  const inputValues = Object.values(example.input);
  const expectedOutput = example.output;

  let declarations = "";
  let testCode = "";
  let params = [];

  // Generate parameter declarations and build parameter list
  inputValues.forEach((value, index) => {
    const paramName = `param${index + 1}`;
    params.push(paramName);

    if (Array.isArray(value)) {
      declarations += `        int[] ${paramName} = {${value.join(",")}};\n`;
    } else if (typeof value === "string") {
      declarations += `        String ${paramName} = "${value}";\n`;
    } else if (typeof value === "number") {
      declarations += `        int ${paramName} = ${value};\n`;
    }
  });

  // Generate test code based on return type
  const paramList = params.join(", ");

  if (Array.isArray(expectedOutput)) {
    // Array return type
    testCode = `
        int[] result = solution.${functionName}(${paramList});
        int[] expected = {${expectedOutput.join(",")}};
        boolean passed = java.util.Arrays.equals(result, expected);
    `;
  } else if (typeof expectedOutput === "boolean") {
    // Boolean return type
    testCode = `
        boolean result = solution.${functionName}(${paramList});
        boolean expected = ${expectedOutput};
        boolean passed = (result == expected);
    `;
  } else if (typeof expectedOutput === "string") {
    // String return type
    testCode = `
        String result = solution.${functionName}(${paramList});
        String expected = "${expectedOutput}";
        boolean passed = result.equals(expected);
    `;
  } else if (typeof expectedOutput === "number") {
    if (Number.isInteger(expectedOutput)) {
      // Integer return type
      testCode = `
        int result = solution.${functionName}(${paramList});
        int expected = ${expectedOutput};
        boolean passed = (result == expected);
      `;
    } else {
      // Double return type
      testCode = `
        double result = solution.${functionName}(${paramList});
        double expected = ${expectedOutput};
        boolean passed = Math.abs(result - expected) < 0.00001;
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
${declarations}
${testCode}
            
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
  const functionName = problem.functionName;
  const inputValues = Object.values(example.input);
  const expectedOutput = example.output;

  let declarations = "";
  let params = [];

  // Generate parameter declarations
  inputValues.forEach((value, index) => {
    const paramName = `param${index + 1}`;
    params.push(paramName);

    if (Array.isArray(value)) {
      declarations += `    vector<int> ${paramName} = {${value.join(",")}};\n`;
    } else if (typeof value === "string") {
      declarations += `    string ${paramName} = "${value}";\n`;
    } else if (typeof value === "number") {
      declarations += `    int ${paramName} = ${value};\n`;
    }
  });

  const paramList = params.join(", ");
  let testCode = "";

  // Generate test code based on return type
  if (Array.isArray(expectedOutput)) {
    // Array return type
    testCode = `
    vector<int> result = ${functionName}(${paramList});
    vector<int> expected = {${expectedOutput.join(",")}};
    bool passed = (result == expected);
    `;
  } else if (typeof expectedOutput === "boolean") {
    // Boolean return type
    testCode = `
    bool result = ${functionName}(${paramList});
    bool expected = ${expectedOutput};
    bool passed = (result == expected);
    `;
  } else if (typeof expectedOutput === "string") {
    // String return type
    testCode = `
    string result = ${functionName}(${paramList});
    string expected = "${expectedOutput}";
    bool passed = (result == expected);
    `;
  } else if (typeof expectedOutput === "number") {
    if (Number.isInteger(expectedOutput)) {
      // Integer return type
      testCode = `
    int result = ${functionName}(${paramList});
    int expected = ${expectedOutput};
    bool passed = (result == expected);
      `;
    } else {
      // Double return type
      testCode = `
    double result = ${functionName}(${paramList});
    double expected = ${expectedOutput};
    bool passed = abs(result - expected) < 0.00001;
      `;
    }
  }

  return `
#include <iostream>
#include <vector>
#include <string>
#include <cmath>
using namespace std;

${userCode}

int main() {
    try {
${declarations}
${testCode}
        
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
