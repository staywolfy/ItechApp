import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { FaHome, FaSignOutAlt } from "react-icons/fa";

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const user = location.state?.user;

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-green-100">
      <header className="p-6 bg-green-300 text-center">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user.name}!</h1>
        <p className="text-lg">
          Branch: <span className="font-semibold">{user.branch}</span> | Course:{" "}
          <span className="font-semibold">{user.course}</span>
        </p>
      </header>

      <main className="flex-grow p-6">
        {/* Page-specific content renders here */}
        <Outlet />
      </main>

      <footer className="flex justify-around bg-green-300 p-4">
        <button
          onClick={() => navigate("/dashboard", { state: { user } })}
          className="flex flex-col items-center text-white hover:text-green-900"
          aria-label="Home"
        >
          <FaHome size={24} />
          <span className="text-sm">Home</span>
        </button>

        <button
          onClick={() => navigate("/login")}
          className="flex flex-col items-center text-white hover:text-green-900"
          aria-label="Logout"
        >
          <FaSignOutAlt size={24} />
          <span className="text-sm">Logout</span>
        </button>
      </footer>
    </div>
  );
}
