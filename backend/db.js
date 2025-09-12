import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql
  .createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "ticketurn",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })
  .on("error", (err) => {
    console.error("Database connection error:", err);
  });

export const db = pool;
