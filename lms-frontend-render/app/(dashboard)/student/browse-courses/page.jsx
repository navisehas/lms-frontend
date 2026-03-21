"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  DollarSign,
  Loader,
  Users,
  Clock,
  User,
} from "lucide-react";
import { authFetch, guardRoute } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function BrowseCoursesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrolling, setEnrolling] = useState({});
  const [enrolledCourses, setEnrolledCourses] = useState(new Set());
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const auth = guardRoute("STUDENT", router);
    if (auth) {
      setUser(auth);
      fetchCourses();
      fetchMyEnrollments(auth.user_id);
    }
  }, [router]);

  async function fetchCourses() {
    setLoading(true);
    setError("");
    try {
      const res = await authFetch(`${API}/courses`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load courses.");
        setCourses([]);
        return;
      }

      setCourses(data || []);
    } catch {
      setError("Network error. Please try again.");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMyEnrollments(studentId) {
    try {
      const res = await authFetch(`${API}/payments/courses/${studentId}`);
      const data = await res.json();

      if (res.ok && data.success) {
        const enrolled = new Set(
          (data.courses || [])
            .filter((c) => c.is_enrolled)
            .map((c) => c.course_id)
        );
        setEnrolledCourses(enrolled);
      }
    } catch {
      // Silently fail - not critical
    }
  }

  async function handleEnroll(courseId, courseTitle) {
    if (enrolling[courseId]) return; // Already enrolling

    setEnrolling((prev) => ({ ...prev, [courseId]: true }));
    setError("");
    setSuccessMsg("");

    try {
      const res = await authFetch(`${API}/courses/enrollments/enroll`, {
        method: "POST",
        body: JSON.stringify({ course_id: courseId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Enrollment failed.");
        return;
      }

      setSuccessMsg(`✓ Enrolled in ${courseTitle}!`);
      setEnrolledCourses((prev) => new Set([...prev, courseId]));
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setEnrolling((prev) => ({ ...prev, [courseId]: false }));
    }
  }

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="text-indigo-600" size={26} /> Browse All Courses
        </h1>
        <p className="text-sm text-gray-500 mt-1">Explore and enroll in available courses.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
          <Loader size={20} className="animate-spin" /> Loading courses...
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-24">
          <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No courses available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const isEnrolled = enrolledCourses.has(course.course_id);
            const isEnrolling = enrolling[course.course_id];

            return (
              <div
                key={course.course_id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden"
              >
                {/* Thumbnail */}
                {course.thumbnail_url && (
                  <div className="h-40 bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center overflow-hidden">
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {course.description || "No description"}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1 text-xs text-gray-600 border-t pt-2">
                    {course.teacher_name && (
                      <div className="flex items-center gap-2">
                        <User size={14} /> {course.teacher_name}
                      </div>
                    )}
                    {course.duration && (
                      <div className="flex items-center gap-2">
                        <Clock size={14} /> {course.duration}
                      </div>
                    )}
                    {course.enrolled_count !== undefined && (
                      <div className="flex items-center gap-2">
                        <Users size={14} /> {course.enrolled_count} students
                      </div>
                    )}
                    {course.fee > 0 && (
                      <div className="flex items-center gap-2 text-indigo-600 font-semibold">
                        <DollarSign size={14} /> Rs. {(course.fee || 0).toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="pt-2 border-t">
                    {isEnrolled ? (
                      <button
                        disabled
                        className="w-full text-sm text-gray-400 bg-gray-100 px-3 py-2 rounded-lg flex items-center justify-center gap-1"
                      >
                        <CheckCircle size={14} /> Enrolled
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEnroll(course.course_id, course.title)}
                        disabled={isEnrolling}
                        className="w-full text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 px-3 py-2 rounded-lg transition font-medium flex items-center justify-center gap-1"
                      >
                        {isEnrolling ? (
                          <>
                            <Loader size={14} className="animate-spin" /> Enrolling...
                          </>
                        ) : (
                          "Enroll Now"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
