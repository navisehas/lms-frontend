"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle, BookOpen, CheckCircle, Lock,
  Loader, RefreshCw, CalendarDays, BadgeCheck,
} from "lucide-react";
import { authFetch, guardRoute } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function StudentCoursesPage() {
  const router = useRouter();
  const [user, setUser]       = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const auth = guardRoute("STUDENT", router);
    if (auth) { setUser(auth); fetchCourses(auth.user_id); }
  }, [router]);

  async function fetchCourses(studentId) {
    setLoading(true);
    setError("");
    try {
      const res  = await authFetch(`${API}/payments/courses/${studentId}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to load your courses.");
        setCourses([]);
        return;
      }
      // Show ALL courses — both enrolled (access ok) and locked (payment needed)
      setCourses(data.courses || []);
    } catch {
      setError("Network error. Please try again.");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }

  const enrolledCourses = courses.filter((c) => c.is_enrolled);
  const lockedCourses   = courses.filter((c) => !c.is_enrolled);

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="text-indigo-600" size={26} /> My Courses
          </h1>
          <p className="text-sm text-gray-500 mt-1">Your enrolled courses and learning access status.</p>
        </div>
        <button
          onClick={() => user && fetchCourses(user.user_id)}
          className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-400">Active Access</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{enrolledCourses.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-400">Payment Needed</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{lockedCourses.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 col-span-2 md:col-span-1">
          <p className="text-xs text-gray-400">Total Courses</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{courses.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
          <Loader size={20} className="animate-spin" /> Loading courses...
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <BookOpen size={48} className="mx-auto text-indigo-200 mb-4" />
          <h2 className="text-lg font-bold text-gray-800">No courses yet</h2>
          <p className="text-sm text-gray-500 mt-2">
            Once you are enrolled in a course it will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-8">

          {/* ── Enrolled / Active ── */}
          {enrolledCourses.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <CheckCircle size={14} className="text-green-500" /> Active This Month
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {enrolledCourses.map((course) => (
                  <CourseCard key={course.course_id} course={course} active={true} />
                ))}
              </div>
            </div>
          )}

          {/* ── Locked / Payment needed ── */}
          {lockedCourses.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Lock size={14} className="text-amber-500" /> Payment Required
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {lockedCourses.map((course) => (
                  <CourseCard key={course.course_id} course={course} active={false} />
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

function CourseCard({ course, active }) {
  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-6 ${active ? "border-green-200" : "border-gray-100"}`}>

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-gray-300">{course.course_id}</p>
          <h2 className="text-lg font-bold text-gray-900 mt-1">{course.title}</h2>
        </div>
        {active ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 border border-green-200 px-3 py-1 text-xs font-bold flex-shrink-0">
            <BadgeCheck size={12} /> Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 text-xs font-bold flex-shrink-0">
            <Lock size={12} /> Locked
          </span>
        )}
      </div>

      {course.description && (
        <p className="text-sm text-gray-500 leading-relaxed mt-3 line-clamp-2">{course.description}</p>
      )}

      {/* Access until */}
      {active && course.access_until && (
        <div className="mt-3 flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2">
          <CalendarDays size={13} className="text-green-500 flex-shrink-0" />
          <span className="text-xs text-green-700 font-semibold">
            Access until{" "}
            {new Date(course.access_until).toLocaleDateString("en-US", {
              month: "long", day: "numeric", year: "numeric",
            })}
          </span>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100">
        {active ? (
          <Link
            href={`/student/courses/${course.course_id}`}
            className="inline-flex items-center justify-center w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            View Materials
          </Link>
        ) : (
          <Link
            href="/student/payments"
            className="inline-flex items-center justify-center w-full rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors gap-2"
          >
            <Lock size={14} /> Pay to Unlock
          </Link>
        )}
      </div>
    </div>
  );
}
