import express from "express";
import { db } from "../db.js";
import { authMiddleware } from "../auth.js";

const router = express.Router();

// כל הכרטיסים
router.get("/", async (req, res) => {
  const [tickets] = await db.execute("SELECT * FROM tickets");
  res.json(tickets);
});

// כרטיס לפי id
router.get("/:id", async (req, res) => {
  const [rows] = await db.execute("SELECT * FROM tickets WHERE id=?", [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ message: "Ticket not found" });
  res.json(rows[0]);
});

// העלאת כרטיס חדש
router.post("/", authMiddleware, async (req, res) => {
  const { eventName, eventDate, price, location } = req.body;
  if (!eventName || !eventDate || !price || !location) return res.status(400).json({ message: "Missing fields" });

  const [result] = await db.execute(
    "INSERT INTO tickets (eventName, eventDate, price, location, sellerId, sellerName, sellerEmail) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [eventName, eventDate, price, location, req.user.id, req.user.name, req.user.email]
  );

  const [rows] = await db.execute("SELECT * FROM tickets WHERE id=?", [result.insertId]);
  res.status(201).json(rows[0]);
});

// רכישת כרטיס
router.post("/:id/purchase", authMiddleware, async (req, res) => {
  const [rows] = await db.execute("SELECT * FROM tickets WHERE id=?", [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ message: "Ticket not found" });

  const ticket = rows[0];
  if (ticket.isSold) return res.status(400).json({ message: "Ticket already sold" });

  await db.execute(
    "UPDATE tickets SET isSold=1, buyerId=?, buyerName=?, buyerEmail=? WHERE id=?",
    [req.user.id, req.user.name, req.user.email, ticket.id]
  );

  const [updatedRows] = await db.execute("SELECT * FROM tickets WHERE id=?", [ticket.id]);
  res.json(updatedRows[0]);
});

export default router;
