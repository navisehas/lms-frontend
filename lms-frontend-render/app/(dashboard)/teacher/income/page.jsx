"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp, DollarSign, Download, Loader, AlertCircle,
  RefreshCw, BookOpen, Users, BarChart3, ChevronRight,
  ArrowUpRight, Wallet, GraduationCap, Star, Clock
} from "lucide-react";
import { guardRoute, authFetch } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;

// ─── Helpers ────────────────────────────────────────────────────────────────
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
      map[key].gross_total += parseFloat(p.amount);
      map[key].teacher_income += parseFloat(p.teacher_share);
      map[key].institute_cut += parseFloat(p.amount) - parseFloat(p.teacher_share);
      map[key].payment_count += 1;
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
    `Your Share ${teacherPct}% (Rs.)`, `Institute (Rs.)`
  ];
  const rows = courses.map((c) => [
    c.course_title, c.enrolled_students,
    c.gross_total.toFixed(2), c.teacher_income.toFixed(2), c.institute_cut.toFixed(2)
  ]);
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `teacher-course-income-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Course Card ─────────────────────────────────────────────────────────────
function CourseCard({ course, teacherPct, isTop, maxIncome, onClick, isSelected }) {
  const pct = maxIncome > 0 ? (course.teacher_income / maxIncome) * 100 : 0;
  const colors = [
    { bar: "#10b981", bg: "rgba(16,185,129,0.08)", accent: "#10b981" },
    { bar: "#6366f1", bg: "rgba(99,102,241,0.08)", accent: "#6366f1" },
    { bar: "#f59e0b", bg: "rgba(245,158,11,0.08)", accent: "#f59e0b" },
    { bar: "#ef4444", bg: "rgba(239,68,68,0.08)", accent: "#ef4444" },
    { bar: "#8b5cf6", bg: "rgba(139,92,246,0.08)", accent: "#8b5cf6" },
  ];
  const colorIdx = Math.abs(course.course_id?.toString().split("").reduce((a, c) => a + c.charCodeAt(0), 0) || 0) % colors.length;
  const c = colors[colorIdx];

  return (
    <div
      onClick={onClick}
      style={{
        background: isSelected ? c.bg : "#fff",
        border: isSelected ? `1.5px solid ${c.accent}` : "1.5px solid #f0f0f0",
        borderRadius: 16,
        padding: "20px 22px",
        cursor: "pointer",
        transition: "all 0.18s ease",
        position: "relative",
        overflow: "hidden",
      }}
      className="hover:shadow-md"
    >
      {isTop && (
        <span style={{
          position: "absolute", top: 12, right: 12,
          background: "#fef3c7", color: "#d97706",
          fontSize: 10, fontWeight: 700, padding: "2px 8px",
          borderRadius: 99, display: "flex", alignItems: "center", gap: 3
        }}>
          <Star size={9} fill="#d97706" /> TOP
        </span>
      )}

      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: c.bg, display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <BookOpen size={15} color={c.accent} />
          </div>
          <p style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e", lineHeight: 1.3, flex: 1 }}>
            {course.course_title}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
        <div>
          <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2 }}>Your Income</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: c.accent, fontFamily: "'DM Mono', monospace" }}>
            Rs. {fmt(course.teacher_income)}
          </p>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2 }}>Students</p>
          <p style={{ fontSize: 18, fontWeight: 700, color: "#374151" }}>
            {course.enrolled_students}
          </p>
        </div>
      </div>

      <div style={{ background: "#f3f4f6", borderRadius: 99, height: 6, marginBottom: 8 }}>
        <div style={{
          width: `${pct}%`, height: "100%",
          background: c.bar, borderRadius: 99,
          transition: "width 0.6s ease"
        }} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontSize: 11, color: "#9ca3af" }}>
          {course.payment_count} payment{course.payment_count !== 1 ? "s" : ""} · Gross Rs. {fmt(course.gross_total)}
        </p>
        <ChevronRight size={14} color={isSelected ? c.accent : "#d1d5db"} />
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function TeacherIncomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
      const res = await authFetch(`${API}/income/teacher/${teacherId}/monthly`);
      const json = await res.json();
      if (json.success) setData(json);
      else setError(json.error || "Failed to load income data.");
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  const monthly = data?.monthly || [];
  const totals = data?.totals || {};
  const teacherPct = data?.teacher_share_pct || 80;
  const institutePct = data?.institute_share_pct || 20;

  const courses = useMemo(() => buildCourseMap(monthly), [monthly]);
  const maxIncome = courses[0]?.teacher_income || 0;

  const activeCourse = selectedCourse
    ? courses.find((c) => c.course_id === selectedCourse)
    : null;

  function doExport() {
    setExporting(true);
    try { exportCSV(courses, teacherPct); }
    finally { setTimeout(() => setExporting(false), 800); }
  }

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = [
    {
      label: "Total Earnings",
      value: `Rs. ${fmt(totals.teacher_income)}`,
      sub: `${teacherPct}% of gross Rs. ${fmt(totals.gross_total)}`,
      icon: <Wallet size={18} />, color: "#10b981", bg: "#ecfdf5"
    },
    {
      label: "My Courses",
      value: courses.length,
      sub: "With enrollment activity",
      icon: <BookOpen size={18} />, color: "#6366f1", bg: "#eef2ff"
    },
    {
      label: "Total Enrollments",
      value: courses.reduce((s, c) => s + c.enrolled_students, 0),
      sub: "Unique students across courses",
      icon: <GraduationCap size={18} />, color: "#f59e0b", bg: "#fffbeb"
    },
    {
      label: "Payments Received",
      value: totals.payment_count || 0,
      sub: "All-time transactions",
      icon: <BarChart3 size={18} />, color: "#ef4444", bg: "#fef2f2"
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fb", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        .hover\\:shadow-md:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 28 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div style={{ background: "#ecfdf5", borderRadius: 10, padding: 8 }}>
                <TrendingUp size={22} color="#10b981" />
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: 0 }}>
                My Income
              </h1>
            </div>
            <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>
              Course-wise earnings · You keep <strong style={{ color: "#10b981" }}>{teacherPct}%</strong> of every enrollment
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => user && fetchIncome(user.user_id)}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "9px 14px", fontSize: 13, color: "#374151", cursor: "pointer", fontWeight: 500 }}>
              <RefreshCw size={13} /> Refresh
            </button>
            <button
              onClick={doExport}
              disabled={exporting || courses.length === 0}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "#10b981", border: "none", borderRadius: 10, padding: "9px 16px", fontSize: 13, color: "#fff", cursor: "pointer", fontWeight: 700, opacity: exporting || courses.length === 0 ? 0.6 : 1 }}>
              {exporting ? <Loader size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Download size={13} />}
              Export CSV
            </button>
          </div>
        </div>

        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13 }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {/* ── Stat Cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 28 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #f0f0f0", padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ background: s.bg, borderRadius: 10, padding: 10, flexShrink: 0 }}>
                <span style={{ color: s.color }}>{s.icon}</span>
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 3px" }}>{s.label}</p>
                <p style={{ fontSize: 20, fontWeight: 800, color: s.color, margin: "0 0 2px", fontFamily: "'DM Mono', monospace" }}>{s.value}</p>
                <p style={{ fontSize: 11, color: "#d1d5db", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Content ── */}
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0", color: "#9ca3af", gap: 10 }}>
            <Loader size={20} style={{ animation: "spin 1s linear infinite" }} /> Loading income data…
          </div>
        ) : courses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", background: "#fff", borderRadius: 16, border: "1.5px solid #f0f0f0" }}>
            <DollarSign size={48} color="#e5e7eb" style={{ marginBottom: 12 }} />
            <p style={{ fontWeight: 700, color: "#374151", margin: "0 0 6px" }}>No income data yet</p>
            <p style={{ fontSize: 13, color: "#9ca3af" }}>Income appears once students enroll in your courses.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: activeCourse ? "1fr 380px" : "1fr", gap: 16, alignItems: "start" }}>

            {/* Course Grid */}
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                {courses.length} Course{courses.length !== 1 ? "s" : ""} with Income
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                {courses.map((course, idx) => (
                  <CourseCard
                    key={course.course_id}
                    course={course}
                    teacherPct={teacherPct}
                    isTop={idx === 0}
                    maxIncome={maxIncome}
                    isSelected={selectedCourse === course.course_id}
                    onClick={() => setSelectedCourse(selectedCourse === course.course_id ? null : course.course_id)}
                  />
                ))}
              </div>
            </div>

            {/* Course Detail Panel */}
            {activeCourse && (
              <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #f0f0f0", overflow: "hidden", position: "sticky", top: 20 }}>
                {/* Panel Header */}
                <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid #f3f4f6" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1, marginRight: 12 }}>
                      <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.07em" }}>Course Detail</p>
                      <p style={{ fontWeight: 800, fontSize: 15, color: "#111827", margin: 0, lineHeight: 1.3 }}>
                        {activeCourse.course_title}
                      </p>
                    </div>
                    <button onClick={() => setSelectedCourse(null)}
                      style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 12, cursor: "pointer", color: "#6b7280" }}>
                      ✕
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
                    {[
                      { label: "Your Income", val: `Rs. ${fmt(activeCourse.teacher_income)}`, color: "#10b981" },
                      { label: "Gross Total", val: `Rs. ${fmt(activeCourse.gross_total)}`, color: "#374151" },
                      { label: "Students", val: activeCourse.enrolled_students, color: "#6366f1" },
                      { label: "Payments", val: activeCourse.payment_count, color: "#f59e0b" },
                    ].map((s, i) => (
                      <div key={i} style={{ background: "#f8f9fb", borderRadius: 10, padding: "12px 14px" }}>
                        <p style={{ fontSize: 10, color: "#9ca3af", margin: "0 0 3px", textTransform: "uppercase" }}>{s.label}</p>
                        <p style={{ fontSize: 16, fontWeight: 800, color: s.color, margin: 0, fontFamily: "'DM Mono', monospace" }}>{s.val}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enrolled Students List */}
                <div style={{ padding: "16px 22px" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                    Enrollment History
                  </p>
                  <div style={{ maxHeight: 340, overflowY: "auto" }}>
                    {activeCourse.payments.map((p, i) => (
                      <div key={p.payment_id || i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
                        <div style={{ flex: 1, marginRight: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <Users size={12} color="#6366f1" />
                            </div>
                            <div>
                              <p style={{ fontSize: 12, fontWeight: 600, color: "#111827", margin: 0 }}>{p.student_name}</p>
                              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                                <Clock size={9} color="#9ca3af" />
                                <p style={{ fontSize: 10, color: "#9ca3af", margin: 0 }}>
                                  {new Date(p.payment_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </p>
                                <span style={{ fontSize: 10, background: p.payment_type === "ONLINE" ? "#dbeafe" : "#fef3c7", color: p.payment_type === "ONLINE" ? "#1d4ed8" : "#92400e", padding: "1px 6px", borderRadius: 99, fontWeight: 600 }}>
                                  {p.payment_type === "ONLINE" ? "Online" : "Cash"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 800, color: "#10b981", margin: "0 0 1px", fontFamily: "'DM Mono', monospace" }}>
                            Rs. {fmt(p.teacher_share)}
                          </p>
                          <p style={{ fontSize: 10, color: "#d1d5db", margin: 0 }}>of Rs. {fmt(p.amount)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}