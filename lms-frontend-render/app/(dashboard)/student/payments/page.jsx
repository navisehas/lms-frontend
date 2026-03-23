"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen, CreditCard, CheckCircle, Loader2, AlertCircle,
  RefreshCw, Wifi, Clock, Tag, ShieldCheck, ExternalLink,
  Lock, Star, Play, ChevronRight, BadgeCheck, Zap
} from "lucide-react";
import { guardRoute, authFetch, getToken } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;
const PAYHERE_CHECKOUT_URL = process.env.NEXT_PUBLIC_PAYHERE_URL;
const CURRENCY = "LKR";
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;

export default function StudentCoursesPayPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingCourse, setPayingCourse] = useState(null);

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
      const res = await authFetch(`${API}/payments/courses/${studentId}`);
      const data = await res.json();
      if (data.success) setCourses(data.courses);
      else setError(data.error || "Failed to load courses.");
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  async function handlePayNow(course) {
    if (payingCourse) return;
    setPayingCourse(course.course_id);
    setError("");

    try {
      const order_id = `${course.course_id}::${user.user_id}`;
      const amount = parseFloat(course.fee).toFixed(2);

      const hashRes = await authFetch(`${API}/payments/online/hash`, {
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
        return_url: `${FRONTEND_URL}/student/payments/success?order_id=${encodeURIComponent(order_id)}`,
        cancel_url: `${FRONTEND_URL}/student/payments/cancel?order_id=${encodeURIComponent(order_id)}`,
        notify_url: `${API}/payments/online/notify`,
        order_id,
        items: course.title,
        currency: CURRENCY,
        amount,
        first_name: user.name?.split(" ")[0] || "Student",
        last_name: user.name?.split(" ").slice(1).join(" ") || "",
        email: user.email || `${user.user_id}@lms.lk`,
        phone: user.phone_no || "0000000000",
        address: user.address || "Sri Lanka",
        city: "Colombo",
        country: "Sri Lanka",
        hash: hashData.hash,
        platform: "web",
      };

      Object.entries(fields).forEach(([k, v]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = k;
        input.value = v;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      console.error("Pay error:", err);
      setError("Payment initiation failed. Please try again.");
      setPayingCourse(null);
    }
  }

  const enrolled = courses.filter((c) => c.is_enrolled);
  const available = courses.filter((c) => !c.is_enrolled);

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="text-blue-600" size={24} />
            Course Payments
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your monthly course subscriptions and enroll in new courses.
          </p>
        </div>
        <button
          onClick={() => user && fetchCourses(user.user_id)}
          disabled={loading}
          className="inline-flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors shadow-sm self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ── Monthly Notice Banner ── */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-start gap-3">
        <Clock size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-amber-800">
          <span className="font-semibold">Monthly Subscription:</span> All enrollments are automatically
          reset on the <span className="font-semibold">8th of each month</span>. Pay before the 8th to
          maintain uninterrupted access to your courses.
        </div>
      </div>

      {/* ── Error Alert ── */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* ── Stats Row (Total & Available only) ── */}
      {!loading && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Total Courses</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{courses.length}</p>
            <p className="text-xs text-gray-400 mt-1">In your learning plan</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Available to Pay</p>
            <p className="text-3xl font-bold text-orange-500 mt-1">{available.length}</p>
            <p className="text-xs text-gray-400 mt-1">Pending payment this month</p>
          </div>
        </div>
      )}

      {/* ── Loading State ── */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center py-24 text-gray-400 gap-3">
          <Loader2 size={22} className="animate-spin text-blue-500" />
          <span className="text-sm">Loading your courses…</span>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm text-center py-20 text-gray-400">
          <BookOpen size={44} className="mx-auto mb-3 opacity-20" />
          <p className="font-medium text-gray-500">No courses available.</p>
          <p className="text-sm mt-1">Contact your manager to get enrolled in a course.</p>
        </div>
      ) : (
        <div className="space-y-8">

          {/* ── Currently Enrolled Section ── */}
          {enrolled.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <BadgeCheck size={18} className="text-green-500" />
                <h2 className="text-base font-semibold text-gray-800">Currently Enrolled</h2>
                <span className="ml-auto text-xs bg-green-50 text-green-700 border border-green-200 font-medium px-2.5 py-0.5 rounded-full">
                  {enrolled.length} Active
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {enrolled.map((course) => (
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

          {/* ── Available to Pay Section ── */}
          {available.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Zap size={18} className="text-blue-500" />
                <h2 className="text-base font-semibold text-gray-800">Available Courses</h2>
                <span className="ml-auto text-xs bg-blue-50 text-blue-700 border border-blue-200 font-medium px-2.5 py-0.5 rounded-full">
                  {available.length} Unpaid
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {available.map((course) => (
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
        </div>
      )}

      {/* ── PayHere Trust Badge ── */}
      <div className="flex items-center justify-center gap-2 py-4 text-xs text-gray-400">
        <ShieldCheck size={14} className="text-green-500" />
        Payments secured by{" "}
        <span className="font-semibold text-gray-500">PayHere</span> — Sri Lanka's trusted payment gateway
        <Lock size={12} className="text-gray-300 ml-1" />
      </div>
    </div>
  );
}

// ── Course Card Component ─────────────────────────────────────────────────────
function CourseCard({ course, enrolled, paying, onPay }) {
  const fee = parseFloat(course.fee || 0);

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md ${
        enrolled ? "border-green-200" : "border-gray-200"
      }`}
    >
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
            <Play size={34} className="text-white opacity-40" />
          </div>
        )}

        {/* Enrolled badge */}
        {enrolled && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
            <CheckCircle size={11} /> Enrolled
          </div>
        )}

        {/* Category badge */}
        {course.category && (
          <div className="absolute bottom-2 left-2 bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
            <Tag size={10} /> {course.category}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">
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
          {/* Fee display */}
          <div className="flex items-end justify-between mb-3">
            <div>
              <span className="text-2xl font-extrabold text-gray-900">
                Rs.&nbsp;{fee.toLocaleString()}
              </span>
              <span className="text-xs text-gray-400 ml-1">/ month</span>
            </div>
          </div>

          {/* Action button */}
          {enrolled ? (
            <div className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-700 text-sm font-semibold py-2.5 rounded-xl border border-green-200">
              <CheckCircle size={15} /> Access Granted
            </div>
          ) : fee === 0 ? (
            <div className="w-full text-center text-sm text-gray-400 py-2.5 border border-dashed border-gray-200 rounded-xl">
              Free Course
            </div>
          ) : (
            <button
              onClick={() => onPay(course)}
              disabled={paying}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold py-2.5 rounded-xl transition-all"
            >
              {paying ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Redirecting…
                </>
              ) : (
                <>
                  <Wifi size={15} /> Pay with PayHere
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}