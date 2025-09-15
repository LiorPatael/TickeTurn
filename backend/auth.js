import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { db } from "./db.js";
import dotenv from "dotenv";
import { validateBody, registerSchema, loginSchema } from "./validation.js";

dotenv.config();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// רישום משתמש
router.post("/register", validateBody(registerSchema), async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const [existingUsers] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await db.execute(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    // Generate JWT token
    const token = jwt.sign({ id: result.insertId, email, name }, JWT_SECRET, { expiresIn: "24h" });

    // Return success response
    res.status(201).json({
      message: "Registration successful",
      user: {
        id: result.insertId,
        name,
        email,
      },
      token,
    });
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
});

// התחברות משתמש
router.post("/login", validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE email=?", [email]);
    if (rows.length === 0) return res.status(400).json({ message: "Invalid email or password" });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
});

export default router;
