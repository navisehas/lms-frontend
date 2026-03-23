"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { authFetch } from "../../../../../lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;

// ─── Timer Hook ───────────────────────────────────────────────────────────────
function useTimer(durationMinutes, onExpire) {
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const intervalRef = useRef(null);
  const expiredRef = useRef(false);

  useEffect(() => {
    if (durationMinutes <= 0) return;
    setSecondsLeft(durationMinutes * 60);
    expiredRef.current = false;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          if (!expiredRef.current) {
            expiredRef.current = true;
            onExpire();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [durationMinutes]);

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const pct = durationMinutes > 0 ? (secondsLeft / (durationMinutes * 60)) * 100 : 100;
  const isWarning = secondsLeft <= 120 && secondsLeft > 60;
  const isDanger = secondsLeft <= 60;

  return { secondsLeft, fmt, pct, isWarning, isDanger };
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ answered, total }) {
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-500 mb-1.5">
        <span>{answered} of {total} answered</span>
        <span>{pct}% complete</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-slate-100">
        <div
          className="h-1.5 rounded-full transition-all duration-500 bg-violet-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Question Panel ───────────────────────────────────────────────────────────
function QuestionPanel({ question, index, total, selected, onSelect }) {
  const options = [
    { key: "A", val: question.option_a },
    { key: "B", val: question.option_b },
    { key: "C", val: question.option_c },
    { key: "D", val: question.option_d },
  ].filter((o) => o.val);

  const keyToIndex = { A: 0, B: 1, C: 2, D: 3 };

  return (
    <div
      className="rounded-2xl p-6 bg-white"
      style={{
        border: "1px solid #e8edf5",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}
    >
      {/* Question header */}
      <div className="flex items-start gap-3 mb-5">
        <span
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{ background: "linear-gradient(135deg,#8b5cf6,#6366f1)" }}
        >
          {index + 1}
        </span>
        <p className="text-slate-800 font-medium text-sm leading-relaxed pt-1">
          {question.question_text}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-2.5 ml-11">
        {options.map((opt) => {
          const isSelected = selected === keyToIndex[opt.key];
          return (
            <button
              key={opt.key}
              onClick={() => onSelect(keyToIndex[opt.key])}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                isSelected
                  ? "bg-violet-50 border-violet-400 text-violet-700 font-semibold shadow-sm shadow-violet-100"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-violet-50/40 hover:border-violet-200"
              }`}
              style={{
                border: `1.5px solid ${isSelected ? "#a78bfa" : "#e2e8f0"}`,
              }}
            >
              <span
                className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-violet-500 border-violet-500 text-white"
                    : "bg-white border-slate-300 text-slate-400"
                }`}
              >
                {opt.key}
              </span>
              {opt.val}
            </button>
          );
        })}
      </div>

      {/* Q progress */}
      <p className="text-right text-xs text-slate-400 mt-4">
        Question {index + 1} / {total}
      </p>
    </div>
  );
}

