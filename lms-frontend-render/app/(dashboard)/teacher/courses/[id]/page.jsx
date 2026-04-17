"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Loader, AlertCircle, Trash2, Edit2, Save,
  X, BookOpen, FileText, ExternalLink, Upload, Link2,
  ChevronDown, ChevronRight, GraduationCap, Tag, Layers,
  CheckCircle, FolderPlus, FilePlus, File, FileVideo,
  FileImage, Cloud, CloudUpload,
} from "lucide-react";
import { authFetch, guardRoute } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;

const inputCls =
  "w-full rounded-xl border border-blue-200 bg-white text-gray-900 placeholder-gray-400 " +
  "px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-500 transition";

const inputErrCls =
  "w-full rounded-xl border border-red-400 bg-white text-gray-900 placeholder-gray-400 " +
  "px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition";

const labelCls = "block text-xs font-bold text-blue-700 mb-1.5 uppercase tracking-wide";

function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(filename, type) {
  const ext = filename?.split(".").pop()?.toLowerCase();
  if (["mp4", "mov", "avi", "webm"].includes(ext) || type === "VIDEO")
    return <FileVideo size={13} className="text-purple-500" />;
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext))
    return <FileImage size={13} className="text-green-500" />;
  if (ext === "pdf" || type === "PDF")
    return <FileText size={13} className="text-red-500" />;
  return <File size={13} className="text-blue-500" />;
}

// ─── Type badge style (matching student page) ────────────────────────────────
function getTypeBadgeStyle(type) {
  switch (type?.toUpperCase()) {
    case "PDF":     return "bg-red-50 text-red-600 border-red-100";
    case "VIDEO":   return "bg-purple-50 text-purple-600 border-purple-100";
    case "LINK":    return "bg-blue-50 text-blue-600 border-blue-100";
    case "MEETING": return "bg-green-50 text-green-600 border-green-100";
    case "DOC":     return "bg-blue-50 text-blue-600 border-blue-100";
    default:        return "bg-gray-50 text-gray-500 border-gray-100";
  }
}

