"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Clock,
  DollarSign,
  ExternalLink,
  FilePlus2,
  GraduationCap,
  ImageIcon,
  Layers3,
  Loader,
  NotebookPen,
  Plus,
  RefreshCw,
  Users,
  Edit2,
  Trash2,
  X,
  Check,
} from "lucide-react";
import { authFetch, guardRoute } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getLessonHref(value) {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  if (/^www\./i.test(value)) return `https://${value}`;
  return null;
}

export default function TeacherCourseManage() {
  const router = useRouter();
  const params = useParams();
  const courseId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [user, setUser] = useState(null);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [savingLesson, setSavingLesson] = useState(false);
  const [error, setError] = useState("");
  const [lessonError, setLessonError] = useState("");
  const [lessonSuccess, setLessonSuccess] = useState("");
  const [lessonForm, setLessonForm] = useState({
    title: "",
    description: "",
    resource_url: "",
  });
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [editingLessonForm, setEditingLessonForm] = useState({
    title: "",
    description: "",
    resource_url: "",
  });
  const [deletingLessonId, setDeletingLessonId] = useState(null);

  useEffect(() => {
    const auth = guardRoute("TEACHER", router);
    if (auth && courseId) {
      setUser(auth);
      fetchCourseData(auth.user_id, courseId);
    }
  }, [router, courseId]);

  async function fetchCourseData(teacherId, id) {
    setLoading(true);
    setError("");
    try {
      const res = await authFetch(`${API}/courses/${id}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load course.");
        setCourse(null);
        setLessons([]);
        return;
      }

      if (data.teacher_id !== teacherId) {
        setError("This course is not assigned to your teacher account.");
        setCourse(null);
        setLessons([]);
        return;
      }

      setCourse(data);
      await fetchLessons(id);
    } catch {
      setError("Network error. Please try again.");
      setCourse(null);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchLessons(id) {
    setLoadingLessons(true);
    setLessonError("");
    try {
      const res = await authFetch(`${API}/lessons/course/${id}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setLessonError(data.error || "Failed to load course lessons.");
        setLessons([]);
        return;
      }

      setLessons(Array.isArray(data.lessons) ? data.lessons : []);
    } catch {
      setLessonError("Network error while loading lessons.");
      setLessons([]);
    } finally {
      setLoadingLessons(false);
    }
  }

  async function handleLessonSubmit(event) {
    event.preventDefault();
    setLessonError("");
    setLessonSuccess("");

    if (!course?.course_id) {
      setLessonError("Course information is not ready yet.");
      return;
    }

    if (!lessonForm.title.trim()) {
      setLessonError("Lesson title is required.");
      return;
    }

    setSavingLesson(true);
    try {
      const res = await authFetch(`${API}/lessons`, {
        method: "POST",
        body: JSON.stringify({
          course_id: course.course_id,
          title: lessonForm.title,
          description: lessonForm.description,
          resource_url: lessonForm.resource_url,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setLessonError(data.error || "Failed to add lesson.");
        return;
      }

      setLessonForm({ title: "", description: "", resource_url: "" });
      setLessonSuccess("Lesson added successfully.");
      await fetchLessons(course.course_id);
    } catch {
      setLessonError("Network error. Please try again.");
    } finally {
      setSavingLesson(false);
    }
  }

  function startEditingLesson(lesson) {
    setEditingLessonId(lesson.lesson_id);
    setEditingLessonForm({
      title: lesson.title,
      description: lesson.description || "",
      resource_url: lesson.resource_url || "",
    });
    setLessonError("");
    setLessonSuccess("");
  }

  async function handleEditLessonSubmit(event) {
    event.preventDefault();
    setLessonError("");
    setLessonSuccess("");

    if (!editingLessonForm.title.trim()) {
      setLessonError("Lesson title is required.");
      return;
    }

    setSavingLesson(true);
    try {
      const res = await authFetch(`${API}/lessons/${editingLessonId}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editingLessonForm.title,
          description: editingLessonForm.description,
          resource_url: editingLessonForm.resource_url,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setLessonError(data.error || "Failed to update lesson.");
        return;
      }

      setEditingLessonId(null);
      setEditingLessonForm({ title: "", description: "", resource_url: "" });
      setLessonSuccess("Lesson updated successfully.");
      await fetchLessons(course.course_id);
    } catch {
      setLessonError("Network error. Please try again.");
    } finally {
      setSavingLesson(false);
    }
  }

  async function handleDeleteLesson(lessonId) {
    if (!confirm("Are you sure you want to delete this lesson? This action cannot be undone.")) {
      return;
    }

    setDeletingLessonId(lessonId);
    setLessonError("");
    setLessonSuccess("");

    try {
      const res = await authFetch(`${API}/lessons/${lessonId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setLessonError(data.error || "Failed to delete lesson.");
        return;
      }

      setLessonSuccess("Lesson deleted successfully.");
      await fetchLessons(course.course_id);
    } catch {
      setLessonError("Network error. Please try again.");
    } finally {
      setDeletingLessonId(null);
    }
  }

  const nextLessonNumber = useMemo(() => {
    return lessons.reduce((max, lesson) => Math.max(max, Number(lesson.lesson_order) || 0), 0) + 1;
  }, [lessons]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
        <Loader size={20} className="animate-spin" /> Loading course...
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Link
          href="/teacher/courses"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft size={16} /> Back to My Courses
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-4 flex items-center gap-2">
          <AlertCircle size={18} /> {error || "Course not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/teacher/courses"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft size={16} /> Back to My Courses
        </Link>
        <button
          onClick={() => user && fetchCourseData(user.user_id, course.course_id)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={15} /> Refresh Course
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-60 bg-gradient-to-br from-indigo-50 to-blue-100">
          {course.thumbnail_url ? (
            <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-indigo-200 gap-2">
              <ImageIcon size={48} />
              <span className="text-sm">No course image</span>
            </div>
          )}
        </div>

        <div className="p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <p className="text-xs font-mono text-gray-300 mb-2">{course.course_id}</p>
              <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-sm text-gray-500 mt-3 max-w-3xl">
                {course.description || "No description has been added for this course yet."}
              </p>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-4 min-w-[220px]">
              <p className="text-xs uppercase tracking-wide text-indigo-400 font-semibold">Teacher View</p>
              <p className="text-sm text-indigo-700 mt-2">
                Signed in as <span className="font-semibold">{user?.name}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mt-8">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 text-violet-600 mb-2">
                <Layers3 size={16} />
                <span className="text-xs font-semibold uppercase tracking-wide">Lessons</span>
              </div>
              <p className="text-lg font-bold text-gray-800">{lessons.length}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 text-indigo-600 mb-2">
                <GraduationCap size={16} />
                <span className="text-xs font-semibold uppercase tracking-wide">Assigned Teacher</span>
              </div>
              <p className="text-lg font-bold text-gray-800">{course.teacher_name || user?.name}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 text-emerald-600 mb-2">
                <Users size={16} />
                <span className="text-xs font-semibold uppercase tracking-wide">Enrolled</span>
              </div>
              <p className="text-lg font-bold text-gray-800">{course.enrolled_count} students</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Clock size={16} />
                <span className="text-xs font-semibold uppercase tracking-wide">Duration</span>
              </div>
              <p className="text-lg font-bold text-gray-800">{course.duration || "Not set"}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 text-orange-600 mb-2">
                <DollarSign size={16} />
                <span className="text-xs font-semibold uppercase tracking-wide">Course Fee</span>
              </div>
              <p className="text-lg font-bold text-gray-800">
                Rs. {parseFloat(course.fee || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {lessonError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} /> {lessonError}
        </div>
      )}

      {lessonSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <Plus size={16} /> {lessonSuccess}
        </div>
      )}

      <div className="grid xl:grid-cols-[1.15fr_0.85fr] gap-6 items-start">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="text-indigo-600" size={18} />
                <h2 className="text-lg font-bold text-gray-900">Course Lessons</h2>
              </div>
              <p className="text-sm text-gray-500">
                Teachers can add any number of lessons for this course.
              </p>
            </div>

            {loadingLessons ? (
              <div className="flex items-center justify-center gap-2 py-12 text-gray-400">
                <Loader size={18} className="animate-spin" /> Loading lessons...
              </div>
            ) : lessons.length === 0 ? (
              <div className="text-center py-12">
                <NotebookPen size={40} className="mx-auto text-indigo-200 mb-3" />
                <p className="font-semibold text-gray-800">No lessons added yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Add the first lesson for this course using the form on the right.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {lessons.map((lesson) => {
                  const resourceHref = getLessonHref(lesson.resource_url);
                  const isEditing = editingLessonId === lesson.lesson_id;
                  const isDeleting = deletingLessonId === lesson.lesson_id;

                  if (isEditing) {
                    return (
                      <form key={lesson.lesson_id} onSubmit={handleEditLessonSubmit} className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Lesson Title</label>
                            <input
                              value={editingLessonForm.title}
                              onChange={(e) =>
                                setEditingLessonForm((prev) => ({ ...prev, title: e.target.value }))
                              }
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Lesson Summary</label>
                            <textarea
                              value={editingLessonForm.description}
                              onChange={(e) =>
                                setEditingLessonForm((prev) => ({ ...prev, description: e.target.value }))
                              }
                              rows={3}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Lesson Link</label>
                            <input
                              value={editingLessonForm.resource_url}
                              onChange={(e) =>
                                setEditingLessonForm((prev) => ({ ...prev, resource_url: e.target.value }))
                              }
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="submit"
                              disabled={savingLesson}
                              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white text-sm font-semibold py-2 rounded-lg transition"
                            >
                              {savingLesson ? (
                                <>
                                  <Loader size={14} className="animate-spin" /> Saving...
                                </>
                              ) : (
                                <>
                                  <Check size={14} /> Save changes
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingLessonId(null);
                                setLessonError("");
                              }}
                              className="flex-1 flex items-center justify-center gap-2 border border-gray-300 text-gray-700 text-sm font-semibold py-2 rounded-lg hover:bg-gray-100 transition"
                            >
                              <X size={14} /> Cancel
                            </button>
                          </div>
                        </div>
                      </form>
                    );
                  }

                  return (
                    <div key={lesson.lesson_id} className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                            Lesson {lesson.lesson_order}
                          </span>
                          <h3 className="text-lg font-bold text-gray-900">{lesson.title}</h3>
                          <p className="text-sm text-gray-500">
                            {lesson.description || "No lesson summary added yet."}
                          </p>
                          <p className="text-xs text-gray-400">
                            Added on{" "}
                            {new Date(lesson.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>

                        <div className="flex flex-col gap-2 min-w-fit">
                          {resourceHref ? (
                            <a
                              href={resourceHref}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 px-3 py-1.5 bg-white border border-indigo-200 rounded-lg"
                            >
                              Open Link <ExternalLink size={14} />
                            </a>
                          ) : lesson.resource_url ? (
                            <span className="text-xs text-gray-500 px-3 py-1.5 bg-white border border-gray-200 rounded-lg break-all max-w-[150px]">{lesson.resource_url}</span>
                          ) : null}

                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditingLesson(lesson)}
                              className="flex items-center justify-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
                            >
                              <Edit2 size={14} /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteLesson(lesson.lesson_id)}
                              disabled={isDeleting}
                              className="flex items-center justify-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                            >
                              {isDeleting ? (
                                <>
                                  <Loader size={14} className="animate-spin" /> Del
                                </>
                              ) : (
                                <>
                                  <Trash2 size={14} /> Delete
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center gap-2 text-slate-700 mb-3">
              <FilePlus2 size={18} />
              <h2 className="text-lg font-bold">Course Workspace</h2>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Build this course lesson by lesson, then attach materials and links whenever you need them for students.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/teacher/materials?course=${course.course_id}`}
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 hover:bg-indigo-700 transition-colors"
              >
                Manage Materials
              </Link>
              <Link
                href="/teacher/courses"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold px-4 py-2.5 hover:bg-white transition-colors"
              >
                View All Courses
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 xl:sticky xl:top-6">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="text-indigo-600" size={18} />
            <h2 className="text-lg font-bold text-gray-900">Add New Lesson</h2>
          </div>
          <p className="text-sm text-gray-500 mb-5">
            Lesson <span className="font-semibold text-gray-800">{nextLessonNumber}</span> will be added next for this
            course.
          </p>

          <form onSubmit={handleLessonSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Lesson Title</label>
              <input
                value={lessonForm.title}
                onChange={(event) =>
                  setLessonForm((current) => ({ ...current, title: event.target.value }))
                }
                placeholder="e.g. Introduction to Grammar"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Lesson Summary</label>
              <textarea
                value={lessonForm.description}
                onChange={(event) =>
                  setLessonForm((current) => ({ ...current, description: event.target.value }))
                }
                rows={5}
                placeholder="Briefly describe what students will learn in this lesson."
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Lesson Link</label>
              <input
                value={lessonForm.resource_url}
                onChange={(event) =>
                  setLessonForm((current) => ({ ...current, resource_url: event.target.value }))
                }
                placeholder="https://youtube.com/... or https://drive.google.com/..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            <button
              type="submit"
              disabled={savingLesson}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
            >
              {savingLesson ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />}
              {savingLesson ? "Adding Lesson..." : "Add Lesson"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
