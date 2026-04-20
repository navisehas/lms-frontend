"use client";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle, ArrowLeft, Loader, Download,
  Clock, User, DollarSign, Lock,
  BookOpen, FileText, ExternalLink, BadgeCheck,
  ChevronDown, ChevronRight, PlayCircle,
  RefreshCw, Tag, File, FileVideo,
  FileImage, Link2, Search, X, Eye,
} from "lucide-react";
import { authFetch, guardRoute } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;
const POLL_INTERVAL = 5000;

// ─── Authenticated file fetcher ─────────────────────────────────────────────
// Materials now live in Postgres as base64, so we must hit the API with the
// auth token and build a blob URL to preview/download. No more public /uploads.
async function fetchMaterialBlob(materialId) {
  const res = await authFetch(`${API}/materials/${materialId}/file`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to fetch file");
  }
  return await res.blob();
}

async function handleDownloadMaterial(material) {
  try {
    const blob = await fetchMaterialBlob(material.material_id);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = material.title || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Revoke after a moment so the browser has time to start the download
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  } catch (err) {
    alert("Download failed. Please try again.");
  }
}

async function handlePreviewMaterial(material) {
  try {
    const blob = await fetchMaterialBlob(material.material_id);
    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    // Keep the blob URL alive briefly so the new tab can load it
    setTimeout(() => window.URL.revokeObjectURL(url), 60 * 1000);
  } catch (err) {
    alert("Preview failed. Please try again.");
  }
}

