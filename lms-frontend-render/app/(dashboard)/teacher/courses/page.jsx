"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  BookOpen,
  ChevronRight,
  Clock,
  DollarSign,
  GraduationCap,
  ImageIcon,
  Loader,
  RefreshCw,
  Users,
  Search,
  X,
} from "lucide-react";
import { authFetch, guardRoute } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function TeacherCoursesPage() {
  const router = useRouter();
  const [user,    setUser]    = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const auth = guardRoute("TEACHER", router);
    if (auth) { setUser(auth); fetchCourses(auth.user_id); }
  }, [router]);

  async function fetchCourses(teacherId) {
    setLoading(true);
    setError("");
    try {
      const res  = await authFetch(`${API}/courses`);
      const data = await res.json();
      if (!res.ok || !Array.isArray(data)) {
        setError(data?.error || "Failed to load assigned courses.");
        setCourses([]);
        return;
      }
      setCourses(data.filter((c) => c.teacher_id === teacherId));
    } catch {
      setError("Network error. Please try again.");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }

  const stats = {
    total:    courses.length,
    enrolled: courses.reduce((s, c) => s + (c.enrolled_count || 0), 0),
    value:    courses.reduce((s, c) => s + parseFloat(c.fee || 0), 0),
  };

  const filteredCourses = searchTerm.trim()
    ? courses.filter(c =>
        c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.course_id?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : courses;

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="text-blue-600" size={26} /> My Assigned Courses
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Courses currently assigned to {user?.name || "you"}.
          </p>
        </div>
        <button
          onClick={() => user && fetchCourses(user.user_id)}
          className="flex items-center gap-2 text-sm text-blue-600 bg-white border border-blue-200 px-3 py-2 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm font-medium"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-blue-100 p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" size={16} />
          <input
            type="text"
            placeholder="Search by course name, description, or ID…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-10 py-2.5 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-gray-700 placeholder-gray-400 text-sm transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition"
            >
              <X size={15} />
            </button>
          )}
        </div>
        {searchTerm && (
          <p className="text-xs text-gray-400 mt-2 pl-1">
            {filteredCourses.length} result{filteredCourses.length !== 1 ? "s" : ""} for "{searchTerm}"
          </p>
        )}
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <BookOpen size={17} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Assigned Courses</p>
            <p className="text-2xl font-extrabold text-gray-900">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
            <Users size={17} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Total Enrolled Students</p>
            <p className="text-2xl font-extrabold text-gray-900">{stats.enrolled}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
            <GraduationCap size={17} className="text-amber-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Combined Course Value</p>
            <p className="text-2xl font-extrabold text-gray-900">Rs. {stats.value.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-blue-400 gap-2">
          <Loader size={22} className="animate-spin" />
          <span className="text-sm font-medium text-gray-500">Loading courses…</span>
        </div>

      ) : filteredCourses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <BookOpen size={30} className="text-blue-300" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">
            {searchTerm ? "No matching courses found" : "No courses assigned yet"}
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            {searchTerm
              ? "Try a different search term"
              : "Once an admin assigns courses to your teacher account, they will appear here."}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="inline-flex items-center gap-2 mt-5 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm shadow-sm"
            >
              Clear Search
            </button>
          )}
        </div>

      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => (
            <div
              key={course.course_id}
              className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md hover:border-blue-200 transition-all"
            >
              {/* Thumbnail */}
              <div className="h-44 bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">
                <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-blue-700 to-indigo-700 absolute top-0" />
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
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="mb-3">
                  <h2 className="text-base font-bold text-gray-900 line-clamp-2">{course.title}</h2>
                  <p className="text-xs font-mono text-gray-300 mt-1">{course.course_id}</p>
                </div>

                {course.description && (
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-4">
                    {course.description}
                  </p>
                )}

                <div className="space-y-2 text-sm text-gray-500 mt-auto mb-4">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={13} className="text-blue-500" />
                    <span className="text-xs">{course.teacher_name || user?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={13} className="text-green-500" />
                    <span className="text-xs">{course.enrolled_count} enrolled students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={13} className="text-blue-400" />
                    <span className="text-xs">{course.duration || "Duration not set"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign size={13} className="text-blue-500" />
                    <span className="text-xs font-semibold text-blue-700">
                      Rs. {parseFloat(course.fee || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Open Lessons button — blue-700 matching theme */}
                <Link
                  href={`/teacher/courses/${course.course_id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-4 py-2.5 transition-colors shadow-sm"
                >
                  Open Lessons <ChevronRight size={15} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
