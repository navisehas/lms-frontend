"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Loader2, ArrowRight, BookOpen, Home, RefreshCw, AlertCircle } from "lucide-react";
import { guardRoute, authFetch } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;
const REDIRECT_DELAY = 3; // seconds before auto-redirect to courses

export default function PaymentSuccessPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const orderId      = searchParams.get("order_id");

  const [user, setUser]         = useState(null);
  const [status, setStatus]     = useState("verifying"); // verifying | confirmed | pending | error
  const [payment, setPayment]   = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [countdown, setCountdown] = useState(REDIRECT_DELAY);

  const intervalRef   = useRef(null);
  const countdownRef  = useRef(null);

  useEffect(() => {
    const auth = guardRoute("STUDENT", router);
    if (auth) {
      setUser(auth);
      if (orderId) {
        startVerification(orderId);
      } else {
        setStatus("error");
      }
    }
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(countdownRef.current);
    };
  }, [router, orderId]);

  // Auto-redirect countdown once payment is confirmed
  useEffect(() => {
    if (status !== "confirmed") return;

    setCountdown(REDIRECT_DELAY);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          router.push("/student/courses");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownRef.current);
  }, [status, router]);

  function startVerification(oid) {
    let count = 0;
    const MAX = 10;
    intervalRef.current = setInterval(async () => {
      count++;
      setAttempts(count);
      const found = await verify(oid);
      if (found || count >= MAX) {
        clearInterval(intervalRef.current);
        if (!found && count >= MAX) {
          setStatus("pending");
        }
      }
    }, 2000);

    // First check immediately
    verify(oid);
  }

  async function verify(oid) {
    try {
      const res  = await authFetch(`${API}/payments/online/verify/${encodeURIComponent(oid)}`);
      const data = await res.json();
      if (data.paid) {
        setPayment(data.payment);
        setStatus("confirmed");
        return true;
      }
    } catch {
      // network error — keep polling
    }
    return false;
  }

  async function retryVerify() {
    setStatus("verifying");
    setAttempts(0);
    startVerification(orderId);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 w-full max-w-md p-8 text-center">

        {/* ── Verifying ── */}
        {status === "verifying" && (
          <>
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 mx-auto mb-5">
              <Loader2 size={36} className="text-blue-500 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Confirming Payment…</h1>
            <p className="text-gray-500 text-sm mb-2">
              We're verifying your payment with PayHere. This usually takes a few seconds.
            </p>
            <div className="flex justify-center gap-1 mt-4">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i < attempts ? "w-4 bg-blue-500" : "w-2 bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* ── Confirmed ── */}
        {status === "confirmed" && (
          <>
            <div className="flex items-center justify-center w-24 h-24 rounded-full bg-green-50 mx-auto mb-5">
              <CheckCircle size={52} className="text-green-500" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
            <p className="text-gray-500 text-sm mb-1">
              You have been <strong className="text-green-600">automatically enrolled</strong> in your course.
            </p>

            {/* Auto-redirect notice */}
            <p className="text-xs text-indigo-500 font-medium mb-5">
              Redirecting to My Courses in{" "}
              <span className="font-bold text-indigo-600">{countdown}s</span>…
            </p>

            {payment && (
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 mb-6 text-left space-y-2 text-sm">
                <Row label="Course"     value={payment.course_title} />
                <Row label="Amount"     value={`Rs. ${parseFloat(payment.amount || 0).toLocaleString()}`} />
                <Row label="Payment ID" value={payment.payment_id} mono />
                <Row label="Date"       value={payment.payment_date ? new Date(payment.payment_date).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "—"} />
                <Row label="Method"     value="Online (PayHere)" />
                <Row label="Status"     value="Enrolled ✓" green />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  clearInterval(countdownRef.current);
                  router.push("/student/courses");
                }}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all"
              >
                <BookOpen size={16} /> Go to My Courses Now
              </button>
              <button
                onClick={() => {
                  clearInterval(countdownRef.current);
                  router.push("/student/dashboard");
                }}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-all"
              >
                <Home size={16} /> Dashboard
              </button>
            </div>
          </>
        )}

        {/* ── Pending (notify not yet received) ── */}
        {status === "pending" && (
          <>
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-amber-50 mx-auto mb-5">
              <RefreshCw size={36} className="text-amber-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Processing</h1>
            <p className="text-gray-500 text-sm mb-6">
              Your payment was received by PayHere. Enrollment confirmation may take up to{" "}
              <strong>1–2 minutes</strong>. Please check again shortly.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={retryVerify}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition-all"
              >
                <RefreshCw size={16} /> Check Again
              </button>
              <button
                onClick={() => router.push("/student/courses")}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl"
              >
                <ArrowRight size={16} /> Go to My Courses
              </button>
            </div>
          </>
        )}

        {/* ── Error ── */}
        {status === "error" && (
          <>
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-50 mx-auto mb-5">
              <AlertCircle size={36} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h1>
            <p className="text-gray-500 text-sm mb-6">
              We couldn't verify your payment. Please contact support with your order ID.
            </p>
            {orderId && (
              <p className="text-xs font-mono bg-gray-50 rounded px-3 py-2 text-gray-500 mb-4 break-all">
                {orderId}
              </p>
            )}
            <button
              onClick={() => router.push("/student/courses")}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl"
            >
              <ArrowRight size={16} /> Back to My Courses
            </button>
          </>
        )}

      </div>
    </div>
  );
}

function Row({ label, value, mono, green }) {
  return (
    <div className="flex justify-between items-start gap-2">
      <span className="text-gray-400 flex-shrink-0">{label}</span>
      <span className={`font-semibold text-right ${green ? "text-green-600" : "text-gray-800"} ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </span>
    </div>
  );
}