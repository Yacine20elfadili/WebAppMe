import request from "supertest";
import express from "express";
import cors from "cors";
import initSqlJs from "sql.js";
import crypto from "crypto";

const hash = (text: string): string =>
  crypto.createHash("sha256").update(text).digest("hex");

async function buildApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const SQL = await initSqlJs();
  const db = new SQL.Database();

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created  TEXT DEFAULT (datetime('now'))
    )
  `);

  app.post("/register", (req, res): any => {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Username and password required." });
    if (password.length < 4)
      return res.status(400).json({ error: "Password must be at least 4 characters." });

    const check = db.prepare("SELECT * FROM users WHERE username = ?");
    check.bind([username.trim()]);
    if (check.step()) { check.free(); return res.status(409).json({ error: "Username already taken." }); }
    check.free();

    db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username.trim(), hash(password)]);
    return res.json({ message: `Welcome, ${username}! Account created.` });
  });

  app.post("/login", (req, res): any => {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Username and password required." });

    const stmt = db.prepare("SELECT * FROM users WHERE username = ?");
    stmt.bind([username.trim()]);
    let user: any = null;
    if (stmt.step()) user = stmt.getAsObject();
    stmt.free();

    if (!user || user.password !== hash(password))
      return res.status(401).json({ error: "Wrong username or password." });

    return res.json({ message: `Welcome back, ${username}!` });
  });

  return app;
}

// ── Tests ─────────────────────────────────────

describe("POST /register", () => {
  it("registers a new user successfully", async () => {
    const app = await buildApp();
    const res = await request(app).post("/register").send({ username: "alice", password: "1234" });
    expect(res.status).toBe(200);
    expect(res.body.message).toContain("Account created");
  });

  it("rejects duplicate username", async () => {
    const app = await buildApp();
    await request(app).post("/register").send({ username: "alice", password: "1234" });
    const res = await request(app).post("/register").send({ username: "alice", password: "1234" });
    expect(res.status).toBe(409);
  });

  it("rejects short password", async () => {
    const app = await buildApp();
    const res = await request(app).post("/register").send({ username: "bob", password: "12" });
    expect(res.status).toBe(400);
  });

  it("rejects missing fields", async () => {
    const app = await buildApp();
    const res = await request(app).post("/register").send({ username: "bob" });
    expect(res.status).toBe(400);
  });
});

describe("POST /login", () => {
  it("logs in with correct credentials", async () => {
    const app = await buildApp();
    await request(app).post("/register").send({ username: "alice", password: "1234" });
    const res = await request(app).post("/login").send({ username: "alice", password: "1234" });
    expect(res.status).toBe(200);
    expect(res.body.message).toContain("Welcome back");
  });

  it("rejects wrong password", async () => {
    const app = await buildApp();
    await request(app).post("/register").send({ username: "alice", password: "1234" });
    const res = await request(app).post("/login").send({ username: "alice", password: "wrong" });
    expect(res.status).toBe(401);
  });

  it("rejects non-existent user", async () => {
    const app = await buildApp();
    const res = await request(app).post("/login").send({ username: "ghost", password: "1234" });
    expect(res.status).toBe(401);
  });
});