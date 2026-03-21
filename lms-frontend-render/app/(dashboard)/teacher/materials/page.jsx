"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  BookOpen,
  ExternalLink,
  FileText,
  GraduationCap,
  ImageIcon,
  Layers3,
  Link as LinkIcon,
  Loader,
  NotebookPen,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { authFetch, guardRoute } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getMaterialHref(value) {
  if (!value) return null;
  if (value.startsWith("/")) return `${API}${value}`;
  if (/^https?:\/\//i.test(value)) return value;
  if (/^www\./i.test(value)) return `https://${value}`;
  return null;
}

function getTypeClasses(type) {
  switch (type) {
    case "PDF":
      return "bg-red-100 text-red-700";
    case "MEETING":
      return "bg-emerald-100 text-emerald-700";
    case "VIDEO":
      return "bg-blue-100 text-blue-700";
    case "LINK":
      return "bg-violet-100 text-violet-700";
    case "DOC":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function normalizeMaterialType(type) {
  return String(type || "DOC").toUpperCase();
}

export default function TeacherMaterialsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedCourseId = searchParams.get("course") || "";

  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [modalCourse, setModalCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [lessonMaterials, setLessonMaterials] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [savingMaterial, setSavingMaterial] = useState(false);
  const [deletingMaterialId, setDeletingMaterialId] = useState("");
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");
  const [editingMaterialId, setEditingMaterialId] = useState("");
  const [selectedDocumentFile, setSelectedDocumentFile] = useState(null);
  const [materialForm, setMaterialForm] = useState({
    title: "",
    external_url: "",
  });

  const totalMaterials = courses.reduce((sum, course) => sum + (course.material_count || 0), 0);
  const totalLessons = courses.reduce((sum, course) => sum + (course.lesson_count || 0), 0);
  const selectedLesson = useMemo(
    () => lessons.find((lesson) => lesson.lesson_id === selectedLessonId) || null,
    [lessons, selectedLessonId]
  );

  useEffect(() => {
    const auth = guardRoute("TEACHER", router);
    if (auth) {
      setUser(auth);
      fetchAssignedCourses(auth.user_id);
    }
  }, [router]);

  useEffect(() => {
    if (!modalCourse?.course_id || !selectedLessonId) {
      setLessonMaterials([]);
      return;
    }

    fetchLessonMaterials(selectedLessonId);
  }, [modalCourse?.course_id, selectedLessonId]);

  useEffect(() => {
    if (!requestedCourseId || !courses.length || modalCourse) {
      return;
    }

    const requestedCourse = courses.find((course) => course.course_id === requestedCourseId);

    if (requestedCourse) {
      openCourseModal(requestedCourse);
    }
  }, [courses, requestedCourseId]);

  useEffect(() => {
    if (!pathname) {
      return;
    }

    const nextUrl = modalCourse?.course_id
      ? `${pathname}?course=${encodeURIComponent(modalCourse.course_id)}`
      : pathname;

    router.replace(nextUrl, { scroll: false });
  }, [modalCourse?.course_id, pathname, router]);

  async function fetchAssignedCourses(teacherId) {
    setLoadingCourses(true);
    setError("");
    try {
      const res = await authFetch(`${API}/materials/teacher/${teacherId}/courses`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to load assigned courses.");
        setCourses([]);
        return;
      }

      setCourses(Array.isArray(data.courses) ? data.courses : []);
    } catch {
      setError("Network error. Please try again.");
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  }

  async function fetchLessons(courseId) {
    setLoadingLessons(true);
    setModalError("");
    try {
      const res = await authFetch(`${API}/lessons/course/${courseId}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setModalError(data.error || "Failed to load lessons for this course.");
        setLessons([]);
        setSelectedLessonId("");
        return;
      }

      const nextLessons = Array.isArray(data.lessons) ? data.lessons : [];
      setLessons(nextLessons);
      setSelectedLessonId((current) => {
        if (current && nextLessons.some((lesson) => lesson.lesson_id === current)) {
          return current;
        }
        return nextLessons[0]?.lesson_id || "";
      });
    } catch {
      setModalError("Network error while loading lessons.");
      setLessons([]);
      setSelectedLessonId("");
    } finally {
      setLoadingLessons(false);
    }
  }

  async function fetchLessonMaterials(lessonId) {
    setLoadingMaterials(true);
    setModalError("");
    try {
      const res = await authFetch(`${API}/materials/lesson/${lessonId}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setModalError(data.error || "Failed to load lesson materials.");
        setLessonMaterials([]);
        return;
      }

      setLessonMaterials(Array.isArray(data.materials) ? data.materials : []);
    } catch {
      setModalError("Network error while loading lesson materials.");
      setLessonMaterials([]);
    } finally {
      setLoadingMaterials(false);
    }
  }

  function resetMaterialEditor() {
    setEditingMaterialId("");
    setSelectedDocumentFile(null);
    setMaterialForm({
      title: "",
      external_url: "",
    });
  }

  async function openCourseModal(course) {
    setModalCourse(course);
    setLessons([]);
    setLessonMaterials([]);
    setSelectedLessonId("");
    setModalError("");
    setModalSuccess("");
    resetMaterialEditor();
    await fetchLessons(course.course_id);
  }

  function closeCourseModal() {
    if (pathname) {
      router.replace(pathname, { scroll: false });
    }
    setModalCourse(null);
    setLessons([]);
    setLessonMaterials([]);
    setSelectedLessonId("");
    setModalError("");
    setModalSuccess("");
    setDeletingMaterialId("");
    resetMaterialEditor();
  }

  function startEditMaterial(material) {
    setEditingMaterialId(material.material_id);
    setSelectedDocumentFile(null);
    setMaterialForm({
      title: material.title || "",
      external_url: material.external_url || "",
    });
    setModalError("");
    setModalSuccess("");
  }

  async function handleMaterialSubmit(event) {
    event.preventDefault();
    setModalError("");
    setModalSuccess("");

    if (!selectedLessonId) {
      setModalError("Please select a lesson first.");
      return;
    }

    if (!materialForm.title.trim()) {
      setModalError("Material title is required.");
      return;
    }

    const editingMaterial = editingMaterialId
      ? lessonMaterials.find((material) => material.material_id === editingMaterialId)
      : null;
    const hasExistingFile = Boolean(editingMaterial?.content_url);

    if (!selectedDocumentFile && !hasExistingFile && !materialForm.external_url.trim()) {
      setModalError("Please upload a document file or add an optional reference link.");
      return;
    }

    setSavingMaterial(true);
    try {
      const url = editingMaterialId ? `${API}/materials/${editingMaterialId}` : `${API}/materials`;
      const formData = new FormData();
      formData.append("lesson_id", selectedLessonId);
      formData.append("title", materialForm.title.trim());
      formData.append("external_url", materialForm.external_url.trim());
      if (selectedDocumentFile) {
        formData.append("document", selectedDocumentFile);
      }

      const res = await authFetch(url, {
        method: editingMaterialId ? "PUT" : "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setModalError(data.error || "Failed to save material.");
        return;
      }

      resetMaterialEditor();
      setModalSuccess(editingMaterialId ? "Material updated successfully." : "Material added successfully.");
      await fetchAssignedCourses(user.user_id);
      await fetchLessons(modalCourse.course_id);
      await fetchLessonMaterials(selectedLessonId);
    } catch {
      setModalError("Network error. Please try again.");
    } finally {
      setSavingMaterial(false);
    }
  }

  async function handleDeleteMaterial(materialId) {
    if (typeof window !== "undefined" && !window.confirm("Remove this material from the lesson?")) {
      return;
    }

    setDeletingMaterialId(materialId);
    setModalError("");
    setModalSuccess("");

    try {
      const res = await authFetch(`${API}/materials/${materialId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setModalError(data.error || "Failed to remove material.");
        return;
      }

      if (editingMaterialId === materialId) {
        resetMaterialEditor();
      }

      setModalSuccess("Material removed successfully.");
      await fetchAssignedCourses(user.user_id);
      await fetchLessons(modalCourse.course_id);
      await fetchLessonMaterials(selectedLessonId);
    } catch {
      setModalError("Network error. Please try again.");
    } finally {
      setDeletingMaterialId("");
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-indigo-600" size={26} /> Course Materials
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Open an assigned course, pick a lesson, and manage all PDFs, meeting links, and lesson resources there.
          </p>
        </div>
        <button
          onClick={() => user && fetchAssignedCourses(user.user_id)}
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
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-400">Assigned Courses</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{courses.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-400">Available Lessons</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{totalLessons}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-400">Total Materials</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{totalMaterials}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="text-indigo-600" size={18} />
          <h2 className="text-lg font-bold text-gray-900">Assigned Courses</h2>
        </div>

        {loadingCourses ? (
          <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
            <Loader size={18} className="animate-spin" /> Loading assigned courses...
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen size={40} className="mx-auto text-indigo-200 mb-3" />
            <p className="font-semibold text-gray-800">No courses assigned yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Ask an admin to assign a course to your teacher account first.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course.course_id}
                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
              >
                <div className="h-32 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-100 overflow-hidden mb-4">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-indigo-200">
                      <ImageIcon size={30} />
                    </div>
                  )}
                </div>

                <p className="text-xs font-mono text-gray-300">{course.course_id}</p>
                <h3 className="text-xl font-bold text-gray-900 mt-1">{course.title}</h3>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                  {course.description || "No course description available."}
                </p>

                <div className="grid grid-cols-2 gap-3 mt-5">
                  <div className="rounded-xl bg-indigo-50 px-3 py-3">
                    <p className="text-xs text-indigo-400">Lessons</p>
                    <p className="text-lg font-bold text-indigo-700">{course.lesson_count || 0}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-3">
                    <p className="text-xs text-slate-400">Materials</p>
                    <p className="text-lg font-bold text-slate-800">{course.material_count || 0}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openCourseModal(course)}
                  className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
                >
                  <NotebookPen size={16} /> Manage Lesson Materials
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
        Select any assigned course to open its lesson modal. Inside the modal, choose a lesson and add as many PDF links,
        meeting links, documents, videos, or other lesson resources as you need.
      </div>

      {modalCourse && (
        <div
          className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={closeCourseModal}
        >
          <div
            className="w-full max-w-7xl max-h-[92vh] overflow-hidden rounded-[28px] bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
                <p className="text-xs font-mono text-slate-300">{modalCourse.course_id}</p>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">{modalCourse.title}</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Choose a lesson first, then add or update the resources for that lesson only.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCourseModal}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(92vh-93px)] px-6 py-6">
              {modalError && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle size={16} /> {modalError}
                </div>
              )}

              {modalSuccess && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  <Plus size={16} /> {modalSuccess}
                </div>
              )}

              <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr] items-start">
                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Layers3 className="text-indigo-600" size={18} />
                      <h3 className="text-lg font-bold text-slate-900">Available Lessons</h3>
                    </div>

                    {loadingLessons ? (
                      <div className="flex items-center justify-center gap-2 py-10 text-slate-400">
                        <Loader size={18} className="animate-spin" /> Loading lessons...
                      </div>
                    ) : lessons.length === 0 ? (
                      <div className="space-y-3 text-sm text-slate-500">
                        <p>No lessons are available for this course yet.</p>
                        <Link
                          href={`/teacher/courses/${modalCourse.course_id}`}
                          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700 transition-colors"
                        >
                          Open Course Lessons
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {lessons.map((lesson) => (
                          <button
                            key={lesson.lesson_id}
                            type="button"
                            onClick={() => {
                              setSelectedLessonId(lesson.lesson_id);
                              setModalSuccess("");
                              setModalError("");
                              resetMaterialEditor();
                            }}
                            className={`w-full rounded-2xl border p-4 text-left transition-all ${
                              selectedLessonId === lesson.lesson_id
                                ? "border-indigo-400 bg-white shadow-sm"
                                : "border-slate-200 bg-white hover:border-indigo-200"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                                Lesson {lesson.lesson_order}
                              </span>
                              <span className="text-xs font-semibold text-slate-400">
                                {lesson.material_count || 0} materials
                              </span>
                            </div>
                            <h4 className="mt-3 text-base font-bold text-slate-900">{lesson.title}</h4>
                            <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                              {lesson.description || "No lesson summary added yet."}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="text-indigo-600" size={18} />
                      <h3 className="text-lg font-bold text-slate-900">Course Shortcuts</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/teacher/courses/${modalCourse.course_id}`}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Manage Lessons
                      </Link>
                      <Link
                        href={`/teacher/materials?course=${modalCourse.course_id}`}
                        className="inline-flex items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
                      >
                        Keep This Course Open
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <LinkIcon className="text-indigo-600" size={18} />
                      <h3 className="text-lg font-bold text-slate-900">
                        {selectedLesson ? `${selectedLesson.title} Materials` : "Lesson Materials"}
                      </h3>
                    </div>

                    {!selectedLesson ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                        Select a lesson from the left to see and manage its materials.
                      </div>
                    ) : loadingMaterials ? (
                      <div className="flex items-center justify-center gap-2 py-10 text-slate-400">
                        <Loader size={18} className="animate-spin" /> Loading lesson materials...
                      </div>
                    ) : lessonMaterials.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
                        <FileText size={40} className="mx-auto text-indigo-200 mb-3" />
                        <p className="font-semibold text-slate-800">No materials added to this lesson yet</p>
                        <p className="mt-2 text-sm text-slate-500">
                          Use the form below to add PDFs, meeting links, documents, or other lesson resources.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {lessonMaterials.map((material) => {
                          const href = getMaterialHref(material.content_url);
                          return (
                            <div key={material.material_id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getTypeClasses(material.material_type)}`}>
                                      {normalizeMaterialType(material.material_type)}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                      Added on{" "}
                                      {new Date(material.created_at).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </span>
                                  </div>
                                  <h4 className="text-lg font-bold text-slate-900">{material.title}</h4>
                                  {href ? (
                                    <a
                                      href={href}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                                    >
                                      Open Document <ExternalLink size={14} />
                                    </a>
                                  ) : (
                                    <p className="text-sm text-slate-500">No document uploaded.</p>
                                  )}
                                  {material.external_url && (
                                    <a
                                      href={getMaterialHref(material.external_url) || material.external_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                                    >
                                      Open Reference Link <ExternalLink size={14} />
                                    </a>
                                  )}
                                </div>

                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => startEditMaterial(material)}
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                  >
                                    <Pencil size={14} /> Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteMaterial(material.material_id)}
                                    disabled={deletingMaterialId === material.material_id}
                                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                                  >
                                    {deletingMaterialId === material.material_id ? (
                                      <Loader size={14} className="animate-spin" />
                                    ) : (
                                      <Trash2 size={14} />
                                    )}
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {editingMaterialId ? "Update Lesson Material" : "Add Lesson Material"}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                          {selectedLesson
                            ? `This resource will belong to Lesson ${selectedLesson.lesson_order}: ${selectedLesson.title}.`
                            : "Select a lesson before adding a resource."}
                        </p>
                      </div>
                      {editingMaterialId && (
                        <button
                          type="button"
                          onClick={resetMaterialEditor}
                          className="text-sm font-semibold text-slate-500 hover:text-slate-700"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>

                    <form onSubmit={handleMaterialSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Selected Lesson</label>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                          {selectedLesson
                            ? `Lesson ${selectedLesson.lesson_order} - ${selectedLesson.title}`
                            : "No lesson selected"}
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-[1.2fr_0.8fr] gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Material Title</label>
                          <input
                            value={materialForm.title}
                            onChange={(event) =>
                              setMaterialForm((current) => ({ ...current, title: event.target.value }))
                            }
                            placeholder="e.g. Lesson 2 PDF Notes"
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Upload Document</label>
                          <input
                            type="file"
                            onChange={(event) => setSelectedDocumentFile(event.target.files?.[0] || null)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                          />
                          {editingMaterialId && (
                            <p className="mt-1 text-xs text-slate-500">
                              Leave empty to keep the current document.
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Optional Reference Link
                        </label>
                        <input
                          value={materialForm.external_url}
                          onChange={(event) =>
                            setMaterialForm((current) => ({ ...current, external_url: event.target.value }))
                          }
                          placeholder="https://drive.google.com/... or any supporting URL"
                          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          type="submit"
                          disabled={savingMaterial || !selectedLesson}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
                        >
                          {savingMaterial ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />}
                          {savingMaterial
                            ? "Saving Material..."
                            : editingMaterialId
                            ? "Update Material"
                            : "Add Material"}
                        </button>

                        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                          <FileText size={16} className="text-indigo-600" />
                          Upload any document type. Reference link is optional.
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
