import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 3001;

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Vercel has a read-only file system, except for the /tmp directory.
// We'll read from the project's db.json but write to a temporary file.
const sourceDbPath = path.resolve(__dirname, "..", "db.json"); // Path to the source db.json in the project root
const dbPath = path.join("/tmp", "db.json"); // Writable path in Vercel's temp directory

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // for parsing application/json

// Routes
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  console.log("Login attempt with:", username);

  if (username === "zmumuni.da@gmail.com" && password === "zakari") {
    res.status(200).json({ message: "Login successful" });
  } else {
    res.status(401).json({ message: "Invalid username or password" });
  }
});

// A helper function to ensure the db.json exists in the /tmp directory
const ensureDbFile = async () => {
  try {
    await fs.access(dbPath);
  } catch (error) {
    // If the file doesn't exist in /tmp, copy it from the source
    const data = await fs.readFile(sourceDbPath, "utf-8");
    await fs.writeFile(dbPath, data);
  }
};

app.get("/api/projects", async (req, res) => {
  try {
    await ensureDbFile(); // Make sure the db file is in /tmp
    const data = await fs.readFile(dbPath, "utf-8");
    res.status(200).json(JSON.parse(data));
  } catch (error) {
    console.error("Error reading data:", error);
    res.status(500).json({ message: "Error reading project data." });
  }
});

app.post("/api/projects", async (req, res) => {
  console.log("Received form submission:");
  console.log(req.body);

  try {
    await ensureDbFile(); // Make sure the db file is in /tmp
    const data = await fs.readFile(dbPath, "utf-8");
    const projects = JSON.parse(data);

    const newProject = { id: Date.now(), ...req.body };
    projects.push(newProject);

    await fs.writeFile(dbPath, JSON.stringify(projects, null, 2));

    res
      .status(201)
      .json({ message: "Project data stored successfully!", data: newProject });
  } catch (error) {
    console.error("Error storing data:", error);
    res.status(500).json({ message: "Error storing project data." });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Backend server listening on http://localhost:${port}`);
});
