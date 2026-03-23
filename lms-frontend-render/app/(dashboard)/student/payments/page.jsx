"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen, CreditCard, CheckCircle, Loader2, AlertCircle,
  RefreshCw, Wifi, Clock, Tag, ShieldCheck, Lock, Play,
  DollarSign, BadgeAlert, XCircle,
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

  // Track if we left for PayHere
  const leftForPayHere = useRef(false);

  useEffect(() => {
    const auth = guardRoute("STUDENT", router);
    if (auth) {
      setUser(auth);
      fetchCourses(auth.user_id);
    }
  }, [router]);

  // ── Detect browser back button from PayHere ──────────────────────────────
  useEffect(() => {
    const handlePageShow = (e) => {
      // persisted = true means page was restored from bfcache (back button)
      if (e.persisted && leftForPayHere.current) {
        leftForPayHere.current = false;
        setPayingCourse(null);
        setBackWarning(true);
        // Refresh courses in case something changed
        if (user) fetchCourses(user.user_id);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && leftForPayHere.current) {
        leftForPayHere.current = false;
        setPayingCourse(null);
        setBackWarning(true);
        if (user) fetchCourses(user.user_id);
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user]);

  const fetchCourses = useCallback(async (studentId) => {
    setLoading(true);
    setError("");
    try {
      const res  = await authFetch(`${API}/payments/courses/${studentId}`);
      const data = await res.json();
      if (data.success) {
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
    setBackWarning(false);
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
        cancel_url:  `${FRONTEND_URL}/student/cancel?order_id=${encodeURIComponent(order_id)}`,
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

      // Mark that we are leaving for PayHere before submitting
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

  const totalDue = courses.reduce((sum, c) => sum + parseFloat(c.fee || 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="text-indigo-600" size={26} />
            Course Payments
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Pay your monthly course fee to maintain access. Enrollments reset on the 8th of every month.
          </p>
        </div>
        <button
          onClick={() => user && fetchCourses(user.user_id)}
          disabled={loading}
          className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ── Browser Back Warning ─────────────────────────── */}
      {backWarning && (
        <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 text-orange-800 rounded-xl px-4 py-4 text-sm">
          <XCircle size={18} className="mt-0.5 flex-shrink-0 text-orange-500" />
          <div className="flex-1">
            <p className="font-semibold mb-0.5">Payment Not Completed</p>
            <p>
              You navigated back from the payment gateway. No money has been charged.
              You can try paying again below.
            </p>
          </div>
          <button
            onClick={() => setBackWarning(false)}
            className="text-orange-400 hover:text-orange-600 flex-shrink-0 mt-0.5"
          >
            <XCircle size={16} />
          </button>
        </div>
      )}

      {/* ── Monthly Notice ───────────────────────────────── */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm">
        <Clock size={16} className="mt-0.5 flex-shrink-0 text-amber-600" />
        <span>
          <strong>Monthly Subscription:</strong> All enrollments are automatically removed on the{" "}
          <strong>8th of each month</strong>. Pay before the 8th to maintain uninterrupted access.
        </span>
      </div>

      {/* ── Error Alert ─────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" /> {error}
        </div>
      )}

      {/* ── Stats Row ───────────────────────────────────── */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl flex-shrink-0">
              <BookOpen size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-400">Courses to Pay</p>
              <p className="text-2xl font-bold text-gray-800 mt-0.5">{courses.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="bg-green-50 text-green-600 p-2.5 rounded-xl flex-shrink-0">
              <DollarSign size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-400">Total Due This Month</p>
              <p className="text-2xl font-bold text-gray-800 mt-0.5">
                Rs. {totalDue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content ─────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
          <Loader2 size={22} className="animate-spin" /> Loading courses…
        </div>

      ) : courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
          <h2 className="text-lg font-bold text-gray-800">All Payments Up to Date!</h2>
          <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
            You have no pending course payments this month. Check back after the 8th if enrollments reset.
          </p>
        </div>

      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BadgeAlert size={17} className="text-indigo-500" />
            <h2 className="text-base font-semibold text-gray-800">Courses Awaiting Payment</h2>
            <span className="ml-auto text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium px-2.5 py-0.5 rounded-full">
              {courses.length} Pending
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {courses.map((course) => (
              <CourseCard
                key={course.course_id}
                course={course}
                paying={payingCourse === course.course_id}
                onPay={handlePayNow}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── PayHere Trust Badge ──────────────────────────── */}
      <div className="flex items-center justify-center gap-2 mt-6 text-xs text-gray-400">
        <ShieldCheck size={14} className="text-green-500" />
        Payments secured by{" "}
        <span className="font-semibold text-gray-500">PayHere</span> — Sri Lanka's trusted payment gateway
        <Lock size={12} className="text-gray-300 ml-1" />
      </div>
    </div>
  );
}

// ── Course Card ───────────────────────────────────────────────────────────────
function CourseCard({ course, paying, onPay }) {
  const fee = parseFloat(course.fee || 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">

      {/* Thumbnail */}
      <div className="relative h-36 bg-gradient-to-br from-indigo-500 to-blue-600 overflow-hidden">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Play size={34} className="text-white opacity-40" />
          </div>
        )}
        {course.category && (
          <div className="absolute bottom-2 left-2 bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
            <Tag size={10} /> {course.category}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 mb-1">
          {course.title}
        </h3>

        {course.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-2">{course.description}</p>
        )}

        {course.duration && (
          <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
            <Clock size={11} /> {course.duration}
          </p>
        )}

        <div className="mt-auto">
          <div className="flex items-end justify-between mb-3">
            <span className="text-2xl font-extrabold text-gray-800">
              Rs.&nbsp;{fee.toLocaleString()}
            </span>
            <span className="text-xs text-gray-400">/ month</span>
          </div>

          {fee === 0 ? (
            <div className="w-full text-center text-sm text-gray-400 py-2.5 border border-dashed border-gray-200 rounded-xl">
              Free Course
            </div>
          ) : (
            <button
              onClick={() => onPay(course)}
              disabled={paying}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold py-2.5 rounded-xl transition-all"
            >
              {paying ? (
                <><Loader2 size={15} className="animate-spin" /> Redirecting…</>
              ) : (
                <><Wifi size={15} /> Pay with PayHere</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}