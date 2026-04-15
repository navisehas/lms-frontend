"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle, BookOpen, CheckCircle,
  Loader, RefreshCw, BadgeCheck, ChevronRight,
  Sparkles, XCircle,
} from "lucide-react";
import { authFetch, guardRoute } from "@/lib/auth";

const API                  = process.env.NEXT_PUBLIC_API_URL;
const PAYHERE_CHECKOUT_URL = process.env.NEXT_PUBLIC_PAYHERE_URL;
const CURRENCY             = "LKR";
const FRONTEND_URL         = process.env.NEXT_PUBLIC_FRONTEND_URL;

export default function StudentCoursesPage() {
  const router = useRouter();
  const [user, setUser]               = useState(null);
  const [courses, setCourses]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [payFailed, setPayFailed]     = useState(false);
  const [payingCourse, setPayingCourse] = useState(null);

  const userRef        = useRef(null);
  const leftForPayHere = useRef(false);
  const warningTimer   = useRef(null);

  // Auth + initial load
  useEffect(() => {
    const auth = guardRoute("STUDENT", router);
    if (auth) {
      setUser(auth);
      userRef.current = auth;
      fetchCourses(auth.user_id);
    }
    return () => clearTimeout(warningTimer.current);
  }, [router]);

  // Back-from-PayHere & cancelled param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("cancelled") === "1") {
      showPayFailed();
      window.history.replaceState({}, "", "/student/courses");
    }

    const handlePageShow = (e) => {
      if (e.persisted && leftForPayHere.current) {
        leftForPayHere.current = false;
        setPayingCourse(null);
        showPayFailed();
        if (userRef.current) fetchCourses(userRef.current.user_id);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible" && leftForPayHere.current) {
        leftForPayHere.current = false;
        setPayingCourse(null);
        showPayFailed();
        if (userRef.current) fetchCourses(userRef.current.user_id);
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  function showPayFailed() {
    setPayFailed(true);
    clearTimeout(warningTimer.current);
    warningTimer.current = setTimeout(() => setPayFailed(false), 10000);
  }

  async function fetchCourses(studentId) {
    setLoading(true);
    setError("");
    try {
      const payRes  = await authFetch(`${API}/payments/courses/${studentId}`);
      const payData = await payRes.json();

      if (!payData.success) {
        setError(payData.error || "Failed to load your courses.");
        setCourses([]);
        return;
      }

      // Only enrolled courses
      const enrolledCourses = (payData.courses || []).filter((c) => c.is_enrolled === true);
      setCourses(enrolledCourses);
    } catch {
      setError("Network error. Please try again.");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }

  async function handlePayNow(course) {
    if (payingCourse) return;
    const currentUser = userRef.current;
    if (!currentUser) return;

    setPayingCourse(course.course_id);
    setPayFailed(false);
    setError("");

    try {
      const now       = new Date();
      const pad       = (n) => String(n).padStart(2, "0");
      const billMonth = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
      const order_id  = `${course.course_id}::${currentUser.user_id}::${billMonth}`;
      const amount    = parseFloat(course.fee).toFixed(2);

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

      const form  = document.createElement("form");
      form.method = "POST";
      form.action = PAYHERE_CHECKOUT_URL;

      const fields = {
        merchant_id: hashData.merchant_id,
        return_url:  `${FRONTEND_URL}/student/success?order_id=${encodeURIComponent(order_id)}`,
        cancel_url:  `${FRONTEND_URL}/student/courses?cancelled=1`,
        notify_url:  `${API}/payments/online/notify`,
        order_id,
        items:       course.title,
        currency:    CURRENCY,
        amount,
        first_name:  currentUser.name?.split(" ")[0] || "Student",
        last_name:   currentUser.name?.split(" ").slice(1).join(" ") || "",
        email:       currentUser.email || `${currentUser.user_id}@lms.lk`,
        phone:       currentUser.phone_no || "0000000000",
        address:     currentUser.address || "Sri Lanka",
        city:        "Colombo",
        country:     "Sri Lanka",
        hash:        hashData.hash,
      };

      Object.entries(fields).forEach(([k, v]) => {
        const input = document.createElement("input");
        input.type  = "hidden";
        input.name  = k;
        input.value = String(v ?? "");
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

  const enrolledCourses = courses;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <BookOpen size={24} style={{ color: "#1E40AF" }} className="flex-shrink-0 mt-1" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">My Courses</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {user ? `Welcome back, ${user.name || "Student"}` : "Your learning dashboard"}
            </p>
          </div>
        </div>
        <button
          onClick={() => user && fetchCourses(user.user_id)}
          className="inline-flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-200 px-4 py-2.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm font-medium self-start sm:self-auto"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Payment not completed warning */}
      {payFailed && (
        <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 text-orange-800 rounded-2xl px-5 py-4 text-sm">
          <XCircle size={18} className="mt-0.5 flex-shrink-0 text-orange-500" />
          <div className="flex-1">
            <p className="font-semibold mb-0.5">Payment Not Completed</p>
            <p className="text-orange-700">You returned without completing payment. Please try again.</p>
          </div>
          <button onClick={() => setPayFailed(false)} className="text-orange-400 hover:text-orange-600 flex-shrink-0 mt-0.5">
            <XCircle size={16} />
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3.5 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3 text-gray-400">
          <Loader size={28} className="animate-spin" style={{ color: "#1E40AF" }} />
          <span className="text-sm font-medium">Loading your courses…</span>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: "#EFF6FF" }}>
            <BookOpen size={36} style={{ color: "#93C5FD" }} />
          </div>
          <h2 className="text-lg font-bold text-gray-800">No courses yet</h2>
          <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto">
            Once you enroll in a course, it will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-10">

          <div className="grid gap-4 sm:grid-cols-2">
            {enrolledCourses.map((course) => (
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
    </div>
  );
}

function CourseCard({ course }) {
  return (
    <div className="group relative bg-white rounded-2xl border border-green-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:border-green-300">
      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-green-400 to-emerald-500" />

      <div className="p-5">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-gray-900 leading-snug group-hover:text-blue-800 transition-colors">
              {course.title}
            </h2>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 text-xs font-bold flex-shrink-0">
            <BadgeCheck size={11} /> Active
          </span>
        </div>

        {/* Description */}
        {course.description && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
            {course.description}
          </p>
        )}

        {/* CTA */}
        <Link
          href={`/student/courses/${course.course_id}`}
          className="flex items-center justify-center gap-2 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: "#1E40AF" }}
        >
          <Sparkles size={14} /> View Materials
          <ChevronRight size={14} className="ml-auto" />
        </Link>
      </div>
    </div>
  );
}
