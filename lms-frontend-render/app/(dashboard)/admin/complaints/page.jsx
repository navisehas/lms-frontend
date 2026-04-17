"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle, CheckCircle, Clock, Loader, Search,
  RefreshCw, User, ChevronDown, Trash2, MessageSquare,
  AlertCircle, Star, Send
} from "lucide-react";
import { guardRoute, authFetch } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;

const STATUS_CONFIG = {
  PENDING:   { label: "Pending",   color: "bg-amber-100 text-amber-700 border-amber-200",      icon: <Clock size={12} /> },
  REVIEWING: { label: "Reviewing", color: "bg-blue-100 text-blue-700 border-blue-200",          icon: <MessageSquare size={12} /> },
  RESOLVED:  { label: "Resolved",  color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <CheckCircle size={12} /> },
};

function StarDisplay({ value }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={13}
          className={s <= value ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}
        />
      ))}
      <span className="ml-1 text-xs text-gray-500 font-medium">{value}/5</span>
    </div>
  );
}

export default function AdminComplaintsPage() {
  const router = useRouter();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");
  const [filter, setFilter]         = useState("ALL");
  const [search, setSearch]         = useState("");
  const [updating, setUpdating]     = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [deleteId, setDeleteId]     = useState(null);
  const [responseText, setResponseText] = useState({});

  useEffect(() => {
    const auth = guardRoute("ADMIN", router);
    if (auth) fetchComplaints();
  }, [router]);

  async function fetchComplaints() {
    setLoading(true);
    try {
      const res  = await authFetch(`${API}/complaints/admin/all`);
      const data = await res.json();
      if (data.success) setComplaints(data.complaints);
      else setError(data.error || "Failed to load.");
    } catch { setError("Network error."); }
    finally { setLoading(false); }
  }

  function showMsg(msg, isError = false) {
    if (isError) setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(""); setSuccess(""); }, 3500);
  }

  async function updateStatus(id, status, currentAdminResponse) {
    setUpdating(id + "_status");
    const adminResp = Object.prototype.hasOwnProperty.call(responseText, id)
      ? responseText[id]
      : (currentAdminResponse || null);
    try {
      const res  = await authFetch(`${API}/complaints/admin/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status, admin_response: adminResp }),
      });
      const data = await res.json();
      if (data.success) { showMsg(`Status updated to ${status}.`); fetchComplaints(); }
      else showMsg(data.error || "Failed.", true);
    } catch { showMsg("Network error.", true); }
    finally { setUpdating(null); }
  }

  async function saveResponse(id, currentStatus, currentAdminResponse) {
    setUpdating(id + "_response");
    const adminResp = Object.prototype.hasOwnProperty.call(responseText, id)
      ? responseText[id]
      : (currentAdminResponse || "");
    if (!adminResp.trim()) return showMsg("Please write a response first.", true);
    try {
      const res  = await authFetch(`${API}/complaints/admin/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: currentStatus, admin_response: adminResp }),
      });
      const data = await res.json();
      if (data.success) {
        showMsg("Response sent to user!");
        setComplaints(prev => prev.map(c =>
          c.complaint_id === id ? { ...c, admin_response: adminResp } : c
        ));
        setResponseText(prev => { const n = { ...prev }; delete n[id]; return n; });
      } else showMsg(data.error || "Failed.", true);
    } catch { showMsg("Network error.", true); }
    finally { setUpdating(null); }
  }

  async function handleDelete(id) {
    setUpdating(id + "_delete");
    try {
      const res  = await authFetch(`${API}/complaints/admin/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) { setDeleteId(null); setExpandedId(null); showMsg("Complaint deleted."); fetchComplaints(); }
      else showMsg(data.error || "Delete failed.", true);
    } catch { showMsg("Network error.", true); }
    finally { setUpdating(null); }
  }

  const filtered = complaints.filter(c => {
    const matchStatus = filter === "ALL" || c.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      c.user_name.toLowerCase().includes(q) ||
      c.user_id.toLowerCase().includes(q) ||
      c.subject.toLowerCase().includes(q) ||
      c.message.toLowerCase().includes(q) ||
      c.complaint_id.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = {
    ALL:       complaints.length,
    PENDING:   complaints.filter(c => c.status === "PENDING").length,
    REVIEWING: complaints.filter(c => c.status === "REVIEWING").length,
    RESOLVED:  complaints.filter(c => c.status === "RESOLVED").length,
  };

  const avgRating = complaints.length > 0
    ? (complaints.reduce((a, c) => a + c.rating, 0) / complaints.length).toFixed(1)
    : "—";

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <AlertTriangle className="text-orange-500" size={26} /> Complaints Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Review and respond to all complaints.</p>
        </div>
        <button onClick={fetchComplaints}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 bg-white border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error   && <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm"><AlertCircle size={16} />{error}</div>}
      {success && <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 mb-4 text-sm"><CheckCircle size={16} />{success}</div>}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { key: "ALL",       label: "Total",     color: "bg-white border-gray-200 text-gray-700" },
          { key: "PENDING",   label: "Pending",   color: "bg-amber-50 border-amber-200 text-amber-700" },
          { key: "REVIEWING", label: "Reviewing", color: "bg-blue-50 border-blue-200 text-blue-700" },
          { key: "RESOLVED",  label: "Resolved",  color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
        ].map(({ key, label, color }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`rounded-xl border p-4 text-left transition-all ${color} ${filter === key ? "ring-2 ring-offset-1 ring-orange-400 shadow-md" : "hover:shadow-sm"}`}>
            <p className="text-2xl font-bold">{counts[key]}</p>
            <p className="text-xs font-semibold mt-0.5">{label}</p>
          </button>
        ))}
        <div className="rounded-xl border bg-purple-50 border-purple-200 text-purple-700 p-4">
          <p className="text-2xl font-bold flex items-center gap-1">
            {avgRating} <Star size={16} className="fill-amber-400 text-amber-400" />
          </p>
          <p className="text-xs font-semibold mt-0.5">Avg Rating</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, ID, subject..."
            className="w-full pl-9 pr-4 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-200" />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400 gap-2"><Loader size={20} className="animate-spin" /> Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <AlertTriangle size={48} className="mx-auto mb-3 opacity-25" />
          <p className="font-semibold">No complaints found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => {
            const stat       = STATUS_CONFIG[c.status] || STATUS_CONFIG.PENDING;
            const isExpanded = expandedId === c.complaint_id;
            const isUpdating = updating && updating.startsWith(c.complaint_id);
            return (
              <div key={c.complaint_id}
                className={`bg-white rounded-2xl border shadow-sm transition-all ${c.status === "PENDING" ? "border-amber-200" : "border-gray-100"}`}>

                {/* Row */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 rounded-2xl"
                  onClick={() => setExpandedId(isExpanded ? null : c.complaint_id)}
                >
                  <div className={`rounded-full p-2 flex-shrink-0 ${
                    c.user_role === "TEACHER" ? "bg-emerald-100" :
                    c.user_role === "MANAGER" ? "bg-indigo-100" : "bg-blue-100"
                  }`}>
                    <User size={18} className={
                      c.user_role === "TEACHER" ? "text-emerald-600" :
                      c.user_role === "MANAGER" ? "text-indigo-600" : "text-blue-600"
                    } />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-semibold text-gray-800 text-sm">{c.user_name}</span>
                      <span className="text-xs text-gray-400 font-mono">{c.user_id}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        c.user_role === "TEACHER" ? "bg-emerald-100 text-emerald-700" :
                        c.user_role === "MANAGER" ? "bg-indigo-100 text-indigo-700" :
                        "bg-blue-100 text-blue-700"}`}>{c.user_role}</span>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${stat.color}`}>
                        {stat.icon} {stat.label}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-700 truncate max-w-xs block">{c.subject}</span>
                    <div className="mt-0.5">
                      <StarDisplay value={c.rating} />
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                    <p className="text-xs text-gray-400">{new Date(c.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`} />
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Full Complaint</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{c.message}</p>
                    </div>

                    {/* Admin Response Box */}
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                        Admin Response (optional)
                      </label>
                      <textarea
                        value={Object.prototype.hasOwnProperty.call(responseText, c.complaint_id) ? responseText[c.complaint_id] : (c.admin_response || "")}
                        onChange={(e) => setResponseText(prev => ({ ...prev, [c.complaint_id]: e.target.value }))}
                        placeholder="Write a response to this user..."
                        rows={2}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-200 bg-white resize-none"
                      />
                    </div>

                    {/* Save Response Button */}
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={() => saveResponse(c.complaint_id, c.status, c.admin_response)}
                        disabled={!Object.prototype.hasOwnProperty.call(responseText, c.complaint_id) || responseText[c.complaint_id] === c.admin_response}
                        className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg disabled:opacity-40 transition-colors"
                      >
                        {updating === c.complaint_id + "_response" ? <Loader size={12} className="animate-spin" /> : <Send size={12} />}
                        Send Response to User
                      </button>
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <span className="text-xs text-gray-400 font-mono">ID: {c.complaint_id}</span>
                      <div className="flex gap-2 flex-wrap">
                        {c.status !== "REVIEWING" && (
                          <button onClick={() => updateStatus(c.complaint_id, "REVIEWING", c.admin_response)} disabled={isUpdating}
                            className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg disabled:opacity-60 transition-colors">
                            {isUpdating ? <Loader size={12} className="animate-spin" /> : <MessageSquare size={12} />} Mark Reviewing
                          </button>
                        )}
                        {c.status !== "RESOLVED" && (
                          <button onClick={() => updateStatus(c.complaint_id, "RESOLVED", c.admin_response)} disabled={isUpdating}
                            className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg disabled:opacity-60 transition-colors">
                            {isUpdating ? <Loader size={12} className="animate-spin" /> : <CheckCircle size={12} />} Mark Resolved
                          </button>
                        )}
                        {c.status === "RESOLVED" && (
                          <button onClick={() => updateStatus(c.complaint_id, "PENDING", c.admin_response)} disabled={isUpdating}
                            className="flex items-center gap-1.5 text-xs border border-amber-400 text-amber-700 hover:bg-amber-50 px-3 py-1.5 rounded-lg disabled:opacity-60 transition-colors">
                            <Clock size={12} /> Reopen
                          </button>
                        )}
                        <button onClick={() => setDeleteId(c.complaint_id)} disabled={isUpdating}
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
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 text-red-600 rounded-full p-2.5"><Trash2 size={20} /></div>
              <h3 className="font-bold text-gray-800">Delete Complaint?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5">This will permanently delete this complaint record.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} disabled={!!updating}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60">
                {updating ? <Loader size={14} className="animate-spin" /> : <Trash2 size={14} />}Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}