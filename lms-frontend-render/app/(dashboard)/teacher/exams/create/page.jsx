"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "../../../../../lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;

//  Empty Question Template
const emptyQuestion = () => ({
  id: Date.now() + Math.random(),
  question: "",
  options: ["", "", "", ""],
  correctAnswer: 0,
});

//  Step Indicator
function StepIndicator({ current, steps }) {
  return (
    <div className="flex items-center gap-0 mb-10">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                i < current
                  ? "bg-blue-600 text-white"
                  : i === current
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/40 scale-110"
                    : "bg-white/5 text-slate-500 border border-white/10"
              }`}
            >
              {i < current ? "✓" : i + 1}
            </div>
            <p
              className={`text-xs mt-1.5 font-medium whitespace-nowrap ${
                i === current ? "text-blue-500" : "text-slate-600"
              }`}
            >
              {step}
            </p>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-16 h-px mx-1 mb-5 transition-all duration-500 ${
                i < current ? "bg-blue-600" : "bg-white/8"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// Input Field Wrapper
function Field({ label, children, hint }) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-medium text-slate-500 mb-1.5">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-600 mt-1">{hint}</p>}
    </div>
  );
}

const inputClass =
  "w-full px-4 py-2.5 rounded-xl text-sm text-slate-800 placeholder-slate-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-600/40";
const inputStyle = {
  background: "rgba(0, 0, 0, 0.04)",
  border: "1px solid rgba(0, 0, 0, 0,012)",
};

const getLocalISODate = (value = new Date()) => {
  const offsetMs = value.getTimezoneOffset() * 60000;
  return new Date(value.getTime() - offsetMs).toISOString().slice(0, 10);
};

// Question Builder Card
function QuestionCard({ question, index, onChange, onDelete }) {
  const updateOption = (i, val) => {
    const opts = [...question.options];
    opts[i] = val;
    onChange({ ...question, options: opts });
  };

  return (
    <div
      className="rounded-2xl p-5 mb-4 relative"
      style={{
        background: "rgba(139,92,246,0.04)",
        border: "1px solid rgba(139,92,246,0.15)",
      }}
    >
      {/* Question header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-blue-500 tracking-widest uppercase">
          Question {index + 1}
        </span>
        <button
          onClick={onDelete}
          className="text-slate-600 hover:text-red-400 transition-colors text-lg leading-none"
          title="Delete question"
        >
          ✕
        </button>
      </div>

      {/* Question text */}
      <textarea
        rows={2}
        placeholder="Enter your question here..."
        value={question.question}
        onChange={(e) => onChange({ ...question, question: e.target.value })}
        className={`${inputClass} resize-none mb-4`}
        style={inputStyle}
      />

      {/* Options */}
      <p className="text-xs text-slate-500 mb-2 font-medium">
        Answer Options — click the circle to mark correct answer
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {question.options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            {/* Correct answer selector */}
            <button
              onClick={() => onChange({ ...question, correctAnswer: i })}
              className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                question.correctAnswer === i
                  ? "border-blue-500 bg-blue-500/20"
                  : "border-slate-600 hover:border-slate-400"
              }`}
            >
              {question.correctAnswer === i && (
                <span className="text-blue-500 text-xs font-bold">✓</span>
              )}
            </button>
            <input
              type="text"
              placeholder={`Option ${String.fromCharCode(65 + i)}`}
              value={opt}
              onChange={(e) => updateOption(i, e.target.value)}
              className={`${inputClass} flex-1`}
              style={{
                ...inputStyle,
                borderColor:
                  question.correctAnswer === i
                    ? "rgba(52,211,153,0.3)"
                    : "rgba(255,255,255,0.09)",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

//  Review Summary
function ReviewSummary({ details, questions, courses }) {
  const course = courses.find((c) => c.course_id === details.courseId);
  return (
    <div className="space-y-4">
      <div
        className="rounded-2xl p-5"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <p className="text-xs text-slate-500 uppercase tracking-widest font-medium mb-3">
          Exam Details
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            ["Title", details.title],
            ["Course", course?.title || "—"],
            ["Duration", `${details.duration} minutes`],
            ["Due Date", details.dueDate || "—"],
            ["Total Questions", questions.length],
            ["Pass Mark", `${details.passMark}%`],
            ["Max Attempts", details.maxAttempts],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-sm text-slate-500 font-medium">{value}</p>
            </div>
          ))}
        </div>
        {details.instructions && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <p className="text-xs text-slate-500 mb-1">Instructions</p>
            <p className="text-sm text-slate-300">{details.instructions}</p>
          </div>
        )}
      </div>

      {/* Questions preview */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "rgba(0,0,0,0.04)",
          border: "1px solid rgba(0,0,0,0.12)",
        }}
      >
        <p className="text-xs text-slate-500 uppercase tracking-widest font-medium mb-3">
          Questions Preview
        </p>
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {questions.map((q, i) => (
            <div key={q.id} className="text-sm">
              <p className="text-slate-500 font-medium mb-1">
                {i + 1}.{" "}
                {q.question || (
                  <span className="text-red-400 italic">Empty question</span>
                )}
              </p>
              <div className="grid grid-cols-2 gap-1 pl-3">
                {q.options.map((opt, j) => (
                  <p
                    key={j}
                    className={`text-xs ${
                      q.correctAnswer === j
                        ? "text-emerald-400 font-semibold"
                        : "text-slate-500"
                    }`}
                  >
                    {String.fromCharCode(65 + j)}. {opt || "—"}
                    {q.correctAnswer === j && " ✓"}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main Page
export default function CreateExamPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [courses, setCourses] = useState([]);

  const [details, setDetails] = useState({
    title: "",
    courseId: "",
    duration: 30,
    dueDate: "",
    maxAttempts: 1,
    instructions: "",
    passMark: 50,
  });

  const [questions, setQuestions] = useState([emptyQuestion()]);

  const steps = ["Exam Details", "Add Questions", "Review & Publish"];

  // ── Fetch teacher's own courses on mount ───────────
  useEffect(() => {
    authFetch(`${API}/exams/teacher/my-courses`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCourses(data);
      })
      .catch((err) => console.error("Failed to load courses:", err));
  }, []);

  //  Validation
  const validateStep0 = () => {
    const e = {};
    if (!details.title.trim()) e.title = "Title is required";
    if (!details.courseId) e.courseId = "Please select a course";
    if (!details.duration || details.duration < 5)
      e.duration = "Minimum 5 minutes";
    if (!details.dueDate) {
      e.dueDate = "Due date is required";
    } else {
      const selected = new Date(details.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selected.setHours(0, 0, 0, 0);
      if (selected < today) e.dueDate = "Due date cannot be in the past";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep1 = () => {
    const e = {};
    if (questions.length === 0) e.questions = "Add at least one question";
    questions.forEach((q, i) => {
      if (!q.question.trim()) e[`q${i}`] = `Question ${i + 1} is empty`;
      if (q.options.some((o) => !o.trim()))
        e[`q${i}_opts`] = `Question ${i + 1} has empty options`;
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 0 && !validateStep0()) return;
    if (step === 1 && !validateStep1()) return;
    setErrors({});
    setStep((s) => s + 1);
  };

  //  Submit
  const handleSubmit = async () => {
    setSubmitting(true);
    setErrors({});
    try {
      const payload = { ...details, questions };
      const res = await authFetch(`${API}/exams`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setErrors({ api: data.error || "Failed to create exam" });
      }
    } catch (err) {
      setErrors({ api: err.message });
    }
    setSubmitting(false);
  };

  //  Question helpers
  const addQuestion = () => setQuestions((q) => [...q, emptyQuestion()]);
  const updateQuestion = (id, updated) =>
    setQuestions((q) => q.map((x) => (x.id === id ? updated : x)));
  const deleteQuestion = (id) =>
    setQuestions((q) => q.filter((x) => x.id !== id));

  //  Success Screen
  if (submitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');`}</style>
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-blue-600/20 border border-blue-600/40 flex items-center justify-center mx-auto mb-5 text-4xl">
            🎉
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Exam Published!
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            <span className="text-blue-500 font-semibold">
              {details.title}
            </span>{" "}
            is now live for enrolled students.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push("/dashboard/teacher/exams")}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all"
            >
              View All Exams
            </button>
            <button
              onClick={() => {
                setSubmitted(false);
                setStep(0);
                setDetails({
                  title: "",
                  courseId: "",
                  duration: 30,
                  dueDate: "",
                  maxAttempts: 1,
                  instructions: "",
                  passMark: 50,
                });
                setQuestions([emptyQuestion()]);
              }}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-all"
              style={{
                background: "rgba(26, 160, 95, 0.05)",
                border: "1px solid rgba(25, 56, 157, 0.08)",
              }}
            >
              Create Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Render
  return (
    <div
      className="min-h-screen p-6"
      style={{
        background:
          "linear-gradient(135deg, #6d7690 0%, #0ffffff 50%, #f8faff 100%)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(37,99,235,0.3); border-radius: 4px; }
      `}</style>

      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => (step > 0 ? setStep((s) => s - 1) : router.back())}
          className="text-slate-500 hover:text-white text-sm flex items-center gap-1 mb-4 transition-colors"
        >
          ← Back
        </button>
        <p className="text-slate-500 text-xs uppercase tracking-widest font-medium mb-1">
          Exam Management
        </p>
        <h1
          className="text-2xl font-bold text-slate-800"
          style={{ letterSpacing: "-0.02em" }}
        >
          Create New Exam
        </h1>
      </div>

      {/* Step Indicator */}
      <StepIndicator current={step} steps={steps} />

      {/* ── STEP 0: Exam Details ── */}
      {step === 0 && (
        <div className="max-w-xl">
          <Field label="Exam Title *">
            <input
              type="text"
              placeholder="e.g. English Grammar Fundamentals"
              value={details.title}
              onChange={(e) =>
                setDetails({ ...details, title: e.target.value })
              }
              className={inputClass}
              style={{
                ...inputStyle,
                borderColor: errors.title ? "rgba(239,68,68,0.5)" : undefined,
              }}
            />
            {errors.title && (
              <p className="text-red-400 text-xs mt-1">{errors.title}</p>
            )}
          </Field>

          <Field label="Course *">
            <select
              value={details.courseId}
              onChange={(e) =>
                setDetails({ ...details, courseId: e.target.value })
              }
              className={inputClass}
              style={{
                ...inputStyle,
                borderColor: errors.courseId
                  ? "rgba(239,68,68,0.5)"
                  : undefined,
              }}
            >
              <option value="" style={{ background: "#0d1117" }}>
                Select a course
              </option>
              {courses.map((c) => (
                <option
                  key={c.course_id}
                  value={c.course_id}
                  style={{ background: "#7687a1" }}
                >
                  {c.title}
                </option>
              ))}
            </select>
            {errors.courseId && (
              <p className="text-red-400 text-xs mt-1">{errors.courseId}</p>
            )}
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Duration (minutes) *">
              <input
                type="number"
                min={5}
                max={180}
                value={details.duration}
                onChange={(e) =>
                  setDetails({ ...details, duration: Number(e.target.value) })
                }
                className={inputClass}
                style={{
                  ...inputStyle,
                  borderColor: errors.duration
                    ? "rgba(239,68,68,0.5)"
                    : undefined,
                }}
              />
              {errors.duration && (
                <p className="text-red-400 text-xs mt-1">{errors.duration}</p>
              )}
            </Field>

            <Field label="Pass Mark (%)">
              <input
                type="number"
                min={1}
                max={100}
                value={details.passMark}
                onChange={(e) =>
                  setDetails({ ...details, passMark: Number(e.target.value) })
                }
                className={inputClass}
                style={inputStyle}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Due Date *">
              <input
                type="date"
                min={getLocalISODate()}
                value={details.dueDate}
                onChange={(e) =>
                  setDetails({ ...details, dueDate: e.target.value })
                }
                className={inputClass}
                style={{
                  ...inputStyle,
                  colorScheme: "dark",
                  borderColor: errors.dueDate
                    ? "rgba(239,68,68,0.5)"
                    : undefined,
                }}
              />
              {errors.dueDate && (
                <p className="text-red-400 text-xs mt-1">{errors.dueDate}</p>
              )}
            </Field>

            <Field label="Max Attempts">
              <select
                value={details.maxAttempts}
                onChange={(e) =>
                  setDetails({
                    ...details,
                    maxAttempts: Number(e.target.value),
                  })
                }
                className={inputClass}
                style={inputStyle}
              >
                {[1, 2, 3].map((n) => (
                  <option key={n} value={n} style={{ background: "#0d1117" }}>
                    {n} attempt{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field
            label="Instructions (optional)"
            hint="Students will see this before starting the exam."
          >
            <textarea
              rows={3}
              placeholder="e.g. Read each question carefully. No external materials allowed."
              value={details.instructions}
              onChange={(e) =>
                setDetails({ ...details, instructions: e.target.value })
              }
              className={`${inputClass} resize-none`}
              style={inputStyle}
            />
          </Field>
        </div>
      )}

      {/* ── STEP 1: Add Questions ── */}
      {step === 1 && (
        <div className="max-w-2xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-white font-semibold">
                {questions.length} Question{questions.length !== 1 ? "s" : ""}
              </p>
              <p className="text-slate-500 text-xs">
                Click the circle ● to mark the correct answer
              </p>
            </div>
            <button
              onClick={addQuestion}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-blue-500 border border-blue-600/30 hover:bg-blue-600/10 transition-all"
            >
              + Add Question
            </button>
          </div>

          {/* Error summary */}
          {Object.keys(errors).length > 0 && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-xs font-medium">
                ⚠ Please fix the following before continuing:
              </p>
              {Object.values(errors).map((e, i) => (
                <p key={i} className="text-red-400/80 text-xs mt-0.5">
                  • {e}
                </p>
              ))}
            </div>
          )}

          {questions.map((q, i) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={i}
              onChange={(updated) => updateQuestion(q.id, updated)}
              onDelete={() => questions.length > 1 && deleteQuestion(q.id)}
            />
          ))}

          <button
            onClick={addQuestion}
            className="w-full py-3 rounded-2xl text-sm font-medium text-slate-500 hover:text-blue-500 transition-all duration-200 mt-2"
            style={{ border: "2px dashed rgba(255,255,255,0.08)" }}
          >
            + Add Another Question
          </button>
        </div>
      )}

      {/* ── STEP 2: Review ── */}
      {step === 2 && (
        <div className="max-w-xl">
          <p className="text-slate-400 text-sm mb-5">
            Review everything before publishing. Students will be able to see
            this exam once published.
          </p>
          <ReviewSummary
            details={details}
            questions={questions}
            courses={courses}
          />
        </div>
      )}

      {/* ── Navigation Buttons ── */}
      <div className="flex items-center gap-3 mt-8 max-w-2xl">
        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-all"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            ← Back
          </button>
        )}

        {step < 2 ? (
          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-600/25 active:scale-95"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-600/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                Publishing...
              </>
            ) : (
              "🚀 Publish Exam"
            )}
          </button>
        )}

        {step === 1 && (
          <span className="ml-auto text-xs text-slate-500 font-medium">
            {questions.length} question{questions.length !== 1 ? "s" : ""} added
          </span>
        )}
      </div>
    </div>
  );
}
