import express from "express";
import {
  getAllProblems,
  getProblemById,
} from "../controllers/problemController.js";

const router = express.Router();

// Get all problems
router.get("/", getAllProblems);

// Get problem by ID
router.get("/:problemId", getProblemById);

export default router;
