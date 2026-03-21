"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Banknote, CheckCircle, Search, Loader, AlertCircle,
  User, BookOpen, ChevronDown, RefreshCw, Receipt, X,
  Building2, Users, DollarSign, Hash, Phone, BadgeCheck,
  Download, Wifi, Calendar
} from "lucide-react";
import { guardRoute, authFetch } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;

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
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [historySearch, setHistorySearch] = useState("");
  const [historyMonth, setHistoryMonth]   = useState("ALL");
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");

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

  function handleCourseSelect(course_id) {
    const course = courses.find(c => c.course_id === course_id);
    setSelectedCourse(course || null);
    setStudents([]);
    if (course) loadStudentsForCourse(course);
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
        body: JSON.stringify({ student_id: payModal.student.student_id, course_id: selectedCourse.course_id, amount: parseFloat(customAmount) }),
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

  function exportToExcel() {
    setExporting(true);
    try {
      const headers = ["Payment ID", "Student Name", "Student ID", "Course", "Amount (Rs.)", "Method", "Date & Time"];
      const rows = filteredHistory.map(p => [
        p.payment_id, p.student_name, p.student_id, p.course_title,
        parseFloat(p.amount).toFixed(2),
        p.payment_type === "ONLINE" ? "Online (PayHere)" : "Cash at Counter",
        new Date(p.payment_date).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      ]);
      const summary = [[], ["--- SUMMARY ---"],
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

  const filteredStudents = students.filter(s => {
    const matchSearch = s.student_name.toLowerCase().includes(search.toLowerCase()) || s.student_id.toLowerCase().includes(search.toLowerCase()) || (s.phone_no || "").includes(search);
    const matchStatus = filterStatus === "ALL" || (filterStatus === "PAID" && s.is_enrolled) || (filterStatus === "UNPAID" && !s.is_enrolled);
    return matchSearch && matchStatus;
  });

  const paidCount   = students.filter(s =>  s.is_enrolled).length;
  const unpaidCount = students.filter(s => !s.is_enrolled).length;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Banknote className="text-indigo-600" size={32} /> Payments & Enrollment
          </h1>
          <p className="text-sm text-gray-500 mt-1">Record cash payments and manually enroll students into courses.</p>
        </div>
        <button onClick={() => { loadAllPayments(); if (selectedCourse) loadStudentsForCourse(selectedCourse); }}
          className="flex items-center justify-center gap-2 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-5 py-3 rounded-xl transition w-full md:w-auto">
          <RefreshCw size={16} /> Refresh Data
        </button>
      </div>

      {/* Alerts */}
      {error   && <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 rounded-xl px-5 py-4 text-sm font-bold animate-in fade-in zoom-in duration-300"><AlertCircle size={20} /> {error}</div>}
      {success && <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 rounded-xl px-5 py-4 text-sm font-bold animate-in fade-in zoom-in duration-300"><CheckCircle size={20} /> {success}</div>}

      {/* 2. Modern Pill Tabs */}
      <div className="flex flex-wrap bg-gray-200/50 p-1.5 rounded-xl w-max border border-gray-200/60">
        {[
          { key: "mark",    label: "Mark Physical Payment", icon: <Building2 size={16} /> },
          { key: "history", label: "All Payment Records",   icon: <Receipt size={16} /> },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${
              activeTab === t.key 
              ? "bg-white text-indigo-700 shadow-sm" 
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
            }`}>
            {t.icon} {t.label}
            {t.key === "history" && allPayments.length > 0 && (
              <span className={`ml-1 text-[10px] px-2 py-0.5 rounded-full ${activeTab === t.key ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-500'}`}>
                {allPayments.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══ TAB 1: MARK PAYMENT ══ */}
      {activeTab === "mark" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Step 1 Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-sm font-extrabold text-gray-400 uppercase tracking-widest mb-4">Step 1 — Select Course</h2>
            {coursesLoading ? (
              <div className="flex items-center gap-2 text-indigo-600 font-medium"><Loader size={16} className="animate-spin" /> Loading available courses...</div>
            ) : (
              <div className="relative max-w-xl">
                <BookOpen size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" />
                <select 
                  value={selectedCourse?.course_id || ""} 
                  onChange={e => handleCourseSelect(e.target.value)} 
                  className="w-full border-2 border-gray-200 hover:border-indigo-300 rounded-xl pl-12 pr-10 py-3.5 text-sm font-bold text-gray-900 bg-white appearance-none focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition cursor-pointer"
                >
                  <option value="">— Choose a course to manage payments —</option>
                  {courses.map(c => <option key={c.course_id} value={c.course_id} className="text-gray-900">{c.title} (Rs. {parseFloat(c.fee).toLocaleString()})</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            )}
            
            {selectedCourse && (
              <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-xl px-5 py-4 flex flex-wrap gap-6 items-center">
                <div className="flex items-center gap-2 text-indigo-800"><Hash size={16} className="opacity-50" /><span className="text-sm font-mono font-bold">{selectedCourse.course_id}</span></div>
                <div className="w-px h-6 bg-indigo-200 hidden sm:block"></div>
                <div className="flex items-center gap-2 text-indigo-800"><DollarSign size={16} className="opacity-50" /><span className="text-sm font-extrabold">Fee: Rs. {parseFloat(selectedCourse.fee).toLocaleString()}</span></div>
                <div className="w-px h-6 bg-indigo-200 hidden sm:block"></div>
                <div className="flex items-center gap-2 text-indigo-800"><Users size={16} className="opacity-50" /><span className="text-sm font-bold">{selectedCourse.enrolled_count} Students Enrolled</span></div>
              </div>
            )}
          </div>

          {/* Step 2 Card */}
          {selectedCourse && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              
              {/* Toolbar */}
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="w-full md:w-1/2 relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    placeholder="Search by student name, ID, or phone..."
                    className="w-full pl-11 pr-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm" 
                  />
                </div>
                <div className="flex gap-2 w-full md:w-auto bg-gray-200/50 p-1 rounded-xl border border-gray-200">
                  {["ALL", "UNPAID", "PAID"].map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)}
                      className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                        filterStatus === s
                        ? s === "UNPAID" ? "bg-white text-yellow-700 shadow-sm border border-yellow-200"
                        : s === "PAID" ? "bg-white text-green-700 shadow-sm border border-green-200"
                        : "bg-white text-gray-900 shadow-sm border border-gray-200"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
                      }`}>
                      {s === "ALL" ? `All (${students.length})` : s === "PAID" ? `Paid (${paidCount})` : `Unpaid (${unpaidCount})`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Student List */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-indigo-600 gap-3"><Loader size={28} className="animate-spin" /><span className="font-bold">Fetching student data...</span></div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-20 text-gray-400"><User size={48} className="mx-auto mb-3 opacity-20" /><p className="font-medium text-gray-500">No students match your search filters.</p></div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                  {filteredStudents.map(student => (
                    <div key={student.student_id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-gray-50 transition-colors gap-4 ${student.is_enrolled ? "bg-green-50/20" : ""}`}>
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-sm border-2 ${student.is_enrolled ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-700 border-gray-200"}`}>
                          {student.student_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 text-base truncate">{student.student_name}</p>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md"><Hash size={12}/> {student.student_id}</span>
                            {student.phone_no && <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500"><Phone size={12} /> {student.phone_no}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center sm:justify-end flex-shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                        {student.is_enrolled ? (
                          <div className="text-left sm:text-right">
                            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-green-700 bg-green-100 border border-green-200 px-3 py-1.5 rounded-lg"><BadgeCheck size={16} /> Paid & Enrolled</span>
                            <p className="text-xs font-bold text-gray-400 mt-2">Rs. {parseFloat(student.paid_amount || 0).toLocaleString()} • {student.payment_type === "ONLINE" ? "Online PayHere" : "Physical Cash"}</p>
                          </div>
                        ) : (
                          <button onClick={() => openPayModal(student)} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-900 hover:bg-indigo-600 text-white text-sm font-bold px-6 py-3 rounded-xl transition shadow-md hover:shadow-lg">
                            <Banknote size={18} /> Mark Payment
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

      {/* ══ TAB 2: HISTORY ══ */}
      {activeTab === "history" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Enhanced Toolbar */}
          <div className="p-5 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                value={historySearch} 
                onChange={e => setHistorySearch(e.target.value)} 
                placeholder="Search history by name, ID, or course..."
                className="w-full pl-12 pr-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm" 
              />
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-auto">
                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" />
                <select 
                  value={historyMonth} 
                  onChange={e => setHistoryMonth(e.target.value)}
                  className="w-full sm:w-48 pl-11 pr-10 py-3 text-sm font-bold text-gray-900 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer shadow-sm"
                >
                  <option value="ALL">All Months</option>
                  {monthOptions.map(m => {
                    const [y, mo] = m.split("-");
                    const label = new Date(parseInt(y), parseInt(mo) - 1).toLocaleString("en-US", { month: "long", year: "numeric" });
                    return <option key={m} value={m}>{label}</option>;
                  })}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              
              <button onClick={exportToExcel} disabled={exporting || filteredHistory.length === 0}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-bold px-6 py-3 rounded-xl transition shadow-md hover:shadow-lg">
                {exporting ? <Loader size={18} className="animate-spin" /> : <Download size={18} />} Export Excel
              </button>
            </div>
          </div>

          {/* Table Content */}
          {filteredHistory.length === 0 ? (
            <div className="text-center py-24 text-gray-400 bg-white">
              <Receipt size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg font-bold text-gray-500">No payment records found.</p>
              <p className="text-sm mt-1">Try adjusting your search or month filter.</p>
            </div>
          ) : (
            <>
              {/* Summary Bar */}
              <div className="px-6 py-4 bg-white border-b border-gray-100 flex flex-wrap gap-8 items-center">
                <div className="flex items-center gap-2"><span className="text-2xl font-black text-gray-900">{filteredHistory.length}</span><span className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Total Records</span></div>
                <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>
                <div className="flex flex-col"><span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Revenue</span><span className="text-lg font-black text-green-600">Rs. {filteredHistory.reduce((s,p)=>s+parseFloat(p.amount||0),0).toLocaleString()}</span></div>
                <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>
                <div className="flex flex-col"><span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Cash Payments</span><span className="text-lg font-black text-orange-600">{filteredHistory.filter(p=>p.payment_type==="CASH").length}</span></div>
                <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>
                <div className="flex flex-col"><span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Online Payments</span><span className="text-lg font-black text-blue-600">{filteredHistory.filter(p=>p.payment_type==="ONLINE").length}</span></div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-gray-50 text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                    <tr>{["Student Details", "Course", "Amount Paid", "Method", "Date & Time", "Reference No"].map(h=><th key={h} className="px-6 py-4 border-b border-gray-200">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredHistory.map(p=>(
                      <tr key={p.payment_id} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900 text-sm">{p.student_name}</p>
                          <p className="text-xs font-mono text-gray-500 mt-0.5">{p.student_id}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-gray-700 truncate max-w-[200px]" title={p.course_title}>{p.course_title}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-black text-green-600 bg-green-50 px-3 py-1 rounded-lg">Rs. {parseFloat(p.amount).toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg border ${p.payment_type==="ONLINE"?"bg-blue-50 text-blue-700 border-blue-200":"bg-orange-50 text-orange-700 border-orange-200"}`}>
                            {p.payment_type==="ONLINE"?<Wifi size={14}/>:<Building2 size={14}/>} {p.payment_type==="ONLINE"?"Online PayHere":"Cash Counter"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-gray-600">
                          {new Date(p.payment_date).toLocaleString("en-US",{year:"numeric",month:"short",day:"numeric", hour:"2-digit", minute:"2-digit"})}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono font-bold text-gray-400">
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

      {/* ══ PAYMENT MODAL ══ */}
      {payModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-extrabold text-gray-900 flex items-center gap-3 text-xl"><Building2 size={24} className="text-indigo-600" /> Confirm Payment</h3>
              <button onClick={() => setPayModal(null)} className="text-gray-400 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition"><X size={20} /></button>
            </div>
            
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 space-y-4 mb-6">
              <div className="flex justify-between items-center"><span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2"><User size={14}/>Student Name</span><span className="text-sm font-bold text-gray-900">{payModal.student.student_name}</span></div>
              <div className="flex justify-between items-center"><span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2"><Hash size={14}/>Student ID</span><span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-md">{payModal.student.student_id}</span></div>
              <div className="w-full h-px bg-indigo-100"></div>
              <div className="flex justify-between items-start"><span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mt-0.5"><BookOpen size={14}/>Course</span><span className="text-sm font-bold text-gray-900 text-right max-w-[200px] leading-tight">{selectedCourse.title}</span></div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-extrabold text-gray-800 mb-2">Amount Received (Cash) <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rs.</span>
                <input 
                  type="number" 
                  value={customAmount} 
                  onChange={e => setCustomAmount(e.target.value)} 
                  min="0" step="0.01"
                  className="w-full border-2 border-gray-200 focus:border-indigo-500 rounded-xl pl-12 pr-4 py-4 text-xl font-black text-gray-900 bg-white focus:outline-none shadow-sm transition" 
                />
              </div>
              <p className="text-xs font-bold text-indigo-500 mt-2 flex justify-between">
                <span>Standard Course Fee:</span>
                <span>Rs. {parseFloat(selectedCourse.fee).toLocaleString()}</span>
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setPayModal(null)} className="w-full py-3.5 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
              <button onClick={confirmPayment} disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 text-white rounded-xl text-sm font-bold disabled:opacity-60 transition-all">
                {submitting ? <Loader size={18} className="animate-spin" /> : <CheckCircle size={18} />} Enroll & Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}