"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Banknote, CheckCircle, Search, Loader, AlertCircle,
  User, BookOpen, ChevronDown, RefreshCw, Receipt, X,
  Building2, Users, DollarSign, Hash, Phone, BadgeCheck,
  Download, Wifi, Calendar, GraduationCap, TrendingUp,
  CreditCard, ArrowUpRight, Clock, Filter
} from "lucide-react";
import { guardRoute, authFetch } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;

// ─── Design tokens (match layout.jsx brand) ────────────────────────────────
const BRAND      = "#1E40AF";   // blue-800
const BRAND_LIGHT = "#DBEAFE";  // blue-100

export default function ManagerPaymentsPage() {
  const router = useRouter();
  const [user, setUser]         = useState(null);
  const [courses, setCourses]   = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [allPayments, setAllPayments] = useState([]);

  const [activeTab, setActiveTab]   = useState("mark");
  const [loading, setLoading]       = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);

  const [courseSearch, setCourseSearch] = useState("");
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [historySearch, setHistorySearch] = useState("");
  const [historyMonth, setHistoryMonth]   = useState("ALL");

  const [error, setError]   = useState("");
  const [success, setSuccess] = useState("");

  const [payModal, setPayModal]     = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [exporting, setExporting]   = useState(false);

  useEffect(() => {
    const authorised = guardRoute("MANAGER", router);
    if (authorised) { setUser(authorised); loadCourses(); loadAllPayments(); }
  }, [router]);

  async function loadCourses() {
    setCoursesLoading(true);
    try {
      const res  = await authFetch(`${API}/courses`);
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch { showMsg("Failed to load courses.", true); }
    finally { setCoursesLoading(false); }
  }

  async function loadStudentsForCourse(course) {
    if (!course) return;
    setLoading(true); setStudents([]); setSearch(""); setFilterStatus("ALL");
    try {
      const res  = await authFetch(`${API}/payments/manager/course/${course.course_id}`);
      const data = await res.json();
      if (data.success) setStudents(data.students);
      else showMsg(data.error || "Failed to load students.", true);
    } catch { showMsg("Network error.", true); }
    finally { setLoading(false); }
  }

  async function loadAllPayments() {
    try {
      const res  = await authFetch(`${API}/payments/admin/all`);
      const data = await res.json();
      if (data.success) setAllPayments(data.payments);
    } catch {}
  }

  function handleCourseSelect(course) {
    setSelectedCourse(course);
    setStudents([]);
    loadStudentsForCourse(course);
  }

  function showMsg(msg, isError = false) {
    if (isError) { setError(msg);   setTimeout(() => setError(""),   4500); }
    else         { setSuccess(msg); setTimeout(() => setSuccess(""), 4000); }
  }

  function openPayModal(student) {
    setPayModal({ student });
    setCustomAmount(selectedCourse?.fee ? String(selectedCourse.fee) : "");
  }

  async function confirmPayment() {
    if (!payModal || !selectedCourse) return;
    if (!customAmount || isNaN(customAmount) || parseFloat(customAmount) <= 0) {
      showMsg("Please enter a valid amount.", true); return;
    }
    setSubmitting(true);
    try {
      const res  = await authFetch(`${API}/payments/physical`, {
        method: "POST",
        body: JSON.stringify({
          student_id: payModal.student.student_id,
          course_id: selectedCourse.course_id,
          amount: parseFloat(customAmount),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPayModal(null);
        showMsg(`✓ ${payModal.student.student_name} paid and enrolled in "${selectedCourse.title}".`);
        loadStudentsForCourse(selectedCourse);
        loadAllPayments();
      } else showMsg(data.error || "Failed to record payment.", true);
    } catch { showMsg("Network error.", true); }
    finally { setSubmitting(false); }
  }

  const filteredCourses = useMemo(() => {
    const q = courseSearch.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.course_id.toLowerCase().includes(q) ||
      (c.teacher_name || "").toLowerCase().includes(q)
    );
  }, [courses, courseSearch]);

  function highlight(text, query) {
    if (!query || !text) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-yellow-100 text-yellow-900 rounded px-0.5">
          {text.slice(idx, idx + query.length)}
        </mark>
        {text.slice(idx + query.length)}
      </>
    );
  }

  const monthOptions = Array.from(new Set(
    allPayments.map(p => {
      const d = new Date(p.payment_date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    })
  )).sort().reverse();

  const filteredHistory = allPayments.filter(p => {
    const q = historySearch.toLowerCase();
    const matchSearch =
      (p.student_name || "").toLowerCase().includes(q) ||
      (p.student_id   || "").toLowerCase().includes(q) ||
      (p.course_title || "").toLowerCase().includes(q);
    const matchMonth = historyMonth === "ALL" || (() => {
      const d = new Date(p.payment_date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` === historyMonth;
    })();
    return matchSearch && matchMonth;
  });

  const filteredStudents = students.filter(s => {
    const matchSearch =
      s.student_name.toLowerCase().includes(search.toLowerCase()) ||
      s.student_id.toLowerCase().includes(search.toLowerCase()) ||
      (s.phone_no || "").includes(search);
    const matchStatus =
      filterStatus === "ALL" ||
      (filterStatus === "PAID"   &&  s.is_enrolled) ||
      (filterStatus === "UNPAID" && !s.is_enrolled);
    return matchSearch && matchStatus;
  });

  const paidCount   = students.filter(s =>  s.is_enrolled).length;
  const unpaidCount = students.filter(s => !s.is_enrolled).length;

  const totalRevenue = allPayments.reduce((s, p) => s + parseFloat(p.amount || 0), 0);
  const cashCount    = allPayments.filter(p => p.payment_type === "CASH").length;
  const onlineCount  = allPayments.filter(p => p.payment_type === "ONLINE").length;

  function exportToExcel() {
    setExporting(true);
    try {
      const headers = ["Payment ID", "Student Name", "Student ID", "Course", "Amount (Rs.)", "Method", "Date & Time"];
      const rows = filteredHistory.map(p => [
        p.payment_id, p.student_name, p.student_id, p.course_title,
        parseFloat(p.amount).toFixed(2),
        p.payment_type === "ONLINE" ? "Online (PayHere)" : "Cash at Counter",
        new Date(p.payment_date).toLocaleString("en-US", {
          year: "numeric", month: "short", day: "numeric",
          hour: "2-digit", minute: "2-digit",
        }),
      ]);
      const summary = [
        [],
        ["--- SUMMARY ---"],
        ["Total Records", filteredHistory.length],
        ["Total Revenue (Rs.)", filteredHistory.reduce((s, p) => s + parseFloat(p.amount || 0), 0).toFixed(2)],
        ["Exported On", new Date().toLocaleString("en-US")],
      ];
      const escape = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
      const csv    = [...[headers, ...rows, ...summary].map(r => r.map(escape).join(","))].join("\n");
      const blob   = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url    = URL.createObjectURL(blob);
      const a      = document.createElement("a");
      a.href = url; a.download = `payments-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally { setTimeout(() => setExporting(false), 800); }
  }

  return (
    <div className="space-y-6">

      {/* ══ PAGE HEADER ══════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: BRAND_LIGHT }}>
              <Banknote size={18} style={{ color: BRAND }} />
            </div>
            Payments &amp; Enrollment
          </h1>
          <p className="text-sm text-gray-500 mt-1 ml-10.5">Record cash payments and enroll students into courses.</p>
        </div>
        <button
          onClick={() => { loadAllPayments(); if (selectedCourse) loadStudentsForCourse(selectedCourse); }}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* ══ KPI CARDS ════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Payments",
            value: allPayments.length,
            icon: <Receipt size={20} />,
            color: "blue",
            suffix: "records",
          },
          {
            label: "Total Revenue",
            value: `Rs. ${totalRevenue.toLocaleString()}`,
            icon: <TrendingUp size={20} />,
            color: "green",
            suffix: "collected",
          },
          {
            label: "Cash Payments",
            value: cashCount,
            icon: <Building2 size={20} />,
            color: "orange",
            suffix: "transactions",
          },
          {
            label: "Online Payments",
            value: onlineCount,
            icon: <Wifi size={20} />,
            color: "purple",
            suffix: "transactions",
          },
        ].map((kpi, i) => {
          const palette = {
            blue:   { bg: "bg-blue-50",   icon: "text-blue-600",   val: "text-blue-700"  },
            green:  { bg: "bg-green-50",  icon: "text-green-600",  val: "text-green-700" },
            orange: { bg: "bg-orange-50", icon: "text-orange-600", val: "text-orange-700"},
            purple: { bg: "bg-violet-50", icon: "text-violet-600", val: "text-violet-700"},
          }[kpi.color];
          return (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className={`w-10 h-10 ${palette.bg} ${palette.icon} rounded-xl flex items-center justify-center mb-3`}>
                {kpi.icon}
              </div>
              <p className={`text-xl font-bold ${palette.val}`}>{kpi.value}</p>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      {/* ══ ALERTS ═══════════════════════════════════════════════════════════ */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3.5 text-sm font-semibold">
          <AlertCircle size={18} className="shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-3.5 text-sm font-semibold">
          <CheckCircle size={18} className="shrink-0" /> {success}
        </div>
      )}

      {/* ══ TABS ═════════════════════════════════════════════════════════════ */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit border border-gray-200">
        {[
          { key: "mark",    label: "Mark Payment",     icon: <CreditCard size={15} /> },
          { key: "history", label: "Payment History",  icon: <Receipt size={15} />,
            badge: allPayments.length > 0 ? allPayments.length : null },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              activeTab === t.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <span className={activeTab === t.key ? "text-blue-700" : ""}>{t.icon}</span>
            {t.label}
            {t.badge && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === t.key ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-500"
              }`}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>


      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1 — MARK PHYSICAL PAYMENT
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "mark" && (
        <div className="space-y-5">

          {/* ── Step 1: Select Course ─────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">

            {/* Section header */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: BRAND }}>
                1
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Select a Course</p>
                <p className="text-xs text-gray-400">Choose the course you want to enroll the student into</p>
              </div>
            </div>

            <div className="p-6">
              {coursesLoading ? (
                <div className="flex items-center gap-2.5 text-sm font-medium text-gray-500 py-4">
                  <Loader size={16} className="animate-spin text-blue-600" /> Loading courses…
                </div>
              ) : (
                <>
                  {/* Search */}
                  <div className="relative max-w-lg mb-4">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      value={courseSearch}
                      onChange={e => setCourseSearch(e.target.value)}
                      placeholder="Search by title, course ID, or teacher…"
                      className="w-full border border-gray-200 rounded-xl pl-10 pr-9 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-blue-400 transition"
                      style={{ "--tw-ring-color": BRAND_LIGHT }}
                    />
                    {courseSearch && (
                      <button onClick={() => setCourseSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 font-medium mb-3">
                    {courseSearch.trim()
                      ? `${filteredCourses.length} of ${courses.length} courses`
                      : `${courses.length} courses available`}
                  </p>

                  {filteredCourses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                      <BookOpen size={32} className="mb-2 opacity-20" />
                      <p className="text-sm text-gray-500 font-medium">No courses match your search.</p>
                      <button onClick={() => setCourseSearch("")} className="mt-1.5 text-xs text-blue-600 hover:underline">Clear search</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      {filteredCourses.map(c => {
                        const isSelected = selectedCourse?.course_id === c.course_id;
                        const q = courseSearch.trim();
                        return (
                          <button
                            key={c.course_id}
                            onClick={() => handleCourseSelect(c)}
                            className={`text-left p-4 rounded-xl border-2 transition-all duration-150 ${
                              isSelected
                                ? "border-blue-600 bg-blue-50 shadow-sm"
                                : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50"
                            }`}
                          >
                            {/* Selected indicator */}
                            {isSelected && (
                              <div className="flex items-center gap-1.5 mb-2">
                                <CheckCircle size={13} className="text-blue-600" />
                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">Selected</span>
                              </div>
                            )}
                            <p className={`text-sm font-semibold leading-snug mb-2.5 ${isSelected ? "text-blue-900" : "text-gray-900"}`}>
                              {highlight(c.title, q)}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-500">
                                <Hash size={9} /> {highlight(c.course_id, q)}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-green-100 text-green-700">
                                <DollarSign size={9} /> Rs. {parseFloat(c.fee).toLocaleString()}
                              </span>
                              {c.teacher_name && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">
                                  <GraduationCap size={9} /> {highlight(c.teacher_name, q)}
                                </span>
                              )}
                              {c.enrolled_count != null && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                                  <Users size={9} /> {c.enrolled_count}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Selected course bar */}
                  {selectedCourse && (
                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 items-center bg-blue-50 border border-blue-100 rounded-xl px-5 py-3.5">
                      <span className="text-xs font-bold text-blue-800 uppercase tracking-widest">Selected:</span>
                      <span className="text-sm font-semibold text-blue-900">{selectedCourse.title}</span>
                      <span className="text-xs font-mono text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">{selectedCourse.course_id}</span>
                      <span className="text-sm font-bold text-green-700">Rs. {parseFloat(selectedCourse.fee).toLocaleString()}</span>
                      {selectedCourse.teacher_name && (
                        <span className="text-xs font-medium text-blue-700 flex items-center gap-1">
                          <GraduationCap size={12} /> {selectedCourse.teacher_name}
                        </span>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ── Step 2: Student List ─────────────────────────────────────── */}
          {selectedCourse && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

              {/* Section header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: BRAND }}>
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Student Payment Status</p>
                    <p className="text-xs text-gray-400">{selectedCourse.title}</p>
                  </div>
                </div>

                {/* Status pills */}
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg">
                    <CheckCircle size={13} /> {paidCount} Paid
                  </span>
                  <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg">
                    <Clock size={13} /> {unpaidCount} Pending
                  </span>
                </div>
              </div>

              {/* Toolbar */}
              <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search name, ID, or phone…"
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 transition"
                  />
                </div>
                <div className="flex gap-1 bg-gray-200/70 p-1 rounded-xl border border-gray-200 self-start">
                  {["ALL", "UNPAID", "PAID"].map(s => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                        filterStatus === s
                          ? s === "UNPAID" ? "bg-white text-amber-700 shadow-sm border border-amber-200"
                          : s === "PAID"   ? "bg-white text-green-700 shadow-sm border border-green-200"
                          : "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {s === "ALL" ? `All (${students.length})` : s === "PAID" ? `Paid (${paidCount})` : `Pending (${unpaidCount})`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Student list */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                  <Loader size={24} className="animate-spin text-blue-600" />
                  <span className="text-sm font-medium">Loading student data…</span>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <User size={40} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium text-gray-500">No students match your filters.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50 max-h-[550px] overflow-y-auto">
                  {filteredStudents.map((student, idx) => (
                    <div
                      key={student.student_id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 hover:bg-gray-50/80 transition-colors gap-4 ${
                        student.is_enrolled ? "bg-green-50/20" : ""
                      }`}
                    >
                      {/* Left: student info */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                          student.is_enrolled
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {student.student_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{student.student_name}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                              <Hash size={10} /> {student.student_id}
                            </span>
                            {student.phone_no && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                                <Phone size={10} /> {student.phone_no}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: status / action */}
                      <div className="flex items-center sm:justify-end flex-shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                        {student.is_enrolled ? (
                          <div className="text-left sm:text-right">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-green-700 bg-green-100 border border-green-200 px-3 py-1.5 rounded-lg">
                              <BadgeCheck size={14} /> Enrolled
                            </span>
                            <p className="text-[11px] text-gray-400 font-medium mt-1.5">
                              Rs. {parseFloat(student.paid_amount || 0).toLocaleString()} · {student.payment_type === "ONLINE" ? "Online" : "Cash"}
                            </p>
                          </div>
                        ) : (
                          <button
                            onClick={() => openPayModal(student)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md"
                            style={{ backgroundColor: BRAND }}
                            onMouseOver={e => e.currentTarget.style.opacity = "0.9"}
                            onMouseOut={e => e.currentTarget.style.opacity = "1"}
                          >
                            <Banknote size={15} /> Mark Payment
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}


      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2 — PAYMENT HISTORY
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "history" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Toolbar */}
          <div className="px-6 py-5 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-gray-50/50">
            <div className="relative w-full md:max-w-sm">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                value={historySearch}
                onChange={e => setHistorySearch(e.target.value)}
                placeholder="Search name, ID, or course…"
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 transition"
              />
            </div>

            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <div className="relative">
                <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none" />
                <select
                  value={historyMonth}
                  onChange={e => setHistoryMonth(e.target.value)}
                  className="pl-9 pr-8 py-2.5 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 appearance-none cursor-pointer min-w-[160px]"
                >
                  <option value="ALL">All Months</option>
                  {monthOptions.map(m => {
                    const [y, mo] = m.split("-");
                    const label = new Date(parseInt(y), parseInt(mo) - 1).toLocaleString("en-US", { month: "long", year: "numeric" });
                    return <option key={m} value={m}>{label}</option>;
                  })}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              <button
                onClick={exportToExcel}
                disabled={exporting || filteredHistory.length === 0}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm"
              >
                {exporting ? <Loader size={15} className="animate-spin" /> : <Download size={15} />}
                Export CSV
              </button>
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Receipt size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium text-gray-500">No payment records found.</p>
              <p className="text-xs mt-1 text-gray-400">Try adjusting your search or month filter.</p>
            </div>
          ) : (
            <>
              {/* Summary strip */}
              <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center gap-8">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{filteredHistory.length}</p>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Records</p>
                </div>
                <div className="w-px h-8 bg-gray-200 hidden sm:block" />
                <div>
                  <p className="text-lg font-bold text-green-600">
                    Rs. {filteredHistory.reduce((s, p) => s + parseFloat(p.amount || 0), 0).toLocaleString()}
                  </p>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Revenue</p>
                </div>
                <div className="w-px h-8 bg-gray-200 hidden sm:block" />
                <div>
                  <p className="text-lg font-bold text-orange-600">{filteredHistory.filter(p => p.payment_type === "CASH").length}</p>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Cash</p>
                </div>
                <div className="w-px h-8 bg-gray-200 hidden sm:block" />
                <div>
                  <p className="text-lg font-bold text-blue-600">{filteredHistory.filter(p => p.payment_type === "ONLINE").length}</p>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Online</p>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {["Student", "Course", "Amount", "Method", "Date & Time", "Ref #"].map(h => (
                        <th key={h} className="px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredHistory.map(p => (
                      <tr key={p.payment_id} className="hover:bg-blue-50/20 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">{p.student_name}</p>
                          <p className="text-[11px] font-mono text-gray-400 mt-0.5">{p.student_id}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-700 font-medium max-w-[180px] truncate" title={p.course_title}>{p.course_title}</p>
                          <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded mt-1 inline-block">{p.course_id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-green-700 bg-green-50 border border-green-100 px-3 py-1 rounded-lg">
                            Rs. {parseFloat(p.amount).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border ${
                            p.payment_type === "ONLINE"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-orange-50 text-orange-700 border-orange-200"
                          }`}>
                            {p.payment_type === "ONLINE" ? <Wifi size={12} /> : <Building2 size={12} />}
                            {p.payment_type === "ONLINE" ? "Online" : "Cash"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500 font-medium">
                          {new Date(p.payment_date).toLocaleString("en-US", {
                            year: "numeric", month: "short", day: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-4 text-[11px] font-mono text-gray-400">
                          {p.payment_id}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}


      {/* ══ PAYMENT CONFIRMATION MODAL ═══════════════════════════════════════ */}
      {payModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">

            {/* Modal header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: BRAND_LIGHT }}>
                  <CreditCard size={18} style={{ color: BRAND }} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Confirm Payment</h3>
              </div>
              <button
                onClick={() => setPayModal(null)}
                className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Details card */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 space-y-3 mb-5">
              {[
                { label: "Student", value: payModal.student.student_name, icon: <User size={13} /> },
                {
                  label: "Student ID",
                  value: <span className="font-mono text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{payModal.student.student_id}</span>,
                  icon: <Hash size={13} />
                },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    {row.icon} {row.label}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">{row.value}</span>
                </div>
              ))}

              <div className="border-t border-gray-200 pt-3 space-y-3">
                <div className="flex items-start justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide mt-0.5">
                    <BookOpen size={13} /> Course
                  </span>
                  <span className="text-sm font-semibold text-gray-900 text-right max-w-[200px] leading-snug">{selectedCourse.title}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    <Hash size={13} /> Course ID
                  </span>
                  <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{selectedCourse.course_id}</span>
                </div>
                {selectedCourse.teacher_name && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      <GraduationCap size={13} /> Teacher
                    </span>
                    <span className="text-sm font-semibold text-gray-900">{selectedCourse.teacher_name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Amount input */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cash Amount Received <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">Rs.</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={e => setCustomAmount(e.target.value)}
                  min="0" step="0.01"
                  className="w-full border-2 border-gray-200 focus:border-blue-500 rounded-xl pl-12 pr-4 py-3.5 text-xl font-bold text-gray-900 bg-white focus:outline-none transition"
                />
              </div>
              <p className="flex justify-between text-xs font-medium text-gray-400 mt-2">
                <span>Standard fee</span>
                <span className="text-blue-600 font-semibold">Rs. {parseFloat(selectedCourse.fee).toLocaleString()}</span>
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setPayModal(null)}
                className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmPayment}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-3 text-white rounded-xl text-sm font-semibold disabled:opacity-60 transition-all shadow-md"
                style={{ backgroundColor: BRAND }}
              >
                {submitting ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                {submitting ? "Processing…" : "Confirm & Enroll"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}