import express from "express";
import { db } from "../db.js";
import { authenticate } from "../middleware.js";

const router = express.Router();

// חיפוש כרטיסים
router.get("/search", async (req, res) => {
  const searchQuery = req.query.q;
  if (!searchQuery) return res.json([]);

  try {
    const [tickets] = await db.execute(
      "SELECT * FROM tickets WHERE (eventName LIKE ? OR location LIKE ?) AND isSold = 0",
      [`%${searchQuery}%`, `%${searchQuery}%`]
    );
    res.json(tickets);
  } catch (error) {
    console.error("שגיאה בחיפוש:", error);
    res.status(500).json({ message: "שגיאה בחיפוש כרטיסים" });
  }
});

// כל הכרטיסים
router.get("/", async (req, res) => {
  try {
    const { search, minPrice, maxPrice, startDate, endDate } = req.query;
    
    let query = "SELECT * FROM tickets WHERE isSold = 0";
    const params = [];

    // Add search condition
    if (search) {
      query += " AND (eventName LIKE ? OR location LIKE ? OR sellerName LIKE ? OR title LIKE ? )";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Add price range conditions
    if (minPrice) {
      query += " AND price >= ?";
      params.push(parseFloat(minPrice));
    }
    if (maxPrice) {
      query += " AND price <= ?";
      params.push(parseFloat(maxPrice));
    }

    // Add date range conditions
    if (startDate) {
      query += " AND eventDate >= ?";
      params.push(startDate);
    }
    if (endDate) {
      query += " AND eventDate <= ?";
      params.push(endDate);
    }

    const [tickets] = await db.execute(query, params);
    res.json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ message: "Error fetching tickets" });
  }
});

// כרטיס לפי id
router.get("/:id", async (req, res) => {
  const [rows] = await db.execute("SELECT * FROM tickets WHERE id=?", [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ message: "Ticket not found" });
  res.json(rows[0]);
});

// Delete a ticket
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const [result] = await db.execute("DELETE FROM tickets WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res.status(500).json({ message: "Error deleting ticket" });
  }
});

// העלאת כרטיס חדש
router.post("/", authenticate, async (req, res) => {
  try {
    const { eventName, eventDate, price, location } = req.body;
    console.log("Received ticket data:", { eventName, eventDate, price, location });

    // Validate required fields
    if (!eventName || !eventDate || !price || !location) {
      console.log("Missing fields in request");
      return res.status(400).json({ message: "Missing fields" });
    }

    // Convert price to number and validate
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      console.log("Invalid price value:", price);
      return res.status(400).json({ message: "Invalid price value" });
    }

    // Validate date
    const dateValue = new Date(eventDate);
    if (isNaN(dateValue.getTime())) {
      console.log("Invalid date value:", eventDate);
      return res.status(400).json({ message: "Invalid date format" });
    }

    console.log("Inserting ticket into database...");
    // Format the date to MySQL format (YYYY-MM-DD)
    const formattedDate = new Date(eventDate).toISOString().split('T')[0];
    console.log("Formatted date:", formattedDate);
    
    const [result] = await db.execute(
      "INSERT INTO tickets (title, eventName, eventDate, price, location, sellerId) VALUES (?, ?, ?, ?, ?, ?)",
      [eventName, eventName, formattedDate, numericPrice, location, req.user.id]
    );

    console.log("Ticket inserted, fetching created ticket...");
    const [rows] = await db.execute("SELECT * FROM tickets WHERE id=?", [result.insertId]);
    
    console.log("Returning created ticket:", rows[0]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ 
      message: "Failed to create ticket", 
      error: error.message,
      sqlMessage: error.sqlMessage 
    });
  }
});

// רכישת כרטיס
router.post("/:id/purchase", authenticate, async (req, res) => {
  const [rows] = await db.execute("SELECT * FROM tickets WHERE id=?", [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ message: "Ticket not found" });

  const ticket = rows[0];
  if (ticket.isSold) return res.status(400).json({ message: "Ticket already sold" });

  await db.execute(
    "UPDATE tickets SET isSold=1, buyerId=? WHERE id=?",
    [req.user.id, ticket.id]
  );

  const [updatedRows] = await db.execute("SELECT * FROM tickets WHERE id=?", [ticket.id]);
  res.json(updatedRows[0]);
});

export default router;
