"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen, CreditCard, CheckCircle, Loader2, AlertCircle,
  RefreshCw, Wifi, Clock, Tag, ShieldCheck, ExternalLink,
  Lock, Star, Play
} from "lucide-react";
import { guardRoute, authFetch, getToken } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ── PayHere sandbox config ────────────────────────────────────────────────────
const PAYHERE_CHECKOUT_URL = "https://sandbox.payhere.lk/pay/checkout";
const CURRENCY             = "LKR";
const FRONTEND_URL         = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://lms-frontend-ger6.onrender.com";

export default function StudentCoursesPayPage() {
  const router = useRouter();

  const [user, setUser]       = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [payingCourse, setPayingCourse] = useState(null); // course_id being paid

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const auth = guardRoute("STUDENT", router);
    if (auth) {
      setUser(auth);
      fetchCourses(auth.user_id);
    }
  }, [router]);

  const fetchCourses = useCallback(async (studentId) => {
    setLoading(true);
    setError("");
    try {
      const res  = await authFetch(`${API}/payments/courses/${studentId}`);
      const data = await res.json();
      if (data.success) setCourses(data.courses);
      else setError(data.error || "Failed to load courses.");
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Initiate PayHere online payment ───────────────────────────────────────
  async function handlePayNow(course) {
    if (payingCourse) return;
    setPayingCourse(course.course_id);
    setError("");

    try {
      // order_id = course_id::student_id  (parsed on backend notify)
      const order_id = `${course.course_id}::${user.user_id}`;
      const amount   = parseFloat(course.fee).toFixed(2);

      // Get hash from backend
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

      // Build & auto-submit PayHere form
      const form = document.createElement("form");
      form.method = "POST";
      form.action = PAYHERE_CHECKOUT_URL;

      const fields = {
        merchant_id:   hashData.merchant_id,
        return_url:    `${FRONTEND_URL}/student/payments/success?order_id=${encodeURIComponent(order_id)}`,
        cancel_url:    `${FRONTEND_URL}/student/payments/cancel?order_id=${encodeURIComponent(order_id)}`,
        notify_url:    `${API}/payments/online/notify`,
        order_id:      order_id,
        items:         course.title,
        currency:      CURRENCY,
        amount:        amount,
        first_name:    user.name?.split(" ")[0] || "Student",
        last_name:     user.name?.split(" ").slice(1).join(" ") || "",
        email:         user.email || `${user.user_id}@lms.lk`,
        phone:         user.phone_no || "0000000000",
        address:       user.address || "Sri Lanka",
        city:          "Colombo",
        country:       "Sri Lanka",
        hash:          hashData.hash,
        platform:      "web",
      };

      Object.entries(fields).forEach(([k, v]) => {
        const input  = document.createElement("input");
        input.type   = "hidden";
        input.name   = k;
        input.value  = v;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      // Page navigates away — no need to reset payingCourse
    } catch (err) {
      console.error("Pay error:", err);
      setError("Payment initiation failed. Please try again.");
      setPayingCourse(null);
    }
  }

  // ── UI helpers ────────────────────────────────────────────────────────────
  const enrolled  = courses.filter(c => c.is_enrolled);
  const available = courses.filter(c => !c.is_enrolled);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="text-blue-600" size={26} /> My Courses
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Pay your monthly course fee to stay enrolled. Enrollments reset on the 8th of every month.
          </p>
        </div>
        <button
          onClick={() => user && fetchCourses(user.user_id)}
          className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 self-start sm:self-auto"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Monthly notice */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 mb-6 text-sm">
        <Clock size={16} className="mt-0.5 flex-shrink-0 text-amber-600" />
        <span>
          <strong>Monthly Subscription:</strong> All enrollments are automatically removed on the{" "}
          <strong>8th of each month</strong>. Pay before the 8th to maintain access.
        </span>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
          <AlertCircle size={16} />{error}
        </div>
      )}

      {/* Stats row */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total Courses",    val: courses.length,   color: "text-blue-600",   bg: "bg-blue-50" },
            { label: "Currently Enrolled", val: enrolled.length, color: "text-green-600", bg: "bg-green-50" },
            { label: "Available to Pay",  val: available.length, color: "text-orange-600", bg: "bg-orange-50" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color} mt-0.5`}>{s.val}</p>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
          <Loader2 size={22} className="animate-spin" /> Loading courses…
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100 text-gray-400">
          <BookOpen size={48} className="mx-auto mb-3 opacity-20" />
          <p className="font-medium">No courses available.</p>
        </div>
      ) : (
        <>
          {/* Currently enrolled */}
          {enrolled.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <CheckCircle size={18} className="text-green-500" /> Currently Enrolled
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {enrolled.map(course => (
                  <CourseCard
                    key={course.course_id}
                    course={course}
                    enrolled={true}
                    paying={payingCourse === course.course_id}
                    onPay={handlePayNow}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Available to pay / enroll */}
          {available.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <CreditCard size={18} className="text-blue-500" /> Available Courses
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {available.map(course => (
                  <CourseCard
                    key={course.course_id}
                    course={course}
                    enrolled={false}
                    paying={payingCourse === course.course_id}
                    onPay={handlePayNow}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* PayHere trust badge */}
      <div className="flex items-center justify-center gap-2 mt-10 text-xs text-gray-400">
        <ShieldCheck size={14} className="text-green-500" />
        Payments secured by <span className="font-semibold text-gray-500">PayHere</span> — Sri Lanka's trusted payment gateway
        <Lock size={12} className="text-gray-300 ml-1" />
      </div>
    </div>
  );
}

// ── Course Card ───────────────────────────────────────────────────────────────
function CourseCard({ course, enrolled, paying, onPay }) {
  const fee = parseFloat(course.fee || 0);

  return (
    <div className={`bg-white rounded-2xl border ${enrolled ? "border-green-200" : "border-gray-100"} shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md`}>
      {/* Thumbnail */}
      <div className="relative h-36 bg-gradient-to-br from-blue-500 to-indigo-600 overflow-hidden">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Play size={36} className="text-white opacity-50" />
          </div>
        )}
        {enrolled && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <CheckCircle size={11} /> Enrolled
          </div>
        )}
        {course.category && (
          <div className="absolute bottom-2 left-2 bg-black/40 backdrop-blur text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
            <Tag size={10} />{course.category}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-800 text-sm leading-tight mb-1 line-clamp-2">{course.title}</h3>
        {course.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{course.description}</p>
        )}
        {course.duration && (
          <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
            <Clock size={11} />{course.duration}
          </p>
        )}

        <div className="mt-auto">
          {/* Fee */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl font-extrabold text-gray-800">
              Rs.&nbsp;{fee.toLocaleString()}
            </span>
            <span className="text-xs text-gray-400">/ month</span>
          </div>

          {enrolled ? (
            <div className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-700 text-sm font-semibold py-2.5 rounded-xl border border-green-200">
              <CheckCircle size={15} /> Access Granted
            </div>
          ) : fee === 0 ? (
            <div className="w-full text-center text-sm text-gray-400 py-2">Free Course</div>
          ) : (
            <button
              onClick={() => onPay(course)}
              disabled={paying}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white text-sm font-bold py-2.5 rounded-xl transition-all active:scale-95"
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
