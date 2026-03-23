"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "../../../../../lib/auth";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from "recharts";

const API = process.env.NEXT_PUBLIC_API_URL;

// ─── Helpers ───────
const avg = (arr) =>
  arr.length === 0
    ? 0
    : Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);

const grade = (score) =>
  score >= 90
    ? "A"
    : score >= 80
      ? "B"
      : score >= 70
        ? "C"
        : score >= 60
          ? "D"
          : "F";

const gradeColor = (g) =>
  g === "A"
    ? "text-emerald-600"
    : g === "B"
      ? "text-blue-600"
      : g === "C"
        ? "text-amber-600"
        : g === "D"
          ? "text-orange-600"
          : "text-red-500";

const fmt = (ts) => {
  if (!ts) return "—";
  const d = new Date(ts);
  return (
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) +
    " " +
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  );
};

// ─── Chart Tooltip ─
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs shadow-lg"
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        color: "#1e293b",
      }}
    >
      <p className="text-slate-500 mb-0.5">{label}</p>
      <p className="font-bold text-violet-600">{payload[0].value}</p>
    </div>
  );
};

// ─── Stat Card ───
function StatCard({ label, value, sub, accent, icon }) {
  return (
    <div
      className="relative rounded-2xl p-5 overflow-hidden bg-white"
      style={{
        border: "1px solid #e8edf5",
        boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
      }}
    >
      <div
        className="absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-15"
        style={{ background: accent }}
      />
      <p className="text-2xl mb-1">{icon}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      {sub && (
        <p className="text-xs mt-1 font-medium" style={{ color: accent }}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ─── Skeleton Row ─────
function SkeletonRow() {
  return (
    <div
      className="grid grid-cols-12 gap-2 px-5 py-3.5 items-center animate-pulse"
      style={{ borderBottom: "1px solid #f8fafc" }}
    >
      <div className="col-span-1 h-3 w-4 bg-slate-200 rounded" />
      <div className="col-span-3 space-y-1.5">
        <div className="h-3 w-28 bg-slate-200 rounded" />
        <div className="h-2.5 w-20 bg-slate-100 rounded" />
      </div>
      <div className="col-span-2 h-3 w-20 bg-slate-100 rounded" />
      <div className="col-span-2 space-y-1.5">
        <div className="h-3 w-14 bg-slate-200 rounded" />
        <div className="h-1.5 w-full bg-slate-100 rounded-full" />
      </div>
      <div className="col-span-2 h-3 w-16 bg-slate-100 rounded" />
      <div className="col-span-2 h-6 w-20 bg-slate-100 rounded-full" />
    </div>
  );
}

// ─── Main Page ────
export default function ExamResultsPage() {
  const router = useRouter();

  // ── Exam list (for selector) ───
  const [exams, setExams] = useState([]);
  const [examsLoading, setExamsLoading] = useState(true);
  const [selectedExamId, setSelectedExamId] = useState("");

  // ── Results data ───
  const [examMeta, setExamMeta] = useState(null);
  const [results, setResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState(null);

  // ── UI state ─────
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("score");
  const [sortDir, setSortDir] = useState("desc");
  const [tab, setTab] = useState("results");

  // ── Fetch teacher's exams on mount ───
  useEffect(() => {
    let cancelled = false;
    setExamsLoading(true);

    authFetch(`${API}/exams`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data)) {
          setExams(data);
          if (data.length > 0) setSelectedExamId(data[0].exam_id);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setExamsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Fetch results when selected exam changes ───
  useEffect(() => {
    if (!selectedExamId) return;
    let cancelled = false;

    async function load() {
      setResultsLoading(true);
      setResultsError(null);
      setResults([]);
      setExamMeta(null);
      setTab("results");
      setSearch("");
      setFilter("all");

      try {
        const res = await authFetch(`${API}/exams/${selectedExamId}/results`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`);
        if (!cancelled) {
          setExamMeta(data.exam);
          setResults(
            (data.results ?? []).map((r) => ({
              id: r.result_id,
              name: r.name ?? "Unknown",
              regNo: r.student_id ?? "—",
              score: parseFloat(r.marks) ?? 0,
              submittedAt: r.submitted_at ?? null,
            })),
          );
        }
      } catch (err) {
        if (!cancelled)
          setResultsError(err.message ?? "Failed to load results");
      } finally {
        if (!cancelled) setResultsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [selectedExamId]);

  // ── Derived analytics ───
  const passMark = parseFloat(examMeta?.pass_mark ?? 50);
  const scores = results.map((s) => s.score);
  const passed = results.filter((s) => s.score >= passMark);
  const failed = results.filter((s) => s.score < passMark);
  const passRate =
    results.length > 0 ? Math.round((passed.length / results.length) * 100) : 0;

  const scoreDistribution = [
    { range: "0–20", count: results.filter((s) => s.score <= 20).length },
    {
      range: "21–40",
      count: results.filter((s) => s.score > 20 && s.score <= 40).length,
    },
    {
      range: "41–60",
      count: results.filter((s) => s.score > 40 && s.score <= 60).length,
    },
    {
      range: "61–80",
      count: results.filter((s) => s.score > 60 && s.score <= 80).length,
    },
    { range: "81–100", count: results.filter((s) => s.score > 80).length },
  ];

  const submissionTrend = Object.entries(
    results.reduce((acc, s) => {
      if (!s.submittedAt) return acc;
      const date = new Date(s.submittedAt).toISOString().slice(0, 10);
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {}),
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date: date.slice(5), count }));

  const pieData = [
    { name: "Passed", value: passed.length, color: "#10b981" },
    { name: "Failed", value: failed.length, color: "#ef4444" },
  ];

  // ── Filter + Sort ────
  const filtered = results
    .filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.regNo.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        filter === "all"
          ? true
          : filter === "passed"
            ? s.score >= passMark
            : filter === "failed"
              ? s.score < passMark
              : true;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "score") return (a.score - b.score) * dir;
      if (sortBy === "name") return a.name.localeCompare(b.name) * dir;
      return 0;
    });

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(col);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ col }) => (
    <span
      className={`ml-1 text-xs ${sortBy === col ? "text-violet-500" : "text-slate-300"}`}
    >
      {sortBy === col ? (sortDir === "desc" ? "↓" : "↑") : "↕"}
    </span>
  );

  // ── Render
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
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 4px; }
      `}</style>

      {/* ── Header ── */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-slate-400 hover:text-slate-700 text-sm flex items-center gap-1 mb-4 transition-colors"
        >
          ← Back
        </button>
        <p className="text-slate-400 text-xs uppercase tracking-widest font-medium mb-1">
          Exam Results
        </p>
        <h1
          className="text-2xl font-bold text-slate-800"
          style={{ letterSpacing: "-0.02em" }}
        >
          Results Dashboard
        </h1>
      </div>

      {/* ── Exam Selector ── */}
      <div
        className="rounded-2xl bg-white p-5 mb-6"
        style={{
          border: "1px solid #e8edf5",
          boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
        }}
      >
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 block">
          Select Exam
        </label>
        {examsLoading ? (
          <div className="h-10 w-full bg-slate-100 rounded-xl animate-pulse" />
        ) : exams.length === 0 ? (
          <p className="text-sm text-slate-400 italic">
            No exams found. Create an exam first.
          </p>
        ) : (
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-violet-400/40 bg-white appearance-none cursor-pointer"
            style={{ border: "1px solid #e2e8f0" }}
          >
            {exams.map((e) => (
              <option key={e.exam_id} value={e.exam_id}>
                {e.title ?? "Untitled"} — {e.course_name ?? e.course_id}
              </option>
            ))}
          </select>
        )}

        {/* Exam meta strip */}
        {examMeta && !resultsLoading && (
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-100">
            {[
              { icon: "📚", label: examMeta.course_name ?? "—" },
              { icon: "⏱", label: `${examMeta.duration_minutes ?? "—"} min` },
              {
                icon: "❓",
                label: `${examMeta.total_questions ?? "—"} questions`,
              },
              { icon: "🎯", label: `Pass mark: ${passMark}%` },
              {
                icon: "👥",
                label: `${results.length} submission${results.length !== 1 ? "s" : ""}`,
              },
            ].map(({ icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 text-xs text-slate-500"
              >
                <span>{icon}</span> {label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Error ── */}
      {resultsError && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          <span>⚠️</span>
          <span>{resultsError}</span>
          <button
            onClick={() => setSelectedExamId((id) => id)}
            className="ml-auto text-xs font-semibold underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Empty state (no submissions yet) ── */}
      {!resultsLoading &&
        !resultsError &&
        selectedExamId &&
        results.length === 0 && (
          <div
            className="rounded-2xl bg-white p-12 text-center"
            style={{ border: "1px solid #e8edf5" }}
          >
            <p className="text-4xl mb-3">📭</p>
            <p className="text-slate-600 font-semibold text-sm">
              No submissions yet
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Students haven't submitted this exam yet.
            </p>
          </div>
        )}

      {/* ── Main content (only when results exist) ── */}
      {(resultsLoading || results.length > 0) && (
        <>
          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <StatCard
              label="Average Score"
              icon="📊"
              accent="#8b5cf6"
              value={resultsLoading ? "—" : `${avg(scores)}%`}
              sub={
                resultsLoading
                  ? ""
                  : scores.length > 0
                    ? `Highest: ${Math.max(...scores)}%`
                    : ""
              }
            />
            <StatCard
              label="Pass Rate"
              icon="✅"
              accent="#10b981"
              value={resultsLoading ? "—" : `${passRate}%`}
              sub={
                resultsLoading
                  ? ""
                  : `${passed.length} / ${results.length} students`
              }
            />
            <StatCard
              label="Submissions"
              icon="📝"
              accent="#3b82f6"
              value={resultsLoading ? "—" : results.length}
              sub={resultsLoading ? "" : `${failed.length} failed`}
            />
            <StatCard
              label="Lowest Score"
              icon="📉"
              accent="#ef4444"
              value={
                resultsLoading
                  ? "—"
                  : scores.length > 0
                    ? `${Math.min(...scores)}%`
                    : "—"
              }
              sub=""
            />
          </div>

          {/* ── Tabs ── */}
          <div
            className="flex gap-1 mb-6 p-1 rounded-xl w-fit bg-slate-100"
            style={{ border: "1px solid #e2e8f0" }}
          >
            {["results", "analytics"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200 ${
                  tab === t
                    ? "bg-violet-500 text-white shadow-md shadow-violet-200"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t === "results" ? "📋 Results" : "📈 Analytics"}
              </button>
            ))}
          </div>

          {/* ════════════════════ TAB: RESULTS ════════════════════ */}
          {tab === "results" && (
            <>
              {/* Search + Filter */}
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    🔍
                  </span>
                  <input
                    type="text"
                    placeholder="Search by name or student ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-violet-400/40 bg-white"
                    style={{ border: "1px solid #e2e8f0" }}
                  />
                </div>
                <div
                  className="flex gap-1 p-1 rounded-xl bg-slate-100"
                  style={{ border: "1px solid #e2e8f0" }}
                >
                  {["all", "passed", "failed"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                        filter === f
                          ? "bg-violet-500 text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Results Table */}
              <div
                className="rounded-2xl overflow-hidden bg-white"
                style={{
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
                }}
              >
                {/* Table header */}
                <div
                  className="grid grid-cols-12 gap-2 px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50"
                  style={{ borderBottom: "1px solid #f1f5f9" }}
                >
                  <div className="col-span-1">#</div>
                  <div
                    className="col-span-3 cursor-pointer hover:text-slate-600 transition-colors"
                    onClick={() => toggleSort("name")}
                  >
                    Student <SortIcon col="name" />
                  </div>
                  <div className="col-span-2">Student ID</div>
                  <div
                    className="col-span-3 cursor-pointer hover:text-slate-600 transition-colors"
                    onClick={() => toggleSort("score")}
                  >
                    Score <SortIcon col="score" />
                  </div>
                  <div className="col-span-2">Grade</div>
                  <div className="col-span-1">Submitted</div>
                </div>

                {/* Skeleton rows while loading */}
                {resultsLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))
                ) : filtered.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-sm bg-white">
                    No students match this filter.
                  </div>
                ) : (
                  filtered.map((s, i) => {
                    const isPassed = s.score >= passMark;
                    const g = grade(s.score);
                    return (
                      <div
                        key={s.id}
                        className="grid grid-cols-12 gap-2 px-5 py-3.5 items-center text-sm transition-colors hover:bg-slate-50/80"
                        style={{ borderBottom: "1px solid #f8fafc" }}
                      >
                        {/* # */}
                        <div className="col-span-1 text-slate-300 text-xs font-mono">
                          {i + 1}
                        </div>

                        {/* Name */}
                        <div className="col-span-3">
                          <p className="text-slate-700 font-semibold text-sm truncate">
                            {s.name}
                          </p>
                          <p className="text-slate-400 text-xs mt-0.5">
                            {fmt(s.submittedAt)}
                          </p>
                        </div>

                        {/* Student ID */}
                        <div className="col-span-2 text-slate-400 text-xs font-mono">
                          {s.regNo}
                        </div>

                        {/* Score + bar */}
                        <div className="col-span-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`font-bold text-sm ${isPassed ? "text-emerald-600" : "text-red-500"}`}
                            >
                              {s.score}%
                            </span>
                            <span className="text-xs text-slate-400">
                              {isPassed ? "✓ Passed" : "✗ Failed"}
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-700 ${isPassed ? "bg-emerald-400" : "bg-red-400"}`}
                              style={{ width: `${s.score}%` }}
                            />
                          </div>
                        </div>

                        {/* Grade */}
                        <div className="col-span-2">
                          <span
                            className={`text-lg font-black ${gradeColor(g)}`}
                          >
                            {g}
                          </span>
                        </div>

                        {/* Submitted at (short) */}
                        <div className="col-span-1 text-slate-400 text-xs">
                          {s.submittedAt
                            ? new Date(s.submittedAt).toLocaleDateString(
                                "en-GB",
                                { day: "2-digit", month: "short" },
                              )
                            : "—"}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {!resultsLoading && (
                <p className="text-slate-400 text-xs mt-3 text-right">
                  Showing {filtered.length} of {results.length} submission
                  {results.length !== 1 ? "s" : ""}
                </p>
              )}
            </>
          )}

          {/* ════════════════════ TAB: ANALYTICS ════════════════════ */}
          {tab === "analytics" && !resultsLoading && (
            <div className="space-y-5">
              {/* Row 1: Score Distribution + Pass/Fail Pie */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Score Distribution */}
                <div
                  className="rounded-2xl p-5 bg-white"
                  style={{
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <p className="text-slate-700 font-semibold text-sm mb-1">
                    Score Distribution
                  </p>
                  <p className="text-slate-400 text-xs mb-5">
                    Number of students per score range
                  </p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={scoreDistribution} barSize={28}>
                      <XAxis
                        dataKey="range"
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        content={<ChartTooltip />}
                        cursor={{ fill: "rgba(139,92,246,0.06)" }}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {scoreDistribution.map((_, i) => (
                          <Cell
                            key={i}
                            fill={
                              i <= 1
                                ? "#ef4444"
                                : i === 2
                                  ? "#f59e0b"
                                  : "#10b981"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Pass / Fail Pie */}
                <div
                  className="rounded-2xl p-5 bg-white"
                  style={{
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <p className="text-slate-700 font-semibold text-sm mb-1">
                    Pass / Fail Breakdown
                  </p>
                  <p className="text-slate-400 text-xs mb-5">
                    Based on {passMark}% pass mark
                  </p>
                  <div className="flex items-center gap-6">
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {pieData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="shrink-0 space-y-3">
                      {pieData.map((d) => (
                        <div key={d.name} className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ background: d.color }}
                          />
                          <div>
                            <p className="text-slate-700 text-sm font-semibold">
                              {d.value}
                            </p>
                            <p className="text-slate-400 text-xs">{d.name}</p>
                          </div>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-slate-100">
                        <p className="text-violet-600 text-lg font-bold">
                          {passRate}%
                        </p>
                        <p className="text-slate-400 text-xs">Pass Rate</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Submission Trend */}
              <div
                className="rounded-2xl p-5 bg-white"
                style={{
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
                }}
              >
                <p className="text-slate-700 font-semibold text-sm mb-1">
                  Submission Trend
                </p>
                <p className="text-slate-400 text-xs mb-5">
                  Number of students who submitted per day
                </p>
                {submissionTrend.length === 0 ? (
                  <p className="text-slate-400 text-xs text-center py-8">
                    No submission date data available.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={submissionTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#8b5cf6"
                        strokeWidth={2.5}
                        dot={{ fill: "#8b5cf6", r: 4 }}
                        activeDot={{ r: 6, fill: "#7c3aed" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Row 3: Grade Breakdown */}
              <div
                className="rounded-2xl p-5 bg-white"
                style={{
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
                }}
              >
                <p className="text-slate-700 font-semibold text-sm mb-4">
                  Grade Breakdown
                </p>
                <div className="grid grid-cols-5 gap-3">
                  {["A", "B", "C", "D", "F"].map((g) => {
                    const gStudents = results.filter(
                      (s) => grade(s.score) === g,
                    );
                    const pct =
                      results.length > 0
                        ? Math.round((gStudents.length / results.length) * 100)
                        : 0;
                    const colors = {
                      A: "#10b981",
                      B: "#3b82f6",
                      C: "#f59e0b",
                      D: "#f97316",
                      F: "#ef4444",
                    };
                    return (
                      <div
                        key={g}
                        className="text-center rounded-xl p-4 bg-slate-50"
                        style={{ border: `1px solid ${colors[g]}30` }}
                      >
                        <p
                          className="text-2xl font-bold mb-1"
                          style={{ color: colors[g] }}
                        >
                          {g}
                        </p>
                        <p className="text-slate-700 font-semibold text-lg">
                          {gStudents.length}
                        </p>
                        <p className="text-slate-400 text-xs">
                          {pct}% of class
                        </p>
                        <div className="w-full h-1.5 rounded-full bg-slate-200 mt-2">
                          <div
                            className="h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, background: colors[g] }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Row 4: Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  {
                    label: "Highest Score",
                    value: scores.length > 0 ? `${Math.max(...scores)}%` : "—",
                    accent: "#10b981",
                  },
                  {
                    label: "Lowest Score",
                    value: scores.length > 0 ? `${Math.min(...scores)}%` : "—",
                    accent: "#ef4444",
                  },
                  {
                    label: "Average Score",
                    value: `${avg(scores)}%`,
                    accent: "#8b5cf6",
                  },
                  {
                    label: "Total Submissions",
                    value: results.length,
                    accent: "#3b82f6",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl p-4 text-center bg-white"
                    style={{
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
                    }}
                  >
                    <p
                      className="text-2xl font-bold"
                      style={{ color: stat.accent }}
                    >
                      {stat.value}
                    </p>
                    <p className="text-slate-500 text-xs mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}