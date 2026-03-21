"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Loader,
  Download,
  Clock,
  User,
  DollarSign,
  CheckCircle,
} from "lucide-react";
import { authFetch, guardRoute } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getMaterialHref(value) {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return `${API}${value.startsWith("/") ? value : `/${value}`}`;
}

export default function CourseDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id;

  const [user, setUser] = useState(null);
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  const materialsByLesson = useMemo(() => {
    const grouped = new Map();

    materials.forEach((material) => {
      const lessonKey = material.lesson_title || "General";
      if (!grouped.has(lessonKey)) {
        grouped.set(lessonKey, []);
      }
      grouped.get(lessonKey).push(material);
    });

    return Array.from(grouped.entries()).map(([lessonTitle, lessonMaterials]) => ({
      lessonTitle,
      lessonMaterials,
    }));
  }, [materials]);

  useEffect(() => {
    const auth = guardRoute("STUDENT", router);
    if (auth) {
      setUser(auth);
      fetchCourseDetails(auth.user_id);
    }
  }, [router, courseId]);

  async function fetchCourseDetails(studentId) {
    setLoading(true);
    setError("");

    try {
      // Fetch course details
      const courseRes = await authFetch(`${API}/courses/${courseId}`);
      if (!courseRes.ok) {
        setError("Course not found.");
        setCourse(null);
        return;
      }
      const courseData = await courseRes.json();
      setCourse(courseData);

      // Check if enrolled
      const enrollRes = await authFetch(`${API}/payments/courses/${studentId}`);
      if (enrollRes.ok) {
        const enrollData = await enrollRes.json();
        const matchedCourse = (enrollData.courses || []).find((c) => c.course_id === courseId);
        const enrolled = Boolean(matchedCourse?.is_enrolled);
        const paid = Boolean(matchedCourse?.payment_id);
        setIsEnrolled(enrolled);
        setIsPaid(paid);

        if (paid) {
          const materialsRes = await authFetch(`${API}/courses/${courseId}/materials`);
          const materialsData = await materialsRes.json();

          if (!materialsRes.ok || !materialsData.success) {
            setError(materialsData.error || "Failed to load course materials.");
            setMaterials([]);
          } else {
            setMaterials(materialsData.materials || []);
          }
        } else {
          setMaterials([]);
        }
      }
    } catch {
      setError("Failed to load course details.");
      setCourse(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleEnroll() {
    if (enrolling || !course) return;

    setEnrolling(true);
    setError("");

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

      setIsEnrolled(true);
      setIsPaid(false);
      setError("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setEnrolling(false);
    }
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        href="/student/browse-courses"
        className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
      >
        <ArrowLeft size={16} /> Back to Courses
      </Link>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
          <Loader size={20} className="animate-spin" /> Loading course...
        </div>
      ) : !course ? (
        <div className="text-center py-24">
          <AlertCircle size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Course not found.</p>
        </div>
      ) : (
        <>
          {/* Course Header */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Thumbnail */}
            {course.thumbnail_url && (
              <div className="h-64 bg-linear-to-br from-indigo-400 to-indigo-600 flex items-center justify-center overflow-hidden">
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Details */}
            <div className="p-6 space-y-4">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {course.title}
                    </h1>
                    <p className="text-gray-600 mt-2 text-base">
                      {course.description || "No description"}
                    </p>
                  </div>

                  {isEnrolled && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium whitespace-nowrap">
                      <CheckCircle size={16} /> Enrolled
                    </div>
                  )}
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t pt-6">
                {course.teacher_name && (
                  <div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <User size={14} /> Instructor
                    </p>
                    <p className="text-sm font-semibold text-gray-800 mt-1">
                      {course.teacher_name}
                    </p>
                  </div>
                )}

                {course.duration && (
                  <div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={14} /> Duration
                    </p>
                    <p className="text-sm font-semibold text-gray-800 mt-1">
                      {course.duration}
                    </p>
                  </div>
                )}

                {course.enrolled_count !== undefined && (
                  <div>
                    <p className="text-xs text-gray-500">Students</p>
                    <p className="text-sm font-semibold text-gray-800 mt-1">
                      {course.enrolled_count}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <DollarSign size={14} /> Fee
                  </p>
                  <p className="text-sm font-semibold text-indigo-600 mt-1">
                    {course.fee > 0 ? `Rs. ${(course.fee || 0).toLocaleString()}` : "Free"}
                  </p>
                </div>
              </div>

              {/* Enroll Button */}
              {!isEnrolled && (
                <div className="border-t pt-6">
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {enrolling ? (
                      <>
                        <Loader size={18} className="animate-spin" /> Enrolling...
                      </>
                    ) : (
                      "Enroll in This Course"
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Materials Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Course Materials</h2>

            {!isPaid ? (
              <div className="text-center py-12 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-amber-700 font-medium">Complete payment to unlock course materials.</p>
                <p className="text-amber-600 text-sm mt-1">After payment confirmation, materials will appear here automatically.</p>
              </div>
            ) : materials.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-gray-500">No materials available yet.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {materialsByLesson.map((lessonGroup) => (
                  <div key={lessonGroup.lessonTitle} className="rounded-xl border border-gray-200 bg-white p-4">
                    <h3 className="text-sm font-bold text-indigo-700 mb-3">{lessonGroup.lessonTitle}</h3>
                    <div className="space-y-3">
                      {lessonGroup.lessonMaterials.map((material) => (
                        <div
                          key={material.material_id}
                          className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3 hover:shadow-sm transition"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-sm truncate">{material.title}</h4>
                          </div>

                          <div className="flex gap-2 ml-4">
                            {material.content_url && (
                              <a
                                href={getMaterialHref(material.content_url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1 bg-indigo-50 px-3 py-2 rounded-lg"
                              >
                                <Download size={14} /> Document
                              </a>
                            )}

                            {material.external_url && (
                              <a
                                href={material.external_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-2 rounded-lg bg-blue-50"
                              >
                                Link ↗
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
