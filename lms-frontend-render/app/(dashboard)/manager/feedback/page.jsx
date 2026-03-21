"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare, Send, Pencil, Trash2, CheckCircle,
  Clock, Eye, AlertCircle, Plus, X, Save, Loader
} from "lucide-react";
import { guardRoute, authFetch } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;

const statusConfig = {
  PENDING: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: <Clock size={13} />,
  },
  READ: {
    label: "Read by Admin",
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
    icon: <Eye size={13} />,
  },
  RESOLVED: {
    label: "Resolved",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: <CheckCircle size={13} />,
  },
};

export default function ManagerFeedbackPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [editId, setEditId] = useState(null);
  const [editMessage, setEditMessage] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const authorised = guardRoute("MANAGER", router);
    if (authorised) {
      setUser(authorised);
      fetchFeedbacks();
    }
  }, [router]);

  async function fetchFeedbacks() {
    setLoading(true);
    try {
      const res = await authFetch(`${API}/feedback/my`);
      const data = await res.json();
      if (data.success) setFeedbacks(data.feedbacks);
    } catch {
      setError("Failed to load feedbacks.");
    } finally {
      setLoading(false);
    }
  }

  function showMsg(msg, isError = false) {
    if (isError) setError(msg);
    else setSuccess(msg);
    setTimeout(() => { setError(""); setSuccess(""); }, 3500);
  }

  async function handleSubmit() {
    if (!newMessage.trim()) return showMsg("Please enter a message.", true);
    setSubmitting(true);
    try {
      const res = await authFetch(`${API}/feedback`, {
        method: "POST",
        body: JSON.stringify({ message: newMessage }),
      });
      const data = await res.json();
      if (data.success) {
        setNewMessage("");
        setShowForm(false);
        showMsg("Feedback submitted successfully!");
        fetchFeedbacks();
      } else showMsg(data.error || "Submission failed.", true);
    } catch {
      showMsg("Network error.", true);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate() {
    if (!editMessage.trim()) return showMsg("Message cannot be empty.", true);
    setSubmitting(true);
    try {
      const res = await authFetch(`${API}/feedback/${editId}`, {
        method: "PUT",
        body: JSON.stringify({ message: editMessage }),
      });
      const data = await res.json();
      if (data.success) {
        setEditId(null);
        setEditMessage("");
        showMsg("Feedback updated successfully!");
        fetchFeedbacks();
      } else showMsg(data.error || "Update failed.", true);
    } catch {
      showMsg("Network error.", true);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    setSubmitting(true);
    try {
      const res = await authFetch(`${API}/feedback/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setDeleteId(null);
        showMsg("Feedback deleted.");
        fetchFeedbacks();
      } else showMsg(data.error || "Delete failed.", true);
    } catch {
      showMsg("Network error.", true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare className="text-indigo-500" size={26} />
            My Feedbacks
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Submit feedback or suggestions to the admin.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setNewMessage(""); }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Cancel" : "New Feedback"}
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm">
          <CheckCircle size={16} /> {success}
        </div>
      )}

      {/* New Feedback Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-indigo-100 shadow-sm p-5 mb-6">
          <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Send size={16} className="text-indigo-500" /> Submit New Feedback
          </h2>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Write your feedback, suggestion, or concern here..."
            className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            rows={4}
          />
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg disabled:opacity-60 transition-colors"
            >
              {submitting ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
              Submit
            </button>
          </div>
        </div>
      )}

      {/* Feedback List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
          <Loader size={20} className="animate-spin" /> Loading feedbacks...
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="text-center py-20 text-gray-400 bg-white rounded-xl">
          <MessageSquare size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No feedbacks yet.</p>
          <p className="text-sm mt-1">Click &quot;New Feedback&quot; to submit one.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((fb) => {
            const stat = statusConfig[fb.status] || statusConfig.PENDING;
            const isEditing = editId === fb.feedback_id;
            const canEdit = fb.status !== "READ" && fb.status !== "RESOLVED";

            return (
              <div
                key={fb.feedback_id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-gray-400">{fb.feedback_id}</span>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${stat.color}`}>
                      {stat.icon} {stat.label}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(fb.created_at).toLocaleString("en-US", {
                      year: "numeric", month: "short", day: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                </div>

                {isEditing ? (
                  <div>
                    <textarea
                      value={editMessage}
                      onChange={(e) => setEditMessage(e.target.value)}
                      className="w-full border border-indigo-300 rounded-lg p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                      rows={3}
                    />
                    <div className="flex gap-2 mt-2 justify-end">
                      <button
                        onClick={() => setEditId(null)}
                        className="px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdate}
                        disabled={submitting}
                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-lg disabled:opacity-60"
                      >
                        {submitting ? <Loader size={12} className="animate-spin" /> : <Save size={12} />}
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 leading-relaxed">{fb.message}</p>
                )}

                {fb.status === "READ" && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50 rounded-lg px-3 py-2">
                    <Eye size={13} /> Admin has read this feedback.
                  </div>
                )}
                {fb.status === "RESOLVED" && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
                    <CheckCircle size={13} /> This feedback has been resolved by admin.
                  </div>
                )}

                {!isEditing && canEdit && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                    <button
                      onClick={() => { setEditId(fb.feedback_id); setEditMessage(fb.message); }}
                      className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(fb.feedback_id)}
                      className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                )}
                {!isEditing && !canEdit && (
                  <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-50 italic">
                    This feedback has been read or resolved and cannot be edited.
                  </p>
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
              <div className="bg-red-100 text-red-600 rounded-full p-2">
                <Trash2 size={20} />
              </div>
              <h3 className="font-semibold text-gray-800">Delete Feedback?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              Are you sure you want to delete this feedback? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm disabled:opacity-60"
              >
                {submitting ? <Loader size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}