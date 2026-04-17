"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle, Send, Trash2, CheckCircle,
  Clock, Loader, Plus, X, Star,
  AlertCircle, MessageSquare
} from "lucide-react";
import { guardRoute, authFetch } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;

const STATUS_CONFIG = {
  PENDING:   { label: "Pending",   color: "bg-amber-100 text-amber-700 border-amber-200",       icon: <Clock size={12} /> },
  REVIEWING: { label: "Reviewing", color: "bg-blue-100 text-blue-700 border-blue-200",           icon: <MessageSquare size={12} /> },
  RESOLVED:  { label: "Resolved",  color: "bg-emerald-100 text-emerald-700 border-emerald-200",  icon: <CheckCircle size={12} /> },
};

function StarRating({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  const labels = ["", "Very Poor", "Poor", "Average", "Good", "Excellent"];
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`transition-transform ${!readonly ? "hover:scale-110 cursor-pointer" : "cursor-default"}`}
        >
          <Star
            size={readonly ? 14 : 26}
            className={`transition-colors ${
              star <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        </button>
      ))}
      {!readonly && value > 0 && (
        <span className="ml-2 text-sm font-medium text-amber-600">{labels[value]}</span>
      )}
    </div>
  );
}

export default function TeacherComplaintsPage() {
  const router = useRouter();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);

  useEffect(() => {
    const auth = guardRoute("TEACHER", router);
    if (auth) fetchComplaints();
  }, [router]);

  async function fetchComplaints() {
    setLoading(true);
    try {
      const res = await authFetch(`${API}/complaints/my`);
      const data = await res.json();
      if (data.success) setComplaints(data.complaints);
    } catch { setError("Failed to load complaints."); }
    finally { setLoading(false); }
  }

  function showMsg(msg, isError = false) {
    if (isError) setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(""); setSuccess(""); }, 4000);
  }

  function resetForm() { setSubject(""); setMessage(""); setRating(0); }

  async function handleSubmit() {
    if (!subject.trim()) return showMsg("Subject is required.", true);
    if (!message.trim()) return showMsg("Please describe your complaint.", true);
    if (rating === 0) return showMsg("Please select a rating.", true);

    setSubmitting(true);
    try {
      const res = await authFetch(`${API}/complaints`, {
        method: "POST",
        body: JSON.stringify({ subject, message, rating }),
      });
      const data = await res.json();
      if (data.success) {
        resetForm(); setShowForm(false);
        showMsg("Complaint submitted successfully!");
        fetchComplaints();
      } else { showMsg(data.error || "Submission failed.", true); }
    } catch { showMsg("Network error.", true); }
    finally { setSubmitting(false); }
  }

  async function handleDelete(id) {
    setSubmitting(true);
    try {
      const res = await authFetch(`${API}/complaints/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setDeleteId(null); showMsg("Complaint deleted."); fetchComplaints();
      } else { showMsg(data.error || "Delete failed.", true); }
    } catch { showMsg("Network error.", true); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <AlertTriangle className="text-orange-500" size={26} /> My Complaints
          </h1>
          <p className="text-sm text-gray-500 mt-1">Submit complaints and track admin responses.</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); resetForm(); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
            showForm ? "bg-gray-200 text-gray-700 hover:bg-gray-300" : "bg-orange-500 hover:bg-orange-600 text-white"
          }`}
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Cancel" : "New Complaint"}
        </button>
      </div>

      {error && <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm"><AlertCircle size={16} />{error}</div>}
      {success && <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 mb-4 text-sm"><CheckCircle size={16} />{success}</div>}

      {showForm && (
        <div className="bg-white rounded-2xl border border-orange-100 shadow-md p-6 mb-6">
          <h2 className="font-bold text-gray-800 mb-5 flex items-center gap-2 text-base">
            <Send size={16} className="text-orange-500" /> Submit a Complaint
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Subject *</label>
              <input value={subject} onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Issue with student grading system"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-gray-50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Describe Your Issue *</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe the issue in detail..."
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-gray-50 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Rate Your Experience *</label>
              <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                <StarRating value={rating} onChange={setRating} />
                {rating === 0 && <p className="text-xs text-gray-400 mt-1">Click a star to rate</p>}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => { setShowForm(false); resetForm(); }}
              className="px-5 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={handleSubmit} disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl disabled:opacity-60 transition-colors shadow-sm">
              {submitting ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}Submit Complaint
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400 gap-2"><Loader size={20} className="animate-spin" /> Loading complaints...</div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-24 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <AlertTriangle size={48} className="mx-auto mb-3 opacity-25" />
          <p className="font-semibold">No complaints submitted yet.</p>
          <p className="text-sm mt-1">Click &quot;New Complaint&quot; to report an issue.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => {
            const stat = STATUS_CONFIG[c.status] || STATUS_CONFIG.PENDING;
            return (
              <div key={c.complaint_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-gray-800 text-sm">{c.subject}</span>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${stat.color}`}>
                        {stat.icon} {stat.label}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">{c.complaint_id}</span>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">{c.message}</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-50 flex-wrap gap-2">
                  <StarRating value={c.rating} readonly />
                  <div className="flex items-center gap-2">
                    {c.admin_response && (
                      <div className="w-full mt-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                        <p className="text-xs font-semibold text-emerald-600 mb-1">💬 Admin Response</p>
                        <p className="text-sm text-emerald-800 leading-relaxed">{c.admin_response}</p>
                      </div>
                    )}
                    {c.status === "PENDING" ? (
                      <button onClick={() => setDeleteId(c.complaint_id)}
                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                        <Trash2 size={12} /> Delete
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Cannot delete after review starts</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 text-red-600 rounded-full p-2.5"><Trash2 size={20} /></div>
              <h3 className="font-bold text-gray-800">Delete Complaint?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5">This will permanently remove your complaint.</p>
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