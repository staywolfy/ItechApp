// server.js
import http from "http";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// 🔧 Configuration
const PORT = process.env.PORT || 5000;

const dbConfig = {
  connectionLimit: 10,
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "test",
};

console.log("🔧 Database configuration:", {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database,
});

// 🔗 Create connection pool
const pool = mysql.createPool(dbConfig);

// 🧩 Helper: Set CORS headers
const setCorsHeaders = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
};

// 🧩 Helper: Send JSON Response
const sendJSON = (res, statusCode, data) => {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
};

// 🚀 HTTP Server
const server = http.createServer(async (req, res) => {
  setCorsHeaders(req, res);

  console.log(`📨 ${req.method} ${req.url}`);

  // ✅ Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // ✅ /test endpoint — check DB connection
  if (
    req.method === "GET" &&
    (req.url === "/test" || req.url === "/api/test")
  ) {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query("SELECT 1+1 AS result");
      connection.release();

      sendJSON(res, 200, {
        success: true,
        message: "Server OK",
        database: rows[0].result,
      });
    } catch (err) {
      sendJSON(res, 500, { success: false, message: err.message });
    }
    return;
  }

  // ✅ /login endpoint
  if (
    req.method === "POST" &&
    (req.url === "/login" || req.url === "/api/login")
  ) {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));

    req.on("end", async () => {
      try {
        if (!body) {
          sendJSON(res, 400, { success: false, message: "Empty body" });
          return;
        }

        const { username, password } = JSON.parse(body);

        if (!username || !password) {
          sendJSON(res, 400, {
            success: false,
            message: "Username and password required",
          });
          return;
        }

        const [rows] = await pool.query(
          "SELECT id, username, name, contact, branch, course, Emailid FROM student WHERE username = ? AND password = ?",
          [username, password]
        );

        if (rows.length === 0) {
          sendJSON(res, 401, {
            success: false,
            message: "Invalid username or password",
          });
          return;
        }

        const user = rows[0];
        sendJSON(res, 200, {
          success: true,
          message: "Login successful",
          user,
        });
      } catch (err) {
        sendJSON(res, 500, { success: false, message: err.message });
      }
    });

    return;
  }

  // ❌ Default 404 response
  sendJSON(res, 404, { success: false, message: "Route not found" });
});

// 🧠 Test DB before starting server
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Database connected successfully!");
    const [tables] = await connection.query("SHOW TABLES LIKE 'student'");
    if (tables.length === 0) console.warn("⚠️ Table 'student' not found!");
    connection.release();
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  }
}

// 🚀 Start server
server.listen(PORT, async () => {
  await testConnection();
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
