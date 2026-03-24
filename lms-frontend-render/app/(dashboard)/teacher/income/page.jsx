"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp, DollarSign, Download, Loader2, AlertCircle,
  RefreshCw, BookOpen, Users, BarChart3, ChevronRight,
  Wallet, GraduationCap, Star, Clock,
} from "lucide-react";
import { guardRoute, authFetch } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n) =>
  parseFloat(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function buildCourseMap(monthly) {
  const map = {};
  for (const m of monthly) {
    for (const p of m.payments || []) {
      const key = p.course_id;
      if (!map[key]) {
        map[key] = {
          course_id: key,
          course_title: p.course_title,
          gross_total: 0,
          teacher_income: 0,
          institute_cut: 0,
          payment_count: 0,
          enrolled_students: new Set(),
          payments: [],
        };
      }
      map[key].gross_total    += parseFloat(p.amount);
      map[key].teacher_income += parseFloat(p.teacher_share);
      map[key].institute_cut  += parseFloat(p.amount) - parseFloat(p.teacher_share);
      map[key].payment_count  += 1;
      map[key].enrolled_students.add(p.student_id);
      map[key].payments.push({ ...p, month_label: m.month_label });
    }
  }
  return Object.values(map)
    .map((c) => ({ ...c, enrolled_students: c.enrolled_students.size }))
    .sort((a, b) => b.teacher_income - a.teacher_income);
}

function exportCSV(courses, teacherPct) {
  const headers = [
    "Course", "Students Enrolled", "Gross Amount (Rs.)",
    `Your Share ${teacherPct}% (Rs.)`, "Institute (Rs.)",
  ];
  const rows   = courses.map((c) => [
    c.course_title, c.enrolled_students,
    c.gross_total.toFixed(2), c.teacher_income.toFixed(2), c.institute_cut.toFixed(2),
  ]);
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv    = [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");
  const blob   = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url    = URL.createObjectURL(blob);
  const a      = document.createElement("a");
  a.href       = url;
  a.download   = `teacher-course-income-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Per-course colour palette ────────────────────────────────────────────────
const PALETTE = [
  { bar: "bg-blue-600",   accent: "text-blue-700",   icon: "text-blue-600",   iconBg: "bg-blue-50",   border: "border-blue-400"   },
  { bar: "bg-indigo-500", accent: "text-indigo-700",  icon: "text-indigo-600", iconBg: "bg-indigo-50", border: "border-indigo-400" },
  { bar: "bg-amber-500",  accent: "text-amber-700",   icon: "text-amber-600",  iconBg: "bg-amber-50",  border: "border-amber-400"  },
  { bar: "bg-rose-500",   accent: "text-rose-700",    icon: "text-rose-600",   iconBg: "bg-rose-50",   border: "border-rose-400"   },
  { bar: "bg-violet-500", accent: "text-violet-700",  icon: "text-violet-600", iconBg: "bg-violet-50", border: "border-violet-400" },
];

function getPalette(courseId) {
  const idx = Math.abs(
    String(courseId ?? "").split("").reduce((a, c) => a + c.charCodeAt(0), 0)
  ) % PALETTE.length;
  return PALETTE[idx];
}

// ─── Course Card ──────────────────────────────────────────────────────────────
function CourseCard({ course, isTop, maxIncome, onClick, isSelected }) {
  const pct = maxIncome > 0 ? (course.teacher_income / maxIncome) * 100 : 0;
  const p   = getPalette(course.course_id);

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border shadow-sm p-5 cursor-pointer hover:shadow-md transition-all duration-150 relative overflow-hidden ${
        isSelected ? `${p.border} border-2` : "border-gray-200"
      }`}
    >
      {isTop && (
        <span className="absolute top-3 right-3 flex items-center gap-1 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
          <Star size={9} fill="currentColor" /> TOP
        </span>
      )}

      {/* Title */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`${p.iconBg} p-2 rounded-lg flex-shrink-0`}>
          <BookOpen size={16} className={p.icon} />
        </div>
        <p className="text-sm font-bold text-gray-900 leading-snug">{course.course_title}</p>
      </div>

      {/* Income + Students */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-0.5">Your Income</p>
          <p className={`text-xl font-bold ${p.accent}`}>Rs. {fmt(course.teacher_income)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-gray-500 mb-0.5">Students</p>
          <p className="text-xl font-bold text-gray-900">{course.enrolled_students}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
        <div className={`${p.bar} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {course.payment_count} payment{course.payment_count !== 1 ? "s" : ""} · Gross Rs. {fmt(course.gross_total)}
        </p>
        <ChevronRight size={14} className={isSelected ? p.icon : "text-gray-300"} />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TeacherIncomePage() {
  const router = useRouter();
  const [user, setUser]           = useState(null);
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [exporting, setExporting] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    const auth = guardRoute("TEACHER", router);
    if (auth) { setUser(auth); fetchIncome(auth.user_id); }
  }, [router]);

  async function fetchIncome(teacherId) {
    setLoading(true);
    setError("");
    try {
      const res  = await authFetch(`${API}/income/teacher/${teacherId}/monthly`);
      const json = await res.json();
      if (json.success) setData(json);
      else setError(json.error || "Failed to load income data.");
    } catch { setError("Network error. Please try again."); }
    finally  { setLoading(false); }
  }

  const monthly    = data?.monthly || [];
  const totals     = data?.totals  || {};
  const teacherPct = data?.teacher_share_pct || 80;

  const courses   = useMemo(() => buildCourseMap(monthly), [monthly]);
  const maxIncome = courses[0]?.teacher_income || 0;
  const activeCourse = selectedCourse
    ? courses.find((c) => c.course_id === selectedCourse)
    : null;

  function doExport() {
    setExporting(true);
    try { exportCSV(courses, teacherPct); }
    finally { setTimeout(() => setExporting(false), 800); }
  }

  // Stat cards — same markup pattern as dashboard
  const stats = [
    {
      label: "Total Earnings",
      value: `Rs. ${fmt(totals.teacher_income)}`,
      sub:   `${teacherPct}% of gross Rs. ${fmt(totals.gross_total)}`,
      icon:  <Wallet size={24} />,
      iconBg: "bg-blue-50", iconColor: "text-blue-600",
    },
    {
      label: "My Courses",
      value: courses.length,
      sub:   "With enrollment activity",
      icon:  <BookOpen size={24} />,
      iconBg: "bg-emerald-50", iconColor: "text-emerald-600",
    },
    {
      label: "Total Enrollments",
      value: courses.reduce((s, c) => s + c.enrolled_students, 0),
      sub:   "Unique students",
      icon:  <GraduationCap size={24} />,
      iconBg: "bg-orange-50", iconColor: "text-orange-600",
    },
    {
      label: "Payments Received",
      value: totals.payment_count || 0,
      sub:   "All-time transactions",
      icon:  <BarChart3 size={24} />,
      iconBg: "bg-violet-50", iconColor: "text-violet-600",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* ── Page heading — identical pattern to dashboard h1 ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Income</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Course-wise earnings · You keep{" "}
            <span className="font-bold text-blue-700">{teacherPct}%</span> of every enrollment
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => user && fetchIncome(user.user_id)}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={doExport}
            disabled={exporting || courses.length === 0}
            className="flex items-center gap-2 text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 px-4 py-2 rounded-lg transition shadow-sm"
          >
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Export CSV
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Info banner */}
      <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm">
        <TrendingUp size={16} className="text-blue-700 flex-shrink-0" />
        <span className="text-blue-800">
          <span className="font-bold">Income Split:</span> You earn{" "}
          <span className="font-bold">{teacherPct}%</span> of each course fee. The institute retains{" "}
          <span className="font-bold">{100 - teacherPct}%</span>.
        </span>
      </div>

      {/* ── Stat Cards — same structure as dashboard ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
            <div className="min-w-0 mr-3">
              <p className="text-sm font-medium text-gray-500">{s.label}</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">
                {loading
                  ? <Loader2 className="w-6 h-6 animate-spin text-gray-300 mt-2" />
                  : s.value}
              </h3>
              <span className="text-xs text-gray-400 mt-1 block">{s.sub}</span>
            </div>
            <div className={`p-3 ${s.iconBg} ${s.iconColor} rounded-full flex-shrink-0`}>
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      {/* ── Main content ── */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
          <Loader2 size={20} className="animate-spin" /> Loading income data…
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <DollarSign size={48} className="mx-auto mb-3 text-gray-200" />
          <p className="font-bold text-gray-500">No income data yet.</p>
          <p className="text-sm text-gray-400 mt-1">Income appears once students enroll in your courses.</p>
        </div>
      ) : (
        <div className={`grid gap-6 ${activeCourse ? "lg:grid-cols-[1fr_380px]" : "grid-cols-1"}`}>

          {/* Course grid */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {courses.length} Course{courses.length !== 1 ? "s" : ""} with Income
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {courses.map((course, i) => (
                <CourseCard
                  key={course.course_id}
                  course={course}
                  isTop={i === 0}
                  maxIncome={maxIncome}
                  isSelected={selectedCourse === course.course_id}
                  onClick={() =>
                    setSelectedCourse(selectedCourse === course.course_id ? null : course.course_id)
                  }
                />
              ))}
            </div>
          </div>

          {/* Detail panel */}
          {activeCourse && (() => {
            return (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-4">

                {/* Header */}
                <div className="bg-blue-50 border-b border-blue-100 px-5 py-4">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">Course Detail</p>
                      <p className="text-sm font-bold text-gray-900 leading-snug">{activeCourse.course_title}</p>
                    </div>
                    <button
                      onClick={() => setSelectedCourse(null)}
                      className="text-xs font-semibold text-gray-500 bg-white border border-gray-200 px-2.5 py-1 rounded-lg hover:bg-gray-50 flex-shrink-0"
                    >
                      ✕ Close
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Your Income", val: `Rs. ${fmt(activeCourse.teacher_income)}`, color: "text-blue-700" },
                      { label: "Gross Total",  val: `Rs. ${fmt(activeCourse.gross_total)}`,   color: "text-gray-900" },
                      { label: "Students",     val: activeCourse.enrolled_students,            color: "text-indigo-700" },
                      { label: "Payments",     val: activeCourse.payment_count,                color: "text-amber-700" },
                    ].map((s, i) => (
                      <div key={i} className="bg-white rounded-lg px-3 py-2.5 border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">{s.label}</p>
                        <p className={`text-base font-bold ${s.color}`}>{s.val}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enrollment history */}
                <div className="px-5 py-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Enrollment History</h3>
                  <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100">
                    {activeCourse.payments.map((pay, i) => (
                      <div key={pay.payment_id || i} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                            <Users size={13} className="text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{pay.student_name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Clock size={10} className="text-gray-400" />
                              <span className="text-xs text-gray-400">
                                {new Date(pay.payment_date).toLocaleDateString("en-US", {
                                  month: "short", day: "numeric", year: "numeric",
                                })}
                              </span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                pay.payment_type === "ONLINE"
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}>
                                {pay.payment_type === "ONLINE" ? "Online" : "Cash"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="text-sm font-bold text-blue-700">Rs. {fmt(pay.teacher_share)}</p>
                          <p className="text-[10px] text-gray-400">of Rs. {fmt(pay.amount)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}