// ─── Auto-detect material type from title / URL / MIME ──────────────────────
function detectMaterialType(material) {
  const name = (material.title || "").toLowerCase();
  const ext  = name.includes(".") ? name.split(".").pop() : "";
  if (ext === "pdf") return "PDF";
  if (["mp4","mov","avi","mkv","webm","flv","wmv"].includes(ext)) return "VIDEO";
  if (["jpg","jpeg","png","gif","webp","svg","bmp"].includes(ext)) return "IMAGE";
  if (["ppt","pptx","xls","xlsx","doc","docx","txt","rtf","odt","sql","csv","json","xml","zip","rar"].includes(ext)) return "DOC";

  const exUrl = (material.external_url || "").toLowerCase();
  if (exUrl) {
    if (exUrl.includes("zoom.us") || exUrl.includes("meet.google") || exUrl.includes("teams.microsoft") || exUrl.includes("webex.com") || exUrl.includes("whereby.com") || exUrl.includes("skype.com")) return "MEETING";
    if (exUrl.includes("youtube.com") || exUrl.includes("youtu.be") || exUrl.includes("vimeo.com") || exUrl.includes("loom.com") || exUrl.includes("dailymotion.com")) return "VIDEO";
    if (exUrl.match(/\.pdf(\?|#|$)/)) return "PDF";
    if (exUrl.match(/\.(mp4|mov|avi|mkv|webm|flv|wmv)(\?|#|$)/)) return "VIDEO";
    if (exUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|#|$)/)) return "IMAGE";
    if (exUrl.startsWith("http")) return "LINK";
  }

  // Use stored MIME from backend as another hint
  const mime = (material.content_mime || "").toLowerCase();
  if (mime) {
    if (mime === "application/pdf") return "PDF";
    if (mime.startsWith("video/")) return "VIDEO";
    if (mime.startsWith("image/")) return "IMAGE";
    if (mime.includes("word") || mime.includes("excel") || mime.includes("spreadsheet") || mime.includes("presentation") || mime.startsWith("text/")) return "DOC";
  }

  const explicit = material.material_type?.toUpperCase();
  if (explicit && explicit !== "OTHER" && explicit !== "DOC") return explicit;

  return "DOC";
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getTypeIcon(type, externalUrl) {
  if (externalUrl) {
    const lower = (externalUrl || "").toLowerCase();
    if (lower.includes("zoom.us") || lower.includes("meet.google.com") || lower.includes("teams.microsoft.com") || lower.includes("webex.com")) return <PlayCircle size={14} className="text-green-500" />;
    if (lower.includes("youtube.com") || lower.includes("youtu.be") || lower.includes("vimeo.com") || lower.includes("loom.com")) return <FileVideo size={14} className="text-purple-500" />;
  }
  switch (type?.toUpperCase()) {
    case "PDF":     return <FileText size={14} className="text-red-500" />;
    case "VIDEO":   return <FileVideo size={14} className="text-purple-500" />;
    case "LINK":    return <Link2 size={14} className="text-blue-500" />;
    case "MEETING": return <PlayCircle size={14} className="text-green-500" />;
    case "DOC":     return <File size={14} className="text-blue-500" />;
    case "IMAGE":   return <FileImage size={14} className="text-pink-400" />;
    default:        return <FileImage size={14} className="text-gray-400" />;
  }
}

function getTypeBadgeStyle(type) {
  switch (type?.toUpperCase()) {
    case "PDF":     return "bg-red-50 text-red-600 border-red-100";
    case "VIDEO":   return "bg-purple-50 text-purple-600 border-purple-100";
    case "LINK":    return "bg-blue-50 text-blue-600 border-blue-100";
    case "MEETING": return "bg-green-50 text-green-600 border-green-100";
    case "DOC":     return "bg-blue-50 text-blue-600 border-blue-100";
    case "IMAGE":   return "bg-pink-50 text-pink-500 border-pink-100";
    default:        return "bg-gray-50 text-gray-500 border-gray-100";
  }
}

// Decide whether a file can be previewed inline (PDF / image / video).
// Office docs and zips have to be downloaded — browsers can't render them.
function isPreviewable(material) {
  const type = detectMaterialType(material);
  if (["PDF", "IMAGE", "VIDEO"].includes(type)) return true;
  const mime = (material.content_mime || "").toLowerCase();
  if (mime === "application/pdf") return true;
  if (mime.startsWith("image/")) return true;
  if (mime.startsWith("video/")) return true;
  return false;
}

// ─── Material Row ─────────────────────────────────────────────────────────────
function MaterialCard({ material }) {
  const externalUrl = material.external_url;
  const resolvedType = detectMaterialType(material);
  const hasFile = material.has_file === true || material.has_file === "true";
  const canPreview = hasFile && isPreviewable(material);

  const [busy, setBusy] = useState(null); // 'preview' | 'download' | null

  async function onPreview() {
    setBusy("preview");
    try { await handlePreviewMaterial(material); } finally { setBusy(null); }
  }
  async function onDownload() {
    setBusy("download");
    try { await handleDownloadMaterial(material); } finally { setBusy(null); }
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 transition-colors rounded-xl gap-4 group hover:bg-blue-50/60">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-lg border shadow-sm flex items-center justify-center bg-white border-gray-100">
            {getTypeIcon(resolvedType, externalUrl)}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate leading-tight text-gray-800">
            {material.title}
          </p>
          <span className={`inline-flex items-center text-xs font-medium border rounded-full px-2 py-0.5 mt-0.5 ${getTypeBadgeStyle(resolvedType)}`}>
            {resolvedType}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-shrink-0 items-center">
        {canPreview && (
          <button
            onClick={onPreview}
            disabled={busy !== null}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            {busy === "preview" ? <Loader size={11} className="animate-spin" /> : <Eye size={11} />}
            View
          </button>
        )}
        {hasFile && (
          <button
            onClick={onDownload}
            disabled={busy !== null}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            {busy === "download" ? <Loader size={11} className="animate-spin" /> : <Download size={11} />}
            Download
          </button>
        )}
        {externalUrl && (
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-800 bg-blue-100 hover:bg-blue-200 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ExternalLink size={11} /> Open
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Subtopic Section ─────────────────────────────────────────────────────────
function SubtopicSection({ subtopic, materials, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const isUncategorized = subtopic === "__none__";

  return (
    <div className="rounded-xl overflow-hidden border border-blue-100">
      {!isUncategorized && (
        <button
          onClick={() => setOpen(v => !v)}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition text-left"
        >
          <div className="flex items-center gap-2">
            <Tag size={12} className="text-blue-500 flex-shrink-0" />
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">{subtopic}</span>
            <span className="text-xs text-blue-400 font-medium">
              {materials.length} file{materials.length !== 1 ? "s" : ""}
            </span>
          </div>
          {open
            ? <ChevronDown size={13} className="text-blue-400" />
            : <ChevronRight size={13} className="text-blue-400" />}
        </button>
      )}

      {(open || isUncategorized) && (
        <div className="divide-y divide-gray-50 px-2 py-1">
          {materials.map((mat) => (
            <MaterialCard key={mat.material_id} material={mat} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Lesson Block ─────────────────────────────────────────────────────────────
function LessonBlock({ lesson, index, isOpen, onToggle }) {
  const subtopicGroups = useMemo(() => {
    const groups = new Map();
    (lesson.materials || []).forEach((m) => {
      const raw = m.subtopic ?? m.sub_topic ?? m.subTopic ?? m.category ?? m.topic ?? null;
      const key = (typeof raw === "string" && raw.trim()) ? raw.trim() : "__none__";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(m);
    });
    return Array.from(groups.entries()).sort(([a], [b]) => {
      if (a === "__none__") return 1;
      if (b === "__none__") return -1;
      return a.localeCompare(b);
    });
  }, [lesson.materials]);

  const totalMaterials = lesson.materials?.length || 0;
  const subtopicCount = subtopicGroups.filter(([k]) => k !== "__none__").length;

  return (
    <div className="bg-white rounded-2xl border overflow-hidden shadow-sm transition-colors border-blue-100">
      {/* Lesson Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-blue-50/40 transition-colors text-left"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <span className="w-8 h-8 rounded-xl text-white text-xs font-extrabold flex items-center justify-center shadow-sm bg-blue-700">
              {index + 1}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{lesson.lessonTitle}</p>
            {lesson.lessonDescription && (
              <p className="text-xs text-gray-400 mt-0.5 truncate">{lesson.lessonDescription}</p>
            )}
          </div>

          {/* Stats pills */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {subtopicCount > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1 text-xs text-indigo-500 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full font-medium">
                <Tag size={10} /> {subtopicCount} topic{subtopicCount !== 1 ? "s" : ""}
              </span>
            )}
            <span className="text-xs text-blue-500 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full font-medium">
              {totalMaterials} file{totalMaterials !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="ml-3 flex items-center gap-2 flex-shrink-0">
          {isOpen
            ? <ChevronDown size={16} className="text-blue-400" />
            : <ChevronRight size={16} className="text-blue-400" />}
        </div>
      </button>

      {/* Subtopic Groups */}
      {isOpen && (
        <div className="border-t border-blue-50 px-3 py-3 space-y-2">
          {totalMaterials === 0 ? (
            <p className="text-xs text-gray-400 text-center py-5">No materials in this lesson yet.</p>
          ) : (
            subtopicGroups.map(([subtopic, mats]) => (
              <SubtopicSection
                key={subtopic}
                subtopic={subtopic}
                materials={mats}
                defaultOpen={true}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Course Summary Bar ───────────────────────────────────────────────────────
function CourseSummaryBar({ lessonBlocks }) {
  const totalLessons = lessonBlocks.length;
  const totalFiles = lessonBlocks.reduce((s, l) => s + (l.materials?.length || 0), 0);
  const totalTopics = lessonBlocks.reduce((s, l) => {
    const unique = new Set((l.materials || []).map(m => m.subtopic).filter(Boolean));
    return s + unique.size;
  }, 0);

  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { icon: <BookOpen size={15} className="text-blue-600" />, value: totalLessons, label: "Lessons", bg: "bg-blue-50 border-blue-100" },
        { icon: <Tag size={15} className="text-indigo-500" />,    value: totalTopics,  label: "Topics",  bg: "bg-indigo-50 border-indigo-100" },
        { icon: <FileText size={15} className="text-blue-500" />, value: totalFiles,   label: "Files",   bg: "bg-blue-50 border-blue-100" },
      ].map((stat) => (
        <div key={stat.label} className={`${stat.bg} border rounded-xl px-3 py-3 flex items-center gap-2.5`}>
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm flex-shrink-0">
            {stat.icon}
          </div>
          <div>
            <p className="text-base font-extrabold text-gray-900 leading-none">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CourseDetailsPage() {
  const router   = useRouter();
  const params   = useParams();
  const courseId = params?.id;

  const [user,            setUser]            = useState(null);
  const [course,          setCourse]          = useState(null);
  const [materials,       setMaterials]       = useState([]);
  const [lessons,         setLessons]         = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState("");
  const [isEnrolled,      setIsEnrolled]      = useState(false);
  const [openLessons,     setOpenLessons]     = useState({});
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [searchQuery,     setSearchQuery]     = useState("");

  const pollTimer = useRef(null);
  const userRef   = useRef(null);

  // ── Build lesson blocks from flat materials array ────────────────────────
  const lessonBlocks = useMemo(() => {
    const byLessonId = new Map();

    materials.forEach((m) => {
      const key = m.lesson_id || m.lesson_title || "General";
      if (!byLessonId.has(key)) {
        byLessonId.set(key, {
          lessonId:          m.lesson_id || null,
          lessonTitle:       m.lesson_title || (m.lesson_id ? `Lesson` : "General"),
          lessonDescription: null,
          lessonOrder:       999,
          materials:         [],
        });
      }
      byLessonId.get(key).materials.push(m);
    });

    // Merge in lesson metadata (title/description/order from /lessons endpoint)
    lessons.forEach((l) => {
      if (byLessonId.has(l.lesson_id)) {
        const block = byLessonId.get(l.lesson_id);
        block.lessonTitle       = l.title || block.lessonTitle;
        block.lessonDescription = l.description || null;
        block.lessonOrder       = l.lesson_order ?? block.lessonOrder;
      }
    });

    return Array.from(byLessonId.values()).sort((a, b) => a.lessonOrder - b.lessonOrder);
  }, [materials, lessons]);

  // ── Filter by search query (matches lesson title, subtopic, or file name) ─
  const filteredLessonBlocks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return lessonBlocks;
    return lessonBlocks
      .map((lb) => {
        const lessonMatch = lb.lessonTitle?.toLowerCase().includes(q) || lb.lessonDescription?.toLowerCase().includes(q);
        const filteredMaterials = (lb.materials || []).filter((m) =>
          m.title?.toLowerCase().includes(q) ||
          (m.subtopic ?? m.sub_topic ?? m.subTopic ?? "")?.toLowerCase().includes(q)
        );
        if (lessonMatch) return lb;
        if (filteredMaterials.length > 0) return { ...lb, materials: filteredMaterials };
        return null;
      })
      .filter(Boolean);
  }, [lessonBlocks, searchQuery]);

  // Auto-open all lessons once they load
  useEffect(() => {
    if (lessonBlocks.length > 0) {
      const initial = {};
      lessonBlocks.forEach((lb) => { initial[lb.lessonId || lb.lessonTitle] = true; });
      setOpenLessons(initial);
    }
  }, [lessonBlocks]);

  const toggleLesson = useCallback((key) => {
    setOpenLessons(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const expandAll = useCallback(() => {
    const all = {};
    lessonBlocks.forEach(lb => { all[lb.lessonId || lb.lessonTitle] = true; });
    setOpenLessons(all);
  }, [lessonBlocks]);

  const collapseAll = useCallback(() => {
    setOpenLessons({});
  }, []);

  // ── Auth + initial data load ──────────────────────────────────────────────
  useEffect(() => {
    if (!router || !courseId) return;

    const init = async () => {
      let u = null;
      try {
        u = guardRoute("STUDENT", router);
      } catch (err) {
        console.error("guardRoute error:", err);
        return;
      }
      if (!u) return;
      setUser(u);
      userRef.current = u;

      try {
        const [courseRes, materialsRes] = await Promise.all([
          authFetch(`${API}/courses/${courseId}`),
          authFetch(`${API}/courses/${courseId}/materials`),
        ]);

        if (!courseRes.ok) { setError("Course not found."); setLoading(false); return; }
        const courseData = await courseRes.json();
        setCourse(courseData);

        if (materialsRes.ok) {
          const matData = await materialsRes.json();
          if (matData.success) {
            setMaterials(matData.materials || []);
            setIsEnrolled(true);
          }
        } else if (materialsRes.status === 403) {
          setIsEnrolled(false);
        }

        // Lessons metadata (best-effort — no error shown if unavailable)
        try {
          const lessonsRes = await authFetch(`${API}/lessons/course/${courseId}`);
          if (lessonsRes.ok) {
            const ld = await lessonsRes.json();
            setLessons(ld.lessons || []);
          }
        } catch (_) {}
      } catch (err) {
        setError("Failed to load course.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [courseId, router]);

  // ── Poll for enrollment while locked (catches payment confirmations) ─────
  const checkEnrollment = useCallback(async () => {
    try {
      const res = await authFetch(`${API}/courses/${courseId}/materials`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMaterials(data.materials || []);
          setIsEnrolled(true);
          clearInterval(pollTimer.current);
        }
      }
    } catch (_) {}
  }, [courseId]);

  const handleManualRefresh = useCallback(async () => {
    setCheckingPayment(true);
    await checkEnrollment();
    setCheckingPayment(false);
  }, [checkEnrollment]);

  useEffect(() => {
    if (!isEnrolled && user && user.role === "STUDENT") {
      pollTimer.current = setInterval(checkEnrollment, POLL_INTERVAL);
    }
    return () => clearInterval(pollTimer.current);
  }, [isEnrolled, user, checkEnrollment]);

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader size={28} className="animate-spin text-blue-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="mx-auto mb-3 text-red-400" size={32} />
        <p className="text-red-600 font-semibold">{error}</p>
        <Link href="/student/courses" className="mt-4 inline-block text-sm text-blue-600 underline">
          Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-3 py-5 space-y-5 pb-16">
      {/* Back */}
      <Link href="/student/courses" className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium">
        <ArrowLeft size={14} /> Back to Courses
      </Link>

      {course && (
        <>
          {/* Course Header Card */}
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-extrabold text-gray-900 leading-tight">{course.title}</h1>
                {course.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{course.description}</p>
                )}
              </div>
              {isEnrolled ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 text-xs font-bold flex-shrink-0">
                  <BadgeCheck size={13} /> Enrolled
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1.5 text-xs font-bold flex-shrink-0">
                  <Lock size={13} /> Locked
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {course.teacher_name && (
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-xs text-blue-400 flex items-center gap-1 mb-1"><User size={11} /> Teacher</p>
                  <p className="font-bold text-gray-800 text-sm">{course.teacher_name}</p>
                </div>
              )}
              {course.duration && (
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-xs text-blue-400 flex items-center gap-1 mb-1"><Clock size={11} /> Duration</p>
                  <p className="font-bold text-gray-800 text-sm">{course.duration}</p>
                </div>
              )}
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-xs text-blue-400 flex items-center gap-1 mb-1"><DollarSign size={11} /> Monthly Fee</p>
                <p className="font-bold text-blue-700 text-sm">
                  {course.fee > 0 ? `Rs. ${parseFloat(course.fee).toLocaleString()}` : "Free"}
                </p>
              </div>
            </div>
          </div>

          {/* ── Materials Section ───────────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <BookOpen size={17} className="text-blue-600" /> Course Materials
              </h2>
              <div className="flex items-center gap-2">
                {isEnrolled && materials.length > 0 && (
                  <>
                    <span className="text-xs text-blue-500 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full font-medium">
                      {materials.length} file{materials.length !== 1 ? "s" : ""}
                    </span>
                    <button onClick={expandAll}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 hover:bg-blue-50 rounded-lg transition">
                      Expand all
                    </button>
                    <button onClick={collapseAll}
                      className="text-xs text-gray-500 hover:text-gray-700 font-medium px-2 py-1 hover:bg-gray-100 rounded-lg transition">
                      Collapse
                    </button>
                  </>
                )}
                {!isEnrolled && (
                  <button
                    onClick={handleManualRefresh}
                    disabled={checkingPayment}
                    className="inline-flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={12} className={checkingPayment ? "animate-spin" : ""} />
                    Check Payment
                  </button>
                )}
              </div>
            </div>

            {/* Search bar */}
            {isEnrolled && materials.length > 0 && (
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search lessons, topics or files…"
                  className="w-full pl-9 pr-9 py-2.5 text-sm bg-white border border-blue-100 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 placeholder-gray-400 text-gray-800 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            )}

            {/* ── Not Enrolled ── */}
            {!isEnrolled ? (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <Lock size={28} className="text-amber-400" />
                </div>
                <p className="text-amber-900 font-bold text-base mb-2">Materials Locked</p>
                <p className="text-amber-600 text-sm mb-3 max-w-xs mx-auto">
                  Complete your payment to unlock all lessons and course materials.
                </p>
                <p className="text-amber-500 text-xs mb-6">
                  After payment confirmation, materials will appear here automatically.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/student/payments"
                    className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm shadow-sm">
                    <Lock size={14} /> Go to Payments
                  </Link>
                  <button onClick={handleManualRefresh} disabled={checkingPayment}
                    className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-amber-600 border border-amber-200 font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
                    <RefreshCw size={14} className={checkingPayment ? "animate-spin" : ""} />
                    {checkingPayment ? "Checking..." : "Refresh Status"}
                  </button>
                </div>
              </div>

            ) : materials.length === 0 ? (
              <div className="text-center py-14 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <BookOpen size={26} className="text-blue-300" />
                </div>
                <p className="text-gray-600 font-semibold">No materials yet</p>
                <p className="text-gray-400 text-sm mt-1">Your teacher will add them soon.</p>
              </div>

            ) : (
              <>
                {/* Summary bar */}
                <CourseSummaryBar lessonBlocks={lessonBlocks} />

                {/* Lesson blocks */}
                <div className="space-y-3">
                  {filteredLessonBlocks.length === 0 ? (
                    <div className="text-center py-10 bg-blue-50 rounded-2xl border border-blue-100">
                      <Search size={22} className="mx-auto text-blue-300 mb-2" />
                      <p className="text-gray-500 font-semibold text-sm">No results for "{searchQuery}"</p>
                      <p className="text-gray-400 text-xs mt-1">Try a different keyword.</p>
                    </div>
                  ) : (
                    filteredLessonBlocks.map((lb, idx) => {
                      const key = lb.lessonId || lb.lessonTitle;
                      return (
                        <LessonBlock
                          key={key}
                          lesson={lb}
                          index={idx}
                          isOpen={!!openLessons[key]}
                          onToggle={() => toggleLesson(key)}
                        />
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
