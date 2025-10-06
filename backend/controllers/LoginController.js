// controllers/studentController.js
import db from "../utils/utils.js";

export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    debugger;
    return res
      .status(400)
      .json({ success: false, message: "Username and password are required." });
  }

  try {
    const [rows] = await db.query(
      `SELECT id, username, name, contact, branch, course, Emailid, name_contactid 
       FROM student 
       WHERE username = ? AND password = ?`,
      [username, password]
    );

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password." });
    }
    debugger;
    const user = rows[0];
    return res.json({ success: true, user });
  } catch (err) {
    console.error("Login error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error while logging in." });
  }
};
