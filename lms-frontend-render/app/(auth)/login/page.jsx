"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Eye, 
  EyeOff, 
  LogIn, 
  User, 
  Lock, 
  AlertCircle,
  BookOpen,
  ArrowRight,
  Shield
} from "lucide-react";
import { saveSession } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ user_id: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    <div className={`relative transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      
      {/* Logo Icon */}
      <div className="flex justify-center mb-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl blur-md opacity-50"></div>
          <div className="relative w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Heading */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-1 leading-tight">
          Sign in to your
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
            Dashboard
          </span>
        </h1>
        <p className="text-gray-500 text-xs">
          Enter your credentials to continue
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2 text-xs font-medium animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* User ID */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            User ID
          </label>
          <div className="relative group transition-all duration-300">
            {/* Focus glow */}
            <div className={`absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg blur opacity-0 transition-opacity duration-300 ${focusedField === 'user_id' ? 'opacity-30' : ''}`}></div>
            
            <div className="relative">
              <User className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300 z-10 ${focusedField === 'user_id' ? 'text-blue-600' : 'text-gray-400'}`} size={16} />
              <input
                type="text"
                placeholder="e.g. STD-2026-0001"
                className="relative w-full pl-10 pr-3 py-2.5 rounded-lg text-gray-900 placeholder-gray-400 bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none uppercase font-medium text-sm transition-all"
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value.toUpperCase() })}
                onFocus={() => setFocusedField('user_id')}
                onBlur={() => setFocusedField(null)}
                required
              />
            </div>
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-gray-700">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative group transition-all duration-300">
            {/* Focus glow */}
            <div className={`absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg blur opacity-0 transition-opacity duration-300 ${focusedField === 'password' ? 'opacity-30' : ''}`}></div>
            
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300 z-10 ${focusedField === 'password' ? 'text-blue-600' : 'text-gray-400'}`} size={16} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="relative w-full pl-10 pr-10 py-2.5 rounded-lg text-gray-900 placeholder-gray-400 bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-medium text-sm transition-all"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition p-0.5 z-10"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="group relative w-full overflow-hidden text-white py-3 rounded-lg font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
          
          <span className="relative flex items-center justify-center gap-2">
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing In...
              </>
            ) : (
              <>
                Sign In
                <LogIn size={16} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </span>
        </button>
      </form>

      {/* Security Badge */}
      <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
        <Shield className="w-3 h-3 text-green-500" />
        <span>Secure and encrypted connection</span>
      </div>

      {/* Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-white text-gray-400 uppercase tracking-wider font-medium text-[10px]">
            Or
          </span>
        </div>
      </div>

      {/* Register Link */}
      <div className="text-center">
        <p className="text-gray-600 text-xs">
          Don't have an account?{" "}
          <Link 
            href="/register" 
            className="font-bold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1 group"
          >
            Register Now
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </p>
      </div>
    </div>
  );
}
