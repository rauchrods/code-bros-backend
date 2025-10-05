import { PROBLEMS } from "../constants/problems.js";
import { executeCode } from "../services/codeExecutionService.js";
import { validateTestCases } from "../services/testCaseValidator.js";

export const runCode = async (req, res, next) => {
  try {
    const { code, language, input } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: "Code and language are required",
      });
    }

    const result = await executeCode(code, language, input);

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.log("Error in runCode:", error);
    next(error);
  }
};

export const submitCode = async (req, res, next) => {
  try {
    const { code, language, problemId } = req.body;

    if (!code || !language || !problemId) {
      return res.status(400).json({
        success: false,
        message: "Code, language, and problemId are required",
      });
    }

    const problem = PROBLEMS.find((p) => p.id === problemId);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    const validationResult = await validateTestCases(code, language, problem);

    res.json({
      success: true,
      ...validationResult,
    });
  } catch (error) {
    next(error);
  }
};