// ─── Navigator Dots ───────────────────────────────────────────────────────────
function QuestionNav({ total, current, answers, onJump }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: total }).map((_, i) => {
        const answered = answers[i] !== undefined;
        const isCurrent = i === current;
        return (
          <button
            key={i}
            onClick={() => onJump(i)}
            title={`Question ${i + 1}${answered ? " (answered)" : ""}`}
            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all duration-200 ${
              isCurrent
                ? "bg-violet-500 text-white shadow-md shadow-violet-200 scale-110"
                : answered
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}

// ─── Confirm Submit Modal ────────────────────────────────────────────────────
function ConfirmModal({ unanswered, total, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
        style={{ border: "1px solid #e8edf5" }}
      >
        <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-4 text-2xl">
          ⚠️
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">
          Submit Exam?
        </h3>
        {unanswered > 0 ? (
          <p className="text-slate-500 text-sm mb-5 leading-relaxed">
            You have{" "}
            <span className="text-amber-600 font-bold">{unanswered}</span>{" "}
            unanswered question{unanswered !== 1 ? "s" : ""} out of {total}.
            Unanswered questions will be marked wrong. Are you sure?
          </p>
        ) : (
          <p className="text-slate-500 text-sm mb-5 leading-relaxed">
            You've answered all {total} questions. Ready to submit?
          </p>
        )}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-violet-500 hover:bg-violet-600 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block" />
                Submitting…
              </>
            ) : (
              "Yes, Submit"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function TakeExamPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id;

  // ── State ───
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionIndex: answerIndex }

  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // ── Fetch exam ───
  useEffect(() => {
    if (!examId) return;
    setLoading(true);
    authFetch(`${API}/exams/${examId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setExam(data);
        // Strip correct_answer before exposing to student UI (defense in depth)
        setQuestions(
          (data.questions || []).map(({ correct_answer, ...q }) => q),
        );
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [examId]);

  // ── Timer expire → auto submit ───
  const handleExpire = useCallback(() => {
    submitExam(true);
  }, [answers, examId]);

  const { secondsLeft, fmt, pct: timerPct, isWarning, isDanger } = useTimer(
    started && exam ? exam.duration_minutes || 0 : 0,
    handleExpire,
  );

  // ── Submit logic ───
  const submitExam = async (autoSubmit = false) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Build answers map: { question_id: answerIndex }
      const answersPayload = {};
      questions.forEach((q, i) => {
        if (answers[i] !== undefined) {
          answersPayload[q.question_id] = answers[i];
        }
      });

      const res = await authFetch(`${API}/exams/${examId}/submit`, {
        method: "POST",
        body: JSON.stringify({ answers: answersPayload }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Submission failed");

      // Redirect to results page
      router.replace(`/student/results/${examId}`);
    } catch (err) {
      setSubmitError(err.message);
      setSubmitting(false);
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    setAnswers((prev) => ({ ...prev, [currentQ]: answerIndex }));
  };

  const answeredCount = Object.keys(answers).length;
  const unanswered = questions.length - answeredCount;

  // ─── Loading ───
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8faff", fontFamily: "'DM Sans', sans-serif" }}>
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading exam…</p>
        </div>
      </div>
    );
  }

  // ─── Error ───
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#f8faff", fontFamily: "'DM Sans', sans-serif" }}>
        <div className="text-center max-w-sm">
          <p className="text-4xl mb-3">❌</p>
          <p className="text-slate-700 font-semibold mb-2">Failed to load exam</p>
          <p className="text-slate-400 text-sm mb-5">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-violet-500 text-white hover:bg-violet-600 transition-colors"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  // ─── Already submitted (edge case) ───
  // ─── Intro / Start Screen ─────────────────────────────────────────────────
  if (!started) {
    const dueDate = exam?.exam_date
      ? new Date(exam.exam_date).toLocaleDateString("en-GB", {
          day: "2-digit", month: "long", year: "numeric",
        })
      : "—";

    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{
          background: "linear-gradient(135deg, #f8faff 0%, #ffffff 50%, #f5f7ff 100%)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');`}</style>
        <div className="max-w-md w-full">
          {/* Card */}
          <div
            className="rounded-3xl p-8 bg-white"
            style={{ border: "1px solid #e8edf5", boxShadow: "0 4px 32px rgba(139,92,246,0.10)" }}
          >
            {/* Icon */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-5 mx-auto"
              style={{ background: "linear-gradient(135deg,#ede9fe,#ddd6fe)" }}
            >
              📝
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-slate-800 text-center mb-1"
              style={{ letterSpacing: "-0.02em" }}>
              {exam?.title || "Untitled Exam"}
            </h1>
            <p className="text-sm text-center text-violet-600 font-medium mb-6">
              {exam?.course_name || exam?.course_id}
            </p>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { icon: "⏱", label: "Duration", val: `${exam?.duration_minutes || "—"} min` },
                { icon: "📝", label: "Questions", val: questions.length },
                { icon: "🎯", label: "Pass Mark", val: `${exam?.pass_mark || 50}%` },
                { icon: "📅", label: "Due Date", val: dueDate },
              ].map(({ icon, label, val }) => (
                <div
                  key={label}
                  className="rounded-xl p-3 text-center"
                  style={{ background: "#f8faff", border: "1px solid #eef2ff" }}
                >
                  <p className="text-lg mb-0.5">{icon}</p>
                  <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                  <p className="text-sm font-bold text-slate-700">{val}</p>
                </div>
              ))}
            </div>

            {/* Instructions */}
            {exam?.instructions && (
              <div
                className="rounded-xl p-4 mb-5 text-sm text-slate-600 leading-relaxed"
                style={{ background: "#fffbeb", border: "1px solid #fde68a" }}
              >
                <p className="font-semibold text-amber-700 text-xs uppercase tracking-widest mb-1.5">
                  📋 Instructions
                </p>
                {exam.instructions}
              </div>
            )}

            {/* Warning */}
            <div
              className="rounded-xl p-3 mb-5 text-xs text-slate-500 leading-relaxed"
              style={{ background: "#f8faff", border: "1px solid #e0e7ff" }}
            >
              ⚠️ Once you start, the timer begins immediately and cannot be paused. Ensure a stable internet connection before starting.
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => router.back()}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => setStarted(true)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 shadow-lg shadow-violet-200"
                style={{ background: "linear-gradient(135deg,#8b5cf6,#7c3aed)" }}
              >
                Start Exam 🚀
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Exam Taking UI ───────────────────────────────────────────────────────
  const timerColor = isDanger
    ? "#ef4444"
    : isWarning
      ? "#f59e0b"
      : "#8b5cf6";

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(135deg, #f8faff 0%, #ffffff 50%, #f5f7ff 100%)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');`}</style>

      {/* ── TOP BAR ── */}
      <div
        className="sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #e8edf5",
          boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
        }}
      >
        {/* Exam name */}
        <div className="flex-1 min-w-0 mr-4">
          <p className="text-xs text-slate-400 truncate">{exam?.course_name}</p>
          <p className="text-sm font-bold text-slate-700 truncate">{exam?.title}</p>
        </div>

        {/* Timer */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-base transition-all duration-300"
          style={{
            background: isDanger
              ? "rgba(239,68,68,0.08)"
              : isWarning
                ? "rgba(245,158,11,0.08)"
                : "rgba(139,92,246,0.08)",
            border: `1.5px solid ${timerColor}30`,
            color: timerColor,
          }}
        >
          <span className={isDanger ? "animate-pulse" : ""}>⏱</span>
          {fmt(secondsLeft)}
        </div>

        {/* Submit button */}
        <button
          onClick={() => setShowConfirm(true)}
          disabled={submitting}
          className="ml-3 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 shadow-sm"
          style={{ background: "linear-gradient(135deg,#8b5cf6,#7c3aed)" }}
        >
          Submit
        </button>
      </div>

      {/* ── TIMER STRIP ── */}
      <div
        className="h-1 transition-all duration-1000"
        style={{
          width: `${timerPct}%`,
          background: `linear-gradient(90deg, ${timerColor}, ${timerColor}90)`,
        }}
      />

      {/* ── BODY ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* LEFT: Question */}
        <div className="lg:col-span-2 space-y-4">
          {questions[currentQ] && (
            <QuestionPanel
              question={questions[currentQ]}
              index={currentQ}
              total={questions.length}
              selected={answers[currentQ]}
              onSelect={handleAnswerSelect}
            />
          )}

          {/* Prev / Next */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
              disabled={currentQ === 0}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-30 bg-white text-slate-600 hover:bg-slate-50"
              style={{ border: "1px solid #e2e8f0" }}
            >
              ← Prev
            </button>

            {/* Jump to first unanswered */}
            <button
              onClick={() => {
                const firstUnanswered = questions.findIndex(
                  (_, i) => answers[i] === undefined,
                );
                if (firstUnanswered !== -1) setCurrentQ(firstUnanswered);
              }}
              className="flex-1 py-2.5 rounded-xl text-xs font-medium text-violet-600 transition-all hover:bg-violet-50"
              style={{ border: "1px dashed #c4b5fd" }}
            >
              Jump to unanswered
            </button>

            <button
              onClick={() => setCurrentQ((q) => Math.min(questions.length - 1, q + 1))}
              disabled={currentQ === questions.length - 1}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-30 bg-white text-slate-600 hover:bg-slate-50"
              style={{ border: "1px solid #e2e8f0" }}
            >
              Next →
            </button>
          </div>
        </div>

        {/* RIGHT: Sidebar */}
        <div className="space-y-4">
          {/* Progress */}
          <div
            className="rounded-2xl p-4 bg-white"
            style={{ border: "1px solid #e8edf5", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}
          >
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
              Progress
            </p>
            <ProgressBar answered={answeredCount} total={questions.length} />
          </div>

          {/* Question navigator */}
          <div
            className="rounded-2xl p-4 bg-white"
            style={{ border: "1px solid #e8edf5", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}
          >
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
              Questions
            </p>
            <QuestionNav
              total={questions.length}
              current={currentQ}
              answers={answers}
              onJump={setCurrentQ}
            />
            {/* Legend */}
            <div className="flex gap-3 mt-3 pt-3 border-t border-slate-100">
              {[
                { color: "bg-violet-500", label: "Current" },
                { color: "bg-emerald-500", label: "Answered" },
                { color: "bg-slate-100", label: "Unanswered" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-sm ${color}`} />
                  <span className="text-xs text-slate-400">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={() => setShowConfirm(true)}
            disabled={submitting}
            className="w-full py-3 rounded-2xl text-sm font-bold text-white transition-all active:scale-95 shadow-lg shadow-violet-200"
            style={{ background: "linear-gradient(135deg,#8b5cf6,#7c3aed)" }}
          >
            🚀 Submit Exam
          </button>

          {submitError && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
              {submitError}
            </div>
          )}
        </div>
      </div>

      {/* ── CONFIRM MODAL ── */}
      {showConfirm && (
        <ConfirmModal
          unanswered={unanswered}
          total={questions.length}
          loading={submitting}
          onConfirm={() => submitExam(false)}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}