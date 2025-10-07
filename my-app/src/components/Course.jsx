import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function Course() {
  const location = useLocation();
  const user = location.state?.user;

  const [selectedCourse, setSelectedCourse] = useState("");
  const [subjects, setSubjects] = useState({
    persuingSubjects: [], // ✅ Keep as 'persuing'
    completedSubjects: [],
    pendingSubjects: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Persuing"); // ✅ Keep as 'Persuing'

  if (!user) return <p>User data missing. Please login again.</p>;

  // Convert user.course to array if single value
  const courses = Array.isArray(user.course) ? user.course : [user.course];

  // Fetch subjects for selected course
  useEffect(() => {
    if (!selectedCourse) return;

    const fetchSubjects = async () => {
      setLoading(true);
      setError(null);

      try {
const res = await fetch(
  `http://localhost:5000/api/courses/details?name_contactid=${user.name_contactid}&course=${encodeURIComponent(selectedCourse)}`
);



        if (!res.ok) {
          const errorText = await res.text();
          console.error("Server response:", errorText);
          throw new Error(`Server error: ${res.status}`);
        }

        const data = await res.json();
        if (!data.success)
          throw new Error(data.message || "Error fetching data");

        setSubjects({
          persuingSubjects: data.data.persuingSubjects || [], // ✅ Keep as 'persuing'
          completedSubjects: data.data.completedSubjects || [],
          pendingSubjects: data.data.pendingSubjects || [],
        });
      } catch (err) {
        setError(err.message);
        console.error("Fetch error:", err);
        setSubjects({
          persuingSubjects: [],
          completedSubjects: [],
          pendingSubjects: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [selectedCourse, user.name_contactid]);

  const renderSubjects = () => {
    let list = [];
    switch (activeTab) {
      case "Persuing": // ✅ Keep as 'Persuing'
        list = subjects.persuingSubjects; // ✅ Keep as 'persuing'
        break;
      case "Completed":
        list = subjects.completedSubjects;
        break;
      case "Pending":
        list = subjects.pendingSubjects;
        break;
      default:
        list = [];
    }

    if (loading) return <p>Loading subjects...</p>;
    if (error) return <p className="text-red-600">Error: {error}</p>;

    if (!list || list.length === 0)
      return <p>No {activeTab} subjects found.</p>;

    return (
      <ul className="list-disc list-inside">
        {list.map((s, i) => (
          <li key={i}>{s.subjectname || s.subject}</li>
        ))}
      </ul>
    );
  };

  return (
<div className="p-6">
  <h2 className="text-2xl font-bold mb-4 text-center">Course Details</h2>

  {/* Centered dropdown */}
  <div className="flex justify-center mb-6">
    <select
      id="course-select"
      value={selectedCourse}
      onChange={(e) => setSelectedCourse(e.target.value)}
      className="p-2 border rounded w-1/2 md:w-1/3"
    >
      <option value="">-- Select a course --</option>
      {courses.map((course) => (
        <option key={course} value={course}>
          {course}
        </option>
      ))}
    </select>
  </div>

  {/* Only show tabs if a course is selected */}
  {selectedCourse && (
    <>
      <div className="flex gap-4 mb-6 justify-center">
        {["Persuing", "Completed", "Pending"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md font-semibold border ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Render subject list */}
      <div className="max-w-md mx-auto">
        <h3 className="font-bold text-lg mb-2 text-center">
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Subjects
        </h3>
        {renderSubjects()}
      </div>
    </>
  )}
</div>

  );
}