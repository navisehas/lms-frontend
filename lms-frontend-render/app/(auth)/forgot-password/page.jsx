"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Phone, KeyRound, Loader2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ForgotPassword() {
  // Steps: "enter_id" → "enter_otp" → "done"
  const [step, setStep] = useState("enter_id");
  const [userId, setUserId] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [maskedPhone, setMaskedPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // ── Step 1: Send OTP ────────────────────────────────────────────────────────
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

  // ── Step 2: Verify OTP ──────────────────────────────────────────────────────
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
      // We just verify OTP here; navigate to reset page with token info
      // Store user_id + otp in sessionStorage for the reset page
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

  // ── STEP: Enter User ID ─────────────────────────────────────────────────────
  if (step === "enter_id") {
    return (
      <div>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
          <p className="text-sm text-gray-500 mt-2">
            Enter your User ID and we'll send an OTP to your registered phone.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSendOtp} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                required
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase font-medium text-gray-900"
                placeholder="e.g. STD-2026-0001"
                value={userId}
                onChange={(e) => setUserId(e.target.value.toUpperCase())}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !userId.trim()}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP...</>
            ) : (
              "Send OTP"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/login" className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
      </div>
    );
  }

  // ── STEP: Enter OTP ─────────────────────────────────────────────────────────
  if (step === "enter_otp") {
    return (
      <div>
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Check your phone</h1>
          <p className="text-sm text-gray-500 mt-2">
            We sent a 6-digit OTP to <span className="font-semibold text-gray-700">{maskedPhone}</span>
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleVerifyOtp} className="space-y-6">
          {/* OTP Input Boxes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              Enter OTP
            </label>
            <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-11 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-gray-900 transition"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otp.join("").length < 6}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
            ) : (
              "Verify OTP"
            )}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-gray-500">
          Didn't receive it?{" "}
          {resendCooldown > 0 ? (
            <span className="text-gray-400">Resend in {resendCooldown}s</span>
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

        <div className="mt-6 text-center">
          <button
            onClick={() => { setStep("enter_id"); setOtp(["","","","","",""]); setError(null); }}
            className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition mx-auto"
          >
            <ArrowLeft className="w-4 h-4" /> Use a different User ID
          </button>
        </div>
      </div>
    );
  }

  return null;
}
