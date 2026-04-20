"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Phone, 
  KeyRound, 
  Loader2, 
  AlertCircle,
  Shield,
  Send,
  ShieldQuestion,
  ArrowRight
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ForgotPassword() {
  // Steps: "enter_id" → "enter_otp" → (redirect to /reset-password)
  const [step, setStep]               = useState("enter_id");
  const [userId, setUserId]           = useState("");
  const [otp, setOtp]                 = useState(["", "", "", "", "", ""]);
  const [maskedPhone, setMaskedPhone] = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [mounted, setMounted]         = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Step 1: Request OTP ─────────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API}/forgot-password/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send OTP.");
      } else {
        setMaskedPhone(data.masked_phone);
        setStep("enter_otp");
        startResendCooldown();
      }
    } catch {
      setError("Server connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Store OTP + userId, redirect to reset page ──────────────────────
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const otpString = otp.join("");
    if (otpString.length < 6) {
      setError("Please enter the full 6-digit OTP.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      // Store user_id + otp in sessionStorage.
      // The reset-password page will send these together with the new password
      // to /forgot-password/reset, which verifies the OTP and updates the password
      // atomically — so the OTP is never exposed beyond one use.
      sessionStorage.setItem("reset_user_id", userId.trim().toUpperCase());
      sessionStorage.setItem("reset_otp", otpString);
      window.location.href = "/reset-password";
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP Input Handling ──────────────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(""));
      document.getElementById("otp-5")?.focus();
    }
    e.preventDefault();
  };

  // ── Resend Cooldown ─────────────────────────────────────────────────────────
  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 1: Enter User ID
  // ═══════════════════════════════════════════════════════════════════════════
  if (step === "enter_id") {
    return (
      <div className={`relative transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        
        {/* Logo Icon */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl blur-md opacity-50"></div>
            <div className="relative w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30">
              <ShieldQuestion className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-1 leading-tight">
            Forgot your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              Password?
            </span>
          </h1>
          <p className="text-gray-500 text-xs">
            Enter your User ID to receive an OTP
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
        <form onSubmit={handleSendOtp} className="space-y-4">
          
          {/* User ID */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              User ID
            </label>
            <div className="relative group transition-all duration-300">
              {/* Focus glow */}
              <div className={`absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg blur opacity-0 transition-opacity duration-300 ${focusedField === 'user_id' ? 'opacity-30' : ''}`}></div>
              
              <div className="relative">
                <KeyRound className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300 z-10 ${focusedField === 'user_id' ? 'text-blue-600' : 'text-gray-400'}`} size={16} />
                <input
                  type="text"
                  required
                  placeholder="e.g. STD-2026-0001"
                  className="relative w-full pl-10 pr-3 py-2.5 rounded-lg text-gray-900 placeholder-gray-400 bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none uppercase font-medium text-sm transition-all"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value.toUpperCase())}
                  onFocus={() => setFocusedField('user_id')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !userId.trim()}
            className="group relative w-full overflow-hidden text-white py-3 rounded-lg font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
            
            <span className="relative flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                <>
                  Send OTP
                  <Send size={14} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </span>
          </button>
        </form>

        {/* Security Badge */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
          <Shield className="w-3 h-3 text-green-500" />
          <span>Secure OTP verification</span>
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

        {/* Back to Login */}
        <div className="text-center">
          <Link
            href="/login"
            className="font-bold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1 group text-xs"
          >
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 2: Enter OTP
  // ═══════════════════════════════════════════════════════════════════════════
  if (step === "enter_otp") {
    return (
      <div className={`relative transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        
        {/* Logo Icon */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl blur-md opacity-50"></div>
            <div className="relative w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30">
              <Phone className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-1 leading-tight">
            Check your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              Phone
            </span>
          </h1>
          <p className="text-gray-500 text-xs">
            We sent a 6-digit OTP to{" "}
            <span className="font-bold text-gray-700">{maskedPhone}</span>
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
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          
          {/* OTP Inputs */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 text-center">
              Enter 6-Digit OTP
            </label>
            <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
              {otp.map((digit, index) => (
                <div 
                  key={index}
                  className="relative group transition-all duration-300"
                >
                  {/* Focus glow */}
                  <div className={`absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg blur opacity-0 transition-opacity duration-300 ${focusedField === `otp-${index}` ? 'opacity-40' : ''}`}></div>
                  <input
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onFocus={() => setFocusedField(`otp-${index}`)}
                    onBlur={() => setFocusedField(null)}
                    className="relative w-11 h-12 text-center text-xl font-bold bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-gray-900 transition-all"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || otp.join("").length < 6}
            className="group relative w-full overflow-hidden text-white py-3 rounded-lg font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
            
            <span className="relative flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify &amp; Continue
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </span>
          </button>
        </form>

        {/* Resend */}
        <div className="mt-4 text-center text-xs text-gray-500">
          Didn&apos;t receive it?{" "}
          {resendCooldown > 0 ? (
            <span className="text-gray-400 font-medium">Resend in {resendCooldown}s</span>
          ) : (
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="text-blue-600 font-bold hover:underline disabled:opacity-50"
            >
              Resend OTP
            </button>
          )}
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

        {/* Change User ID */}
        <div className="text-center">
          <button
            onClick={() => {
              setStep("enter_id");
              setOtp(["", "", "", "", "", ""]);
              setError(null);
            }}
            className="font-bold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1 group text-xs"
          >
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
            Use a different User ID
          </button>
        </div>
      </div>
    );
  }

  return null;
}
