"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen, Plus, Pencil, Trash2, Search, X,
  CheckCircle, AlertCircle, Loader, Users, DollarSign,
  RefreshCw, Save, Clock, ChevronDown,
  GraduationCap, Eye, Upload, UserX, ImageIcon
} from "lucide-react";
import { guardRoute, authFetch } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:5000`
    : "http://localhost:5000");
const REPORT_API_PATH = "/api/admin/course-report";

function getReportApiCandidates() {
  return [];
}

const EMPTY = { title: "", description: "", duration: "", teacher_id: "", fee: "", thumbnail_url: "" };

// ── FIXED: Moved the Label Wrapper outside the component to prevent cursor jumping ──
const FormLabel = ({ label, required, hint, children }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      {hint && <span className="text-xs font-normal text-gray-400 ml-1.5">({hint})</span>}
    </label>
    {children}
  </div>
);

export default function AdminCoursesPage() {
  const router  = useRouter();
  const fileRef = useRef(null);
  const reportInFlightRef = useRef(false);

  const [user, setUser]         = useState(null);
  const [courses, setCourses]   = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [reporting, setReporting] = useState(false);

  // modal: null | "add" | { type:"edit", course_id }
  const [modal, setModal]           = useState(null);
  const [form, setForm]             = useState(EMPTY);
  const [formErr, setFormErr]       = useState("");
  const [saving, setSaving]         = useState(false);
  const [imgLoading, setImgLoading] = useState(false);

  const [preview, setPreview]     = useState(null);
  const [delTarget, setDelTarget] = useState(null);
  const [deleting, setDeleting]   = useState(false);

  useEffect(() => {
    const auth = guardRoute("ADMIN", router);
    if (auth) { setUser(auth); load(); }
  }, [router]);

  // ── loaders ────────────────────────────────────────────────────────────────
  async function load() {
    setLoading(true);
    try {
      const [cr, tr] = await Promise.all([
        authFetch(`${API}/courses`),
        authFetch(`${API}/courses/teachers/list`),
      ]);
      const cd = await cr.json();
      const td = await tr.json();
      setCourses(Array.isArray(cd) ? cd : []);
      setTeachers(Array.isArray(td) ? td : []);
    } catch { flash("Failed to load data.", true); }
    finally { setLoading(false); }
  }

  async function handleGenerateReport() {
    if (reportInFlightRef.current || reporting) return;
    reportInFlightRef.current = true;
    setReporting(true);
    try {
      const res = await authFetch(REPORT_API_PATH);

      if (!res.ok) {
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const data = await res.json().catch(() => ({}));
          flash(data.error || "Failed to generate report.", true);
        } else {
          const text = await res.text().catch(() => "");
          flash(text || `Failed to generate report (HTTP ${res.status}).`, true);
        }
        return;
      }

      const isPdf = (res.headers.get("content-type") || "").includes("application/pdf");
      if (!isPdf) {
        const text = await res.text().catch(() => "");
        // flash(text || "Invalid report response from server.", true);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "course-report.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      flash("Course report downloaded.");
    } catch (err) {
      // const message = String(err?.message || "").toLowerCase().includes("failed to fetch")
      //   ? "Cannot reach server at http://localhost:5000. Make sure backend is running and API URL is correct."
      //   : err?.message || "Network error while generating report.";
      // flash(message, true);
    } finally {
      reportInFlightRef.current = false;
      setReporting(false);
    }
  }

  // ── flash ─────────────────────────────────────────────────────────────────
  function flash(msg, isErr = false) {
    if (isErr) { setError(msg);   setTimeout(() => setError(""),   5000); }
    else       { setSuccess(msg); setTimeout(() => setSuccess(""), 4000); }
  }

  // ── modal helpers ─────────────────────────────────────────────────────────
  function openAdd() { setForm(EMPTY); setFormErr(""); setModal("add"); }

  function openEdit(c) {
    setForm({
      title:         c.title         || "",
      description:   c.description   || "",
      duration:      c.duration      || "",
      teacher_id:    c.teacher_id    || "",
      fee:           c.fee           ?? "",
      thumbnail_url: c.thumbnail_url || "",
    });
    setFormErr("");
    setModal({ type: "edit", course_id: c.course_id });
  }

  function closeModal() { setModal(null); setForm(EMPTY); setFormErr(""); }
  function setF(k, v)   { setForm(f => ({ ...f, [k]: v })); }

  // ── image file → base64 ───────────────────────────────────────────────────
  function handleImageFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFormErr("Please select an image file (JPG, PNG, WebP, etc.).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setFormErr("Image must be smaller than 2 MB.");
      return;
    }
    setImgLoading(true);
    setFormErr("");
    const reader = new FileReader();
    reader.onload  = ev => { setF("thumbnail_url", ev.target.result); setImgLoading(false); };
    reader.onerror = ()  => { setFormErr("Failed to read image."); setImgLoading(false); };
    reader.readAsDataURL(file);
  }

  // ── save ──────────────────────────────────────────────────────────────────
  function validate() {
    if (!form.title.trim()) return "Course title is required.";
    if (form.fee === "" || isNaN(form.fee) || parseFloat(form.fee) < 0)
      return "Please enter a valid price (0 or more).";
    return null;
  }

  async function handleSave() {
    const e = validate();
    if (e) { setFormErr(e); return; }
    setSaving(true); setFormErr("");
    try {
      const isEdit = modal?.type === "edit";
      const url    = isEdit ? `${API}/courses/${modal.course_id}` : `${API}/courses`;
      const res    = await authFetch(url, {
        method: isEdit ? "PUT" : "POST",
        body: JSON.stringify({
          title:         form.title.trim(),
          description:   form.description.trim(),
          duration:      form.duration.trim(),
          teacher_id:    form.teacher_id || null,
          fee:           parseFloat(form.fee),
          thumbnail_url: form.thumbnail_url || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        closeModal();
        flash(isEdit ? "Course updated!" : `Course created! (${data.course_id})`);
        load();
      } else {
        setFormErr(data.error || "Failed to save.");
      }
    } catch { setFormErr("Network error. Please try again."); }
    finally { setSaving(false); }
  }

  // ── delete ────────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!delTarget) return;
    setDeleting(true);
    try {
      const res  = await authFetch(`${API}/courses/${delTarget.course_id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) { setDelTarget(null); flash("Course deleted."); load(); }
      else              { setDelTarget(null); flash(data.error || "Failed to delete.", true); }
    } catch { flash("Network error.", true); }
    finally { setDeleting(false); }
  }

  // ── derived ───────────────────────────────────────────────────────────────
  const filtered = courses.filter(c => {
    const q = search.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.course_id.toLowerCase().includes(q) ||
      (c.teacher_name || "").toLowerCase().includes(q)
    );
  });

  const stats = {
    total:    courses.length,
    enrolled: courses.reduce((s, c) => s + (c.enrolled_count || 0), 0),
    revenue:  courses.reduce((s, c) => s + parseFloat(c.fee || 0) * (c.enrolled_count || 0), 0),
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="text-indigo-600" size={26} /> Course Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Create and manage courses with photos, teachers and pricing.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load}
            className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={handleGenerateReport} disabled={reporting}
            className="flex items-center gap-2 text-sm text-gray-700 bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-60">
            {reporting ? <Loader size={14} className="animate-spin" /> : <BookOpen size={14} />} {reporting ? "Generating..." : "Generate Report"}
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition-all">
            <Plus size={16} /> Add Course
          </button>
        </div>
      </div>

      {/* ── Alerts ── */}
      {error   && <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm"><AlertCircle size={16} />{error}</div>}
      {success && <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg px-4 py-3 mb-4 text-sm"><CheckCircle size={16} />{success}</div>}

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Total Courses",  val: stats.total,                               color: "text-blue-600",   bg: "bg-blue-50",   icon: <BookOpen size={18} /> },
          { label: "Total Enrolled", val: stats.enrolled,                            color: "text-indigo-600", bg: "bg-indigo-50", icon: <Users size={18} /> },
          { label: "Total Revenue",  val: `Rs. ${stats.revenue.toLocaleString()}`,   color: "text-blue-700",   bg: "bg-blue-100",  icon: <DollarSign size={18} /> },
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

      {/* ── Search ── */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by title, ID or teacher name…"
          className="w-full pl-9 pr-4 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200" />
      </div>

      {/* ── Course grid ── */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
          <Loader size={20} className="animate-spin" /> Loading courses…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100 text-gray-400">
          <BookOpen size={48} className="mx-auto mb-3 opacity-20" />
          <p className="font-medium">{search ? "No courses match your search." : "No courses yet."}</p>
          {!search && <button onClick={openAdd} className="mt-3 text-sm text-indigo-600 hover:underline">+ Add your first course</button>}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(c => (
            <div key={c.course_id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              {/* Thumbnail */}
              <div className="relative h-40 bg-gradient-to-br from-indigo-50 to-blue-100 flex-shrink-0">
                {c.thumbnail_url
                  ? <img src={c.thumbnail_url} alt={c.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-indigo-200">
                      <ImageIcon size={36} /><span className="text-xs">No image</span>
                    </div>
                }
                <div className="absolute top-2 right-2 flex gap-1">
                  <button onClick={() => setPreview(c)} title="Preview"
                    className="p-1.5 bg-white/90 hover:bg-white text-gray-500 hover:text-indigo-600 rounded-lg shadow-sm transition-colors">
                    <Eye size={14} />
                  </button>
                  <button onClick={() => openEdit(c)} title="Edit"
                    className="p-1.5 bg-white/90 hover:bg-white text-gray-500 hover:text-indigo-600 rounded-lg shadow-sm transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setDelTarget(c)} title="Delete"
                    className="p-1.5 bg-white/90 hover:bg-white text-gray-500 hover:text-red-600 rounded-lg shadow-sm transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-gray-800 text-sm leading-snug line-clamp-1 mb-0.5">{c.title}</h3>
                <span className="text-xs font-mono text-gray-300 mb-2">{c.course_id}</span>
                {c.description && <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">{c.description}</p>}

                <div className="space-y-1.5 mt-auto">
                  {c.teacher_name
                    ? <div className="flex items-center gap-1.5 text-xs text-gray-500"><GraduationCap size={12} className="text-indigo-400 flex-shrink-0" /><span className="truncate">{c.teacher_name}</span></div>
                    : <div className="flex items-center gap-1.5 text-xs text-gray-300"><UserX size={12} /><span>No teacher assigned</span></div>
                  }
                  {c.duration && <div className="flex items-center gap-1.5 text-xs text-gray-500"><Clock size={12} className="text-blue-400" />{c.duration}</div>}
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

      {/* ══════════════════════════════════════════════════════════
          ADD / EDIT MODAL
      ══════════════════════════════════════════════════════════ */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                {modal === "add"
                  ? <><Plus size={20} className="text-indigo-600" /> Add New Course</>
                  : <><Pencil size={20} className="text-indigo-600" /> Edit Course</>
                }
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

              {formErr && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2.5 text-sm">
                  <AlertCircle size={15} /> {formErr}
                </div>
              )}

              {/* Thumbnail upload */}
              <FormLabel label="Course Photo" hint="optional · max 2 MB">
                <div
                  onClick={() => fileRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl cursor-pointer transition-all
                    ${form.thumbnail_url
                      ? "border-indigo-300 bg-indigo-50/20"
                      : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/10"
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
                    onClick={() => { setF("thumbnail_url", ""); if (fileRef.current) fileRef.current.value = ""; }}
                    className="mt-1.5 text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                    <X size={11} /> Remove photo
                  </button>
                )}
              </FormLabel>

              {/* Title */}
              <FormLabel label="Course Title" required>
                <input value={form.title} onChange={e => setF("title", e.target.value)}
                  placeholder="e.g. A/L Combined Mathematics"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </FormLabel>

              <div className="grid grid-cols-2 gap-4">
                <FormLabel label="Duration" hint="optional">
                  <div className="relative">
                    <Clock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={form.duration} onChange={e => setF("duration", e.target.value)}
                      placeholder="e.g. 6 months"
                      className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                  </div>
                </FormLabel>

                <FormLabel label="Price (Rs.)" required>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">Rs.</span>
                    <input type="number" value={form.fee} onChange={e => setF("fee", e.target.value)}
                      placeholder="0.00" min="0" step="0.01"
                      className="w-full border border-gray-200 rounded-lg pl-10 pr-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                  </div>
                </FormLabel>
              </div>

              <FormLabel label="Assign Teacher" hint="optional">
                <div className="relative">
                  <GraduationCap size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select value={form.teacher_id} onChange={e => setF("teacher_id", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg pl-8 pr-8 py-2.5 text-sm text-gray-900 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer">
                    <option value="">— No teacher assigned —</option>
                    {teachers.map(t => (
                      <option key={t.user_id} value={t.user_id}>
                        {t.name}{t.specialization ? ` — ${t.specialization}` : ""}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </FormLabel>

              <FormLabel label="Description" hint="optional">
                <textarea value={form.description} onChange={e => setF("description", e.target.value)}
                  placeholder="Describe what students will learn in this course…"
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
              </FormLabel>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
              <button onClick={closeModal}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving || imgLoading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60 transition-all shadow-md">
                {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
                {modal === "add" ? "Create Course" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          PREVIEW MODAL
      ══════════════════════════════════════════════════════════ */}
      {preview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-indigo-50 to-blue-100 relative">
              {preview.thumbnail_url
                ? <img src={preview.thumbnail_url} alt={preview.title} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center"><BookOpen size={48} className="text-indigo-200" /></div>
              }
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
                  : <div className="flex items-center gap-2 text-sm text-gray-400"><UserX size={15} /> No teacher assigned</div>
                }
                {preview.duration && <div className="flex items-center gap-2 text-sm"><Clock size={15} className="text-blue-500" /><span className="text-gray-500">Duration:</span><span className="font-semibold text-gray-800">{preview.duration}</span></div>}
                <div className="flex items-center gap-2 text-sm"><Users size={15} className="text-indigo-500" /><span className="text-gray-500">Enrolled:</span><span className="font-semibold text-gray-800">{preview.enrolled_count} students</span></div>
                <div className="flex items-center gap-2 text-sm"><DollarSign size={15} className="text-blue-500" /><span className="text-gray-500">Price:</span><span className="font-bold text-indigo-600 text-base">Rs. {parseFloat(preview.fee).toLocaleString()}</span></div>
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={() => { setPreview(null); openEdit(preview); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-indigo-200 text-indigo-600 rounded-xl text-sm font-semibold hover:bg-indigo-50">
                  <Pencil size={14} /> Edit
                </button>
                <button onClick={() => setPreview(null)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          DELETE MODAL
      ══════════════════════════════════════════════════════════ */}
      {delTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 text-red-600 rounded-full p-2.5"><Trash2 size={20} /></div>
              <h3 className="font-bold text-gray-800">Delete Course?</h3>
            </div>
            <p className="text-sm font-semibold text-gray-800 bg-gray-50 rounded-lg px-3 py-2.5 mb-2">{delTarget.title}</p>
            {parseInt(delTarget.enrolled_count) > 0
              ? <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">⚠️ {delTarget.enrolled_count} student(s) enrolled. Remove enrollments first.</p>
              : <p className="text-xs text-gray-400 mb-4">This cannot be undone.</p>
            }
            <div className="flex gap-3">
              <button onClick={() => setDelTarget(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete} disabled={deleting || parseInt(delTarget.enrolled_count) > 0}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold disabled:opacity-50">
                {deleting ? <Loader size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}