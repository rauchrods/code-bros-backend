import { PROBLEMS } from "../constants/problems.js";

export const getAllProblems = (req, res) => {
  try {
    // Remove starter code from response for security
    const problems = PROBLEMS.map(({ starterCode, ...problem }) => problem);

    res.status(200).json({
      success: true,
      count: problems.length,
      problems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch problems",
      error: error.message,
    });
  }
};

export const getProblemById = (req, res) => {
  try {
    const { problemId } = req.params;
    const problem = PROBLEMS.find((p) => p.id === problemId);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    res.status(200).json({
      success: true,
      problem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch problem",
      error: error.message,
    });
  }
};
