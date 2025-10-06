// controllers/courseController.js
import db from "../utils/utils.js";

export const getPursuingCourses = async (req, res) => {
  const studentId = req.query.name_contactid;

  if (!studentId) {
    return res.status(400).json({ message: "studentId query parameter is required" });
  }

  try {
    const [rows] = await db.query(
      `SELECT f.course AS id, c.name 
       FROM faculty_student f
       JOIN course c ON c.id = f.course_id
       WHERE f.student_id = ? AND f.status = 'pursuing'`,
      [studentId]
    );
    res.json({ courses: rows });
  } catch (err) {
    console.error("Error fetching pursuing courses:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getCompletedCourses = async (req, res) => {
  const studentId = req.query.studentId;

  if (!studentId) {
    return res.status(400).json({ message: "studentId query parameter is required" });
  }

  try {
    const [rows] = await db.query(
      `SELECT f.course_id AS id, c.name 
       FROM faculty_student f
       JOIN course c ON c.id = f.course_id
       WHERE f.student_id = ? AND f.status = 'completed'
       UNION
       SELECT s.course_id AS id, c.name 
       FROM student s
       JOIN course c ON c.id = s.course_id
       WHERE s.id = ? AND s.completed = 1`,
      [studentId, studentId]
    );
    res.json({ courses: rows });
  } catch (err) {
    console.error("Error fetching completed courses:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getPendingCourses = async (req, res) => {
  const studentId = req.query.studentId;

  if (!studentId) {
    return res.status(400).json({ message: "studentId query parameter is required" });
  }

  try {
    // Get student's course_id first
    const [[student]] = await db.query(
      "SELECT course_id FROM student WHERE id = ?",
      [studentId]
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get all subjects for the course
    const [allSubjects] = await db.query(
      "SELECT id, name FROM subject WHERE course_id = ?",
      [student.course_id]
    );

    // Get completed and pursuing subject IDs
    const [completedSubjects] = await db.query(
      `SELECT subject_id FROM completed_subjects WHERE student_id = ?`,
      [studentId]
    );
    const [pursuingSubjects] = await db.query(
      `SELECT subject_id FROM pursuing_subjects WHERE student_id = ?`,
      [studentId]
    );

    const completedIds = new Set(completedSubjects.map((s) => s.subject_id));
    const pursuingIds = new Set(pursuingSubjects.map((s) => s.subject_id));

    // Filter subjects to those NOT completed or pursuing
    const pending = allSubjects.filter(
      (subject) => !completedIds.has(subject.id) && !pursuingIds.has(subject.id)
    );

    res.json({ courses: pending });
  } catch (err) {
    console.error("Error fetching pending courses:", err);
    res.status(500).json({ message: err.message });
  }
};
