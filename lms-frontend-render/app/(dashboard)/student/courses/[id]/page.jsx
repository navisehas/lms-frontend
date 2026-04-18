"use client";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle, ArrowLeft, Loader, Download,
  Clock, User, DollarSign, Lock,
  BookOpen, FileText, ExternalLink, BadgeCheck,
  ChevronDown, ChevronRight, GraduationCap, PlayCircle,
  RefreshCw, CheckCircle, Tag, Layers, File, FileVideo,
  FileImage, Link2, FolderOpen, BookMarked, Search, X,
} from "lucide-react";
import { authFetch, guardRoute } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;
const POLL_INTERVAL = 5000;

function getMaterialHref(value) {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  const path = value.startsWith("/") ? value : `/${value}`;
  return `${API}${path}`;
}

const handleDownload = async (url, filename) => {
  try {
    if (url.startsWith("http")) { window.open(url, "_blank"); return; }
    const response = await authFetch(url, { method: "GET" });
    if (!response.ok) throw new Error("Download failed");
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    window.open(url, "_blank");
  }
};

// ─── Auto-detect material type from URL/filename ──────────────────────────────
function detectMaterialType(material) {
  // 1. Detect from title/filename FIRST (most reliable for uploaded files)
  const name = (material.title || "").toLowerCase();
  const ext  = name.includes(".") ? name.split(".").pop() : "";
  if (ext === "pdf") return "PDF";
  if (["mp4","mov","avi","mkv","webm","flv","wmv"].includes(ext)) return "VIDEO";
  if (["jpg","jpeg","png","gif","webp","svg","bmp"].includes(ext)) return "IMAGE";
  if (["ppt","pptx","xls","xlsx","doc","docx","txt","rtf","odt","sql","csv","json","xml","zip","rar"].includes(ext)) return "DOC";

  // 2. Detect from external_url
  const exUrl = (material.external_url || "").toLowerCase();
  if (exUrl) {
    if (exUrl.includes("zoom.us") || exUrl.includes("meet.google") || exUrl.includes("teams.microsoft") || exUrl.includes("webex.com") || exUrl.includes("whereby.com") || exUrl.includes("skype.com")) return "MEETING";
    if (exUrl.includes("youtube.com") || exUrl.includes("youtu.be") || exUrl.includes("vimeo.com") || exUrl.includes("loom.com") || exUrl.includes("dailymotion.com")) return "VIDEO";
    if (exUrl.match(/\.pdf(\?|#|$)/)) return "PDF";
    if (exUrl.match(/\.(mp4|mov|avi|mkv|webm|flv|wmv)(\?|#|$)/)) return "VIDEO";
    if (exUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|#|$)/)) return "IMAGE";
    if (exUrl.startsWith("http")) return "LINK";
  }

  // 3. Detect from content_url path
  const cUrl = (material.content_url || "").toLowerCase();
  if (cUrl) {
    if (cUrl.match(/\.pdf(\?|#|$)/)) return "PDF";
    if (cUrl.match(/\.(mp4|mov|avi|mkv|webm)(\?|#|$)/)) return "VIDEO";
    if (cUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|#|$)/)) return "IMAGE";
    if (cUrl.match(/\.(doc|docx|ppt|pptx|xls|xlsx)(\?|#|$)/)) return "DOC";
  }

  // 4. Fall back to explicit DB value if meaningful (skip "DOC" — it's just the default)
  const explicit = material.material_type?.toUpperCase();
  if (explicit && explicit !== "OTHER" && explicit !== "DOC") return explicit;

  return "DOC";
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getTypeIcon(type, externalUrl) {
  if (externalUrl) {
    const lower = (externalUrl || "").toLowerCase();
    if (
      lower.includes("zoom.us") ||
      lower.includes("meet.google.com") ||
      lower.includes("teams.microsoft.com") ||
      lower.includes("webex.com")
    ) return <PlayCircle size={14} className="text-green-500" />;
    if (
      lower.includes("youtube.com") ||
      lower.includes("youtu.be") ||
      lower.includes("vimeo.com") ||
      lower.includes("loom.com")
    ) return <FileVideo size={14} className="text-purple-500" />;
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

// ─── Type badge style (matching student page) ────────────────────────────────
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

// ─── Material Row ─────────────────────────────────────────────────────────────
function MaterialCard({ material, index }) {
  const downloadUrl = getMaterialHref(material.content_url);
  const externalUrl = material.external_url;

  // ✅ FIX: auto-detect the type so badge always shows correctly
  const resolvedType = detectMaterialType(material);

  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-blue-50/60 transition-colors rounded-xl gap-4 group">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Number + Icon */}
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 shadow-sm flex items-center justify-center">
            {getTypeIcon(resolvedType, externalUrl)}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate leading-tight">{material.title}</p>
          <span className={`inline-flex items-center text-xs font-medium border rounded-full px-2 py-0.5 mt-0.5 ${getTypeBadgeStyle(resolvedType)}`}>
            {resolvedType}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-shrink-0">
        {downloadUrl && material.content_url && (
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
            onClick={(e) => {
              if (!downloadUrl.startsWith("http")) {
                e.preventDefault();
                handleDownload(downloadUrl, material.title);
              }
            }}
          >
            <Download size={11} /> Download
          </a>
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
      {/* Subtopic header — only show if it has a real name */}
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

      {/* Materials list */}
      {(open || isUncategorized) && (
        <div className={`divide-y divide-gray-50 ${!isUncategorized ? "px-2 py-1" : "px-2 py-1"}`}>
          {materials.map((mat, i) => (
            <MaterialCard key={mat.material_id} material={mat} index={i} />
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
    // Sort: named subtopics alphabetically, __none__ last
    return Array.from(groups.entries()).sort(([a], [b]) => {
      if (a === "__none__") return 1;
      if (b === "__none__") return -1;
      return a.localeCompare(b);
    });
  }, [lesson.materials]);

  const totalMaterials = lesson.materials?.length || 0;
  const subtopicCount = subtopicGroups.filter(([k]) => k !== "__none__").length;

  return (
    <div className="bg-white rounded-2xl border border-blue-100 overflow-hidden shadow-sm">
      {/* Lesson Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-blue-50/40 transition-colors text-left"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="w-8 h-8 rounded-xl bg-blue-700 text-white text-xs font-extrabold flex items-center justify-center flex-shrink-0 shadow-sm">
            {index + 1}
          </span>
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
        <div className="ml-3 flex-shrink-0">
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

// ─── Course Progress Summary ──────────────────────────────────────────────────
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
  const courseId = params.id;

  const [user,            setUser]            = useState(null);
  const [course,          setCourse]          = useState(null);
  const [materials,       setMaterials]       = useState([]);
  const [lessons,         setLessons]         = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState("");
  const [isEnrolled,      setIsEnrolled]      = useState(false);
  const [openLessons,     setOpenLessons]     = useState({});
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [paymentChecked,  setPaymentChecked]  = useState(false);
  const [searchQuery,     setSearchQuery]     = useState("");

  const pollTimer = useRef(null);
  const userRef   = useRef(null);

  // ── Build lesson blocks ───────────────────────────────────────────────────
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

  // ── Filtered lesson blocks based on search ────────────────────────────────
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
        if (lessonMatch) return lb; // show entire lesson if lesson title matches
        if (filteredMaterials.length > 0) return { ...lb, materials: filteredMaterials };
        return null;
      })
      .filter(Boolean);
  }, [lessonBlocks, searchQuery]);

  // Auto-open all lessons
  useEffect(() => {
    if (lessonBlocks.length > 0) {
      const initial = {};
      lessonBlocks.forEach((lb) => { initial[lb.lessonId || lb.lessonTitle] = true; });
      setOpenLessons(initial);
    }
  }, [lessonBlocks.length]);

  function toggleLesson(key) {
    setOpenLessons((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  // Expand / collapse all
  function expandAll() {
    const all = {};
    lessonBlocks.forEach((lb) => { all[lb.lessonId || lb.lessonTitle] = true; });
    setOpenLessons(all);
  }
  function collapseAll() {
    const all = {};
    lessonBlocks.forEach((lb) => { all[lb.lessonId || lb.lessonTitle] = false; });
    setOpenLessons(all);
  }

  // ── Fetch helpers ─────────────────────────────────────────────────────────
  const fetchMaterials = useCallback(async (cId) => {
    try {
      const matRes  = await authFetch(`${API}/courses/${cId}/materials`);
      const matData = await matRes.json();
      if (!matRes.ok || !matData.success) {
        setMaterials([]);
        if (matData.error) setError(matData.error);
      } else {
        setMaterials(matData.materials || []);
        setError("");
      }
    } catch (_) { setMaterials([]); }
  }, []);

  const fetchLessons = useCallback(async (cId) => {
    try {
      const res = await authFetch(`${API}/courses/${cId}/lessons`);
      if (res.ok) { const data = await res.json(); setLessons(data.lessons || []); }
    } catch (_) {}
  }, []);

  const fetchCourseDetails = useCallback(async (studentId, silent = false) => {
    if (!studentId || !courseId) return;
    if (!silent) setLoading(true);
    try {
      const courseRes = await authFetch(`${API}/courses/${courseId}`);
      if (!courseRes.ok) {
        if (!silent) setError("Course not found.");
        setCourse(null);
        return;
      }
      const courseData = await courseRes.json();
      setCourse(courseData);

      const enrollRes = await authFetch(`${API}/payments/courses/${studentId}`);
      if (enrollRes.ok) {
        const enrollData    = await enrollRes.json();
        const matchedCourse = (enrollData.courses || []).find((c) => c.course_id === courseId);
        const enrolled      = Boolean(matchedCourse?.is_enrolled);

        if (enrolled !== isEnrolled) {
          setIsEnrolled(enrolled);
          if (enrolled) {
            await Promise.all([fetchMaterials(courseId), fetchLessons(courseId)]);
            setPaymentChecked(true);
            setTimeout(() => setPaymentChecked(false), 5000);
            if (pollTimer.current) { clearInterval(pollTimer.current); pollTimer.current = null; }
          } else {
            setMaterials([]);
          }
        } else if (enrolled && materials.length === 0 && !silent) {
          await Promise.all([fetchMaterials(courseId), fetchLessons(courseId)]);
        }
      }
    } catch (_) {
      if (!silent) setError("Failed to load course details.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [courseId, isEnrolled, materials.length, fetchMaterials, fetchLessons]);

  const checkPaymentStatus = useCallback(async (studentId) => {
    if (!studentId || !courseId) return;
    try {
      const enrollRes  = await authFetch(`${API}/payments/courses/${studentId}`);
      if (enrollRes.ok) {
        const enrollData    = await enrollRes.json();
        const matchedCourse = (enrollData.courses || []).find((c) => c.course_id === courseId);
        const enrolled      = Boolean(matchedCourse?.is_enrolled);
        if (enrolled !== isEnrolled) {
          setIsEnrolled(enrolled);
          if (enrolled) {
            await Promise.all([fetchMaterials(courseId), fetchLessons(courseId)]);
            setPaymentChecked(true);
            setTimeout(() => setPaymentChecked(false), 5000);
            if (pollTimer.current) { clearInterval(pollTimer.current); pollTimer.current = null; }
          }
        }
      }
    } catch (_) {}
  }, [courseId, isEnrolled, fetchMaterials, fetchLessons]);

  useEffect(() => {
    const auth = guardRoute("STUDENT", router);
    if (auth) {
      setUser(auth);
      userRef.current = auth;
      fetchCourseDetails(auth.user_id, false);
      if (!isEnrolled) {
        setCheckingPayment(true);
        pollTimer.current = setInterval(() => {
          if (userRef.current && !isEnrolled) checkPaymentStatus(userRef.current.user_id);
        }, POLL_INTERVAL);
      }
    }
    return () => { if (pollTimer.current) { clearInterval(pollTimer.current); pollTimer.current = null; } };
  }, [router, courseId]);

  const handleManualRefresh = async () => {
    if (user) {
      setCheckingPayment(true);
      await fetchCourseDetails(user.user_id, false);
      setCheckingPayment(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

      {/* Back */}
      <Link href="/student/courses"
        className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors group">
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to My Courses
      </Link>

      {/* Banners */}
      {checkingPayment && !isEnrolled && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl px-4 py-3.5 text-sm">
          <Loader size={15} className="animate-spin flex-shrink-0" />
          Checking for payment confirmation…
        </div>
      )}
      {paymentChecked && isEnrolled && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3.5 text-sm">
          <CheckCircle size={15} className="flex-shrink-0" />
          Payment confirmed! Course materials are now available.
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3.5 text-sm">
          <AlertCircle size={15} className="flex-shrink-0" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3 text-blue-400">
          <Loader size={28} className="animate-spin" />
          <span className="text-sm font-medium text-gray-500">Loading course…</span>
        </div>
      ) : !course ? null : (
        <>
          {/* ── Course Hero Card ──────────────────────────────────────── */}
          <div className={`relative bg-white rounded-3xl border shadow-sm overflow-hidden ${isEnrolled ? "border-blue-200" : "border-amber-200"}`}>
            <div className={`h-1.5 w-full ${isEnrolled ? "bg-gradient-to-r from-blue-500 via-blue-700 to-indigo-700" : "bg-gradient-to-r from-amber-300 to-orange-300"}`} />
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${isEnrolled ? "bg-blue-50" : "bg-amber-50"}`}>
                    <GraduationCap size={24} className={isEnrolled ? "text-blue-700" : "text-amber-500"} />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">{course.title}</h1>
                    {course.description && <p className="text-sm text-gray-500 mt-1 leading-relaxed">{course.description}</p>}
                  </div>
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
          </div>

          {/* ── Materials Section ─────────────────────────────────────── */}
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

            {/* ── Search bar ── */}
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
