"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare, Send, Pencil, Trash2, CheckCircle,
  AlertCircle, Plus, X, Save, Loader,
  Star, ChevronDown
} from "lucide-react";
import { guardRoute, authFetch } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;

const AREAS = [
  { value: "courses",    label: "📚 Courses & Lessons" },
  { value: "payment",    label: "💳 Payments & Billing" },
  { value: "teacher",    label: "👨‍🏫 Teacher / Instruction" },
  { value: "attendance", label: "📋 Attendance" },
  { value: "materials",  label: "📄 Study Materials" },
  { value: "exam",       label: "📝 Exams & Results" },
  { value: "technical",  label: "💻 Technical / Website" },
  { value: "other",      label: "🔖 Other" },
];

const AREA_LABELS = Object.fromEntries(AREAS.map(a => [a.value, a.label]));
const STAR_LABELS = ["", "Very Poor", "Poor", "Average", "Good", "Excellent"];

function StarRating({ value, onChange, readonly = false, size = 24, hasError = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className={`flex items-center gap-1 rounded-xl px-4 py-3 border ${hasError ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"}`}>
      {[1,2,3,4,5].map(s => (
        <button key={s} type="button" disabled={readonly}
          onClick={() => !readonly && onChange && onChange(s)}
          onMouseEnter={() => !readonly && setHovered(s)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`transition-transform ${!readonly ? "hover:scale-110 cursor-pointer" : "cursor-default"}`}>
          <Star size={size}
            className={`transition-colors ${s <= (hovered || value) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
        </button>
      ))}
      {!readonly && value > 0 && (
        <span className="ml-1.5 text-sm font-medium text-amber-600">{STAR_LABELS[value]}</span>
      )}
      {!readonly && value === 0 && (
        <span className={`ml-1 text-xs ${hasError ? "text-red-400" : "text-gray-400"}`}>Click a star to rate</span>
      )}
      {readonly && value > 0 && (
        <span className="ml-1 text-xs text-gray-500">{value}/5</span>
      )}
    </div>
  );
}

export default function StudentFeedbackPage() {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);

  // field errors
  const [fieldErrors, setFieldErrors] = useState({});

  // new feedback fields
  const [newArea, setNewArea]       = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newRating, setNewRating]   = useState(0);

  // edit
  const [editId, setEditId]           = useState(null);
  const [editArea, setEditArea]       = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [editRating, setEditRating]   = useState(0);

  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const auth = guardRoute("STUDENT", router);
    if (auth) fetchFeedbacks();
  }, [router]);

  async function fetchFeedbacks() {
    setLoading(true);
    try {
      const res  = await authFetch(`${API}/feedback/my`);
      const data = await res.json();
      if (data.success) setFeedbacks(data.feedbacks);
    } catch { setError("Failed to load feedbacks."); }
    finally { setLoading(false); }
  }

  function showMsg(msg, isError = false) {
    if (isError) setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(""); setSuccess(""); }, 3500);
  }

  function resetNew() {
    setNewArea(""); setNewMessage(""); setNewRating(0);
    setFieldErrors({});
  }

  async function handleSubmit() {
    // Inline field validation
    const errors = {};
    if (!newArea)           errors.area    = "Please select an area.";
    if (!newMessage.trim()) errors.message = "Please write your feedback.";
    if (newRating === 0)    errors.rating  = "Please select a rating.";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      const res  = await authFetch(`${API}/feedback`, {
        method: "POST",
        body: JSON.stringify({ area: newArea, message: newMessage, rating: newRating }),
      });
      const data = await res.json();
      if (data.success) {
        resetNew(); setShowForm(false);
        showMsg("Feedback submitted successfully!");
        fetchFeedbacks();
      } else { showMsg(data.error || "Submission failed.", true); }
    } catch { showMsg("Network error.", true); }
    finally { setSubmitting(false); }
  }

  async function handleUpdate() {
    if (!editMessage.trim()) return showMsg("Message cannot be empty.", true);
    setSubmitting(true);
    try {
      const res  = await authFetch(`${API}/feedback/${editId}`, {
        method: "PUT",
        body: JSON.stringify({ area: editArea, message: editMessage, rating: editRating }),
      });
      const data = await res.json();
      if (data.success) {
        setEditId(null); showMsg("Feedback updated!"); fetchFeedbacks();
      } else { showMsg(data.error || "Update failed.", true); }
    } catch { showMsg("Network error.", true); }
    finally { setSubmitting(false); }
  }

  async function handleDelete(id) {
    setSubmitting(true);
    try {
      const res  = await authFetch(`${API}/feedback/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) { setDeleteId(null); showMsg("Feedback deleted."); fetchFeedbacks(); }
      else { showMsg(data.error || "Delete failed.", true); }
    } catch { showMsg("Network error.", true); }
    finally { setSubmitting(false); }
  }

  function startEdit(fb) {
    setEditId(fb.feedback_id);
    setEditArea(fb.area || "");
    setEditMessage(fb.message);
    setEditRating(fb.rating || 0);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare className="text-blue-600" size={26} /> My Feedbacks
          </h1>
          <p className="text-sm text-gray-500 mt-1">Submit feedback and track responses from admin.</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); resetNew(); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all ${
            showForm ? "bg-gray-200 text-gray-700 hover:bg-gray-300" : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}>
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Cancel" : "New Feedback"}
        </button>
      </div>

      {error   && <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm"><AlertCircle size={16} />{error}</div>}
      {success && <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-4 text-sm"><CheckCircle size={16} />{success}</div>}

      {/* New Feedback Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-blue-100 shadow-md p-6 mb-6">
          <h2 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
            <Send size={16} className="text-blue-500" /> Submit Feedback
          </h2>
          <div className="space-y-4">

            {/* Area */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Area *</label>
              <div className="relative">
                <select
                  value={newArea}
                  onChange={e => { setNewArea(e.target.value); setFieldErrors(p => ({ ...p, area: "" })); }}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 bg-gray-50 appearance-none cursor-pointer ${
                    fieldErrors.area ? "border-red-400 focus:ring-red-200" : "border-gray-200 focus:ring-blue-300"
                  }`}>
                  <option value="">— Select area —</option>
                  {AREAS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {fieldErrors.area && <p className="text-xs text-red-500 mt-1">{fieldErrors.area}</p>}
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Message *</label>
              <textarea
                value={newMessage}
                onChange={e => { setNewMessage(e.target.value); setFieldErrors(p => ({ ...p, message: "" })); }}
                placeholder="Write your feedback here..."
                rows={4}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 bg-gray-50 resize-none ${
                  fieldErrors.message ? "border-red-400 focus:ring-red-200" : "border-gray-200 focus:ring-blue-300"
                }`} />
              {fieldErrors.message && <p className="text-xs text-red-500 mt-1">{fieldErrors.message}</p>}
            </div>

            {/* Rating */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Rating *</label>
              <StarRating
                value={newRating}
                onChange={v => { setNewRating(v); setFieldErrors(p => ({ ...p, rating: "" })); }}
                hasError={!!fieldErrors.rating}
              />
              {fieldErrors.rating && <p className="text-xs text-red-500 mt-1">{fieldErrors.rating}</p>}
            </div>

          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => { setShowForm(false); resetNew(); }}
              className="px-5 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
            <button onClick={handleSubmit} disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl disabled:opacity-60 shadow-sm">
              {submitting ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}Submit
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
          <Loader size={20} className="animate-spin" /> Loading feedbacks...
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="text-center py-24 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <MessageSquare size={48} className="mx-auto mb-3 opacity-25" />
          <p className="font-semibold">No feedbacks yet.</p>
          <p className="text-sm mt-1">Click &quot;New Feedback&quot; to submit one.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map(fb => {
            const isEditing = editId === fb.feedback_id;
            return (
              <div key={fb.feedback_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-gray-400">{fb.feedback_id}</span>
                      {fb.area && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          {AREA_LABELS[fb.area] || fb.area}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(fb.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>

                {fb.rating > 0 && (
                  <div className="mb-2">
                    <StarRating value={fb.rating} readonly size={14} />
                  </div>
                )}

                {isEditing ? (
                  <div className="space-y-3 mt-3">
                    <div className="relative">
                      <select value={editArea} onChange={e => setEditArea(e.target.value)}
                        className="w-full border border-blue-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white appearance-none cursor-pointer">
                        <option value="">— Select area —</option>
                        {AREAS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                      </select>
                      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    <textarea value={editMessage} onChange={e => setEditMessage(e.target.value)}
                      rows={3}
                      className="w-full border border-blue-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white resize-none" />
                    <StarRating value={editRating} onChange={setEditRating} />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditId(null)}
                        className="px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                      <button onClick={handleUpdate} disabled={submitting}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg disabled:opacity-60">
                        {submitting ? <Loader size={12} className="animate-spin" /> : <Save size={12} />}Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 leading-relaxed mt-2">{fb.message}</p>
                )}

                {!isEditing && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                    <button onClick={() => startEdit(fb)}
                      className="flex items-center gap-1.5 text-xs text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                      <Pencil size={13} /> Edit
                    </button>
                    <button onClick={() => setDeleteId(fb.feedback_id)}
                      className="flex items-center gap-1.5 text-xs text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 text-red-600 rounded-full p-2.5"><Trash2 size={20} /></div>
              <h3 className="font-bold text-gray-800">Delete Feedback?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60">
                {submitting ? <Loader size={14} className="animate-spin" /> : <Trash2 size={14} />}Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
