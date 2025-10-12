export const generateTestCode = (userCode, example, problem, language) => {
  // Check if this is a print-based problem
  const isPrintProblem = problem.outputType === "print";

  switch (language) {
    case "javascript":
      return generateJavaScriptTest(userCode, example, problem, isPrintProblem);
    case "python":
      return generatePythonTest(userCode, example, problem, isPrintProblem);
    case "java":
      return generateJavaTest(userCode, example, problem, isPrintProblem);
    case "cpp":
      return generateCppTest(userCode, example, problem, isPrintProblem);
    default:
      throw new Error(`Unsupported language: ${language}`);
  }
};

const generateJavaScriptTest = (userCode, example, problem, isPrintProblem) => {
  const functionName = problem.functionName;
  const args = Object.values(example.input)
    .map((v) => JSON.stringify(v))
    .join(", ");
  const expected = JSON.stringify(example.output);

  if (isPrintProblem) {
    // For print-based problems, capture console.log and process.stdout.write output
    return `
${userCode}

try {
  let capturedOutput = '';
  const originalLog = console.log;
  const originalWrite = process.stdout.write;
  
  // Capture console.log (always adds newline)
  console.log = (...args) => {
    if (args.length === 0) {
      capturedOutput += '\\n';
    } else {
      capturedOutput += args.join(' ') + '\\n';
    }
  };
  
  // Capture process.stdout.write (doesn't add newline)
  process.stdout.write = (str) => {
    capturedOutput += str;
    return true;
  };
  
  ${functionName}(${args});
  
  // Restore originals
  console.log = originalLog;
  process.stdout.write = originalWrite;
  
  const expected = ${expected};
  const actualOutput = capturedOutput.trim();
  const expectedOutput = expected.trim();
  
  console.log(actualOutput);
  
  if (actualOutput === expectedOutput) {
    console.log('PASS');
  } else {
    console.log('FAIL: Expected ' + expectedOutput + ' but got ' + actualOutput);
  }
} catch (error) {
  console.log('ERROR: ' + error.message);
}
`;
  } else {
    // Original logic for return-based problems
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
  }
};

const generatePythonTest = (userCode, example, problem, isPrintProblem) => {
  const functionName = problem.functionName;
  const args = Object.values(example.input)
    .map((v) => JSON.stringify(v))
    .join(", ");
  const expected = JSON.stringify(example.output);

  if (isPrintProblem) {
    // For print-based problems, capture stdout
    return `
import json
import sys
from io import StringIO

${userCode}

try:
    # Capture stdout
    captured_output = StringIO()
    sys.stdout = captured_output
    
    ${functionName}(${args})
    
    sys.stdout = sys.__stdout__
    
    expected = ${expected}
    actual_output = captured_output.getvalue().strip()
    expected_output = expected.strip()
    
    print(actual_output)
    
    if actual_output == expected_output:
        print('PASS')
    else:
        print(f'FAIL: Expected {expected_output} but got {actual_output}')
except Exception as e:
    sys.stdout = sys.__stdout__
    print(f'ERROR: {str(e)}')
`;
  } else {
    // Original logic for return-based problems
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
  }
};

const generateJavaTest = (userCode, example, problem, isPrintProblem) => {
  const functionName = problem.functionName;
  const inputValues = Object.values(example.input);
  const expectedOutput = example.output;

  let declarations = "";
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

  const paramList = params.join(", ");

  if (isPrintProblem) {
    // For print-based problems, capture System.out
    return `
import java.util.*;
import java.io.*;

class Solution {
    ${userCode}
}

public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();
        try {
${declarations}
            // Capture output using System.setOut
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PrintStream ps = new PrintStream(baos);
            PrintStream oldOut = System.out;
            
            System.setOut(ps);
            solution.${functionName}(${paramList});
            System.setOut(oldOut);
            
            String actualOutput = baos.toString().trim();
            String expectedOutput = "${expectedOutput.replace(/\n/g, "\\n")}";
            
            System.out.println(actualOutput);
            
            if (actualOutput.equals(expectedOutput)) {
                System.out.println("PASS");
            } else {
                System.out.println("FAIL: Expected " + expectedOutput + " but got " + actualOutput);
            }
        } catch (Exception e) {
            System.out.println("ERROR: " + e.getMessage());
        }
    }
}
`;
  } else {
    // Original logic for return-based problems
    let testCode = "";
    if (Array.isArray(expectedOutput)) {
      testCode = `
        int[] result = solution.${functionName}(${paramList});
        int[] expected = {${expectedOutput.join(",")}};
        boolean passed = java.util.Arrays.equals(result, expected);
      `;
    } else if (typeof expectedOutput === "boolean") {
      testCode = `
        boolean result = solution.${functionName}(${paramList});
        boolean expected = ${expectedOutput};
        boolean passed = (result == expected);
      `;
    } else if (typeof expectedOutput === "string") {
      testCode = `
        String result = solution.${functionName}(${paramList});
        String expected = "${expectedOutput}";
        boolean passed = result.equals(expected);
      `;
    } else if (typeof expectedOutput === "number") {
      if (Number.isInteger(expectedOutput)) {
        testCode = `
        int result = solution.${functionName}(${paramList});
        int expected = ${expectedOutput};
        boolean passed = (result == expected);
        `;
      } else {
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
  }
};

const generateCppTest = (userCode, example, problem, isPrintProblem) => {
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

  if (isPrintProblem) {
    // For print-based problems, capture stdout
    return `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <cmath>
using namespace std;

${userCode}

int main() {
    try {
${declarations}
        // Capture output
        stringstream buffer;
        streambuf* old = cout.rdbuf(buffer.rdbuf());
        
        ${functionName}(${paramList});
        
        cout.rdbuf(old);
        string actualOutput = buffer.str();
        
        // Remove trailing whitespace
        while (!actualOutput.empty() && (actualOutput.back() == '\\n' || actualOutput.back() == ' ')) {
            actualOutput.pop_back();
        }
        
        string expectedOutput = "${expectedOutput.replace(/\n/g, "\\n")}";
        
        cout << actualOutput << endl;
        
        if (actualOutput == expectedOutput) {
            cout << "PASS" << endl;
        } else {
            cout << "FAIL: Expected " << expectedOutput << " but got " << actualOutput << endl;
        }
    } catch (exception& e) {
        cout << "ERROR: " << e.what() << endl;
    }
    return 0;
}
`;
  } else {
    // Original logic for return-based problems
    let testCode = "";
    if (Array.isArray(expectedOutput)) {
      testCode = `
    vector<int> result = ${functionName}(${paramList});
    vector<int> expected = {${expectedOutput.join(",")}};
    bool passed = (result == expected);
      `;
    } else if (typeof expectedOutput === "boolean") {
      testCode = `
    bool result = ${functionName}(${paramList});
    bool expected = ${expectedOutput};
    bool passed = (result == expected);
      `;
    } else if (typeof expectedOutput === "string") {
      testCode = `
    string result = ${functionName}(${paramList});
    string expected = "${expectedOutput}";
    bool passed = (result == expected);
      `;
    } else if (typeof expectedOutput === "number") {
      if (Number.isInteger(expectedOutput)) {
        testCode = `
    int result = ${functionName}(${paramList});
    int expected = ${expectedOutput};
    bool passed = (result == expected);
        `;
      } else {
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
  }
};
