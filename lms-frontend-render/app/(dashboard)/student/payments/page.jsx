"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard, Loader2, AlertCircle, RefreshCw,
  Wifi, Clock, Tag, ShieldCheck, Lock, Play,
  XCircle, BookOpen, User, GraduationCap, FileText,
} from "lucide-react";
import { guardRoute, authFetch } from "@/lib/auth";

const API                  = process.env.NEXT_PUBLIC_API_URL;
const PAYHERE_CHECKOUT_URL = process.env.NEXT_PUBLIC_PAYHERE_URL;
const CURRENCY             = "LKR";
const FRONTEND_URL         = process.env.NEXT_PUBLIC_FRONTEND_URL;

export default function StudentPaymentsPage() {
  const router = useRouter();

  const [user,         setUser]         = useState(null);
  const [grouped,      setGrouped]      = useState([]);
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
      fetchAll(auth.user_id);
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
        if (user) fetchAll(user.user_id);
      }
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && leftForPayHere.current) {
        leftForPayHere.current = false;
        setPayingCourse(null);
        showWarning();
        if (user) fetchAll(user.user_id);
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [user]);

  // ── Fetch all 3 sources in parallel ──────────────────────────────────────
  const fetchAll = useCallback(async (studentId) => {
    setLoading(true);
    setError("");
    try {
      const [payRes, courseRes, teacherRes] = await Promise.all([
        authFetch(`${API}/payments/courses/${studentId}`),
        authFetch(`${API}/courses`),
        fetch(`${API}/public/teachers`),          // public — no auth needed
      ]);

      const payData     = await payRes.json();
      const courseData  = await courseRes.json();
      const teacherData = await teacherRes.json();

      if (!payData.success) {
        setError(payData.error || "Failed to load courses.");
        setGrouped([]);
        return;
      }

      // teacher_id → full teacher info (name, specialization, description, photo)
      const teacherInfoMap = {};
      if (Array.isArray(teacherData)) {
        teacherData.forEach((t) => {
          teacherInfoMap[t.user_id] = {
            teacher_name:        t.name            || "No Teacher Assigned",
            specialization:      t.specialization  || null,
            description:         t.description     || null,   // qualifications
            profile_picture_url: t.profile_picture_url || null,
          };
        });
      }

      // course_id → teacher_id from /courses
      const courseTeacherMap = {};
      if (Array.isArray(courseData)) {
        courseData.forEach((c) => {
          courseTeacherMap[c.course_id] = c.teacher_id || null;
        });
      }

      // Only unenrolled courses — merge teacher info
      const unpaid = payData.courses
        .filter((c) => !c.is_enrolled)
        .map((c) => {
          const tid  = courseTeacherMap[c.course_id] || null;
          const info = tid ? (teacherInfoMap[tid] || null) : null;
          return {
            ...c,
            teacher_id:          tid,
            teacher_name:        info?.teacher_name        || "No Teacher Assigned",
            specialization:      info?.specialization      || null,
            description:         info?.description         || null,
            profile_picture_url: info?.profile_picture_url || null,
          };
        });

      // Group by teacher
      const groupMap = {};
      unpaid.forEach((c) => {
        const key = c.teacher_id || "unassigned";
        if (!groupMap[key]) {
          groupMap[key] = {
            teacher_id:          c.teacher_id,
            teacher_name:        c.teacher_name,
            specialization:      c.specialization,
            description:         c.description,
            profile_picture_url: c.profile_picture_url,
            courses:             [],
          };
        }
        groupMap[key].courses.push(c);
      });

      // Assigned teachers first, then unassigned
      const groups = Object.values(groupMap).sort((a, b) => {
        if (!a.teacher_id) return 1;
        if (!b.teacher_id) return -1;
        return a.teacher_name.localeCompare(b.teacher_name);
      });

      setGrouped(groups);
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

  const totalCourses = grouped.reduce((s, g) => s + g.courses.length, 0);

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
            Browse our courses, choose one and pay your monthly fee.
          </p>
        </div>
        <button
          onClick={() => user && fetchAll(user.user_id)}
          disabled={loading}
          className="inline-flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 self-start sm:self-auto shadow-sm"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ── Cancelled Warning ────────────────────────────── */}
      {backWarning && (
        <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 text-orange-800 rounded-2xl px-5 py-4 text-sm">
          <XCircle size={18} className="mt-0.5 flex-shrink-0 text-orange-500" />
          <div className="flex-1">
            <p className="font-semibold mb-0.5">Payment Not Completed</p>
            <p className="text-orange-700">You left the payment gateway. No money has been charged — you can try again below.</p>
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
          <Loader2 size={22} className="animate-spin text-blue-500" />
          <span className="text-sm">Loading courses…</span>
        </div>

      ) : totalCourses === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <BookOpen size={48} className="mx-auto text-blue-200 mb-4" />
          <h2 className="text-lg font-bold text-gray-800">All payments up to date!</h2>
          <p className="text-sm text-gray-500 mt-2">You have no pending course payments this month.</p>
        </div>

      ) : (
        <div className="space-y-10">
          {grouped.map((group) => (
            <section key={group.teacher_id || "unassigned"}>

              {/* ── Teacher Profile Card ─────────────────── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5 flex flex-col sm:flex-row gap-4">

                {/* Avatar */}
                <div className="flex-shrink-0">
                  {group.profile_picture_url ? (
                    <img
                      src={group.profile_picture_url}
                      alt={group.teacher_name}
                      className="w-16 h-16 rounded-2xl object-cover border border-gray-100"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                      <User size={28} className="text-blue-400" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h2 className="text-base font-bold text-gray-900">
                        {group.teacher_name}
                      </h2>
                      {group.specialization && (
                        <div className="flex items-center gap-1.5 text-xs text-blue-700 font-medium mt-0.5">
                          <GraduationCap size={12} />
                          {group.specialization}
                        </div>
                      )}
                    </div>
                    <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 font-medium px-2.5 py-1 rounded-full flex-shrink-0">
                      {group.courses.length} {group.courses.length === 1 ? "course" : "courses"}
                    </span>
                  </div>

                  {/* Qualifications / description */}
                  {group.description && (
                    <div className="mt-2.5 flex items-start gap-1.5">
                      <FileText size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {group.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Courses Grid ─────────────────────────── */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {group.courses.map((course) => (
                  <CourseCard
                    key={course.course_id}
                    course={course}
                    paying={payingCourse === course.course_id}
                    onPay={handlePayNow}
                  />
                ))}
              </div>
            </section>
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
  const fee = parseFloat(course.fee || 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md hover:-translate-y-0.5">

      {/* Thumbnail */}
      <div className="relative h-40 bg-gradient-to-br from-blue-700 to-blue-500 overflow-hidden">
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
        {course.category && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
            <Tag size={10} /> {course.category}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 mb-1">
          {course.title}
        </h3>
        {course.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3 leading-relaxed">
            {course.description}
          </p>
        )}
        {course.duration && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
            <Clock size={12} />
            <span>{course.duration}</span>
          </div>
        )}

        {/* Fee + Button */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-baseline justify-between mb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-sm text-gray-400 font-medium">Rs.</span>
              <span className="text-3xl font-black text-gray-900 tracking-tight">
                {fee.toLocaleString()}
              </span>
            </div>
            <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1">
              per month
            </span>
          </div>

          {fee === 0 ? (
            <div className="w-full text-center text-sm text-gray-400 py-3 border border-dashed border-gray-200 rounded-xl">
              Free Course
            </div>
          ) : (
            <button
              onClick={() => onPay(course)}
              disabled={paying}
              className="w-full flex items-center justify-center gap-2 bg-blue-800 hover:bg-blue-900 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold py-3 rounded-xl transition-all duration-150 shadow-sm"
            >
              {paying ? (
                <><Loader2 size={15} className="animate-spin" /> Redirecting…</>
              ) : (
                <><Wifi size={15} /> Pay</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}