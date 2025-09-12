import express from "express";
import bcrypt from "bcrypt";
import { db } from "../db.js";
import { createAccessToken, createRefreshToken } from "../auth.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "Missing fields" });

  const [rows] = await db.execute("SELECT * FROM users WHERE email=?", [email]);
  if (rows.length > 0) return res.status(400).json({ message: "Email already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await db.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword]);

  const user = { id: result.insertId, name, email };
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  res.cookie("jid", refreshToken, { httpOnly: true, path: "/auth/refresh_token" });
  res.json({ user, accessToken });
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await db.execute("SELECT * FROM users WHERE email=?", [email]);
  if (rows.length === 0) return res.status(400).json({ message: "Invalid email or password" });

  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: "Invalid email or password" });

  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  res.cookie("jid", refreshToken, { httpOnly: true, path: "/auth/refresh_token" });
  res.json({ user: { id: user.id, name: user.name, email: user.email }, accessToken });
});

// Refresh token
router.post("/refresh_token", async (req, res) => {
  const token = req.cookies.jid;
  if (!token) return res.json({ ok: false, accessToken: "" });

  let payload = null;
  try { payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET); } 
  catch { return res.json({ ok: false, accessToken: "" }); }

  const [rows] = await db.execute("SELECT * FROM users WHERE id=?", [payload.id]);
  if (rows.length === 0) return res.json({ ok: false, accessToken: "" });

  const user = rows[0];
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);
  res.cookie("jid", refreshToken, { httpOnly: true, path: "/auth/refresh_token" });

  res.json({ ok: true, accessToken });
});

export default router;
