"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn, User, Lock, AlertCircle } from "lucide-react";
import { saveSession } from "@/lib/auth";

// Best practice: Use env variable for the API
const API = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ user_id: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!API) {
        setError("API URL is not configured. Set NEXT_PUBLIC_API_URL in .env.local and restart the frontend.");
        return;
      }

      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : { error: await res.text() };

      if (res.ok) {
        saveSession(data.token, data.user);
        localStorage.setItem("role", data.user.role);

        const role = data.user.role;

        if (role === "ADMIN")        router.push("/admin/dashboard");
        else if (role === "STUDENT") router.push("/student/dashboard");
        else if (role === "TEACHER") router.push("/teacher/dashboard");
        else if (role === "MANAGER") router.push("/manager/dashboard");
        else setError("Unknown role");

      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("Server connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
        <p className="text-gray-500 text-sm mt-2">Sign in to access your dashboard</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={18} className="shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">User ID</label>
          <div className="relative text-gray-700">
            <User className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="e.g. STD-2026-0001"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase font-medium text-gray-900"
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value.toUpperCase() })}
              required
            />
          </div>
        </div>

        <div>
          {/* ── Label row with Forgot Password link ── */}
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-bold text-gray-700">Password</label>
            <Link
              href="/forgot-password"
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative text-gray-700">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-gray-900"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition p-0.5"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:bg-blue-400 mt-4 shadow-sm"
        >
          {loading ? "Signing In..." : <> Sign In <LogIn size={18} /> </>}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <Link href="/register" className="font-bold text-blue-600 hover:underline">
          Register Now
        </Link>
      </div>
    </div>
  );
}
