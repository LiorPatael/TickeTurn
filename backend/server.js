import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mysql from "mysql2/promise"; // נשתמש ב־promise API
import authRoutes from "./auth.js";

dotenv.config();
const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// 🌟 חיבור למסד הנתונים
let db;
(async () => {
  try {
    db = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "ticketurn"
    });
    console.log("✅ Connected to MySQL successfully");
  } catch (err) {
    console.error("❌ DB connection failed:", err);
    process.exit(1); // נסגור את השרת אם אין חיבור
  }
})();

// CORS configuration and request logging
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
console.log(`CORS configured to allow: ${FRONTEND_ORIGIN}`);
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} Origin=${req.headers.origin || ''}`);
  next();
});

const corsOptions = {
  origin: [FRONTEND_ORIGIN],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  optionsSuccessStatus: 204
};

// Use the same corsOptions for normal requests and preflight responses
app.use(cors(corsOptions));
app.options('/', cors(corsOptions));

app.use(bodyParser.json());

// Middleware לאימות JWT
const authenticate = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "No token" });
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ message: "Invalid token" });
  }
};

// 🔹 מסלולי Auth
app.use("/auth", authRoutes);

// Explicit preflight handler for the register route that echoes back the Origin when present
app.options('/auth/register', (req, res) => {
  const origin = req.headers.origin || FRONTEND_ORIGIN;
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, Accept');
  return res.sendStatus(204);
});

// Surface CORS errors in logs (helps diagnose origin function failures)
app.use((err, req, res, next) => {
  if (err) {
    console.error('Middleware error:', err && err.message ? err.message : err);
    // If error came from CORS origin check, respond with 403 to mimic browser behavior
    if (err.message && err.message.includes('CORS')) return res.status(403).send('CORS Error');
    return res.status(500).send('Server Error');
  }
  next();
});

// 🔹 מסלולי Tickets
app.get("/tickets", async (req, res) => {
  try {
    const [tickets] = await db.execute(
      `SELECT t.*, s.name AS sellerName, s.email AS sellerEmail, b.name AS buyerName
       FROM tickets t
       JOIN users s ON t.sellerId = s.id
       LEFT JOIN users b ON t.buyerId = b.id`
    );
    res.json(tickets);
  } catch (err) {
    console.error("❌ Error fetching tickets:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/tickets/:id", async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT t.*, s.name AS sellerName, s.email AS sellerEmail, b.name AS buyerName
       FROM tickets t
       JOIN users s ON t.sellerId = s.id
       LEFT JOIN users b ON t.buyerId = b.id
       WHERE t.id=?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Ticket not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Error fetching ticket:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// העלאת כרטיס (מחובר)
app.post("/tickets", authenticate, async (req, res) => {
  const { eventName, eventDate, price, location } = req.body;
  if (!eventName || !eventDate || !price || !location) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const [result] = await db.execute(
      "INSERT INTO tickets (eventName, eventDate, price, location, sellerId) VALUES (?, ?, ?, ?, ?)",
      [eventName, eventDate, price, location, req.user.id]
    );

    console.log("✅ Ticket created with ID:", result.insertId);

    res.status(201).json({ 
      id: result.insertId, eventName, eventDate, price, location, sellerId: req.user.id 
    });
  } catch (err) {
    console.error("❌ Error inserting ticket:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// רכישת כרטיס (מחובר)
app.post("/tickets/:id/purchase", authenticate, async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM tickets WHERE id=?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Ticket not found" });
    if (rows[0].isSold) return res.status(400).json({ message: "Ticket already sold" });

    await db.execute("UPDATE tickets SET isSold=1, buyerId=? WHERE id=?", [req.user.id, req.params.id]);

    console.log(`✅ Ticket ${req.params.id} purchased by user ${req.user.id}`);

    res.json({ ...rows[0], isSold: true, buyerId: req.user.id });
  } catch (err) {
    console.error("❌ Error purchasing ticket:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🌟 Global error handlers
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
process.on('exit', (code) => {
  console.log(`Server is exiting with code: ${code}`);
});

// 🌟 הפעלת השרת
const port = process.env.PORT || 3050;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
