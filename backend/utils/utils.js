// utils/db.js
import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  connectionLimit: 50,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.getConnection((err, conn) => {
  if (err) {
    console.error("❌ MySQL connection error:", err.code, err.message);
    process.exit(1);
  }
  console.log("✅ MySQL connected successfully");
  conn.release();
});

export default pool.promise();
