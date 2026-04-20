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
  Trophy, TrendingUp, Circle,
} from "lucide-react";
import { authFetch, guardRoute } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;
const POLL_INTERVAL = 5000;

function getMaterialHref(value) {
  if (!value) return null;
  if (value.startsWith("data:")) return value;       // base64 — use directly
  if (/^https?:\/\//i.test(value)) return value;   // external URL
  const path = value.startsWith("/") ? value : `/${value}`;
  return `${API}${path}`;
}

const handleDownload = async (url, filename) => {
  try {
    // base64 data URL — create anchor and trigger download directly
    if (url.startsWith("data:")) {
      const link = document.createElement("a");
      link.href = url;
      link.download = filename || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
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

  const cUrl = (material.resource_link || "").toLowerCase();
  if (cUrl && !cUrl.startsWith("data:")) {
    if (cUrl.match(/\.pdf(\?|#|$)/)) return "PDF";
    if (cUrl.match(/\.(mp4|mov|avi|mkv|webm)(\?|#|$)/)) return "VIDEO";
    if (cUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|#|$)/)) return "IMAGE";
    if (cUrl.match(/\.(doc|docx|ppt|pptx|xls|xlsx)(\?|#|$)/)) return "DOC";
  }

  // For base64 data URLs, detect type from mimetype prefix
  if (cUrl.startsWith("data:")) {
    const mime = cUrl.split(";")[0].replace("data:", "");
    if (mime === "application/pdf") return "PDF";
    if (mime.startsWith("video/")) return "VIDEO";
    if (mime.startsWith("image/")) return "IMAGE";
  }

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

// ─── Progress Ring SVG ────────────────────────────────────────────────────────
function ProgressRing({ percent, size = 56, stroke = 5 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  const color = percent === 100 ? "#16a34a" : percent >= 50 ? "#2563eb" : "#93c5fd";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e0e7ef" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.4s" }}
      />
    </svg>
  );
}

// ─── Overall Progress Banner ──────────────────────────────────────────────────
function CourseProgressBanner({ totalFiles, completedCount }) {
  const percent = totalFiles > 0 ? Math.round((completedCount / totalFiles) * 100) : 0;
  const isComplete = percent === 100 && totalFiles > 0;

  return (
    <div className={`rounded-2xl border px-5 py-4 flex items-center gap-4 shadow-sm transition-all ${
      isComplete
        ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
        : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100"
    }`}>
      {/* Ring */}
      <div className="relative flex-shrink-0">
        <ProgressRing percent={percent} size={56} stroke={5} />
        <div className="absolute inset-0 flex items-center justify-center">
          {isComplete
            ? <Trophy size={18} className="text-green-600" />
            : <span className="text-xs font-extrabold text-blue-700">{percent}%</span>
          }
        </div>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        {isComplete ? (
          <>
            <p className="text-sm font-bold text-green-700 flex items-center gap-1.5">
              <CheckCircle size={14} /> Course Completed! 🎉
            </p>
            <p className="text-xs text-green-600 mt-0.5">
              You have completed all {totalFiles} material{totalFiles !== 1 ? "s" : ""}!
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              <TrendingUp size={14} className="text-blue-500" /> Your Progress
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {completedCount} / {totalFiles} material{totalFiles !== 1 ? "s" : ""} completed
            </p>
          </>
        )}

        {/* Bar */}
        <div className="mt-2 w-full bg-white/70 rounded-full h-2 border border-blue-100 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-700 ${isComplete ? "bg-green-500" : "bg-blue-500"}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Material Row ─────────────────────────────────────────────────────────────
function MaterialCard({ material, index, isCompleted, onToggleComplete, toggling }) {
  const downloadUrl = getMaterialHref(material.resource_link);
  const externalUrl = material.external_url;
  const resolvedType = detectMaterialType(material);

  return (
    <div className={`flex items-center justify-between px-4 py-3 transition-colors rounded-xl gap-4 group ${
      isCompleted ? "bg-green-50/60 hover:bg-green-50" : "hover:bg-blue-50/60"
    }`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Icon */}
        <div className="relative flex-shrink-0">
          <div className={`w-8 h-8 rounded-lg border shadow-sm flex items-center justify-center transition-colors ${
            isCompleted ? "bg-green-50 border-green-200" : "bg-white border-gray-100"
          }`}>
            {isCompleted
              ? <CheckCircle size={14} className="text-green-500" />
              : getTypeIcon(resolvedType, externalUrl)
            }
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold truncate leading-tight ${
            isCompleted ? "text-green-800 line-through decoration-green-400/60" : "text-gray-800"
          }`}>
            {material.title}
          </p>
          <span className={`inline-flex items-center text-xs font-medium border rounded-full px-2 py-0.5 mt-0.5 ${getTypeBadgeStyle(resolvedType)}`}>
            {resolvedType}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-shrink-0 items-center">
        {downloadUrl && material.resource_link && (
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

        {/* Mark Complete Button — only shown when onToggleComplete is provided */}
        {onToggleComplete && (
          <button
            onClick={() => onToggleComplete(material.material_id)}
            disabled={toggling}
            title={isCompleted ? "Completed — click to undo" : "Mark as complete"}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all shadow-sm disabled:opacity-50 ${
              isCompleted
                ? "bg-green-100 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                : "bg-white text-gray-400 border-gray-200 hover:bg-green-50 hover:text-green-600 hover:border-green-200"
            }`}
          >
            <CheckCircle size={12} />
            {isCompleted ? "Done" : "Mark Done"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Subtopic Section ─────────────────────────────────────────────────────────
function SubtopicSection({ subtopic, materials, completedIds, onToggleComplete, togglingId, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const isUncategorized = subtopic === "__none__";
  const doneCount = materials.filter(m => completedIds.has(m.material_id)).length;

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
            {doneCount > 0 && (
              <span className="text-xs text-green-600 bg-green-50 border border-green-100 px-1.5 py-0.5 rounded-full font-medium">
                ✓ {doneCount}/{materials.length}
              </span>
            )}
          </div>
          {open
            ? <ChevronDown size={13} className="text-blue-400" />
            : <ChevronRight size={13} className="text-blue-400" />}
        </button>
      )}

      {(open || isUncategorized) && (
        <div className="divide-y divide-gray-50 px-2 py-1">
          {materials.map((mat) => (
            <MaterialCard
              key={mat.material_id}
              material={mat}
              isCompleted={completedIds.has(mat.material_id)}
              onToggleComplete={onToggleComplete}
              toggling={togglingId === mat.material_id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Lesson Block ─────────────────────────────────────────────────────────────
function LessonBlock({ lesson, index, isOpen, onToggle, completedIds, onToggleComplete, togglingId }) {
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
  const lessonCompleted = (lesson.materials || []).filter(m => completedIds.has(m.material_id)).length;
  const lessonPercent = totalMaterials > 0 ? Math.round((lessonCompleted / totalMaterials) * 100) : 0;
  const isLessonDone = lessonCompleted === totalMaterials && totalMaterials > 0;

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden shadow-sm transition-colors ${
      isLessonDone ? "border-green-200" : "border-blue-100"
    }`}>
      {/* Lesson Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-blue-50/40 transition-colors text-left"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <span className={`w-8 h-8 rounded-xl text-white text-xs font-extrabold flex items-center justify-center shadow-sm ${
              isLessonDone ? "bg-green-600" : "bg-blue-700"
            }`}>
              {isLessonDone ? <CheckCircle size={14} /> : index + 1}
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
            {/* Lesson progress pill */}
            {totalMaterials > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                isLessonDone
                  ? "text-green-600 bg-green-50 border-green-200"
                  : lessonCompleted > 0
                  ? "text-blue-600 bg-blue-50 border-blue-200"
                  : "text-gray-400 bg-gray-50 border-gray-100"
              }`}>
                {lessonCompleted}/{totalMaterials} done
              </span>
            )}
          </div>
        </div>

        {/* Mini progress bar + chevron */}
        <div className="ml-3 flex items-center gap-2 flex-shrink-0">
          {totalMaterials > 0 && (
            <div className="hidden sm:block w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${isLessonDone ? "bg-green-500" : "bg-blue-500"}`}
                style={{ width: `${lessonPercent}%` }}
              />
            </div>
          )}
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
                completedIds={completedIds}
                onToggleComplete={onToggleComplete}
                togglingId={togglingId}
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
  // ── FIX: Safely extract courseId — params may be undefined during SSR ──────
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
  const [paymentChecked,  setPaymentChecked]  = useState(false);
  const [searchQuery,     setSearchQuery]     = useState("");

  // ── Progress state ──────────────────────────────────────────────────────────
  const [completedIds,    setCompletedIds]    = useState(new Set());
  const [togglingId,      setTogglingId]      = useState(null);

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
        if (lessonMatch) return lb;
        if (filteredMaterials.length > 0) return { ...lb, materials: filteredMaterials };
        return null;
      })
      .filter(Boolean);
  }, [lessonBlocks, searchQuery]);

  // ── Computed progress totals ──────────────────────────────────────────────
  const totalFiles     = materials.length;
  const completedCount = completedIds.size;

  // ── Load progress from API ────────────────────────────────────────────────
  const loadProgress = useCallback(async () => {
    if (!courseId || !userRef.current || userRef.current.role !== "STUDENT") return;
    try {
      const res = await authFetch(`${API}/courses/${courseId}/progress`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.completed_material_ids)) {
        setCompletedIds(new Set(data.completed_material_ids));
      }
    } catch (_) {}
  }, [courseId]);

  // ── Toggle material complete ──────────────────────────────────────────────
  const handleToggleComplete = useCallback(async (materialId) => {
    if (togglingId) return;
    setTogglingId(materialId);

    const isNowCompleted = !completedIds.has(materialId);

    // Optimistic update
    setCompletedIds(prev => {
      const next = new Set(prev);
      if (isNowCompleted) next.add(materialId);
      else next.delete(materialId);
      return next;
    });

    try {
      const res = await authFetch(`${API}/courses/${courseId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ material_id: materialId, completed: isNowCompleted }),
      });
      if (!res.ok) {
        // Revert on failure
        setCompletedIds(prev => {
          const next = new Set(prev);
          if (isNowCompleted) next.delete(materialId);
          else next.add(materialId);
          return next;
        });
      } else {
        const data = await res.json();
        if (data.success && Array.isArray(data.completed_material_ids)) {
          setCompletedIds(new Set(data.completed_material_ids));
        }
      }
    } catch (_) {
      // Revert on network error
      setCompletedIds(prev => {
        const next = new Set(prev);
        if (isNowCompleted) next.delete(materialId);
        else next.add(materialId);
        return next;
      });
    } finally {
      setTogglingId(null);
    }
  }, [completedIds, courseId, togglingId]);

  // Auto-open all lessons
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

  // ── Auth & data load ──────────────────────────────────────────────────────
  // ── FIX: Guard against router or courseId being undefined on first render ─
  useEffect(() => {
    if (!router || !courseId) return;

    const init = async () => {
      // FIX: guardRoute(requiredRole, router) — must pass "STUDENT" as first arg
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

        // Load lessons list
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

  // Load progress after enrollment confirmed
  useEffect(() => {
    if (isEnrolled && user?.role === "STUDENT") {
      loadProgress();
    }
  }, [isEnrolled, user, loadProgress]);

  // ── Poll for enrollment ───────────────────────────────────────────────────
  const checkEnrollment = useCallback(async () => {
    try {
      const res = await authFetch(`${API}/courses/${courseId}/materials`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMaterials(data.materials || []);
          setIsEnrolled(true);
          clearInterval(pollTimer.current);
          loadProgress();
        }
      }
    } catch (_) {}
  }, [courseId, loadProgress]);

  const handleManualRefresh = useCallback(async () => {
    setCheckingPayment(true);
    await checkEnrollment();
    setPaymentChecked(true);
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

                {/* ── Overall Progress Banner (only for STUDENT) ── */}
                {user?.role === "STUDENT" && totalFiles > 0 && (
                  <CourseProgressBanner
                    totalFiles={totalFiles}
                    completedCount={completedCount}
                  />
                )}

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
                          completedIds={completedIds}
                          onToggleComplete={user?.role === "STUDENT" ? handleToggleComplete : null}
                          togglingId={togglingId}
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
