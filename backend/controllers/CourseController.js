// controllers/CourseController.js
import { db } from "../server.js"; // ✅ Import DB connection

export const getCourseDetails = async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const name_contactid = url.searchParams.get("name_contactid");
    const course = url.searchParams.get("course");

    if (!name_contactid || !course) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          success: false,
          message: "Missing name_contactid or course",
        })
      );
    }

    console.log("🔍 Fetching course details for:", { name_contactid, course });

    // ✅ Persuing subjects
    const [persuing] = await db.query(
      "SELECT subject FROM faculty_student WHERE nameid = ? AND course = ? AND status = 'Persuing'",
      [name_contactid, course]
    );

    // ✅ Completed subjects
    const [completed] = await db.query(
      "SELECT subject FROM faculty_student WHERE nameid = ? AND course = ? AND status = 'Completed'",
      [name_contactid, course]
    );

    // ✅ Pending subjects (not in completed or persuing)
    const [pending] = await db.query(
      `SELECT s.subjectname AS subjectname
       FROM subject s
       WHERE s.coursename = ?
         AND s.subjectname COLLATE utf8mb4_general_ci NOT IN (
           SELECT subject COLLATE utf8mb4_general_ci
           FROM faculty_student
           WHERE nameid = ?
             AND course = ?
             AND status IN ('Completed', 'Persuing')
         )`,
      [course, name_contactid, course]
    );

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: true,
        data: {
          persuingSubjects: persuing,
          completedSubjects: completed,
          pendingSubjects: pending,
        },
      })
    );
  } catch (err) {
    console.error("❌ Course details error:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, message: err.message }));
  }
};
