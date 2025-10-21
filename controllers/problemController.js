import { getPool } from "../database/db.js";

export const getAllProblems = async (req, res) => {
  try {
    const pool = getPool();
    // Get all problems from database (without sensitive data)
    const query = `
      SELECT 
        slug as id,
        title,
        description,
        difficulty,
        tags,
        acceptance_rate,
        total_submissions
      FROM problems
      WHERE is_active = true
      ORDER BY created_at ASC
    `;

    const result = await pool.query(query);
    const problems = result.rows;

    res.status(200).json({
      success: true,
      count: problems.length,
      problems,
    });
  } catch (error) {
    console.error("Error in getAllProblems:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch problems",
      error: error.message,
    });
  }
};

export const getProblemById = async (req, res) => {
  try {
    const pool = getPool();
    const { problemId } = req.params;

    // Get problem details with starter codes and examples
    const problemQuery = `
      SELECT 
        id,
        slug,
        title,
        description,
        function_name as functionName,
        output_type as outputType,
        difficulty,
        constraints,
        tags,
        solution_link as solutionLink,
        acceptance_rate,
        total_submissions
      FROM problems 
      WHERE slug = $1 AND is_active = true
    `;

    const problemResult = await pool.query(problemQuery, [problemId]);

    if (problemResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    const problem = problemResult.rows[0];


    // Get starter codes
    const starterCodeQuery = `
      SELECT language, starter_code
      FROM problem_starter_codes
      WHERE problem_id = $1
    `;
    const starterCodeResult = await pool.query(starterCodeQuery, [problem.id]);

    const starterCode = {};
    starterCodeResult.rows.forEach((row) => {
      starterCode[row.language] = row.starter_code;
    });

    // Get examples
    const examplesQuery = `
      SELECT input_data, expected_output, explanation
      FROM problem_examples
      WHERE problem_id = $1
      ORDER BY order_index ASC
    `;
    const examplesResult = await pool.query(examplesQuery, [problem.id]);

    const examples = examplesResult.rows.map((row) => ({
      input: row.input_data,
      output: row.expected_output,
      explanation: row.explanation,
    }));

    // Format response to match frontend expectations
    const formattedProblem = {
      id: problem.slug,
      title: problem.title,
      description: problem.description,
      functionName: problem.functionname,
      outputType: problem.outputtype,
      difficulty: problem.difficulty,
      constraints: problem.constraints,
      tags: problem.tags,
      solutionLink: problem.solutionlink,
      starterCode,
      examples,
    };

    res.status(200).json({
      success: true,
      problem: formattedProblem,
    });
  } catch (error) {
    console.error("Error in getProblemById:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch problem",
      error: error.message,
    });
  }
};
