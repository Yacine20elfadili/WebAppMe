import express, { Request, Response } from "express";
import cors from "cors";
import initSqlJs, { Database } from "sql.js";
import crypto from "crypto";
import fs from "fs";

const app = express();

app.use(cors());
app.use(express.json());

// ── Hash helper ───────────────────────────────
const hash = (text: string): string =>
  crypto.createHash("sha256").update(text).digest("hex");

// ── Start Database ───────────────────────────
async function startServer() {
  const SQL = await initSqlJs();

  let db: Database;

  // Load existing DB if it exists
  if (fs.existsSync("users.db")) {
    const fileBuffer = fs.readFileSync("users.db");
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Save DB helper
  function saveDatabase(): void {
    const data = db.export();
    fs.writeFileSync("users.db", Buffer.from(data));
  }

  // ── DB setup ──────────────────────────────────
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created  TEXT DEFAULT (datetime('now'))
    )
  `);

  saveDatabase();

  // ── Routes ────────────────────────────────────

  // REGISTER
  app.post("/register", (req: Request, res: Response): any => {
    const { username, password } = req.body;

    if (!username || !password)
      return res
        .status(400)
        .json({ error: "Username and password required." });

    if (password.length < 4)
      return res
        .status(400)
        .json({ error: "Password must be at least 4 characters." });

    try {
      // Check if username exists
      const checkStmt = db.prepare(
        "SELECT * FROM users WHERE username = ?"
      );
      checkStmt.bind([username.trim()]);

      if (checkStmt.step()) {
        checkStmt.free();
        return res.status(409).json({ error: "Username already taken." });
      }

      checkStmt.free();

      // Insert user
      db.run(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username.trim(), hash(password)]
      );

      saveDatabase();

      console.log(`[REGISTER] ✅ "${username}" registered`);

      return res.json({
        message: `Welcome, ${username}! Account created.`,
      });
    } catch (err: any) {
      console.error(err);
      return res.status(500).json({ error: "Something went wrong." });
    }
  });

  // LOGIN
  app.post("/login", (req: Request, res: Response): any => {
    const { username, password } = req.body;

    if (!username || !password)
      return res
        .status(400)
        .json({ error: "Username and password required." });

    try {
      const stmt = db.prepare(
        "SELECT * FROM users WHERE username = ?"
      );

      stmt.bind([username.trim()]);

      let user: any = null;

      if (stmt.step()) {
        user = stmt.getAsObject();
      }

      stmt.free();

      if (!user || user.password !== hash(password)) {
        console.log(`[LOGIN] ❌ Failed attempt for "${username}"`);

        return res
          .status(401)
          .json({ error: "Wrong username or password." });
      }

      console.log(`[LOGIN] ✅ "${username}" logged in`);

      return res.json({
        message: `Welcome back, ${username}!`,
        user: {
          id: user.id,
          username: user.username,
          created: user.created,
        },
      });
    } catch (err: any) {
      console.error(err);
      return res.status(500).json({ error: "Something went wrong." });
    }
  });


  // ── Start ─────────────────────────────────────
  app.listen(3001, () => {
    console.log("\n🚀 Backend running at http://localhost:3001");
    console.log("   POST /register");
    console.log("   POST /login\n");
  });
}

startServer().catch(console.error);