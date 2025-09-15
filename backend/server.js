import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mysql from "mysql2/promise"; // נשתמש ב־promise API
import authRoutes from "./auth.js";
import visionRoutes from './routes/visionRoutes.js';
import { db } from "./db.js";
import { validateBody, ticketSchema, validateParamsId } from "./validation.js";
import upload from './upload.js';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import winston from "winston";
import expressRequestId from "express-request-id";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// Configure Winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    // Uncomment the following line to enable file logging
    // new winston.transports.File({ filename: "logs/server.log" })
  ]
});

// Add request ID middleware
app.use(expressRequestId());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware to log DB connection status from the pool
app.use((req, res, next) => {
  db.getConnection()
    .then(connection => {
      console.log("✅ DB connected via pool");
      connection.release();
      next();
    })
    .catch(err => {
      console.error("❌ DB pool connection failed:", err);
      res.status(500).json({ message: "Database connection error" });
    });
});

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

// Apply Helmet middleware globally for security headers
app.use(helmet());

// Rate limiting configuration for login and registration routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: "Too many login or registration attempts from this IP, please try again later."
});

// Apply rate limiting to login and registration routes
app.use("/auth/login", authLimiter);
app.use("/auth/register", authLimiter);

// 🔹 מסלולי Auth - These routes expect JSON bodies.
app.use("/auth", express.json(), authRoutes);

// 🔹 מסלולי Vision - This route expects multipart/form-data
app.use('/api/vision', visionRoutes);

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

// Log incoming requests
app.use((req, res, next) => {
  logger.info({
    message: "Incoming request",
    method: req.method,
    path: req.path,
    requestId: req.id,
    origin: req.headers.origin || "unknown"
  });
  next();
});

// 🔹 מסלולי Tickets
app.get("/tickets/latest", async (req, res) => {
  try {
    const [tickets] = await db.execute(
      `SELECT t.*, s.name AS sellerName, s.email AS sellerEmail
       FROM tickets t
       JOIN users s ON t.sellerId = s.id
       WHERE t.isSold = 0
       ORDER BY t.id DESC
       LIMIT 5`
    );
    res.json(tickets);
  } catch (err) {
    console.error("❌ Error fetching latest tickets:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/tickets", async (req, res) => {
  try {
    // Return only unsold tickets so sold items don't appear in listings/search
    const [tickets] = await db.execute(
      `SELECT t.*, s.name AS sellerName, s.email AS sellerEmail, b.name AS buyerName
       FROM tickets t
       JOIN users s ON t.sellerId = s.id
       LEFT JOIN users b ON t.buyerId = b.id
       WHERE t.isSold = 0`
    );
    res.json(tickets);
  } catch (err) {
    console.error("❌ Error fetching tickets:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/tickets/:id", validateParamsId, async (req, res) => {
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
app.post("/tickets", authenticate, (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("❌ Multer error:", err);
      return res.status(400).json({ message: err });
    }

    console.log("DEBUG req.body:", req.body);
    console.log("DEBUG req.file:", req.file);
    console.log("DEBUG req.user:", req.user);

    // Manually trigger validation after multer processes the body
    const { error, value } = ticketSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      console.error("❌ Validation error:", error.details);
      return res.status(400).json({ message: 'Validation error', details: error.details });
    }

    const { title, eventName, eventDate, price, location } = value;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    try {
      const [result] = await db.execute(
        "INSERT INTO tickets (title, eventName, eventDate, price, location, sellerId, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [title, eventName, eventDate, price, location, req.user.id, imageUrl]
      );

      console.log("✅ Ticket created with ID:", result.insertId);

      res.status(201).json({
        id: result.insertId,
        message: 'Ticket created successfully!',
        ticket: { title, eventName, eventDate, price, location, sellerId: req.user.id, imageUrl }
      });
    } catch (dbErr) {
      console.error("❌ Database error:", dbErr);
      res.status(500).json({ message: "Server error", error: dbErr.message });
    }
  });
});

// רכישת כרטיס (מחובר)
app.post("/tickets/:id/purchase", authenticate, validateParamsId, async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM tickets WHERE id=?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Ticket not found" });
    if (rows[0].isSold) return res.status(400).json({ message: "Ticket already sold" });

    await db.execute("DELETE FROM tickets WHERE id=?", [req.params.id]);

    console.log(`✅ Ticket ${req.params.id} purchased and removed by user ${req.user.id}`);

    res.json({ message: "Ticket purchased and removed successfully" });
  } catch (err) {
    console.error("❌ Error purchasing ticket:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Log errors
app.use((err, req, res, next) => {
  logger.error({
    message: "Error occurred",
    error: err.message,
    stack: err.stack,
    requestId: req.id
  });
  res.status(500).json({ message: "Server error" });
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