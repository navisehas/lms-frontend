"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "../../../../lib/auth";

// ─── Status Computer ──────────────────────────────────────────────────────────
function computeStatus(exam) {
  if (exam.result_id) return "completed";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(exam.exam_date);
  due.setHours(0, 0, 0, 0);
  if (due < today) return "missed";
  return "available";
}

// ─── API → UI shape mapper ────────────────────────────────────────────────────
function mapExam(e) {
  const status = computeStatus(e);
  const score =
    e.score !== null && e.score !== undefined ? parseFloat(e.score) : undefined;
  return {
    id: e.exam_id,
    title: e.title || "Untitled Exam",
    course: e.course_name || e.course_id,
    duration: e.duration_minutes || 0,
    totalQuestions: parseInt(e.total_questions, 10) || 0,
    dueDate: e.exam_date,
    maxAttempts: e.max_attempts || 1,
    passMark: e.pass_mark || 50,
    attempts: e.result_id ? 1 : 0,
    status,
    score,
    passed: score !== undefined ? score >= (e.pass_mark || 50) : undefined,
  };
}

// ─── Status Config ────────────────────────────────────────────────────────────
const statusConfig = {
  available: {
    label: "Available",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  completed: {
    label: "Completed",
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  missed: {
    label: "Missed",
    bg: "bg-red-50",
    text: "text-red-500",
    border: "border-red-200",
    dot: "bg-red-400",
  },
  upcoming: {
    label: "Upcoming",
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, accent }) {
  return (
    <div
      className="relative rounded-2xl p-5 overflow-hidden bg-white"
      style={{
        border: "1px solid #e8edf5",
        boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
      }}
    >
      <div
        className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 blur-2xl"
        style={{ background: accent }}
      />
      <p className="text-3xl font-bold text-slate-800 mb-1">{value}</p>
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      className="rounded-2xl p-5 bg-white animate-pulse"
      style={{
        border: "1px solid #e8edf5",
        boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
      }}
    >
      <div className="h-3 w-1/3 bg-slate-200 rounded mb-2" />
      <div className="h-4 w-2/3 bg-slate-200 rounded mb-4" />
      <div className="flex gap-4 mb-4">
        <div className="h-3 w-16 bg-slate-100 rounded" />
        <div className="h-3 w-16 bg-slate-100 rounded" />
        <div className="h-3 w-16 bg-slate-100 rounded" />
      </div>
      <div className="h-9 w-full bg-slate-100 rounded-xl" />
    </div>
  );
}

// ─── Exam Card ────────────────────────────────────────────────────────────────
function ExamCard({ exam, onStart, onViewResults }) {
  const s = statusConfig[exam.status] || statusConfig.available;
  const isAvailable = exam.status === "available";
  const isCompleted = exam.status === "completed";

  const daysUntilDue = () => {
    const due = new Date(exam.dueDate);
    const today = new Date();
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    if (diff < 0) return "Overdue";
    if (diff === 0) return "Due today";
    return `${diff}d left`;
  };

  return (
    <div
      className="group rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 bg-white"
      style={{
        border: "1px solid #e8edf5",
        boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = isAvailable
          ? "0 8px 30px rgba(16,185,129,0.12), 0 0 0 1px rgba(16,185,129,0.2)"
          : "0 8px 24px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 8px rgba(0,0,0,0.05)";
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3 gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 mb-1 truncate">{exam.course}</p>
          <h3 className="text-slate-800 font-semibold text-sm leading-snug">
            {exam.title}
          </h3>
        </div>
        <span
          className={`shrink-0 flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
          {s.label}
        </span>
      </div>

      {/* Meta info */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
          <span>⏱</span>
          <span>{exam.duration} min</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
          <span>📝</span>
          <span>{exam.totalQuestions} questions</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
          <span>📅</span>
          <span>{daysUntilDue()}</span>
        </div>
      </div>

      {/* Score bar for completed */}
      {isCompleted && exam.score !== undefined && (
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-500">Your Score</span>
            <span
              className={
                exam.passed
                  ? "text-emerald-600 font-bold"
                  : "text-red-500 font-bold"
              }
            >
              {exam.score}% — {exam.passed ? "✓ Passed" : "✗ Failed"}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100">
            <div
              className={`h-1.5 rounded-full transition-all duration-700 ${
                exam.passed ? "bg-emerald-400" : "bg-red-400"
              }`}
              style={{ width: `${exam.score}%` }}
            />
          </div>
        </div>
      )}

      {/* Action button */}
      <button
        onClick={() => {
          if (isAvailable) onStart(exam);
          else if (isCompleted) onViewResults(exam);
        }}
        disabled={!isAvailable && !isCompleted}
        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
          isAvailable
            ? "bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer active:scale-95 shadow-sm shadow-emerald-200"
            : isCompleted
              ? "bg-blue-50 text-blue-600 border border-blue-200 cursor-pointer hover:bg-blue-100"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
        }`}
      >
        {isAvailable
          ? "Start Exam →"
          : isCompleted
            ? "View Results"
            : exam.status === "upcoming"
              ? "Not Yet Open"
              : "Unavailable"}
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StudentExamsPage() {
  const router = useRouter();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filters = ["all", "available", "completed", "upcoming", "missed"];

  // ── Fetch exams from API ───────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await authFetch("/api/exams");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load exams");
        }

        if (!cancelled) {
          setExams(Array.isArray(data) ? data.map(mapExam) : []);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Derived data ──────────────────────────────────────────────────────────
  const filtered = exams.filter((e) => {
    const matchFilter = filter === "all" || e.status === filter;
    const matchSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.course.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const completedWithScore = exams.filter((e) => e.score !== undefined);
  const stats = {
    total: exams.length,
    available: exams.filter((e) => e.status === "available").length,
    completed: exams.filter((e) => e.status === "completed").length,
    avgScore:
      completedWithScore.length > 0
        ? Math.round(
            completedWithScore.reduce((acc, e) => acc + e.score, 0) /
              completedWithScore.length,
          )
        : 0,
  };

  const handleStart = (exam) => {
    router.push(`/student/exams/${exam.id}`);
  };

  const handleViewResults = (exam) => {
    router.push(`/student/results/${exam.id}`);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen p-6"
      style={{
        background:
          "linear-gradient(135deg, #f8faff 0%, #ffffff 50%, #f5f7ff 100%)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono&display=swap');
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.3); border-radius: 4px; }
      `}</style>

      {/* Header */}
      <div className="mb-8">
        <p className="text-slate-400 text-sm mb-1 tracking-widest uppercase font-medium">
          EnglishGate Institute
        </p>
        <h1
          className="text-3xl font-bold text-slate-800 mb-1"
          style={{ letterSpacing: "-0.02em" }}
        >
          My Exams
        </h1>
        <p className="text-slate-500 text-sm">
          View and attempt your assigned examinations
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          <span>⚠️</span>
          <span>{error}</span>
          <button
            onClick={() => window.location.reload()}
            className="ml-auto text-xs font-semibold underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard
          label="Total Exams"
          value={loading ? "—" : stats.total}
          icon="📋"
          accent="#6366f1"
        />
        <StatCard
          label="Available Now"
          value={loading ? "—" : stats.available}
          icon="🟢"
          accent="#10b981"
        />
        <StatCard
          label="Completed"
          value={loading ? "—" : stats.completed}
          icon="✅"
          accent="#3b82f6"
        />
        <StatCard
          label="Avg. Score"
          value={loading ? "—" : `${stats.avgScore}%`}
          icon="🏆"
          accent="#f59e0b"
        />
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search exams or courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-emerald-400/40 bg-white"
            style={{ border: "1px solid #e2e8f0" }}
          />
        </div>

        {/* Filter tabs */}
        <div
          className="flex items-center gap-1 p-1 rounded-xl bg-slate-100"
          style={{ border: "1px solid #e2e8f0" }}
        >
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-200 ${
                filter === f
                  ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Exam Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((exam) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              onStart={handleStart}
              onViewResults={handleViewResults}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">{error ? "❌" : "🔎"}</p>
          <p className="text-slate-400 text-sm">
            {error
              ? "Could not load exams. Check your connection."
              : exams.length === 0
                ? "No exams have been assigned to you yet."
                : "No exams found for this filter."}
          </p>
        </div>
      )}

      {/* Footer note */}
      <p className="text-center text-slate-400 text-xs mt-10">
        Once you start an exam, the timer cannot be paused. Ensure a stable
        connection.
      </p>
    </div>
  );
}
