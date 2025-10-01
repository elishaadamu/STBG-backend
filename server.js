import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 3001;

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Resolve the path to db.json relative to the current module
const dbPath = path.resolve(__dirname, "db.json");
// Middleware
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

app.get("/api/projects", async (req, res) => {
  try {
    const data = await fs.readFile(dbPath, "utf-8");
    res.status(200).json(JSON.parse(data));
  } catch (error) {
    if (error.code === "ENOENT") {
      // If db.json doesn't exist, return an empty array
      return res.status(200).json([]);
    }
    console.error("Error reading data:", error);
    res.status(500).json({ message: "Error reading project data." });
  }
});

app.post("/api/projects", async (req, res) => {
  console.log("Received form submission:");
  console.log(req.body);

  try {
    let projects = [];
    try {
      const data = await fs.readFile(dbPath, "utf-8");
      projects = JSON.parse(data);
    } catch (error) {
      if (error.code !== "ENOENT") throw error; // Throw if it's not a "file not found" error
    }

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
