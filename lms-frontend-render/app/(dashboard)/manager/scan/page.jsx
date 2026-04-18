"use client";
import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  Camera, CheckCircle, XCircle, RefreshCw,
  User, Keyboard, QrCode, Search, BookOpen, Clock,
  AlertTriangle, CreditCard, X, Loader, Plus,
  GraduationCap, Timer, Banknote
} from "lucide-react";
import { authFetch } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function QRScannerPage() {
  const [scanResult,       setScanResult]       = useState(null);
  const [activeTab,        setActiveTab]        = useState("scan");
  const [manualId,         setManualId]         = useState("");
  const [loading,          setLoading]          = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [courseSearch,     setCourseSearch]     = useState("");

  // Pay modal
  const [payModal,      setPayModal]      = useState(null);
  const [paySubmitting, setPaySubmitting] = useState(false);
  const [markOnPay,     setMarkOnPay]     = useState(true);

  const scannerRef = useRef(null);

  // ── Scanner ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab === "scan" && !scanResult) {
      const t = setTimeout(() => {
        const el = document.getElementById("reader");
        if (el && !scannerRef.current) {
          try {
            scannerRef.current = new Html5QrcodeScanner(
              "reader",
              { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
              false
            );
            scannerRef.current.render(
              (decoded) => { scannerRef.current?.pause(true); processStudent(decoded); },
              () => {}
            );
          } catch (e) { console.error("Scanner init:", e); }
        }
      }, 100);
      return () => clearTimeout(t);
    }
  }, [activeTab, scanResult]);

  useEffect(() => () => {
    scannerRef.current?.clear().catch(console.error);
    scannerRef.current = null;
  }, []);

  const handleTabChange = (tab) => {
    scannerRef.current?.clear().catch(console.error);
    scannerRef.current = null;
    setActiveTab(tab);
  };

  // ── Fetch student + all courses ────────────────────────────────────────────
  async function processStudent(studentId) {
    setLoading(true);
    setAttendanceStatus(null);
    setCourseSearch("");
    try {
      const res  = await authFetch(`${API}/attendance/student/${studentId}`);
      const data = await res.json();
      if (scannerRef.current) {
        await scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
      if (res.ok) setScanResult({ success: true, data, method: activeTab });
      else        setScanResult({ success: false, message: data.error || `ID '${studentId}' not found.` });
    } catch {
      setScanResult({ success: false, message: "Network error. Make sure the server is running." });
      scannerRef.current?.resume();
    } finally { setLoading(false); }
  }

  // ── Mark attendance only ───────────────────────────────────────────────────
  async function handleMarkAttendance(courseId, courseTitle) {
    setAttendanceStatus({ loading: true, courseId });
    try {
      const res  = await authFetch(`${API}/attendance/mark`, {
        method: "POST",
        body: JSON.stringify({ student_id: scanResult.data.user_id, course_id: courseId }),
      });
      const data = await res.json();
      setAttendanceStatus(
        res.ok
          ? { type: "success", message: `✓ Marked Present — "${courseTitle}"`, courseId }
          : { type: "error",   message: data.error, courseId }
      );
    } catch {
      setAttendanceStatus({ type: "error", message: "Failed to connect to server.", courseId });
    }
  }

  // ── Open pay modal ─────────────────────────────────────────────────────────
  function openPayModal(course) {
    setPayModal({ course });
    setMarkOnPay(true);
  }

  // ── Pay + Enroll + (optional) Attendance ──────────────────────────────────
  async function handleConfirmPay() {
    if (!payModal) return;
    const amount = parseFloat(payModal.course.fee);
    if (!amount || isNaN(amount) || amount <= 0) {
      alert("Course fee is not set. Contact admin."); return;
    }
    setPaySubmitting(true);
    try {
      const res  = await authFetch(`${API}/payments/scan-pay-attend`, {
        method: "POST",
        body: JSON.stringify({
          student_id:      scanResult.data.user_id,
          course_id:       payModal.course.course_id,
          amount,
          mark_attendance: markOnPay,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setScanResult(prev => ({
          ...prev,
          data: {
            ...prev.data,
            courses: prev.data.courses.map(c =>
              c.course_id === payModal.course.course_id
                ? { ...c, payment_status: "PAID", is_enrolled: true }
                : c
            ),
          },
        }));
        setAttendanceStatus({
          type:     "success",
          message:  data.message,
          courseId: payModal.course.course_id,
        });
        setPayModal(null);
      } else {
        alert(data.error || "Payment failed.");
      }
    } catch { alert("Network error."); }
    finally { setPaySubmitting(false); }
  }

  function handleManualSubmit(e) {
    e.preventDefault();
    if (!manualId.trim()) return;
    processStudent(manualId.trim());
  }

  const handleReset = () => {
    setScanResult(null); setManualId(""); setAttendanceStatus(null);
    setPayModal(null); setCourseSearch("");
  };

  // ── Filtered + split courses ───────────────────────────────────────────────
  const allCourses = scanResult?.data?.courses ?? [];
  const q = courseSearch.trim().toLowerCase();
  const filtered = q
    ? allCourses.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.course_id.toLowerCase().includes(q) ||
        (c.teacher_name || "").toLowerCase().includes(q)
      )
    : allCourses;

  const enrolledCourses    = filtered.filter(c =>  c.is_enrolled);
  const notEnrolledCourses = filtered.filter(c => !c.is_enrolled);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          {activeTab === "scan"
            ? <Camera className="text-indigo-600" />
            : <Keyboard className="text-indigo-600" />}
          Mark Attendance
        </h1>

        {!scanResult && (
          <div className="bg-white p-1 rounded-lg border flex shadow-sm">
            <button
              onClick={() => handleTabChange("scan")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition ${activeTab === "scan" ? "bg-indigo-100 text-indigo-700" : "text-gray-500 hover:bg-gray-50"}`}
            >
              <QrCode size={16} /> Scan QR
            </button>
            <button
              onClick={() => handleTabChange("manual")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition ${activeTab === "manual" ? "bg-indigo-100 text-indigo-700" : "text-gray-500 hover:bg-gray-50"}`}
            >
              <Keyboard size={16} /> Manual Entry
            </button>
          </div>
        )}

        {scanResult && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition shadow-md"
          >
            <RefreshCw size={18} /> Next Student
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">

        {/* ── LEFT PANEL ─────────────────────────────────────────────────────── */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 min-h-[400px]">
          {loading && (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <RefreshCw className="animate-spin mb-4" size={32} />
              <p>Fetching student details...</p>
            </div>
          )}

          {activeTab === "scan" && !scanResult && !loading && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-xl bg-black border-4 border-gray-100">
                <div id="reader" className="w-full" />
              </div>
              <p className="text-center text-sm text-gray-500">Position the QR code within the frame.</p>
            </div>
          )}

          {activeTab === "manual" && !scanResult && !loading && (
            <div className="h-full flex flex-col justify-center space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Keyboard size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Enter Student ID</h3>
              </div>
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="relative text-gray-700">
                  <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                  <input
                    type="text" autoFocus placeholder="e.g. STD-2026-0001"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl text-lg font-mono text-black focus:border-indigo-500 outline-none transition"
                    value={manualId}
                    onChange={e => setManualId(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition"
                >
                  Find Student
                </button>
              </form>
            </div>
          )}

          {scanResult && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <CheckCircle size={40} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Student Found</h3>
                <p className="text-gray-500 text-sm mt-1">Select a course on the right to mark attendance.</p>
              </div>
              <img
                src={scanResult.data?.profile_picture_url || "https://via.placeholder.com/150"}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover"
              />
              <div className="text-center">
                <p className="font-bold text-gray-900 text-lg">{scanResult.data?.name}</p>
                <p className="text-sm font-mono text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mt-1 inline-block">
                  {scanResult.data?.user_id}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL ────────────────────────────────────────────────────── */}
        <div>
          {!scanResult && !loading && (
            <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <User size={48} className="mb-4 text-gray-300" />
              <p className="font-medium">Waiting for input...</p>
              <p className="text-sm mt-2">Scan a QR code or enter student ID.</p>
            </div>
          )}

          {scanResult && !scanResult.success && (
            <div className="bg-red-50 border-l-4 border-red-500 p-8 rounded-xl shadow-sm min-h-[200px] flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <XCircle className="text-red-600 w-10 h-10" />
                <h2 className="text-2xl font-bold text-red-700">Not Found</h2>
              </div>
              <p className="text-red-800 text-lg">{scanResult.message}</p>
            </div>
          )}

          {scanResult && scanResult.success && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">

              {/* Student header */}
              <div className="bg-indigo-600 p-5 text-white">
                <h2 className="text-xl font-bold">{scanResult.data.name}</h2>
                <p className="text-indigo-200 font-mono text-sm mt-0.5">{scanResult.data.user_id}</p>
              </div>

              {/* Status toast */}
              {attendanceStatus && !attendanceStatus.loading && (
                <div className={`px-5 py-3 font-semibold flex items-center gap-2 text-sm ${
                  attendanceStatus.type === "success"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {attendanceStatus.type === "success"
                    ? <CheckCircle size={16} />
                    : <XCircle size={16} />}
                  {attendanceStatus.message}
                </div>
              )}

              {/* Search bar */}
              <div className="px-4 pt-4 pb-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search courses by name or teacher..."
                    value={courseSearch}
                    onChange={e => setCourseSearch(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 text-sm text-gray-900 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-400 outline-none transition"
                  />
                  {courseSearch && (
                    <button
                      onClick={() => setCourseSearch("")}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-5 max-h-[520px] overflow-y-auto">

                {/* Enrolled courses */}
                {enrolledCourses.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <BookOpen size={13} /> Enrolled Courses
                      <span className="ml-auto bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {enrolledCourses.length}
                      </span>
                    </h3>
                    <div className="space-y-3">
                      {enrolledCourses.map(course => (
                        <CourseCard
                          key={course.course_id}
                          course={course}
                          enrolled
                          attendanceStatus={attendanceStatus}
                          onMarkAttendance={handleMarkAttendance}
                          onPay={openPayModal}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Not enrolled courses */}
                {notEnrolledCourses.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <Plus size={13} /> Other Courses
                      <span className="ml-auto bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {notEnrolledCourses.length}
                      </span>
                    </h3>
                    <div className="space-y-3">
                      {notEnrolledCourses.map(course => (
                        <CourseCard
                          key={course.course_id}
                          course={course}
                          enrolled={false}
                          attendanceStatus={attendanceStatus}
                          onMarkAttendance={handleMarkAttendance}
                          onPay={openPayModal}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {filtered.length === 0 && (
                  <div className="py-10 text-center text-gray-400">
                    <Search size={32} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-medium">No courses match "{courseSearch}"</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── PAY MODAL ──────────────────────────────────────────────────────────── */}
      {payModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">

            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <CreditCard size={18} className="text-indigo-700" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    {payModal.course.is_enrolled ? "Record Payment" : "Enroll & Pay"}
                  </h3>
                  <p className="text-xs text-gray-400">Cash payment</p>
                </div>
              </div>
              <button
                onClick={() => setPayModal(null)}
                className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Details */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-3 mb-5">
              <DetailRow label="Student"   value={scanResult?.data?.name} />
              <DetailRow label="Student ID" value={
                <span className="font-mono text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  {scanResult?.data?.user_id}
                </span>
              } />
              <div className="border-t border-gray-200 pt-3 space-y-3">
                <DetailRow label="Course"    value={payModal.course.title} />
                <DetailRow label="Course ID" value={
                  <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {payModal.course.course_id}
                  </span>
                } />
                {payModal.course.teacher_name && (
                  <DetailRow label="Teacher"  value={payModal.course.teacher_name} />
                )}
                {payModal.course.duration && (
                  <DetailRow label="Duration" value={payModal.course.duration} />
                )}
              </div>
            </div>

            {/* Amount — read only */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Course Fee</label>
              <div className="flex items-center gap-3 bg-indigo-50 border-2 border-indigo-200 rounded-xl px-4 py-3.5">
                <Banknote size={20} className="text-indigo-500 shrink-0" />
                <span className="text-2xl font-bold text-indigo-700">
                  Rs. {parseFloat(payModal.course.fee || 0).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Fee is set by admin and cannot be changed here.</p>
            </div>

            {/* Mark attendance checkbox */}
            <label className="flex items-center gap-3 mb-5 cursor-pointer select-none p-3 bg-gray-50 rounded-xl border border-gray-100">
              <input
                type="checkbox"
                checked={markOnPay}
                onChange={e => setMarkOnPay(e.target.checked)}
                className="w-4 h-4 rounded accent-indigo-600"
              />
              <div>
                <p className="text-sm font-semibold text-gray-700">Mark attendance for today</p>
                <p className="text-xs text-gray-400">Student will be marked Present after payment.</p>
              </div>
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => setPayModal(null)}
                className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPay}
                disabled={paySubmitting}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60 transition shadow-md"
              >
                {paySubmitting ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                {paySubmitting ? "Processing…" : "Confirm & Pay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── CourseCard ────────────────────────────────────────────────────────────────
function CourseCard({ course, enrolled, attendanceStatus, onMarkAttendance, onPay }) {
  const isPaid   = course.payment_status === "PAID";
  const isThisCard = attendanceStatus?.courseId === course.course_id && !attendanceStatus?.loading;

  return (
    <div className={`rounded-xl border overflow-hidden transition ${
      enrolled
        ? "bg-white border-gray-200 hover:border-indigo-300 shadow-sm"
        : "bg-gray-50 border-dashed border-gray-300"
    }`}>
      {/* Title + badge */}
      <div className="px-4 pt-4 pb-2 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm leading-snug">{course.title}</p>
          <p className="text-[11px] text-gray-400 font-mono mt-0.5">{course.course_id}</p>
        </div>
        {enrolled ? (
          <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
            isPaid
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}>
            {isPaid ? <CheckCircle size={9} /> : <AlertTriangle size={9} />}
            {isPaid ? "Paid" : "Unpaid"}
          </span>
        ) : (
          <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-gray-100 text-gray-500 border-gray-200">
            Not Enrolled
          </span>
        )}
      </div>

      {/* Meta row — teacher, duration, fee */}
      <div className="px-4 pb-3 flex flex-wrap gap-x-4 gap-y-1">
        {course.teacher_name && (
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <GraduationCap size={11} className="text-indigo-400" />
            {course.teacher_name}
          </span>
        )}
        {course.duration && (
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Timer size={11} className="text-indigo-400" />
            {course.duration}
          </span>
        )}
        {course.fee != null && (
          <span className="flex items-center gap-1 text-xs font-semibold text-indigo-700">
            <Banknote size={11} className="text-indigo-400" />
            Rs. {parseFloat(course.fee).toLocaleString()}
          </span>
        )}
      </div>

      {/* Per-card success message */}
      {isThisCard && attendanceStatus.type === "success" && (
        <div className="mx-4 mb-3 flex items-center gap-2 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <CheckCircle size={13} /> {attendanceStatus.message}
        </div>
      )}

      {/* Buttons */}
      <div className="px-4 pb-4 flex gap-2">
        {(!isPaid || !enrolled) && (
          <button
            onClick={() => onPay(course)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition ${
              enrolled
                ? "bg-amber-500 hover:bg-amber-600 text-white"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            <CreditCard size={13} />
            {enrolled ? "Pay Now" : "Enroll & Pay"}
          </button>
        )}
        {enrolled && (
          <button
            onClick={() => onMarkAttendance(course.course_id, course.title)}
            disabled={!!attendanceStatus?.loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-bold transition disabled:opacity-50"
          >
            <Clock size={13} /> Mark Present
          </button>
        )}
      </div>
    </div>
  );
}

// ── DetailRow ─────────────────────────────────────────────────────────────────
function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide shrink-0">{label}</span>
      <span className="text-sm font-semibold text-gray-900 text-right">{value}</span>
    </div>
  );
}
