import { db } from "./db.js"; // החיבור ל-MySQL
import bcrypt from "bcrypt";

export async function createUser({ name, email, password }) {
  // בדיקה אם האימייל כבר קיים
  const [existing] = await db.execute("SELECT * FROM users WHERE email=?", [email]);
  if (existing.length > 0) throw new Error("Email already exists");

  // הצפנת הסיסמה
  const hashedPassword = await bcrypt.hash(password, 10);

  // הכנסת המשתמש ל־DB
  const [result] = await db.execute(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, hashedPassword]
  );

  return { id: result.insertId, name, email };
}

export async function authenticateUser(email, password) {
  const [rows] = await db.execute("SELECT * FROM users WHERE email=?", [email]);
  if (rows.length === 0) throw new Error("Invalid email or password");

  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Invalid email or password");

  return { id: user.id, name: user.name, email: user.email };
}