function Btn({ children, onClick, variant = "primary", size = "md", disabled, className = "", type = "button" }) {
  const base = "inline-flex items-center gap-1.5 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2.5 text-sm", lg: "px-6 py-3 text-sm" };
  const variants = {
    primary: "bg-blue-700 hover:bg-blue-800 text-white shadow-sm",
    outline: "border border-blue-300 text-blue-700 hover:bg-blue-50 bg-white",
    ghost:   "text-blue-700 hover:bg-blue-50",
    danger:  "border border-red-200 text-red-600 hover:bg-red-50 bg-white",
    success: "bg-green-600 hover:bg-green-700 text-white shadow-sm",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

// ─── Drag & Drop Upload Zone ─────────────────────────────────────────────────
function DropZone({ files, onChange, onRemove }) {
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files || []);
    if (dropped.length) onChange(dropped);
  }

  function handleDragOver(e) { e.preventDefault(); setDragging(true); }

  function handleFileChange(e) {
    const selected = Array.from(e.target.files || []);
    if (selected.length) onChange(selected);
    e.target.value = "";
  }

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragging(false)}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all
          ${dragging ? "border-blue-500 bg-blue-50 scale-[1.01]" : "border-blue-200 hover:border-blue-400 hover:bg-blue-50/50"}`}
      >
        <div className="flex flex-col items-center gap-2">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${dragging ? "bg-blue-200" : "bg-blue-100"}`}>
            <CloudUpload size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">
              {dragging ? "Drop files here" : "Drag & drop files here"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">or <span className="text-blue-600 font-medium">browse</span> to upload · PDF, DOC, MP4, images…</p>
          </div>
        </div>
        <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFileChange} />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {files.length} file{files.length !== 1 ? "s" : ""} ready to upload
          </p>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {files.map((f, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                  {getFileIcon(f.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{f.name}</p>
                  <p className="text-xs text-gray-400">{formatBytes(f.size)}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onRemove(idx); }}
                  className="text-gray-300 hover:text-red-500 transition flex-shrink-0">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Upload Progress Bar ─────────────────────────────────────────────────────
function UploadProgress({ saving, fileCount }) {
  if (!saving) return null;
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-blue-700">
        <span className="flex items-center gap-1.5">
          <Loader size={12} className="animate-spin" />
          Uploading {fileCount > 1 ? `${fileCount} files` : "file"}…
        </span>
      </div>
      <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 rounded-full animate-pulse w-3/4" />
      </div>
    </div>
  );
}

// ─── Material Modal ──────────────────────────────────────────────────────────
function MaterialModal({ lessonId, courseId, material, onClose, onSaved }) {
  const isEdit = Boolean(material);
  const [title, setTitle] = useState(material?.title || "");
  const [externalUrl, setExternalUrl] = useState(material?.external_url || "");
  const [files, setFiles] = useState([]);
  const [type, setType] = useState(material?.material_type || "DOC");
  const [subtopic, setSubtopic] = useState(material?.subtopic || "");
  const [subtopicError, setSubtopicError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const validateSubtopic = (value) => {
    if (!value || value.trim() === "") return { isValid: false };
    if (value.length > 100) return { isValid: false, error: "Subtopic cannot exceed 100 characters" };
    if (/[<>'"]/.test(value)) return { isValid: false, error: 'Subtopic cannot contain <, >, \', or " characters' };
    return { isValid: true, value: value.trim() };
  };

  async function handleSave() {
    const subtopicValidation = validateSubtopic(subtopic);
    if (!subtopicValidation.isValid) {
      setSubtopicError(true);
      if (subtopicValidation.error) setErr(subtopicValidation.error);
      return;
    }
    if (!isEdit && files.length === 0 && !externalUrl.trim()) {
      setErr("Upload at least one file or add a link.");
      return;
    }
    if (isEdit && !title.trim()) { setErr("Title is required."); return; }

    setSaving(true); setErr(""); setSubtopicError(false);
    try {
      const fd = new FormData();
      if (isEdit) fd.append("title", title.trim());
      fd.append("material_type", type);
      fd.append("subtopic", subtopicValidation.value);
      if (lessonId) fd.append("lesson_id", lessonId);
      if (courseId) fd.append("course_id", courseId);
      if (externalUrl.trim()) fd.append("external_url", externalUrl.trim());
      for (let i = 0; i < files.length; i++) fd.append("files", files[i]);

      const url = isEdit ? `${API}/materials/${material.material_id}` : `${API}/materials`;
      const method = isEdit ? "PUT" : "POST";
      const res = await authFetch(url, { method, body: fd });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to save.");

      if (isEdit) {
        onSaved(data.material);
      } else {
        if (data.materials && Array.isArray(data.materials)) {
          data.materials.forEach(mat => onSaved(mat));
        } else if (data.material) {
          onSaved(data.material);
        }
      }
      onClose();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-extrabold text-gray-900 flex items-center gap-2 text-base">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <FilePlus size={14} className="text-blue-700" />
              </div>
              {isEdit ? "Edit Material" : "Add Materials"}
            </h3>
            {!isEdit && <p className="text-xs text-gray-400 mt-0.5 ml-9">Upload files or add an external link</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
          {err && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-sm">
              <AlertCircle size={14} className="flex-shrink-0" /> {err}
            </div>
          )}
          <UploadProgress saving={saving} fileCount={files.length} />

          {isEdit && (
            <div>
              <label className={labelCls}>Material Title *</label>
              <input className={inputCls} placeholder="e.g. Chapter 1 Notes"
                value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
          )}

          <div>
            <label className={labelCls}>Subtopic *</label>
            <input
              className={subtopicError ? inputErrCls : inputCls}
              placeholder="e.g. Introduction, Week 1, Chapter 3…"
              value={subtopic}
              onChange={(e) => {
                setSubtopic(e.target.value);
                if (subtopicError && e.target.value.trim()) { setSubtopicError(false); setErr(""); }
              }}
              maxLength={100}
            />
            {subtopicError && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={11} /> Required
              </p>
            )}
          </div>

          {/* Type */}
          <div>
            <label className={labelCls}>Material Type</label>
            <select className={inputCls} value={type} onChange={(e) => setType(e.target.value)}>
              {["DOC", "PDF", "VIDEO", "MEETING", "LINK", "OTHER"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {!isEdit && (
            <div>
              <label className={labelCls}>Upload Files</label>
              <DropZone
                files={files}
                onChange={(newFiles) => setFiles(prev => [...prev, ...newFiles])}
                onRemove={(idx) => setFiles(prev => prev.filter((_, i) => i !== idx))}
              />
            </div>
          )}

          {!isEdit && (
            <div className="flex items-center gap-3">
              <hr className="flex-1 border-gray-200" />
              <span className="text-xs text-gray-400 font-medium px-1">OR ADD A LINK</span>
              <hr className="flex-1 border-gray-200" />
            </div>
          )}

          <div>
            <label className={labelCls}>External Link
              {!isEdit && <span className="text-gray-400 normal-case font-normal ml-1">(YouTube, Drive, Zoom…)</span>}
            </label>
            <div className="relative">
              <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
              <input className={`${inputCls} pl-8`} placeholder="https://…"
                value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} />
            </div>
          </div>

          {!isEdit && files.length === 0 && !externalUrl && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-xs text-amber-700">
              <AlertCircle size={13} className="flex-shrink-0" />
              Please upload at least one file or add an external link to continue.
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-3xl">
          {!isEdit
            ? <span className="text-xs text-gray-400">{files.length > 0 ? `${files.length} file${files.length !== 1 ? "s" : ""} selected` : "No files selected"}</span>
            : <span />}
          <div className="flex gap-2">
            <Btn variant="outline" onClick={onClose} disabled={saving}>Cancel</Btn>
            <Btn variant="primary" onClick={handleSave} disabled={saving}>
              {saving
                ? <><Loader size={13} className="animate-spin" /> Uploading…</>
                : <><Save size={13} /> {isEdit ? "Save Changes" : `Upload${files.length > 1 ? ` ${files.length}` : ""}`}</>}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Lesson Modal ────────────────────────────────────────────────────────────
function LessonModal({ courseId, lesson, onClose, onSaved }) {
  const isEdit = Boolean(lesson);
  const [title, setTitle] = useState(lesson?.title || "");
  const [description, setDescription] = useState(lesson?.description || "");
  const [resourceUrl, setResourceUrl] = useState(lesson?.resource_url || "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function handleSave() {
    if (!title.trim()) { setErr("Lesson title is required."); return; }
    setSaving(true); setErr("");
    try {
      const body = { course_id: courseId, title: title.trim(), description: description.trim(), resource_url: resourceUrl.trim() };
      const url = isEdit ? `${API}/lessons/${lesson.lesson_id}` : `${API}/lessons`;
      const method = isEdit ? "PUT" : "POST";
      const res = await authFetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to save.");
      onSaved(data.lesson);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-extrabold text-gray-900 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
              <FolderPlus size={14} className="text-blue-700" />
            </div>
            {isEdit ? "Edit Lesson" : "New Lesson"}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {err && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-sm">
              <AlertCircle size={14} /> {err}
            </div>
          )}
          <div>
            <label className={labelCls}>Lesson Title *</label>
            <input className={inputCls} placeholder="e.g. Week 1 — Introduction to the Course"
              value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Description <span className="text-gray-400 normal-case font-normal">(optional)</span></label>
            <textarea className={`${inputCls} resize-none`} rows={3}
              placeholder="What will students learn in this lesson?"
              value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Resource URL <span className="text-gray-400 normal-case font-normal">(optional)</span></label>
            <div className="relative">
              <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
              <input className={`${inputCls} pl-8`} placeholder="https://…"
                value={resourceUrl} onChange={(e) => setResourceUrl(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-3xl">
          <Btn variant="outline" onClick={onClose} disabled={saving}>Cancel</Btn>
          <Btn variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? <Loader size={13} className="animate-spin" /> : <Save size={13} />}
            {isEdit ? "Save Changes" : "Create Lesson"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ─── Material Row ────────────────────────────────────────────────────────────
function MaterialRow({ material, onEdit, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${material.title}"?`)) return;
    setDeleting(true);
    try {
      await authFetch(`${API}/materials/${material.material_id}`, { method: "DELETE" });
      onDelete(material.material_id);
    } catch (_) { } finally { setDeleting(false); }
  }

  return (
    <div className="flex items-center justify-between px-3 py-2.5 hover:bg-blue-50/60 transition-colors rounded-xl gap-3 group">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 shadow-sm flex items-center justify-center flex-shrink-0">
          {getFileIcon(material.title, material.material_type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-800 truncate">{material.title}</span>
            {material.external_url && (
              <a href={material.external_url} target="_blank" rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-600 transition" title="Open link">
                <ExternalLink size={11} />
              </a>
            )}
            {material.content_url && (
              <a href={`${API}${material.content_url}`} target="_blank" rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-600 transition" title="View file">
                <FileText size={11} />
              </a>
            )}
          </div>
          {/* Color-coded type badge — matching student page */}
          <span className={`inline-flex items-center text-xs font-medium border rounded-full px-2 py-0.5 mt-0.5 ${getTypeBadgeStyle(material.material_type)}`}>
            {material.material_type}
          </span>
        </div>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(material)}
          className="w-7 h-7 rounded-lg hover:bg-blue-100 flex items-center justify-center text-blue-600 transition">
          <Edit2 size={12} />
        </button>
        <button onClick={handleDelete} disabled={deleting}
          className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-400 hover:text-red-600 transition disabled:opacity-50">
          {deleting ? <Loader size={12} className="animate-spin" /> : <Trash2 size={12} />}
        </button>
      </div>
    </div>
  );
}

// ─── Subtopic Group ──────────────────────────────────────────────────────────
function SubtopicGroup({ subtopic, materials, onEditMaterial, onDeleteMaterial }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="border border-blue-100 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition text-left"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2">
          <Tag size={13} className="text-blue-500 flex-shrink-0" />
          <span className="font-semibold text-blue-700 text-sm">{subtopic}</span>
          <span className="text-xs text-indigo-400 font-medium bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
            {materials.length} item{materials.length !== 1 ? "s" : ""}
          </span>
        </div>
        {collapsed
          ? <ChevronRight size={14} className="text-blue-400" />
          : <ChevronDown size={14} className="text-blue-400" />}
      </button>
      {!collapsed && (
        <div className="divide-y divide-gray-50 px-2 py-1">
          {materials.map((material) => (
            <MaterialRow
              key={material.material_id}
              material={material}
              onEdit={onEditMaterial}
              onDelete={onDeleteMaterial}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Lesson Block ────────────────────────────────────────────────────────────
function LessonBlock({ lesson, onLessonEdit, onLessonDelete, onMaterialSaved, onMaterialDeleted }) {
  const [open, setOpen] = useState(true);
  const [materials, setMaterials] = useState(lesson.materials || []);
  const [showMatModal, setShowMatModal] = useState(false);
  const [editMaterial, setEditMaterial] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const groupedMaterials = materials.reduce((groups, mat) => {
    const key = mat.subtopic || "Uncategorized";
    if (!groups[key]) groups[key] = [];
    groups[key].push(mat);
    return groups;
  }, {});
  const sortedSubtopics = Object.keys(groupedMaterials).sort();
  const totalMaterials = materials.length;
  const subtopicCount = sortedSubtopics.filter(s => s !== "Uncategorized").length;

  function handleMaterialSaved(mat) {
    setMaterials((prev) => {
      const idx = prev.findIndex((m) => m.material_id === mat.material_id);
      if (idx >= 0) { const n = [...prev]; n[idx] = mat; return n; }
      return [...prev, mat];
    });
    setShowMatModal(false);
    setEditMaterial(null);
    onMaterialSaved?.();
  }

  function handleMaterialDeleted(id) {
    setMaterials((prev) => prev.filter((m) => m.material_id !== id));
    onMaterialDeleted?.();
  }

  async function handleLessonDelete() {
    if (!confirm(`Delete lesson "${lesson.title}" and all its materials?`)) return;
    setDeleting(true);
    try {
      await authFetch(`${API}/lessons/${lesson.lesson_id}`, { method: "DELETE" });
      onLessonDelete(lesson.lesson_id);
    } catch (_) { } finally { setDeleting(false); }
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-blue-100 overflow-hidden shadow-sm">
        {/* Lesson Header — dark blue gradient same as student page */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-blue-700">
          <button onClick={() => setOpen(v => !v)} className="flex items-center gap-3 flex-1 text-left min-w-0">
            <span className="w-8 h-8 rounded-xl bg-white/20 text-white text-xs font-extrabold flex items-center justify-center flex-shrink-0">
              {lesson.lesson_order}
            </span>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-bold text-white block truncate">{lesson.title}</span>
              {lesson.description && (
                <span className="text-xs text-blue-200 block truncate mt-0.5">{lesson.description}</span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              {subtopicCount > 0 && (
                <span className="hidden sm:inline-flex items-center gap-1 text-xs text-blue-200 font-medium">
                  <Tag size={10} /> {subtopicCount} topic{subtopicCount !== 1 ? "s" : ""}
                </span>
              )}
              <span className="text-xs text-blue-200 font-medium">
                {totalMaterials} file{totalMaterials !== 1 ? "s" : ""}
              </span>
              {open
                ? <ChevronDown size={15} className="text-blue-300" />
                : <ChevronRight size={15} className="text-blue-300" />}
            </div>
          </button>
          <div className="flex gap-1.5 ml-3 flex-shrink-0">
            <button onClick={() => onLessonEdit(lesson)}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition" title="Edit lesson">
              <Edit2 size={12} />
            </button>
            <button onClick={handleLessonDelete} disabled={deleting}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-red-500/70 flex items-center justify-center text-white transition disabled:opacity-50" title="Delete lesson">
              {deleting ? <Loader size={12} className="animate-spin" /> : <Trash2 size={12} />}
            </button>
          </div>
        </div>

        {/* Materials */}
        {open && (
          <div className="p-4 space-y-3">
            {totalMaterials === 0 ? (
              <div className="flex flex-col items-center py-6 gap-2 text-center">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Cloud size={18} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 font-medium">No materials yet</p>
                <p className="text-xs text-gray-400">Add PDFs, videos, links and more</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedSubtopics.map((subtopic) => (
                  <SubtopicGroup
                    key={subtopic}
                    subtopic={subtopic}
                    materials={groupedMaterials[subtopic]}
                    onEditMaterial={(mat) => { setEditMaterial(mat); setShowMatModal(true); }}
                    onDeleteMaterial={handleMaterialDeleted}
                  />
                ))}
              </div>
            )}
            <div className="pt-1 border-t border-gray-100">
              <Btn size="sm" variant="outline"
                onClick={() => { setEditMaterial(null); setShowMatModal(true); }}>
                <FilePlus size={13} /> Add Materials
              </Btn>
            </div>
          </div>
        )}
      </div>

      {showMatModal && (
        <MaterialModal
          lessonId={lesson.lesson_id}
          courseId={lesson.course_id}
          material={editMaterial}
          onClose={() => { setShowMatModal(false); setEditMaterial(null); }}
          onSaved={handleMaterialSaved}
        />
      )}
    </>
  );
}

// ─── Course Summary Bar (matching student page) ───────────────────────────────
function CourseSummaryBar({ lessons }) {
  const totalLessons = lessons.length;
  const totalFiles = lessons.reduce((s, l) => s + (l.materials?.length || 0), 0);
  const totalTopics = lessons.reduce((s, l) => {
    const unique = new Set((l.materials || []).map(m => m.subtopic).filter(Boolean));
    return s + unique.size;
  }, 0);

  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { icon: <BookOpen size={15} className="text-blue-600" />,  value: totalLessons, label: "Lessons", bg: "bg-blue-50 border-blue-100" },
        { icon: <Tag size={15} className="text-indigo-500" />,     value: totalTopics,  label: "Topics",  bg: "bg-indigo-50 border-indigo-100" },
        { icon: <FileText size={15} className="text-blue-500" />,  value: totalFiles,   label: "Files",   bg: "bg-blue-50 border-blue-100" },
      ].map((stat) => (
        <div key={stat.label} className={`${stat.bg} border rounded-xl px-3 py-3 flex items-center gap-2.5`}>
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm flex-shrink-0">
            {stat.icon}
          </div>
          <div>
            <p className="text-base font-extrabold text-gray-900 leading-none">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function TeacherCourseDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id;

  const [user, setUser] = useState(null);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showLesson, setShowLesson] = useState(false);
  const [editLesson, setEditLesson] = useState(null);
  const [toast, setToast] = useState("");

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const fetchAll = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const [courseRes, lessonsRes] = await Promise.all([
        authFetch(`${API}/courses/${courseId}`),
        authFetch(`${API}/lessons/course/${courseId}`),
      ]);
      if (courseRes.ok) { const d = await courseRes.json(); setCourse(d); }
      if (lessonsRes.ok) {
        const d = await lessonsRes.json();
        const lessonsWithMaterials = await Promise.all(
          (d.lessons || []).map(async (l) => {
            try {
              const matRes = await authFetch(`${API}/materials/lesson/${l.lesson_id}`);
              const matData = await matRes.json();
              return { ...l, materials: matData.materials || [] };
            } catch (_) { return { ...l, materials: [] }; }
          })
        );
        setLessons(lessonsWithMaterials);
      }
    } catch (_) {
      setError("Failed to load course data.");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    const auth = guardRoute("TEACHER", router);
    if (auth) { setUser(auth); fetchAll(); }
  }, [router, courseId, fetchAll]);

  function handleLessonSaved(lesson) {
    setLessons((prev) => {
      const idx = prev.findIndex((l) => l.lesson_id === lesson.lesson_id);
      if (idx >= 0) {
        const n = [...prev]; n[idx] = { ...n[idx], ...lesson }; return n;
      }
      return [...prev, { ...lesson, materials: [] }].sort((a, b) => a.lesson_order - b.lesson_order);
    });
    setShowLesson(false);
    setEditLesson(null);
    showToast("Lesson saved!");
  }

  function handleLessonDelete(id) {
    setLessons((prev) => prev.filter((l) => l.lesson_id !== id));
    showToast("Lesson deleted.");
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-xl text-sm font-semibold">
          <CheckCircle size={15} className="text-green-400" /> {toast}
        </div>
      )}

      {/* Back */}
      <Link href="/teacher/courses"
        className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors group">
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to My Courses
      </Link>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3.5 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3 text-blue-400">
          <Loader size={28} className="animate-spin" />
          <span className="text-sm font-medium text-gray-500">Loading course…</span>
        </div>
      ) : (
        <>
          {/* Course Card */}
          {course && (
            <div className="relative bg-white rounded-3xl border border-blue-100 shadow-sm overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-blue-700 to-indigo-700" />
              <div className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <GraduationCap size={24} className="text-blue-700" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">{course.title}</h1>
                    {course.description && <p className="text-sm text-gray-500 mt-1">{course.description}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lessons Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <BookOpen size={17} className="text-blue-600" /> Lessons & Materials
              </h2>
              <Btn variant="primary" onClick={() => { setEditLesson(null); setShowLesson(true); }}>
                <FolderPlus size={14} /> Add Lesson
              </Btn>
            </div>

            {lessons.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <BookOpen size={26} className="text-blue-600" />
                </div>
                <p className="text-gray-700 font-semibold">No lessons yet</p>
                <p className="text-gray-400 text-sm mt-1 mb-5">Start building your course by adding the first lesson.</p>
                <Btn variant="primary" onClick={() => setShowLesson(true)}>
                  <FolderPlus size={14} /> Add First Lesson
                </Btn>
              </div>
            ) : (
              <>
                {/* Summary bar */}
                <CourseSummaryBar lessons={lessons} />

                {/* Lesson blocks */}
                <div className="space-y-3">
                  {lessons.map((lesson) => (
                    <LessonBlock
                      key={lesson.lesson_id}
                      lesson={lesson}
                      onLessonEdit={(l) => { setEditLesson(l); setShowLesson(true); }}
                      onLessonDelete={handleLessonDelete}
                      onMaterialSaved={() => showToast("Material(s) saved!")}
                      onMaterialDeleted={() => showToast("Material deleted.")}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}

      {showLesson && (
        <LessonModal
          courseId={courseId}
          lesson={editLesson}
          onClose={() => { setShowLesson(false); setEditLesson(null); }}
          onSaved={handleLessonSaved}
        />
      )}
    </div>
  );
}
