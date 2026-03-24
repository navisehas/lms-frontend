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
} from "lucide-react";
import { authFetch, guardRoute } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function TeacherCoursesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const auth = guardRoute("TEACHER", router);
    if (auth) {
      setUser(auth);
      fetchCourses(auth.user_id);
    }
  }, [router]);

  async function fetchCourses(teacherId) {
    setLoading(true);
    setError("");
    try {
      const res = await authFetch(`${API}/courses`);
      const data = await res.json();

      if (!res.ok || !Array.isArray(data)) {
        setError(data?.error || "Failed to load assigned courses.");
        setCourses([]);
        return;
      }

      setCourses(data.filter((course) => course.teacher_id === teacherId));
    } catch {
      setError("Network error. Please try again.");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }

  const stats = {
    total: courses.length,
    enrolled: courses.reduce((sum, course) => sum + (course.enrolled_count || 0), 0),
    value: courses.reduce((sum, course) => sum + parseFloat(course.fee || 0), 0),
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="text-indigo-600" size={26} /> My Assigned Courses
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Courses currently assigned to {user?.name || "you"}.
          </p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
            <BookOpen size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400">Assigned Courses</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400">Total Enrolled Students</p>
            <p className="text-2xl font-bold text-gray-800">{stats.enrolled}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400">Combined Course Value</p>
            <p className="text-2xl font-bold text-gray-800">Rs. {stats.value.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
          <Loader size={20} className="animate-spin" /> Loading courses...
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <BookOpen size={48} className="mx-auto text-indigo-200 mb-4" />
          <h2 className="text-lg font-bold text-gray-800">No courses assigned yet</h2>
          <p className="text-sm text-gray-500 mt-2">
            Once an admin assigns courses to your teacher account, they will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.course_id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
            >
              <div className="h-44 bg-gradient-to-br from-indigo-50 to-blue-100">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-indigo-200 gap-2">
                    <ImageIcon size={34} />
                    <span className="text-xs">No course image</span>
                  </div>
                )}
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="mb-3">
                  <h2 className="text-lg font-bold text-gray-800 line-clamp-2">{course.title}</h2>
                  <p className="text-xs font-mono text-gray-300 mt-1">{course.course_id}</p>
                </div>

                {course.description && (
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-4">
                    {course.description}
                  </p>
                )}

                <div className="space-y-2 text-sm text-gray-500 mt-auto">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={14} className="text-indigo-500" />
                    <span>{course.teacher_name || user?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-emerald-500" />
                    <span>{course.enrolled_count} enrolled students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-blue-500" />
                    <span>{course.duration || "Duration not set"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign size={14} className="text-orange-500" />
                    <span>Rs. {parseFloat(course.fee || 0).toLocaleString()}</span>
                  </div>
                </div>

                <Link
                  href={`/teacher/courses/${course.course_id}`}
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold px-4 py-3 hover:bg-indigo-700 transition-colors"
                >
                  Open Lessons <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
