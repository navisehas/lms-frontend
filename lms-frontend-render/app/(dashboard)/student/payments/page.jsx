"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard, Loader2, AlertCircle, RefreshCw,
  Wifi, Clock, Tag, ShieldCheck, Lock, Play,
  CheckCircle, XCircle, BookOpen,
} from "lucide-react";
import { guardRoute, authFetch } from "@/lib/auth";

const API                  = process.env.NEXT_PUBLIC_API_URL;
const PAYHERE_CHECKOUT_URL = process.env.NEXT_PUBLIC_PAYHERE_URL;
const CURRENCY             = "LKR";
const FRONTEND_URL         = process.env.NEXT_PUBLIC_FRONTEND_URL;

export default function StudentPaymentsPage() {
  const router = useRouter();

  const [user,         setUser]         = useState(null);
  const [courses,      setCourses]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [payingCourse, setPayingCourse] = useState(null);
  const [backWarning,  setBackWarning]  = useState(false);

  const leftForPayHere = useRef(false);
  const warningTimer   = useRef(null);

  function showWarning() {
    setBackWarning(true);
    clearTimeout(warningTimer.current);
    warningTimer.current = setTimeout(() => setBackWarning(false), 10000);
  }

  function hideWarning() {
    setBackWarning(false);
    clearTimeout(warningTimer.current);
  }

  useEffect(() => {
    const auth = guardRoute("STUDENT", router);
    if (auth) {
      setUser(auth);
      fetchCourses(auth.user_id);
    }
    return () => clearTimeout(warningTimer.current);
  }, [router]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("cancelled") === "1") {
      showWarning();
      window.history.replaceState({}, "", "/student/payments");
    }

    const handlePageShow = (e) => {
      if (e.persisted && leftForPayHere.current) {
        leftForPayHere.current = false;
        setPayingCourse(null);
        showWarning();
        if (user) fetchCourses(user.user_id);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible" && leftForPayHere.current) {
        leftForPayHere.current = false;
        setPayingCourse(null);
        showWarning();
        if (user) fetchCourses(user.user_id);
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [user]);

  const fetchCourses = useCallback(async (studentId) => {
    setLoading(true);
    setError("");
    try {
      const res  = await authFetch(`${API}/payments/courses/${studentId}`);
      const data = await res.json();
      if (data.success) {
        // Only show courses NOT yet enrolled (pending payment)
        setCourses((data.courses || []).filter((c) => !c.is_enrolled));
      } else {
        setError(data.error || "Failed to load courses.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  async function handlePayNow(course) {
    if (payingCourse) return;
    setPayingCourse(course.course_id);
    hideWarning();
    setError("");

    try {
      const order_id = `${course.course_id}::${user.user_id}`;
      const amount   = parseFloat(course.fee).toFixed(2);

      const hashRes  = await authFetch(`${API}/payments/online/hash`, {
        method: "POST",
        body: JSON.stringify({ order_id, amount, currency: CURRENCY }),
      });
      const hashData = await hashRes.json();

      if (!hashData.success) {
        setError(hashData.error || "Could not initiate payment.");
        setPayingCourse(null);
        return;
      }

      const form = document.createElement("form");
      form.method = "POST";
      form.action = PAYHERE_CHECKOUT_URL;

      const fields = {
        merchant_id: hashData.merchant_id,
        return_url:  `${FRONTEND_URL}/student/success?order_id=${encodeURIComponent(order_id)}`,
        cancel_url:  `${FRONTEND_URL}/student/payments?cancelled=1`,
        notify_url:  `${API}/payments/online/notify`,
        order_id,
        items:       course.title,
        currency:    CURRENCY,
        amount,
        first_name:  user.name?.split(" ")[0] || "Student",
        last_name:   user.name?.split(" ").slice(1).join(" ") || "",
        email:       user.email || `${user.user_id}@lms.lk`,
        phone:       user.phone_no || "0000000000",
        address:     user.address || "Sri Lanka",
        city:        "Colombo",
        country:     "Sri Lanka",
        hash:        hashData.hash,
        platform:    "web",
      };

      Object.entries(fields).forEach(([k, v]) => {
        const input  = document.createElement("input");
        input.type   = "hidden";
        input.name   = k;
        input.value  = v;
        form.appendChild(input);
      });

      leftForPayHere.current = true;
      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      console.error("Pay error:", err);
      setError("Payment initiation failed. Please try again.");
      setPayingCourse(null);
      leftForPayHere.current = false;
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="text-blue-800" size={24} />
            Courses & Payments
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse our courses, choose one and pay your monthly fee
          </p>
        </div>
        <button
          onClick={() => user && fetchCourses(user.user_id)}
          disabled={loading}
          className="inline-flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 self-start sm:self-auto shadow-sm"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ── Cancelled Warning (auto-hides 10s) ──────────── */}
      {backWarning && (
        <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 text-orange-800 rounded-2xl px-5 py-4 text-sm">
          <XCircle size={18} className="mt-0.5 flex-shrink-0 text-orange-500" />
          <div className="flex-1">
            <p className="font-semibold mb-0.5">Payment Not Completed</p>
          </div>
          <button onClick={hideWarning} className="text-orange-400 hover:text-orange-600 flex-shrink-0 mt-0.5">
            <XCircle size={16} />
          </button>
        </div>
      )}

      {/* ── Error ───────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" /> {error}
        </div>
      )}

      {/* ── Loading ─────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-32 text-gray-400 gap-3">
          <Loader2 size={22} className="animate-spin text-indigo-400" />
          <span className="text-sm">Loading your courses…</span>
        </div>

      ) : courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <BookOpen size={48} className="mx-auto text-indigo-200 mb-4" />
          <h2 className="text-lg font-bold text-gray-800">No courses found</h2>
          <p className="text-sm text-gray-500 mt-2">
            Contact your manager to get assigned to a course.
          </p>
        </div>

      ) : (
        /* ── Course Grid ──────────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {courses.map((course) => (
            <CourseCard
              key={course.course_id}
              course={course}
              paying={payingCourse === course.course_id}
              onPay={handlePayNow}
            />
          ))}
        </div>
      )}

      {/* ── Trust Badge ─────────────────────────────────── */}
      <div className="flex items-center justify-center gap-2 pt-2 pb-4 text-xs text-gray-400">
        <ShieldCheck size={14} className="text-green-500" />
        Payments secured by{" "}
        <span className="font-semibold text-gray-500">PayHere</span>
        {" "}— Sri Lanka's trusted payment gateway
        <Lock size={12} className="text-gray-300 ml-1" />
      </div>

    </div>
  );
}

// ── Course Card ───────────────────────────────────────────────────────────────
function CourseCard({ course, paying, onPay }) {
  const fee      = parseFloat(course.fee || 0);
  const enrolled = course.is_enrolled;

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md hover:-translate-y-0.5 ${
      enrolled ? "border-emerald-200" : "border-gray-100"
    }`}>

      {/* ── Thumbnail ─────────────────────────────────── */}
      <div className="relative h-40 bg-gradient-to-br from-indigo-500 to-blue-600 overflow-hidden">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Play size={36} className="text-white opacity-30" />
          </div>
        )}

        {/* Enrolled badge */}
        {enrolled && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            <CheckCircle size={11} /> Enrolled
          </div>
        )}

        {/* Category */}
        {course.category && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
            <Tag size={10} /> {course.category}
          </div>
        )}
      </div>

      {/* ── Body ──────────────────────────────────────── */}
      <div className="p-5 flex flex-col flex-1">

        {/* Title */}
        <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 mb-1">
          {course.title}
        </h3>

        {/* Description */}
        {course.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3 leading-relaxed">
            {course.description}
          </p>
        )}

        {/* Duration */}
        {course.duration && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
            <Clock size={12} />
            <span>{course.duration}</span>
          </div>
        )}

        {/* ── Fee + Action ──────────────────────────── */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          {/* Fee row */}
          <div className="flex items-baseline justify-between mb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-gray-400 font-medium">Rs.</span>
              <span className="text-3xl font-black text-gray-900 tracking-tight">
                {fee.toLocaleString()}
              </span>
            </div>
            <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1">
              per month
            </span>
          </div>

          {/* Button */}
          {enrolled ? (
            <div className="w-full flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 text-sm font-semibold py-3 rounded-xl border border-emerald-200">
              <CheckCircle size={15} />
              Access Granted
            </div>
          ) : fee === 0 ? (
            <div className="w-full text-center text-sm text-gray-400 py-3 border border-dashed border-gray-200 rounded-xl">
              Free Course
            </div>
          ) : (
            <button
              onClick={() => onPay(course)}
              disabled={paying}
              className="w-full flex items-center justify-center gap-2 bg-blue-800 hover:bg-blue-900 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold py-3 rounded-xl transition-all duration-150 shadow-sm shadow-blue-200"
            >
              {paying ? (
                <><Loader2 size={15} className="animate-spin" /> Redirecting…</>
              ) : (
                <><Wifi size={15} /> Pay </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}