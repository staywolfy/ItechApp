import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaBook, FaUsers, FaMoneyBillWave } from "react-icons/fa";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = location.state?.user;

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="flex flex-row items-center justify-center space-x-6">
      <button
        onClick={() => navigate("/dashboard/course", { state: { user } })}
        className="flex items-center space-x-3 bg-white p-4 rounded shadow hover:bg-green-200 transition"
      >
        <FaBook size={24} />
        <span>Course Details</span>
      </button>

      <button
        onClick={() => alert("Batch Details clicked")}
        className="flex items-center space-x-3 bg-white p-4 rounded shadow hover:bg-green-200 transition"
      >
        <FaUsers size={24} />
        <span>Batch Details</span>
      </button>

      <button
        onClick={() => alert("Fees Details clicked")}
        className="flex items-center space-x-3 bg-white p-4 rounded shadow hover:bg-green-200 transition"
      >
        <FaMoneyBillWave size={24} />
        <span>Fees Details</span>
      </button>
    </div>
  );
}
