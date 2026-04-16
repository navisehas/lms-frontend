"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen, Plus, Pencil, Trash2, Search, X,
  CheckCircle, Loader, Users, DollarSign,
  RefreshCw, Save, Clock, ChevronDown,
  GraduationCap, Eye, Upload, UserX, ImageIcon, Calendar,
  AlertCircle, FileText, ListChecks
} from "lucide-react";
import { guardRoute, authFetch } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;

const EMPTY = { title: "", description: "", duration: "", teacher_id: "", fee: "", thumbnail_url: "" };

const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// ── Label wrapper ──────────────────────────────────────────────────────────
const FormLabel = ({ label, required, hint, children, error }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      {hint && <span className="text-xs font-normal text-gray-400 ml-1.5">({hint})</span>}
    </label>
    {children}
    {error && (
      <div className="flex items-center gap-1 mt-1.5 text-xs text-red-500">
        <AlertCircle size={12} />
        <span>{error}</span>
      </div>
    )}
  </div>
);

// ── Client-side PDF report generator ─────────────────────────────────────
async function generateCourseReportPDF(courses) {
  if (!window._jsPDFLoaded) {
    await new Promise((resolve, reject) => {
      const script1 = document.createElement("script");
      script1.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script1.onload = () => {
        const script2 = document.createElement("script");
        script2.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js";
        script2.onload = () => { window._jsPDFLoaded = true; resolve(); };
        script2.onerror = reject;
        document.head.appendChild(script2);
      };
      script1.onerror = reject;
      document.head.appendChild(script1);
    });
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;

  // Header bar
  doc.setFillColor(67, 56, 202);
  doc.rect(0, 0, pageW, 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("Course Management Report", margin, 14);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${dateStr}  ${timeStr}`, pageW - margin, 14, { align: "right" });

  // Summary stats
  const totalEnrolled = courses.reduce((s, c) => s + (parseInt(c.enrolled_count) || 0), 0);
  const totalRevenue = courses.reduce((s, c) => s + parseFloat(c.fee || 0) * (parseInt(c.enrolled_count) || 0), 0);
  const totalLessons = courses.reduce((s, c) => s + (c.lessons?.length || 0), 0);

  const statsY = 28;
  const boxW = (pageW - margin * 2 - 8) / 4;
  const statItems = [
    { label: "Total Courses", value: String(courses.length), color: [238, 242, 255] },
    { label: "Total Lessons", value: String(totalLessons), color: [238, 242, 255] },
    { label: "Total Enrolled", value: String(totalEnrolled), color: [238, 242, 255] },
    { label: "Total Revenue", value: `Rs. ${totalRevenue.toLocaleString()}`, color: [238, 242, 255] },
  ];
  statItems.forEach((s, i) => {
    const x = margin + i * (boxW + 4);
    doc.setFillColor(...s.color);
    doc.roundedRect(x, statsY, boxW, 14, 2, 2, "F");
    doc.setTextColor(67, 56, 202);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(s.label.toUpperCase(), x + 4, statsY + 5);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(s.value, x + 4, statsY + 11);
  });

  // Table
  const tableY = statsY + 20;

  const rows = courses.map((c, idx) => [
    idx + 1,
    c.course_id || "",
    c.title || "",
    c.teacher_name || "—",
    c.duration || "—",
    c.enrolled_count ?? 0,
    `Rs. ${parseFloat(c.fee || 0).toLocaleString()}`,
    c.lessons && c.lessons.length > 0 
      ? c.lessons.map(l => l.title).join(", ")
      : "No lessons",
  ]);

  doc.autoTable({
    startY: tableY,
    margin: { left: margin, right: margin },
    head: [[
      "#", "Course ID", "Title", "Teacher", "Schedule", "Enrolled", "Price (Rs.)", "Lessons"
    ]],
    body: rows,
    styles: {
      fontSize: 8,
      cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
      overflow: "linebreak",
      valign: "top",
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [67, 56, 202],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 255],
    },
    columnStyles: {
      0:  { halign: "center", cellWidth: 8 },
      1:  { cellWidth: 28, fontStyle: "bold", textColor: [79, 70, 229] },
      2:  { cellWidth: 40 },
      3:  { cellWidth: 32 },
      4:  { cellWidth: 32 },
      5:  { halign: "center", cellWidth: 18 },
      6:  { halign: "right", cellWidth: 24, fontStyle: "bold" },
      7:  { cellWidth: "auto" },
    },
    didDrawPage: (data) => {
      const pCount = doc.internal.getNumberOfPages();
      const pNum   = data.pageNumber;
      doc.setFontSize(7);
      doc.setTextColor(160, 160, 160);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Page ${pNum} of ${pCount}`,
        pageW / 2,
        doc.internal.pageSize.getHeight() - 6,
        { align: "center" }
      );
      doc.text(
        "Confidential — Internal Use Only",
        margin,
        doc.internal.pageSize.getHeight() - 6
      );
    },
  });

  const fileName = `course-report-${now.toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}

// ─────────────────────────────────────────────────────────────────────────
export default function AdminCoursesPage() {
  const router = useRouter();
  const fileRef = useRef(null);

  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [reporting, setReporting] = useState(false);

  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [formErr, setFormErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);

  const [preview, setPreview] = useState(null);
  const [delTarget, setDelTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState("");
  const [manualTime, setManualTime] = useState("");

  const [validationErrors, setValidationErrors] = useState({
    thumbnail_url: "", title: "", duration: "", fee: "", teacher_id: "", description: ""
  });

  useEffect(() => {
    const auth = guardRoute("ADMIN", router);
    if (auth) { 
      setUser(auth); 
      load(); 
    }
  }, [router]);

  // ── Validation ────────────────────────────────────────────────────────
  function validateField(field, value) {
    switch (field) {
      case "thumbnail_url":
        return !value ? "Course photo is required." : "";
      case "title":
        if (!value.trim()) return "Course title is required.";
        if (value.trim().length < 3) return "Title must be at least 3 characters.";
        return "";
      case "duration":
        if (!value.trim()) return "Duration is required.";
        if (!selectedDay) return "Please select a day.";
        if (!manualTime.trim()) return "Please enter time.";
        if (manualTime.trim().length < 5) return "Please enter a valid time (e.g., 8:30 PM - 12:30 AM)";
        return "";
      case "fee":
        if (value === "" || value === null || value === undefined) return "Price is required.";
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return "Please enter a valid number.";
        if (numValue < 0) return "Price cannot be negative.";
        return "";
      case "teacher_id":
        return !value ? "Please assign a teacher." : "";
      case "description":
        if (!value.trim()) return "Description is required.";
        if (value.trim().length < 10) return "Description must be at least 10 characters.";
        return "";
      default: return "";
    }
  }

  function handleFieldChange(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    setValidationErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
  }

  function validateAllFields() {
    const errors = {
      thumbnail_url: validateField("thumbnail_url", form.thumbnail_url),
      title: validateField("title", form.title),
      duration: validateField("duration", form.duration),
      fee: validateField("fee", form.fee),
      teacher_id: validateField("teacher_id", form.teacher_id),
      description: validateField("description", form.description),
    };
    setValidationErrors(errors);
    return !Object.values(errors).some(e => e !== "");
  }

  // ── Loaders ───────────────────────────────────────────────────────────
  async function load() {
    setLoading(true);
    try {
      const [cr, tr] = await Promise.all([
        authFetch(`${API}/courses`),
        authFetch(`${API}/courses/teachers/list`),
      ]);
      const cd = await cr.json();
      const td = await tr.json();
      
      const coursesWithLessons = await Promise.all(
        (Array.isArray(cd) ? cd : []).map(async (course) => {
          try {
            const lessonsRes = await authFetch(`${API}/lessons/course/${course.course_id}`);
            const lessonsData = await lessonsRes.json();
            return {
              ...course,
              lessons: lessonsData.success ? lessonsData.lessons : []
            };
          } catch {
            return { ...course, lessons: [] };
          }
        })
      );
      
      setCourses(coursesWithLessons);
      setTeachers(Array.isArray(td) ? td : []);
    } catch {
      setError("Failed to load data.");
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  }

  // ── Report generation ──────────────────────────────────────────────
  async function handleGenerateReport() {
    if (reporting) return;
    setReporting(true);
    setError("");
    try {
      if (courses.length === 0) {
        setError("No courses to include in the report.");
        setTimeout(() => setError(""), 5000);
        return;
      }
      await generateCourseReportPDF(courses);
      setSuccess("Report downloaded successfully!");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError("Failed to generate report. Please try again.");
      setTimeout(() => setError(""), 5000);
      console.error(err);
    } finally {
      setReporting(false);
    }
  }

  // ── Modal helpers ─────────────────────────────────────────────────────
  function openAdd() {
    setForm(EMPTY);
    setFormErr("");
    setSelectedDay("");
    setManualTime("");
    setValidationErrors({ thumbnail_url: "", title: "", duration: "", fee: "", teacher_id: "", description: "" });
    setModal("add");
  }

  function parseDurationString(duration) {
    const dayMatch = weekDays.find(day => duration.includes(day));
    let time = "";
    if (dayMatch) {
      time = duration.replace(dayMatch, "").trim();
    } else {
      const m = duration.match(/\d{1,2}:\d{2}\s*(?:AM|PM)\s*-\s*\d{1,2}:\d{2}\s*(?:AM|PM)/i);
      if (m) time = m[0];
    }
    return { day: dayMatch || "", time };
  }

  function openEdit(c) {
    if (c.enrolled_count && parseInt(c.enrolled_count) > 0) {
      setError(`Cannot edit "${c.title}" because ${c.enrolled_count} student(s) are enrolled.`);
      setTimeout(() => setError(""), 5000);
      return;
    }
    const { day, time } = parseDurationString(c.duration || "");
    setSelectedDay(day);
    setManualTime(time);
    setForm({
      title: c.title || "",
      description: c.description || "",
      duration: c.duration || "",
      teacher_id: c.teacher_id || "",
      fee: c.fee ?? "",
      thumbnail_url: c.thumbnail_url || "",
    });
    setValidationErrors({ thumbnail_url: "", title: "", duration: "", fee: "", teacher_id: "", description: "" });
    setFormErr("");
    setModal({ type: "edit", course_id: c.course_id });
  }

  function updateDuration(day, time) {
    const newDuration = [day, time].filter(Boolean).join(" ");
    setForm(f => ({ ...f, duration: newDuration }));
    setValidationErrors(prev => ({ ...prev, duration: validateField("duration", newDuration) }));
  }

  function handleDaySelect(day) { 
    setSelectedDay(day); 
    updateDuration(day, manualTime); 
  }
  
  function handleManualTimeChange(e) { 
    const t = e.target.value; 
    setManualTime(t); 
    updateDuration(selectedDay, t); 
  }

  function closeModal() {
    setModal(null); 
    setForm(EMPTY); 
    setFormErr("");
    setSelectedDay(""); 
    setManualTime(""); 
    setShowDatePicker(false);
    setValidationErrors({ thumbnail_url: "", title: "", duration: "", fee: "", teacher_id: "", description: "" });
  }

  // ── Image upload ──────────────────────────────────────────────────────
  function handleImageFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setValidationErrors(prev => ({ ...prev, thumbnail_url: "Please select an image file (JPG, PNG, WebP, etc.)" }));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setValidationErrors(prev => ({ ...prev, thumbnail_url: "Image must be smaller than 2 MB" }));
      return;
    }
    setImgLoading(true);
    setValidationErrors(prev => ({ ...prev, thumbnail_url: "" }));
    const reader = new FileReader();
    reader.onload = ev => {
      const url = ev.target.result;
      setForm(f => ({ ...f, thumbnail_url: url }));
      setValidationErrors(prev => ({ ...prev, thumbnail_url: validateField("thumbnail_url", url) }));
      setImgLoading(false);
    };
    reader.onerror = () => {
      setValidationErrors(prev => ({ ...prev, thumbnail_url: "Failed to read image." }));
      setImgLoading(false);
    };
    reader.readAsDataURL(file);
  }

  // ── Save ──────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!validateAllFields()) { 
      setFormErr("Please fix all validation errors before saving."); 
      return; 
    }
    setSaving(true); 
    setFormErr("");
    try {
      const isEdit = modal?.type === "edit";
      const url = isEdit ? `${API}/courses/${modal.course_id}` : `${API}/courses`;
      const body = {
        title: form.title.trim(),
        description: form.description.trim(),
        duration: form.duration.trim(),
        teacher_id: form.teacher_id,
        fee: parseFloat(form.fee),
        thumbnail_url: form.thumbnail_url,
      };
      const res = await authFetch(url, { method: isEdit ? "PUT" : "POST", body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) {
        closeModal();
        setSuccess(isEdit ? "Course updated!" : `Course created!`);
        setTimeout(() => setSuccess(""), 4000);
        load();
      } else {
        setFormErr(data.error || "Failed to save.");
      }
    } catch {
      setFormErr("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!delTarget) return;
    setDeleting(true);
    try {
      const res = await authFetch(`${API}/courses/${delTarget.course_id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) { 
        setDelTarget(null); 
        setSuccess("Course deleted."); 
        setTimeout(() => setSuccess(""), 4000);
        load(); 
      } else { 
        setDelTarget(null); 
        setError(data.error || "Failed to delete."); 
        setTimeout(() => setError(""), 5000);
      }
    } catch {
      setError("Network error.");
      setTimeout(() => setError(""), 5000);
    } finally {
      setDeleting(false);
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────
  const filtered = courses.filter(c => {
    const q = search.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.course_id.toLowerCase().includes(q) ||
      (c.teacher_name || "").toLowerCase().includes(q)
    );
  });

  const stats = {
    total: courses.length,
    enrolled: courses.reduce((s, c) => s + (c.enrolled_count || 0), 0),
    lessons: courses.reduce((s, c) => s + (c.lessons?.length || 0), 0),
  };

  const getLessonsSummary = (course) => {
    const count = course.lessons?.length || 0;
    return `${count} lesson${count !== 1 ? 's' : ''}`;
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="text-indigo-600" size={26} /> Course Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Create and manage courses with lessons, teachers and pricing.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={handleGenerateReport}
            disabled={reporting || courses.length === 0}
            className="flex items-center gap-2 text-sm text-gray-700 bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
            title={courses.length === 0 ? "No courses to report" : "Download PDF report"}
          >
            {reporting
              ? <><Loader size={14} className="animate-spin" /> Generating…</>
              : <><FileText size={14} /> Generate Report</>}
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition-all"
          >
            <Plus size={16} /> Add Course
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
          <X size={16} className="flex-shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg px-4 py-3 mb-4 text-sm">
          <CheckCircle size={16} /> {success}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Total Courses", val: stats.total, color: "text-blue-600", bg: "bg-blue-50", icon: <BookOpen size={18} /> },
          { label: "Total Lessons", val: stats.lessons, color: "text-green-600", bg: "bg-green-50", icon: <ListChecks size={18} /> },
          { label: "Total Enrolled", val: stats.enrolled, color: "text-indigo-600", bg: "bg-indigo-50", icon: <Users size={18} /> },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`${s.color} ${s.bg} p-2 rounded-lg flex-shrink-0`}>{s.icon}</div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 truncate">{s.label}</p>
              <p className={`text-lg font-bold ${s.color} truncate`}>{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by title, ID or teacher name…"
          className="w-full pl-9 pr-4 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {/* Course grid - No LessonManager component */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
          <Loader size={20} className="animate-spin" /> Loading courses…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100 text-gray-400">
          <BookOpen size={48} className="mx-auto mb-3 opacity-20" />
          <p className="font-medium">{search ? "No courses match your search." : "No courses yet."}</p>
          {!search && (
            <button onClick={openAdd} className="mt-3 text-sm text-indigo-600 hover:underline">
              + Add your first course
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(c => (
            <div key={c.course_id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="relative h-40 bg-gradient-to-br from-indigo-50 to-blue-100 flex-shrink-0">
                {c.thumbnail_url ? (
                  <img src={c.thumbnail_url} alt={c.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-indigo-200">
                    <ImageIcon size={36} />
                    <span className="text-xs">No image</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  <button onClick={() => setPreview(c)} title="Preview"
                    className="p-1.5 bg-white/90 hover:bg-white text-gray-500 hover:text-indigo-600 rounded-lg shadow-sm transition-colors">
                    <Eye size={14} />
                  </button>
                  <button onClick={() => openEdit(c)} disabled={c.enrolled_count > 0}
                    title={c.enrolled_count > 0 ? `Cannot edit: ${c.enrolled_count} student(s) enrolled` : "Edit"}
                    className={`p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-colors ${
                      c.enrolled_count > 0 ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:text-indigo-600"
                    }`}>
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setDelTarget(c)} title="Delete"
                    className="p-1.5 bg-white/90 hover:bg-white text-gray-500 hover:text-red-600 rounded-lg shadow-sm transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-gray-800 text-sm leading-snug line-clamp-1 mb-0.5">{c.title}</h3>
                <span className="text-xs font-mono text-gray-300 mb-2">{c.course_id}</span>
                
                {c.description && (
                  <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">{c.description}</p>
                )}

                <div className="space-y-1.5 mt-auto">
                  {c.teacher_name ? (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <GraduationCap size={12} className="text-indigo-400 flex-shrink-0" />
                      <span className="truncate">{c.teacher_name}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-gray-300">
                      <UserX size={12} /> <span>No teacher assigned</span>
                    </div>
                  )}
                  
                  {c.duration && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock size={12} className="text-blue-400" /> {c.duration}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <ListChecks size={12} className="text-green-400" /> 
                    <span>{getLessonsSummary(c)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-50">
                  <div className="flex items-center gap-1">
                    <Users size={13} className="text-gray-400" />
                    <span className="text-sm font-semibold text-gray-700">{c.enrolled_count}</span>
                    <span className="text-xs text-gray-400">enrolled</span>
                  </div>
                  <span className="text-sm font-bold text-indigo-600">Rs. {parseFloat(c.fee).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                {modal === "add"
                  ? <><Plus size={20} className="text-indigo-600" /> Add New Course</>
                  : <><Pencil size={20} className="text-indigo-600" /> Edit Course</>}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
              {formErr && (
                <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
                  <AlertCircle size={16} className="flex-shrink-0 text-red-500" /> {formErr}
                </div>
              )}

              {/* Thumbnail */}
              <FormLabel label="Course Photo" required hint="max 2 MB" error={validationErrors.thumbnail_url}>
                <div
                  onClick={() => fileRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                    form.thumbnail_url
                      ? validationErrors.thumbnail_url ? "border-red-300 bg-red-50/20" : "border-indigo-300 bg-indigo-50/20"
                      : validationErrors.thumbnail_url ? "border-red-300 hover:border-red-400" : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/10"
                  }`}
                >
                  {imgLoading ? (
                    <div className="flex items-center justify-center gap-2 py-10 text-gray-400 text-sm">
                      <Loader size={18} className="animate-spin" /> Processing image…
                    </div>
                  ) : form.thumbnail_url ? (
                    <div className="relative rounded-xl overflow-hidden">
                      <img src={form.thumbnail_url} alt="preview" className="w-full h-44 object-cover" />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/25 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                        <span className="bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                          <Upload size={13} /> Change photo
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 py-10 text-gray-400">
                      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                        <ImageIcon size={26} className="text-gray-300" />
                      </div>
                      <p className="text-sm font-semibold text-gray-500">Click to upload course photo</p>
                      <p className="text-xs text-gray-400">JPG, PNG, WebP — max 2 MB</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
                {form.thumbnail_url && !imgLoading && (
                  <button type="button"
                    onClick={() => {
                      setForm(f => ({ ...f, thumbnail_url: "" }));
                      if (fileRef.current) fileRef.current.value = "";
                      setValidationErrors(prev => ({ ...prev, thumbnail_url: "Course photo is required." }));
                    }}
                    className="mt-1.5 text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                    <X size={11} /> Remove photo
                  </button>
                )}
              </FormLabel>

              {/* Title, Duration, Price, Teacher, Description fields remain the same */}
              {/* (The rest of the modal is unchanged from previous version) */}

              <FormLabel label="Course Title" required error={validationErrors.title}>
                <input 
                  value={form.title} 
                  onChange={e => handleFieldChange("title", e.target.value)}
                  placeholder="e.g. A/L Combined Mathematics"
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                    validationErrors.title ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                />
              </FormLabel>

              <FormLabel label="Duration" required error={validationErrors.duration}>
                <div className="space-y-3">
                  <div className="relative">
                    <button type="button" onClick={() => setShowDatePicker(!showDatePicker)}
                      className={`w-full border rounded-lg px-3 py-2.5 text-sm text-left text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300 flex items-center justify-between bg-white ${
                        validationErrors.duration && !selectedDay ? "border-red-300" : "border-gray-200"
                      }`}>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className={selectedDay ? "text-gray-900" : "text-gray-400"}>{selectedDay || "Select day"}</span>
                      </div>
                      <ChevronDown size={16} className={`text-gray-400 transition-transform ${showDatePicker ? "rotate-180" : ""}`} />
                    </button>
                    {showDatePicker && (
                      <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 w-full">
                        <div className="p-3">
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Select Day</label>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {weekDays.map(day => (
                              <button key={day} type="button"
                                onClick={() => { handleDaySelect(day); setShowDatePicker(false); }}
                                className={`px-3 py-2 text-sm rounded-lg transition-all text-left ${
                                  selectedDay === day ? "bg-indigo-600 text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                }`}>
                                {day}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      value={manualTime} 
                      onChange={handleManualTimeChange}
                      placeholder="Enter time (e.g., 8:30 PM - 12:30 AM)"
                      className={`w-full border rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                        validationErrors.duration && !manualTime ? "border-red-300 bg-red-50" : "border-gray-200"
                      }`}
                    />
                  </div>
                  {(selectedDay || manualTime) && (
                    <div className={`p-2 rounded-lg ${validationErrors.duration ? "bg-red-50" : "bg-indigo-50"}`}>
                      <p className={`text-xs font-medium ${validationErrors.duration ? "text-red-600" : "text-indigo-600"}`}>Preview:</p>
                      <p className={`text-sm font-semibold ${validationErrors.duration ? "text-red-700" : "text-indigo-900"}`}>
                        {selectedDay && manualTime ? `${selectedDay} ${manualTime}` : selectedDay || manualTime}
                      </p>
                    </div>
                  )}
                </div>
              </FormLabel>

              <div className="grid grid-cols-2 gap-4">
                <FormLabel label="Price (Rs.)" required error={validationErrors.fee}>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">Rs.</span>
                    <input 
                      type="number" 
                      value={form.fee} 
                      onChange={e => handleFieldChange("fee", e.target.value)}
                      placeholder="0.00" 
                      min="0" 
                      step="0.01"
                      className={`w-full border rounded-lg pl-10 pr-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                        validationErrors.fee ? "border-red-300 bg-red-50" : "border-gray-200"
                      }`}
                    />
                  </div>
                </FormLabel>

                <FormLabel label="Assign Teacher" required error={validationErrors.teacher_id}>
                  <div className="relative">
                    <GraduationCap size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select 
                      value={form.teacher_id} 
                      onChange={e => handleFieldChange("teacher_id", e.target.value)}
                      className={`w-full border rounded-lg pl-8 pr-8 py-2.5 text-sm text-gray-900 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer ${
                        validationErrors.teacher_id ? "border-red-300 bg-red-50" : "border-gray-200"
                      }`}>
                      <option value="">— Select a teacher —</option>
                      {teachers.map(t => (
                        <option key={t.user_id} value={t.user_id}>
                          {t.name}{t.specialization ? ` — ${t.specialization}` : ""}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </FormLabel>
              </div>

              <FormLabel label="Description" required error={validationErrors.description}>
                <textarea 
                  value={form.description} 
                  onChange={e => handleFieldChange("description", e.target.value)}
                  placeholder="Describe what students will learn in this course…" 
                  rows={3}
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none ${
                    validationErrors.description ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                />
              </FormLabel>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
              <button onClick={closeModal}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                disabled={saving || imgLoading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60 transition-all shadow-md"
              >
                {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
                {modal === "add" ? "Create Course" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-indigo-50 to-blue-100 relative">
              {preview.thumbnail_url
                ? <img src={preview.thumbnail_url} alt={preview.title} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center"><BookOpen size={48} className="text-indigo-200" /></div>}
              <button onClick={() => setPreview(null)}
                className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-600 rounded-lg p-1.5 shadow-sm">
                <X size={18} />
              </button>
            </div>
            <div className="p-5">
              <h2 className="text-lg font-bold text-gray-800 mb-0.5">{preview.title}</h2>
              <p className="text-xs font-mono text-gray-300 mb-3">{preview.course_id}</p>
              {preview.description && <p className="text-sm text-gray-500 leading-relaxed mb-4">{preview.description}</p>}
              <div className="space-y-2.5">
                {preview.teacher_name
                  ? <div className="flex items-center gap-2 text-sm"><GraduationCap size={15} className="text-indigo-500" /><span className="text-gray-500">Teacher:</span><span className="font-semibold text-gray-800">{preview.teacher_name}</span></div>
                  : <div className="flex items-center gap-2 text-sm text-gray-400"><UserX size={15} /> No teacher assigned</div>}
                {preview.duration && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock size={15} className="text-blue-500" /><span className="text-gray-500">Duration:</span><span className="font-semibold text-gray-800">{preview.duration}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <ListChecks size={15} className="text-green-500" /><span className="text-gray-500">Lessons:</span><span className="font-semibold text-gray-800">{getLessonsSummary(preview)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users size={15} className="text-indigo-500" /><span className="text-gray-500">Enrolled:</span><span className="font-semibold text-gray-800">{preview.enrolled_count} students</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign size={15} className="text-blue-500" /><span className="text-gray-500">Price:</span><span className="font-bold text-indigo-600 text-base">Rs. {parseFloat(preview.fee).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <button 
                  onClick={() => { setPreview(null); openEdit(preview); }} 
                  disabled={preview.enrolled_count > 0}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold ${
                    preview.enrolled_count > 0
                      ? "border border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
                      : "border border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                  }`}>
                  <Pencil size={14} /> Edit
                </button>
                <button onClick={() => setPreview(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {delTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 text-red-600 rounded-full p-2.5"><Trash2 size={20} /></div>
              <h3 className="font-bold text-gray-800">Delete Course?</h3>
            </div>
            <p className="text-sm font-semibold text-gray-800 bg-gray-50 rounded-lg px-3 py-2.5 mb-2">{delTarget.title}</p>
            {parseInt(delTarget.enrolled_count) > 0 ? (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
                ⚠️ {delTarget.enrolled_count} student(s) enrolled. Remove enrollments first.
              </p>
            ) : (
              <p className="text-xs text-gray-400 mb-4">This will also delete all lessons in this course.</p>
            )}
            <div className="flex gap-3">
              <button onClick={() => setDelTarget(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button 
                onClick={handleDelete} 
                disabled={deleting || parseInt(delTarget.enrolled_count) > 0}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold disabled:opacity-50"
              >
                {deleting ? <Loader size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
