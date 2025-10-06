import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function Course() {
  const location = useLocation();
  const user = location.state?.user;

  const [selectedCourse, setSelectedCourse] = useState("");
  const [subjects, setSubjects] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!user) return <p>User data missing. Please login again.</p>;

  // Suppose user.course is a string or an array of courses.
  // For simplicity, let's assume it's an array or make an array of one:
  const courses = Array.isArray(user.course) ? user.course : [user.course];

  // Fetch subjects when selectedCourse changes
  useEffect(() => {
    if (!selectedCourse) {
      setSubjects(null);
      return;
    }

    async function fetchSubjects() {
      setLoading(true);
      setError(null);
      try {
        // Example API call: fetch subjects by name_contactid and course
        const res = await fetch(
          `/api/courses/details?name_contactid=${user.name_contactid}&course=${encodeURIComponent(selectedCourse)}`
        );
console.log("User object in Course:", user);

        if (!res.ok) throw new Error("Failed to fetch course subjects");

        const data = await res.json();

        if (!data.success) throw new Error(data.message || "Error fetching data");

        setSubjects(data.data); // Assuming API returns { pursuingSubjects, completedSubjects, pendingSubjects }
      } catch (err) {
        setError(err.message);
        setSubjects(null);
      } finally {
        setLoading(false);
      }
    }

    fetchSubjects();
  }, [selectedCourse, user.name_contactid]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Course Details</h2>

      <label htmlFor="course-select" className="block mb-2 font-semibold">
        Select Course:
      </label>

      <select
        id="course-select"
        value={selectedCourse}
        onChange={(e) => setSelectedCourse(e.target.value)}
        className="mb-6 p-2 border rounded"
      >
        <option value="">-- Select a course --</option>
        {courses.map((course) => (
          <option key={course} value={course}>
            {course}
          </option>
        ))}
      </select>

      {loading && <p>Loading subjects...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {subjects && (
        <div>
          <h3 className="font-bold text-lg">Pursuing Subjects</h3>
          {subjects.pursuingSubjects.length > 0 ? (
            <ul className="mb-4 list-disc list-inside">
              {subjects.pursuingSubjects.map((s, i) => (
                <li key={i}>{s.subjectname || s.subject}</li>
              ))}
            </ul>
          ) : (
            <p>No pursuing subjects</p>
          )}

          <h3 className="font-bold text-lg">Completed Subjects</h3>
          {subjects.completedSubjects.length > 0 ? (
            <ul className="mb-4 list-disc list-inside">
              {subjects.completedSubjects.map((s, i) => (
                <li key={i}>{s.subjectname || s.subject}</li>
              ))}
            </ul>
          ) : (
            <p>No completed subjects</p>
          )}

          <h3 className="font-bold text-lg">Pending Subjects</h3>
          {subjects.pendingSubjects.length > 0 ? (
            <ul className="mb-4 list-disc list-inside">
              {subjects.pendingSubjects.map((s, i) => (
                <li key={i}>{s.subjectname || s.subject}</li>
              ))}
            </ul>
          ) : (
            <p>No pending subjects</p>
          )}
        </div>
      )}
    </div>
  );
}
