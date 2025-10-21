import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import codeRoutes from "./routes/codeRoutes.js";
import problemRoutes from "./routes/problemRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import helmet from "helmet";
import { connect, initializeSchema, healthCheck } from "./database/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL;

// Initialize database connection
async function initializeDatabase() {
  try {
    await connect();
    await initializeSchema();
    console.log("🎯 Database ready for use");
  } catch (error) {
    console.error("❌ Failed to initialize database:", error.message);
    console.error(
      "⚠️  Server will continue, but database features may not work"
    );
  }
}

// Security Middleware
app.use(helmet());

//CORS Middleware
app.use(
  cors({
    origin: [FRONTEND_URL, "http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/code", codeRoutes);
app.use("/api/problems", problemRoutes);

// Health check with database status
app.get("/health", async (req, res) => {
  try {
    const dbHealth = await healthCheck();
    res.json({
      status: "OK",
      message: "Server is running",
      database: dbHealth,
    });
  } catch (error) {
    res.status(503).json({
      status: "Degraded",
      message: "Server running but database unavailable",
      error: error.message,
    });
  }
});

// Error handling middleware
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`💚 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
