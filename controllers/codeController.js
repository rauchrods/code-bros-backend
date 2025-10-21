import { getPool } from "../database/db.js";
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

    const pool = getPool();
    
    // Get problem from database
    const problemQuery = `
      SELECT 
        p.id,
        p.function_name as functionName,
        p.output_type as outputType,
        json_agg(
          json_build_object(
            'input', e.input_data,
            'output', e.expected_output,
            'explanation', e.explanation
          ) ORDER BY e.order_index
        ) as examples
      FROM problems p
      LEFT JOIN problem_examples e ON p.id = e.problem_id
      WHERE p.slug = $1 AND p.is_active = true
      GROUP BY p.id, p.function_name, p.output_type
    `;

    const problemResult = await pool.query(problemQuery, [problemId]);

    if (problemResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    const problem = problemResult.rows[0];

    console.log("problem", problem);
    
    // Convert database format to match validation service expectations
    const problemForValidation = {
      functionName: problem.functionname,
      outputType: problem.outputtype,
      examples: problem.examples || []
    };

    // Validate the code against test cases
    const validationResult = await validateTestCases(code, language, problemForValidation);

    // Save submission to database
    try {
      const submissionQuery = `
        INSERT INTO submissions (
          problem_id, language, code, status, execution_time, 
          memory_usage, error_message, total_test_cases, passed_test_cases
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `;

      const submissionResult = await pool.query(submissionQuery, [
        problem.id,
        language,
        code,
        validationResult.allPassed ? 'Success' : 'Error',
        validationResult.testResults?.[0]?.executionTime || 0,
        validationResult.testResults?.[0]?.memory || 0,
        validationResult.allPassed ? null : validationResult.message,
        validationResult.totalTests,
        validationResult.passedCount
      ]);

      console.log(`✅ Submission saved with ID: ${submissionResult.rows[0].id}`);
    } catch (dbError) {
      console.error('Error saving submission to database:', dbError);
      // Don't fail the request if database save fails, just log it
    }

    res.json({
      success: true,
      ...validationResult,
    });
  } catch (error) {
    console.error('Error in submitCode:', error);
    next(error);
  }
};
