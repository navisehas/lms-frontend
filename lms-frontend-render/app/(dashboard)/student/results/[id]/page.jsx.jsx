"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { authFetch } from "../../../../../lib/auth";

// ─── Circular Score Ring ────────────────────────────────────────────────────
function ScoreRing({ score, passed, passMark }) {
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color = passed ? "#10b981" : "#ef4444";

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 136 136">
        {/* Track */}
        <circle cx="68" cy="68" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="10" />
        {/* Progress */}
        <circle
          cx="68" cy="68" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-slate-800">{score}%</span>
        <span
          className="text-xs font-semibold mt-0.5"
          style={{ color }}
        >
          {passed ? "PASSED ✓" : "FAILED ✗"}
        </span>
      </div>
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, accent }) {
  return (
    <div
      className="rounded-2xl p-4 text-center relative overflow-hidden bg-white"
      style={{ border: "1px solid #e8edf5", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
    >
      <div
        className="absolute -top-3 -right-3 w-16 h-16 rounded-full blur-2xl opacity-20"
        style={{ background: accent }}
      />
      <p className="text-2xl mb-1">{icon}</p>
      <p className="text-xl font-black text-slate-800">{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StudentResultPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id;

  const [result, setResult] = useState(null);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!examId) return;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Fetch result and exam in parallel
        const [resultRes, examRes] = await Promise.all([
          authFetch(`/api/exams/${examId}/result`),
          authFetch(`/api/exams/${examId}`),
        ]);

        const resultData = await resultRes.json();
        const examData = await examRes.json();

        if (!resultRes.ok) throw new Error(resultData.error || "Could not load result");
        if (!examRes.ok) throw new Error(examData.error || "Could not load exam details");

        setResult(resultData);
        setExam(examData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [examId]);

  // ── Loading ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#f8faff", fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading your result…</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: "#f8faff", fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="text-center max-w-sm">
          <p className="text-4xl mb-3">❌</p>
          <p className="text-slate-700 font-semibold mb-2">Could not load result</p>
          <p className="text-slate-400 text-sm mb-5">{error}</p>
          <button
            onClick={() => router.push("/student/exams")}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-violet-500 text-white hover:bg-violet-600 transition-colors"
          >
            ← Back to Exams
          </button>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const score = parseFloat(result.score) ?? 0;
  const passed = result.passed;
  const passMark = result.pass_mark ?? 50;
  const correct = result.correct ?? 0;
  const total = result.total ?? 0;
  const wrong = total - correct;

  const grade =
    score >= 90 ? "A"
    : score >= 80 ? "B"
    : score >= 70 ? "C"
    : score >= 60 ? "D"
    : "F";

  const gradeColor =
    grade === "A" ? "#10b981"
    : grade === "B" ? "#3b82f6"
    : grade === "C" ? "#f59e0b"
    : grade === "D" ? "#f97316"
    : "#ef4444";

  const resultColor = passed ? "#10b981" : "#ef4444";
  const resultBg = passed ? "#f0fdf4" : "#fef2f2";
  const resultBorder = passed ? "#bbf7d0" : "#fecaca";

  return (
    <div
      className="min-h-screen p-4 sm:p-6"
      style={{
        background: "linear-gradient(135deg, #f8faff 0%, #ffffff 50%, #f5f7ff 100%)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');`}</style>

      <div className="max-w-lg mx-auto">

        {/* ── Back ── */}
        <button
          onClick={() => router.push("/student/exams")}
          className="text-slate-400 hover:text-slate-700 text-sm flex items-center gap-1 mb-6 transition-colors"
        >
          ← Back to Exams
        </button>

        {/* ── Header ── */}
        <div className="mb-2">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">
            Exam Result
          </p>
          <h1
            className="text-2xl font-bold text-slate-800 mt-0.5"
            style={{ letterSpacing: "-0.02em" }}
          >
            {exam?.title || "Exam"}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {exam?.course_name || exam?.course_id}
          </p>
        </div>

        {/* ── Result Banner ── */}
        <div
          className="rounded-2xl px-5 py-3 mb-5 flex items-center gap-3 text-sm font-semibold mt-4"
          style={{ background: resultBg, border: `1.5px solid ${resultBorder}`, color: resultColor }}
        >
          <span className="text-xl">{passed ? "🎉" : "😔"}</span>
          {passed
            ? "Congratulations! You passed this exam."
            : `You didn't pass this time. Pass mark is ${passMark}%.`}
        </div>

        {/* ── Score Ring Card ── */}
        <div
          className="rounded-3xl p-6 bg-white mb-5"
          style={{ border: "1px solid #e8edf5", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
        >
          <ScoreRing score={score} passed={passed} passMark={passMark} />

          {/* Grade badge */}
          <div className="flex justify-center mt-4">
            <span
              className="px-4 py-1.5 rounded-full text-sm font-black"
              style={{
                background: `${gradeColor}15`,
                color: gradeColor,
                border: `1.5px solid ${gradeColor}30`,
              }}
            >
              Grade {grade}
            </span>
          </div>

          {/* Pass mark indicator */}
          <p className="text-center text-xs text-slate-400 mt-2">
            Pass mark: <span className="font-semibold text-slate-600">{passMark}%</span>
            {" · "}
            Your score: <span className="font-semibold" style={{ color: resultColor }}>{score}%</span>
          </p>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <StatCard
            icon="✅"
            label="Correct"
            value={correct}
            accent="#10b981"
          />
          <StatCard
            icon="❌"
            label="Wrong"
            value={wrong}
            accent="#ef4444"
          />
          <StatCard
            icon="📝"
            label="Total"
            value={total}
            accent="#8b5cf6"
          />
        </div>

        {/* ── Score breakdown bar ── */}
        <div
          className="rounded-2xl p-5 bg-white mb-5"
          style={{ border: "1px solid #e8edf5", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
        >
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            Score Breakdown
          </p>

          {/* Segmented bar */}
          <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex mb-3">
            <div
              className="h-full bg-emerald-400 transition-all duration-1000"
              style={{ width: `${total > 0 ? (correct / total) * 100 : 0}%` }}
            />
            <div
              className="h-full bg-red-400 transition-all duration-1000"
              style={{ width: `${total > 0 ? (wrong / total) * 100 : 0}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              Correct ({total > 0 ? Math.round((correct / total) * 100) : 0}%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
              Wrong ({total > 0 ? Math.round((wrong / total) * 100) : 0}%)
            </span>
          </div>
        </div>

        {/* ── Exam info ── */}
        {exam && (
          <div
            className="rounded-2xl p-5 bg-white mb-6"
            style={{ border: "1px solid #e8edf5", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
          >
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
              Exam Details
            </p>
            <div className="space-y-2">
              {[
                { label: "Exam", value: exam.title },
                { label: "Course", value: exam.course_name || exam.course_id },
                { label: "Teacher", value: exam.teacher_name || "—" },
                {
                  label: "Due Date",
                  value: exam.exam_date
                    ? new Date(exam.exam_date).toLocaleDateString("en-GB", {
                        day: "2-digit", month: "long", year: "numeric",
                      })
                    : "—",
                },
                { label: "Duration", value: `${exam.duration_minutes || "—"} minutes` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">{label}</span>
                  <span className="text-xs font-semibold text-slate-600 text-right max-w-xs truncate">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push("/student/exams")}
            className="w-full py-3 rounded-2xl text-sm font-bold text-white transition-all active:scale-95 shadow-lg shadow-violet-200"
            style={{ background: "linear-gradient(135deg,#8b5cf6,#7c3aed)" }}
          >
            ← Back to Exams
          </button>
          <button
            onClick={() => router.push("/student/dashboard")}
            className="w-full py-3 rounded-2xl text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors"
            style={{ border: "1px solid #e2e8f0" }}
          >
            Go to Dashboard
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6 mb-4">
          Result ID: <span className="font-mono">{result.result_id}</span>
        </p>
      </div>
    </div>
  );
}
