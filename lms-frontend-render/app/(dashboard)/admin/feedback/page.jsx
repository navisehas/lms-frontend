"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare, Eye, CheckCircle, Clock, Filter,
  AlertCircle, Loader, Search, RefreshCw, User, ChevronDown, Trash2
} from "lucide-react";
import { guardRoute, authFetch } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const statusConfig = {
  PENDING:  { label: "Pending",  color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: <Clock size={13} /> },
  READ:     { label: "Read",     color: "bg-blue-100 text-blue-700 border-blue-200",       icon: <Eye size={13} /> },
  RESOLVED: { label: "Resolved", color: "bg-green-100 text-green-700 border-green-200",    icon: <CheckCircle size={13} /> },
};

export default function AdminFeedbackPage() {
  const router = useRouter();
  const [user, setUser]         = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [filter, setFilter]     = useState("ALL");
  const [search, setSearch]     = useState("");
  const [updating, setUpdating] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const authorised = guardRoute("ADMIN", router);
    if (authorised) { setUser(authorised); fetchFeedbacks(); }
  }, [router]);

  async function fetchFeedbacks() {
    setLoading(true);
    try {
      const res  = await authFetch(`${API}/feedback/admin/all`);
      const data = await res.json();
      if (data.success) setFeedbacks(data.feedbacks);
      else setError(data.error || "Failed to load.");
    } catch { setError("Network error."); }
    finally { setLoading(false); }
  }

  function showMsg(msg, isError = false) {
    if (isError) setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(""); setSuccess(""); }, 3000);
  }

  async function markRead(id) {
    setUpdating(id + "_read");
    try {
      const res  = await authFetch(`${API}/feedback/admin/${id}/read`, { method: "PUT" });
      const data = await res.json();
      if (data.success) { showMsg("Marked as read."); fetchFeedbacks(); }
      else showMsg(data.error || "Failed.", true);
    } catch { showMsg("Network error.", true); }
    finally { setUpdating(null); }
  }

  async function updateStatus(id, status) {
    setUpdating(id + "_status");
    try {
      const res  = await authFetch(`${API}/feedback/admin/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) });
      const data = await res.json();
      if (data.success) { showMsg(`Status updated to ${status}.`); fetchFeedbacks(); }
      else showMsg(data.error || "Failed.", true);
    } catch { showMsg("Network error.", true); }
    finally { setUpdating(null); }
  }

  async function handleAdminDelete(id) {
    setUpdating(id + "_delete");
    try {
      const res  = await authFetch(`${API}/feedback/admin/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) { setDeleteId(null); setExpandedId(null); showMsg("Feedback deleted successfully."); fetchFeedbacks(); }
      else showMsg(data.error || "Delete failed.", true);
    } catch { showMsg("Network error.", true); }
    finally { setUpdating(null); }
  }

  function toggleExpand(id, fb) {
    setExpandedId(expandedId === id ? null : id);
    if (fb.status === "PENDING" && expandedId !== id) markRead(id);
  }

  const filtered = feedbacks.filter(fb => {
    const matchFilter = filter === "ALL" || fb.status === filter;
    const matchSearch =
      fb.student_name.toLowerCase().includes(search.toLowerCase()) ||
      fb.user_id.toLowerCase().includes(search.toLowerCase()) ||
      fb.message.toLowerCase().includes(search.toLowerCase()) ||
      fb.feedback_id.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    ALL:      feedbacks.length,
    PENDING:  feedbacks.filter(f => f.status === "PENDING").length,
    READ:     feedbacks.filter(f => f.status === "READ").length,
    RESOLVED: feedbacks.filter(f => f.status === "RESOLVED").length,
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare className="text-blue-600" size={26} /> Feedback Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">View and manage all student feedbacks.</p>
        </div>
        <button onClick={fetchFeedbacks}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Alerts */}
      {error   && <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm"><AlertCircle size={16} /> {error}</div>}
      {success && <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm"><CheckCircle size={16} /> {success}</div>}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {["ALL","PENDING","READ","RESOLVED"].map(s => {
          const labels = { ALL:"Total", PENDING:"Pending", READ:"Read", RESOLVED:"Resolved" };
          const colors = {
            ALL:      "bg-white border-gray-200 text-gray-700",
            PENDING:  "bg-yellow-50 border-yellow-200 text-yellow-700",
            READ:     "bg-blue-50 border-blue-200 text-blue-700",
            RESOLVED: "bg-green-50 border-green-200 text-green-700",
          };
          return (
            <button key={s} onClick={() => setFilter(s)}
              className={`rounded-xl border p-4 text-left transition-all ${colors[s]} ${filter === s ? "ring-2 ring-offset-1 ring-blue-400 shadow-md" : "hover:shadow-sm"}`}>
              <p className="text-2xl font-bold">{counts[s]}</p>
              <p className="text-xs font-medium mt-0.5">{labels[s]}</p>
            </button>
          );
        })}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          {/* FIX: text-gray-900 makes typed text visible */}
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by student, ID, or message..."
            className="w-full pl-9 pr-4 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="pl-8 pr-8 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 appearance-none cursor-pointer">
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="READ">Read</option>
            <option value="RESOLVED">Resolved</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Feedback List */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400 gap-2"><Loader size={20} className="animate-spin" /> Loading feedbacks...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-gray-400 bg-white rounded-xl border border-gray-100">
          <MessageSquare size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No feedbacks found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(fb => {
            const stat       = statusConfig[fb.status] || statusConfig.PENDING;
            const isExpanded = expandedId === fb.feedback_id;
            const isUpdating = updating && updating.startsWith(fb.feedback_id);
            return (
              <div key={fb.feedback_id}
                className={`bg-white rounded-xl border shadow-sm transition-all ${fb.status === "PENDING" ? "border-yellow-200" : "border-gray-100"}`}>
                <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 rounded-xl"
                  onClick={() => toggleExpand(fb.feedback_id, fb)}>
                  <div className="bg-gray-100 rounded-full p-2 flex-shrink-0"><User size={18} className="text-gray-500" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-800 text-sm">{fb.student_name}</span>
                      <span className="text-xs text-gray-400 font-mono">{fb.user_id}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        fb.user_role === "TEACHER" ? "bg-emerald-100 text-emerald-700" :
                        fb.user_role === "MANAGER" ? "bg-indigo-100 text-indigo-700" :
                        "bg-blue-100 text-blue-700"}`}>{fb.user_role}</span>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${stat.color}`}>{stat.icon} {stat.label}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{fb.message}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">{new Date(fb.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</p>
                    <p className="text-xs text-gray-400">{new Date(fb.created_at).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}</p>
                  </div>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`} />
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-50 pt-4">
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide">Full Message</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{fb.message}</p>
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <span className="text-xs text-gray-400 font-mono">ID: {fb.feedback_id}</span>
                      <div className="flex gap-2 flex-wrap">
                        {fb.status === "PENDING" && (
                          <button onClick={() => markRead(fb.feedback_id)} disabled={isUpdating}
                            className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg disabled:opacity-60 transition-colors">
                            {isUpdating ? <Loader size={12} className="animate-spin" /> : <Eye size={12} />} Mark as Read
                          </button>
                        )}
                        {fb.status !== "RESOLVED" && (
                          <button onClick={() => updateStatus(fb.feedback_id, "RESOLVED")} disabled={isUpdating}
                            className="flex items-center gap-1.5 text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg disabled:opacity-60 transition-colors">
                            {isUpdating ? <Loader size={12} className="animate-spin" /> : <CheckCircle size={12} />} Mark Resolved
                          </button>
                        )}
                        {fb.status === "RESOLVED" && (
                          <button onClick={() => updateStatus(fb.feedback_id, "PENDING")} disabled={isUpdating}
                            className="flex items-center gap-1.5 text-xs border border-yellow-400 text-yellow-700 hover:bg-yellow-50 px-3 py-1.5 rounded-lg disabled:opacity-60 transition-colors">
                            {isUpdating ? <Loader size={12} className="animate-spin" /> : <Clock size={12} />} Reopen
                          </button>
                        )}
                        <button onClick={() => setDeleteId(fb.feedback_id)} disabled={isUpdating}
                          className="flex items-center gap-1.5 text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg disabled:opacity-60 transition-colors">
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
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
            <div className="flex items-center gap-3 mb-4"><div className="bg-red-100 text-red-600 rounded-full p-2"><Trash2 size={20} /></div><h3 className="font-semibold text-gray-800">Delete Feedback?</h3></div>
            <p className="text-sm text-gray-500 mb-5">Are you sure you want to permanently delete this feedback? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleAdminDelete(deleteId)} disabled={!!updating}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm disabled:opacity-60">
                {updating ? <Loader size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}