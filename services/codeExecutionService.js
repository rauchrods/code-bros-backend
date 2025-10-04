import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const execPromise = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMP_DIR = path.join(__dirname, "../temp");
// 5seconds
const TIMEOUT = 5000;

await fs.mkdir(TEMP_DIR, { recursive: true });

export const executeCode = async (code, language, input = "") => {
  const startTime = Date.now();

  try {
    switch (language) {
      case "javascript":
        return await executeJavaScript(code, input, startTime);
      case "python":
        return await executePython(code, input, startTime);
      case "java":
        return await executeJava(code, input, startTime);
      case "cpp":
        return await executeCpp(code, input, startTime);
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  } catch (error) {
    return {
      stdout: "",
      stderr: error.message || "Execution error",
      status: "Error",
      time: Date.now() - startTime,
      memory: 0,
    };
  }
};

const executeJavaScript = async (code, input, startTime) => {
  const fileName = `temp_${Date.now()}_${Math.random()
    .toString(36)
    .substring(7)}.js`;
  const filePath = path.join(TEMP_DIR, fileName);

  try {
    console.log("Writing file...");
    await fs.writeFile(filePath, code);

    const { stdout, stderr } = await execPromise(`node "${filePath}"`, {
      timeout: TIMEOUT,
      maxBuffer: 1024 * 1024,
    });

    return {
      stdout: stdout || "",
      stderr: stderr || "",
      status: "Success",
      time: Date.now() - startTime,
      memory: 0,
    };
  } catch (error) {
    return {
      stdout: error.stdout || "",
      stderr: error.stderr || error.message,
      status: error.killed ? "Time Limit Exceeded" : "Error",
      time: Date.now() - startTime,
      memory: 0,
    };
  } finally {
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.error("Error deleting temp file:", err);
    }
  }
};

const executePython = async (code, input, startTime) => {
  const fileName = `temp_${Date.now()}_${Math.random()
    .toString(36)
    .substring(7)}.py`;
  const filePath = path.join(TEMP_DIR, fileName);

  try {
    await fs.writeFile(filePath, code);

    const { stdout, stderr } = await execPromise(`python3 "${filePath}"`, {
      timeout: TIMEOUT,
      maxBuffer: 1024 * 1024,
    });

    return {
      stdout: stdout || "",
      stderr: stderr || "",
      status: "Success",
      time: Date.now() - startTime,
      memory: 0,
    };
  } catch (error) {
    return {
      stdout: error.stdout || "",
      stderr: error.stderr || error.message,
      status: error.killed ? "Time Limit Exceeded" : "Error",
      time: Date.now() - startTime,
      memory: 0,
    };
  } finally {
    try {
      await fs.unlink(filePath);
    } catch (err) {}
  }
};

const executeJava = async (code, input, startTime) => {
  const className = extractJavaClassName(code) || "Main";
  const fileName = `${className}.java`;
  const filePath = path.join(TEMP_DIR, fileName);
  const classFilePath = path.join(TEMP_DIR, `${className}.class`);

  try {
    await fs.writeFile(filePath, code);

    const { stderr: compileError } = await execPromise(`javac "${filePath}"`, {
      timeout: TIMEOUT,
    });

    if (compileError) {
      return {
        stdout: "",
        stderr: compileError,
        status: "Compilation Error",
        time: Date.now() - startTime,
        memory: 0,
      };
    }

    const { stdout, stderr } = await execPromise(
      `cd "${TEMP_DIR}" && java "${className}"`,
      {
        timeout: TIMEOUT,
        maxBuffer: 1024 * 1024,
      }
    );

    return {
      stdout: stdout || "",
      stderr: stderr || "",
      status: "Success",
      time: Date.now() - startTime,
      memory: 0,
    };
  } catch (error) {
    return {
      stdout: error.stdout || "",
      stderr: error.stderr || error.message,
      status: error.killed ? "Time Limit Exceeded" : "Error",
      time: Date.now() - startTime,
      memory: 0,
    };
  } finally {
    try {
      await fs.unlink(filePath);
      await fs.unlink(classFilePath);
    } catch (err) {}
  }
};

const executeCpp = async (code, input, startTime) => {
  const fileName = `temp_${Date.now()}_${Math.random()
    .toString(36)
    .substring(7)}.cpp`;
  const filePath = path.join(TEMP_DIR, fileName);
  const outputPath = path.join(TEMP_DIR, `temp_${Date.now()}`);

  try {
    await fs.writeFile(filePath, code);

    const { stderr: compileError } = await execPromise(
      `g++ "${filePath}" -o "${outputPath}"`,
      { timeout: TIMEOUT }
    );

    if (compileError) {
      return {
        stdout: "",
        stderr: compileError,
        status: "Compilation Error",
        time: Date.now() - startTime,
        memory: 0,
      };
    }

    const { stdout, stderr } = await execPromise(outputPath, {
      timeout: TIMEOUT,
      maxBuffer: 1024 * 1024,
    });

    return {
      stdout: stdout || "",
      stderr: stderr || "",
      status: "Success",
      time: Date.now() - startTime,
      memory: 0,
    };
  } catch (error) {
    return {
      stdout: error.stdout || "",
      stderr: error.stderr || error.message,
      status: error.killed ? "Time Limit Exceeded" : "Error",
      time: Date.now() - startTime,
      memory: 0,
    };
  } finally {
    try {
      await fs.unlink(filePath);
      await fs.unlink(outputPath);
    } catch (err) {}
  }
};

const extractJavaClassName = (code) => {
  const match = code.match(/public\s+class\s+(\w+)/);
  return match ? match[1] : null;
};
