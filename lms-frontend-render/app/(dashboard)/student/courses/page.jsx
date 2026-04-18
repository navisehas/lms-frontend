"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle, BookOpen, CheckCircle, Lock,
  Loader, RefreshCw, BadgeCheck, ChevronRight,
  GraduationCap, Sparkles, LayoutGrid, Calendar,
  Wifi, Loader2, User, ImageIcon,
} from "lucide-react";
import { authFetch, guardRoute } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;
const PAYHERE_CHECKOUT_URL = process.env.NEXT_PUBLIC_PAYHERE_URL;
const CURRENCY             = "LKR";
const FRONTEND_URL         = process.env.NEXT_PUBLIC_FRONTEND_URL;

export default function StudentCoursesPage() {
  const router = useRouter();
  const [user,        setUser]        = useState(null);
  const [courses,     setCourses]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [payingCourse, setPayingCourse] = useState(null);
  const [teachers,    setTeachers]    = useState({});
  
  // Track if we left for PayHere
  const leftForPayHere = useRef(false);

  useEffect(() => {
    const auth = guardRoute("STUDENT", router);
    if (auth) { 
      setUser(auth); 
      fetchTeachers();
      fetchCourses(auth.user_id); 
    }
  }, [router]);

  // Handle browser back from PayHere
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && leftForPayHere.current) {
        setPayingCourse(null);
        leftForPayHere.current = false;
        if (user) {
          fetchCourses(user.user_id);
        }
      }
    };

    const handlePageShow = (event) => {
      if (event.persisted && leftForPayHere.current) {
        setPayingCourse(null);
        leftForPayHere.current = false;
        if (user) {
          fetchCourses(user.user_id);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handlePageShow);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [user]);

  // Fetch teachers information
  async function fetchTeachers() {
    try {
      const res = await fetch(`${API}/public/teachers`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const teacherMap = {};
        data.forEach(teacher => {
          teacherMap[teacher.user_id] = {
            name: teacher.name,
            specialization: teacher.specialization,
          };
        });
        setTeachers(teacherMap);
      }
    } catch (err) {
      console.error("Failed to fetch teachers:", err);
    }
  }

  async function fetchCourses(studentId) {
    setLoading(true);
    setError("");
    try {
      const enrollRes  = await authFetch(`${API}/payments/courses/${studentId}`);
      const enrollData = enrollRes.ok ? await enrollRes.json() : { courses: [] };

      if (!enrollRes.ok) {
        setError("Failed to load courses.");
        setCourses([]);
        return;
      }

      const coursesRes = await authFetch(`${API}/courses`);
      const coursesData = coursesRes.ok ? await coursesRes.json() : { courses: [] };
      
      const courseTeacherMap = {};
      if (Array.isArray(coursesData)) {
        coursesData.forEach(course => {
          courseTeacherMap[course.course_id] = {
            teacher_id: course.teacher_id,
            thumbnail_url: course.thumbnail_url,
          };
        });
      }

      const myCourses = (enrollData.courses || []).filter((c) => c.ever_enrolled === true);
      
      const coursesWithTeacher = myCourses.map(course => ({
        ...course,
        teacher_id:    courseTeacherMap[course.course_id]?.teacher_id    || null,
        thumbnail_url: courseTeacherMap[course.course_id]?.thumbnail_url || null,
      }));
      
      setCourses(coursesWithTeacher);
    } catch {
      setError("Network error. Please try again.");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }

  // PayHere redirect
  async function handlePayNow(course) {
    if (payingCourse || course.current_month_paid) return;
    setPayingCourse(course.course_id);
    setError("");

    try {
      const now       = new Date();
      const pad       = (n) => String(n).padStart(2, "0");
      const billMonth = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
      const order_id  = `${course.course_id}::${user.user_id}::${billMonth}`;
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

      const form   = document.createElement("form");
      form.method  = "POST";
      form.action  = PAYHERE_CHECKOUT_URL;

      const fields = {
        merchant_id: hashData.merchant_id,
        return_url:  `${FRONTEND_URL}/student/success?order_id=${encodeURIComponent(order_id)}`,
        cancel_url:  `${FRONTEND_URL}/student/courses?cancelled=1`,
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
      };

      Object.entries(fields).forEach(([k, v]) => {
        const input  = document.createElement("input");
        input.type   = "hidden";
        input.name   = k;
        input.value  = String(v ?? "");
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

  const activeCourses  = courses.filter((c) => c.is_enrolled === true);
  const expiredCourses = courses.filter((c) => c.is_enrolled === false);

  // Check if there's a cancelled payment param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("cancelled") === "1") {
      setPayingCourse(null);
      leftForPayHere.current = false;
      setError("Payment was cancelled. Please try again if you wish to proceed.");
      window.history.replaceState({}, "", "/student/courses");
      setTimeout(() => setError(""), 5000);
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-md" style={{ backgroundColor: "#1E40AF" }}>
            <GraduationCap size={22} className="text-white" />
          </div>
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

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3.5 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" /> {error}
        </div>
      )}

      {/* KPI Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border shadow-sm p-4 flex flex-col items-center gap-2" style={{ borderColor: "#BFDBFE" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#EFF6FF" }}>
            <LayoutGrid size={17} style={{ color: "#1E40AF" }} />
          </div>
          <p className="text-2xl font-extrabold" style={{ color: "#1E40AF" }}>{courses.length}</p>
          <p className="text-xs text-gray-400 font-medium">Total</p>
        </div>
        <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-4 flex flex-col items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
            <CheckCircle size={17} className="text-green-600" />
          </div>
          <p className="text-2xl font-extrabold text-green-600">{activeCourses.length}</p>
          <p className="text-xs text-gray-400 font-medium">Active</p>
        </div>
        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-4 flex flex-col items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
            <Lock size={17} className="text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-500">{expiredCourses.length}</p>
          <p className="text-xs text-gray-400 font-medium">Renewal Due</p>
        </div>
      </div>

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
            Complete a payment to enroll in a course. It will appear here once enrolled.
          </p>
          <Link
            href="/student/payments"
            className="inline-flex items-center gap-2 mt-6 bg-blue-800 hover:bg-blue-900 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm shadow-sm"
          >
            View Available Courses <ChevronRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-10">

          {/* Active courses */}
          {activeCourses.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle size={15} className="text-green-500" />
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Courses</h2>
                <span className="ml-auto text-xs bg-green-100 text-green-700 font-bold px-2.5 py-0.5 rounded-full">
                  {activeCourses.length}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {activeCourses.map((course) => (
                  <CourseCard
                    key={course.course_id}
                    course={course}
                    paying={payingCourse === course.course_id}
                    onPay={handlePayNow}
                    teacher={teachers[course.teacher_id]}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Renewal due courses */}
          {expiredCourses.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Lock size={15} className="text-amber-500" />
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Renewal Due</h2>
                <span className="ml-auto text-xs bg-amber-100 text-amber-700 font-bold px-2.5 py-0.5 rounded-full">
                  {expiredCourses.length}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {expiredCourses.map((course) => (
                  <CourseCard
                    key={course.course_id}
                    course={course}
                    paying={payingCourse === course.course_id}
                    onPay={handlePayNow}
                    teacher={teachers[course.teacher_id]}
                  />
                ))}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  );
}

function CourseCard({ course, paying, onPay, teacher }) {
  const active = course.is_enrolled === true;
  const paid   = course.current_month_paid === true;

  return (
    <div
      className={`group relative bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col transition-all duration-200 hover:shadow-md ${
        active
          ? "border-green-200 hover:border-green-300"
          : "border-amber-100 hover:border-amber-200"
      }`}
    >
      {/* Thumbnail — matches teacher card h-44 */}
      <div className="h-44 bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden flex-shrink-0">
        <div className={`h-1.5 w-full absolute top-0 ${active ? "bg-gradient-to-r from-green-400 to-emerald-500" : "bg-gradient-to-r from-amber-300 to-orange-300"}`} />
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-blue-200 gap-2 pt-1.5">
            <ImageIcon size={34} />
            <span className="text-xs">No course image</span>
          </div>
        )}
        {/* Status badge overlaid on thumbnail */}
        <div className="absolute top-3 right-3">
          {active ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 text-xs font-bold shadow-sm">
              <BadgeCheck size={11} /> Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-1 text-xs font-bold shadow-sm">
              <Lock size={11} /> Renewal Due
            </span>
          )}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        {/* Title */}
        <div className="mb-2">
          <h2 className="text-base font-bold text-gray-900 leading-snug group-hover:text-blue-800 transition-colors line-clamp-2">
            {course.title}
          </h2>
          <p className="text-xs font-mono text-gray-300 mt-1">{course.course_id}</p>
        </div>

        {/* Teacher Info */}
        {teacher && (
          <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2">
              <User size={12} className="text-blue-600" />
              <span className="text-xs font-semibold text-gray-700">{teacher.name}</span>
            </div>
            {teacher.specialization && (
              <div className="text-xs text-gray-500 ml-6 mt-0.5">
                {teacher.specialization}
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {course.description && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-3">
            {course.description}
          </p>
        )}

        {/* Access until (active only) */}
        {active && course.access_until && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
            <Calendar size={12} />
            Access until{" "}
            {new Date(course.access_until).toLocaleDateString("en-LK", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </div>
        )}

        {/* Renewal message (expired) */}
        {!active && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3">
            Your access has expired. Pay this month's fee to regain access.
          </p>
        )}

        {/* Fee Display */}
        <div className="flex items-center justify-between mt-auto mb-4 pt-2 border-t border-gray-100">
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-gray-400">Rs.</span>
            <span className="text-lg font-bold text-gray-800">
              {parseFloat(course.fee || 0).toLocaleString()}
            </span>
          </div>
          <span className="text-xs text-gray-400">per month</span>
        </div>

        {/* CTA */}
        {active ? (
          <div className="flex flex-col gap-2">
            <Link
              href={`/student/courses/${course.course_id}`}
              className="flex items-center justify-center gap-2 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: "#1E40AF" }}
            >
              <Sparkles size={14} /> View Materials
              <ChevronRight size={14} className="ml-auto" />
            </Link>
            {!paid && (
              <button
                onClick={() => onPay(course)}
                disabled={!!paying}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 transition-colors"
              >
                {paying ? (
                  <><Loader2 size={14} className="animate-spin" /> Processing...</>
                ) : (
                  <><Wifi size={14} /> Pay This Month</>
                )}
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => onPay(course)}
            disabled={!!paying}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold px-4 py-2.5 transition-colors shadow-sm"
          >
            {paying ? (
              <><Loader2 size={14} className="animate-spin" /> Processing...</>
            ) : (
              <><Wifi size={14} /> Pay to Renew Access</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
