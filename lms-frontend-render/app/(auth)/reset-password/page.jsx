"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  Loader2, 
  ShieldCheck, 
  AlertCircle,
  Shield,
  ArrowRight,
  Sparkles
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ new_password: "", confirm_password: "" });
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Retrieve user_id + otp stored by forgot-password page
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState(null);

  useEffect(() => {
    setMounted(true);
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

  // ═══════════════════════════════════════════════════════════════════════════
  // SUCCESS STATE
  // ═══════════════════════════════════════════════════════════════════════════
  if (success) {
    return (
      <div className="relative animate-in fade-in zoom-in-95 duration-500">
        
        {/* Success Icon */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl blur-md opacity-60 animate-pulse"></div>
            <div className="relative w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-1 leading-tight">
            Password
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
              Reset!
            </span>
          </h1>
          <p className="text-gray-500 text-xs">
            Your password has been updated successfully
          </p>
        </div>

        {/* Login Button */}
        <button
          onClick={() => router.push("/login")}
          className="group relative w-full overflow-hidden text-white py-3 rounded-lg font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
          <span className="relative flex items-center justify-center gap-2">
            Back to Login
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </span>
        </button>

        {/* Security Badge */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
          <Shield className="w-3 h-3 text-green-500" />
          <span>Your account is now secure</span>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LOADING / NOT READY
  // ═══════════════════════════════════════════════════════════════════════════
  if (!userId || !otp) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FORM
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className={`relative transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      
      {/* Logo Icon */}
      <div className="flex justify-center mb-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl blur-md opacity-50"></div>
          <div className="relative w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Heading */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-1 leading-tight">
          Set a new
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
            Password
          </span>
        </h1>
        <p className="text-gray-500 text-xs">
          Create a strong password for your account
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
        
        {/* New Password */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            New Password
          </label>
          <div className="relative group transition-all duration-300">
            {/* Focus glow */}
            <div className={`absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg blur opacity-0 transition-opacity duration-300 ${focusedField === 'new_password' ? 'opacity-30' : ''}`}></div>
            
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300 z-10 ${focusedField === 'new_password' ? 'text-blue-600' : 'text-gray-400'}`} size={16} />
              <input
                type={showNew ? "text" : "password"}
                required
                placeholder="Enter new password"
                className="relative w-full pl-10 pr-10 py-2.5 rounded-lg text-gray-900 placeholder-gray-400 bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-medium text-sm transition-all"
                value={formData.new_password}
                onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                onFocus={() => setFocusedField('new_password')}
                onBlur={() => setFocusedField(null)}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition p-0.5 z-10"
                tabIndex={-1}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Password strength bar */}
          {formData.new_password.length > 0 && (
            <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-300">
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                      i <= strength.level ? strength.color : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-[11px] text-gray-500">
                Strength:{" "}
                <span className={`font-bold ${
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
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            Confirm Password
          </label>
          <div className="relative group transition-all duration-300">
            {/* Focus glow */}
            <div className={`absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg blur opacity-0 transition-opacity duration-300 ${focusedField === 'confirm_password' ? 'opacity-30' : ''}`}></div>
            
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300 z-10 ${focusedField === 'confirm_password' ? 'text-blue-600' : 'text-gray-400'}`} size={16} />
              <input
                type={showConfirm ? "text" : "password"}
                required
                placeholder="Re-enter new password"
                className={`relative w-full pl-10 pr-10 py-2.5 rounded-lg text-gray-900 placeholder-gray-400 bg-gray-50 border focus:bg-white focus:ring-2 focus:outline-none font-medium text-sm transition-all ${
                  formData.confirm_password.length > 0
                    ? passwordsMatch
                      ? "border-green-400 focus:border-green-500 focus:ring-green-500/20"
                      : "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                }`}
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                onFocus={() => setFocusedField('confirm_password')}
                onBlur={() => setFocusedField(null)}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition p-0.5 z-10"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {formData.confirm_password.length > 0 && (
            <p className={`text-[11px] mt-1 font-medium ${passwordsMatch ? "text-green-600" : "text-red-500"}`}>
              {passwordsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !passwordsMatch || strength.level < 1}
          className="group relative w-full overflow-hidden text-white py-3 rounded-lg font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
          
          <span className="relative flex items-center justify-center gap-2">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Resetting...
              </>
            ) : (
              <>
                Reset Password
                <ShieldCheck size={14} className="group-hover:scale-110 transition-transform" />
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

      {/* Password Tips */}
      <div className="mt-4 p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3 h-3 text-blue-600" />
          <p className="text-[11px] font-bold text-blue-900 uppercase tracking-wide">Password Tips</p>
        </div>
        <ul className="text-[11px] text-gray-600 space-y-1">
          <li className={`flex items-center gap-1.5 transition-colors ${formData.new_password.length >= 8 ? "text-green-600 font-medium" : ""}`}>
            <span className="w-3 inline-block">{formData.new_password.length >= 8 ? "✓" : "•"}</span>
            At least 8 characters
          </li>
          <li className={`flex items-center gap-1.5 transition-colors ${/[A-Z]/.test(formData.new_password) ? "text-green-600 font-medium" : ""}`}>
            <span className="w-3 inline-block">{/[A-Z]/.test(formData.new_password) ? "✓" : "•"}</span>
            One uppercase letter
          </li>
          <li className={`flex items-center gap-1.5 transition-colors ${/[0-9]/.test(formData.new_password) ? "text-green-600 font-medium" : ""}`}>
            <span className="w-3 inline-block">{/[0-9]/.test(formData.new_password) ? "✓" : "•"}</span>
            One number
          </li>
          <li className={`flex items-center gap-1.5 transition-colors ${/[^A-Za-z0-9]/.test(formData.new_password) ? "text-green-600 font-medium" : ""}`}>
            <span className="w-3 inline-block">{/[^A-Za-z0-9]/.test(formData.new_password) ? "✓" : "•"}</span>
            One special character
          </li>
        </ul>
      </div>
    </div>
  );
}
