"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle, Loader2, ShieldCheck } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ new_password: "", confirm_password: "" });
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Retrieve user_id + otp stored by forgot-password page
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState(null);

  useEffect(() => {
    const storedId = sessionStorage.getItem("reset_user_id");
    const storedOtp = sessionStorage.getItem("reset_otp");
    if (!storedId || !storedOtp) {
      // No OTP session — redirect back
      router.replace("/forgot-password");
      return;
    }
    setUserId(storedId);
    setOtp(storedOtp);
  }, [router]);

  // ── Password strength ───────────────────────────────────────────────────────
  const getStrength = (pw) => {
    if (!pw) return { level: 0, label: "", color: "" };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const map = [
      { level: 1, label: "Weak", color: "bg-red-400" },
      { level: 2, label: "Fair", color: "bg-orange-400" },
      { level: 3, label: "Good", color: "bg-yellow-400" },
      { level: 4, label: "Strong", color: "bg-green-500" },
    ];
    return map[score - 1] || { level: 0, label: "", color: "" };
  };

  const strength = getStrength(formData.new_password);
  const passwordsMatch =
    formData.confirm_password.length > 0 &&
    formData.new_password === formData.confirm_password;

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.new_password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (formData.new_password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/forgot-password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          otp: otp,
          new_password: formData.new_password,
          confirm_password: formData.confirm_password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to reset password.");
      } else {
        // Clear session storage
        sessionStorage.removeItem("reset_user_id");
        sessionStorage.removeItem("reset_otp");
        setSuccess(true);
      }
    } catch {
      setError("Server connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── SUCCESS STATE ───────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset!</h2>
        <p className="text-gray-600 mb-8">
          Your password has been successfully updated. You can now log in with your new password.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Back to Login
        </button>
      </div>
    );
  }

  // ── LOADING / NOT READY ─────────────────────────────────────────────────────
  if (!userId || !otp) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  // ── FORM ────────────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Set New Password</h1>
        <p className="text-sm text-gray-500 mt-2">
          Create a strong password for your account.
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type={showNew ? "text" : "password"}
              required
              className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-gray-900"
              placeholder="Enter new password"
              value={formData.new_password}
              onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition p-0.5"
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Password strength bar */}
          {formData.new_password.length > 0 && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all ${
                      i <= strength.level ? strength.color : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Strength:{" "}
                <span className={`font-semibold ${
                  strength.level <= 1 ? "text-red-500" :
                  strength.level === 2 ? "text-orange-500" :
                  strength.level === 3 ? "text-yellow-600" : "text-green-600"
                }`}>
                  {strength.label}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type={showConfirm ? "text" : "password"}
              required
              className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:outline-none font-medium text-gray-900 transition ${
                formData.confirm_password.length > 0
                  ? passwordsMatch
                    ? "border-green-400 focus:ring-green-400"
                    : "border-red-400 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="Re-enter new password"
              value={formData.confirm_password}
              onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition p-0.5"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {formData.confirm_password.length > 0 && (
            <p className={`text-xs mt-1 ${passwordsMatch ? "text-green-600" : "text-red-500"}`}>
              {passwordsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !passwordsMatch || strength.level < 1}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Resetting...</>
          ) : (
            "Reset Password"
          )}
        </button>
      </form>

      {/* Password tips */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
        <p className="text-xs font-semibold text-gray-600 mb-2">Password tips:</p>
        <ul className="text-xs text-gray-500 space-y-1">
          <li className={formData.new_password.length >= 8 ? "text-green-600" : ""}>
            {formData.new_password.length >= 8 ? "✓" : "•"} At least 8 characters
          </li>
          <li className={/[A-Z]/.test(formData.new_password) ? "text-green-600" : ""}>
            {/[A-Z]/.test(formData.new_password) ? "✓" : "•"} One uppercase letter
          </li>
          <li className={/[0-9]/.test(formData.new_password) ? "text-green-600" : ""}>
            {/[0-9]/.test(formData.new_password) ? "✓" : "•"} One number
          </li>
          <li className={/[^A-Za-z0-9]/.test(formData.new_password) ? "text-green-600" : ""}>
            {/[^A-Za-z0-9]/.test(formData.new_password) ? "✓" : "•"} One special character
          </li>
        </ul>
      </div>
    </div>
  );
}
