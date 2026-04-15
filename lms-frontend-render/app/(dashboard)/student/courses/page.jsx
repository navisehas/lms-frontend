"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle, BookOpen, CheckCircle, Lock,
  Loader, RefreshCw, BadgeCheck, ChevronRight,
  GraduationCap, Sparkles, LayoutGrid,
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
      // Fetch all courses + enrollment status in parallel
      const [allRes, enrollRes] = await Promise.all([
        authFetch(`${API}/courses`),
        authFetch(`${API}/payments/courses/${studentId}`),
      ]);

      const allData   = await allRes.json();
      const enrollData = enrollRes.ok ? await enrollRes.json() : { courses: [] };

      if (!allRes.ok) {
        setError("Failed to load courses.");
        setCourses([]);
        return;
      }

      // Build a map of enrolled course ids
      const enrolledMap = new Map(
        (enrollData.courses || []).map((c) => [c.course_id, c])
      );

      // Merge: all courses, mark enrolled ones
      const merged = (allData.courses || allData || []).map((c) => {
        const enrollInfo = enrolledMap.get(c.course_id);
        return {
          ...c,
          is_enrolled:  Boolean(enrollInfo?.is_enrolled),
          access_until: enrollInfo?.access_until || null,
        };
      });

      setCourses(merged);
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
          <p className="text-2xl font-extrabold text-green-600">{enrolledCourses.length}</p>
          <p className="text-xs text-gray-400 font-medium">Active</p>
        </div>
        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-4 flex flex-col items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
            <Lock size={17} className="text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-500">{lockedCourses.length}</p>
          <p className="text-xs text-gray-400 font-medium">Locked</p>
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
            Once you enroll in a course, it will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-10">

          {/* Active / Enrolled */}
          {enrolledCourses.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle size={15} className="text-green-500" />
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Courses</h2>
                <span className="ml-auto text-xs bg-green-100 text-green-700 font-bold px-2.5 py-0.5 rounded-full">
                  {enrolledCourses.length}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {enrolledCourses.map((course) => (
                  <CourseCard key={course.course_id} course={course} active={true} />
                ))}
              </div>
            </section>
          )}

          {/* Locked / Payment needed */}
          {lockedCourses.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Lock size={15} className="text-amber-500" />
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Payment Required</h2>
                <span className="ml-auto text-xs bg-amber-100 text-amber-700 font-bold px-2.5 py-0.5 rounded-full">
                  {lockedCourses.length}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {lockedCourses.map((course) => (
                  <CourseCard key={course.course_id} course={course} active={false} />
                ))}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  );
}

function CourseCard({ course, active }) {
  return (
    <div
      className={`group relative bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md ${
        active
          ? "border-green-200 hover:border-green-300"
          : "border-gray-100 hover:border-gray-200 opacity-80 hover:opacity-100"
      }`}
    >
      {/* Top accent bar */}
      <div className={`h-1 w-full ${active ? "bg-gradient-to-r from-green-400 to-emerald-500" : "bg-gradient-to-r from-gray-200 to-gray-300"}`} />

      <div className="p-5">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-gray-900 leading-snug group-hover:text-blue-800 transition-colors">
              {course.title}
            </h2>
          </div>
          {active ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 text-xs font-bold flex-shrink-0">
              <BadgeCheck size={11} /> Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-1 text-xs font-bold flex-shrink-0">
              <Lock size={11} /> Locked
            </span>
          )}
        </div>

        {/* Description */}
        {course.description && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
            {course.description}
          </p>
        )}

        {/* CTA */}
        {active ? (
          <Link
            href={`/student/courses/${course.course_id}`}
            className="flex items-center justify-center gap-2 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: "#1E40AF" }}
          >
            <Sparkles size={14} /> View Materials
            <ChevronRight size={14} className="ml-auto" />
          </Link>
        ) : (
          <Link
            href="/student/payments"
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            <Lock size={14} /> Pay to Unlock
            <ChevronRight size={14} className="ml-auto" />
          </Link>
        )}
      </div>
    </div>
  );
}
