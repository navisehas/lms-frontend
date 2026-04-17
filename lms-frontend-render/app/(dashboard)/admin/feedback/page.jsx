"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare, CheckCircle,
  AlertCircle, Loader, Search, RefreshCw, User,
  ChevronDown, Trash2, Star
} from "lucide-react";
import { guardRoute, authFetch } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;

const AREA_LABELS = {
  courses:    "📚 Courses",
  payment:    "💳 Payment",
  teacher:    "👨‍🏫 Teacher",
  attendance: "📋 Attendance",
  materials:  "📄 Materials",
  exam:       "📝 Exams",
  technical:  "💻 Technical",
  other:      "🔖 Other",
};


function StarDisplay({ value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={13}
          className={s <= value ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
      ))}
      <span className="ml-1 text-xs text-gray-500">{value}/5</span>
    </div>
  );
}

export default function AdminFeedbackPage() {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");
  const [search, setSearch]       = useState("");
  const [updating, setUpdating]   = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [deleteId, setDeleteId]   = useState(null);

  useEffect(() => {
    const auth = guardRoute("ADMIN", router);
    if (auth) fetchFeedbacks();
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


  function handleExpand(id) {
    setExpandedId(expandedId === id ? null : id);
  }

  async function handleDelete(id) {
    setUpdating(id + "_delete");
    try {
      const res  = await authFetch(`${API}/feedback/admin/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) { setDeleteId(null); setExpandedId(null); showMsg("Feedback deleted."); fetchFeedbacks(); }
      else showMsg(data.error || "Delete failed.", true);
    } catch { showMsg("Network error.", true); }
    finally { setUpdating(null); }
  }

  const filtered = feedbacks.filter(fb => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      fb.student_name.toLowerCase().includes(q) ||
      fb.user_id.toLowerCase().includes(q) ||
      fb.message.toLowerCase().includes(q) ||
      fb.feedback_id.toLowerCase().includes(q);
    return matchSearch;
  });



  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare className="text-blue-600" size={26} /> Feedback Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">View and manage all feedbacks.</p>
        </div>
        <button onClick={fetchFeedbacks}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 bg-white border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error   && <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm"><AlertCircle size={16} />{error}</div>}
      {success && <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-4 text-sm"><CheckCircle size={16} />{success}</div>}

      {/* Search */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, ID or message..."
            className="w-full pl-9 pr-4 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400 gap-2"><Loader size={20} className="animate-spin" /> Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <MessageSquare size={48} className="mx-auto mb-3 opacity-25" />
          <p className="font-semibold">No feedbacks found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(fb => {
            const isExpanded = expandedId === fb.feedback_id;
            const isUpdating = updating && updating.startsWith(fb.feedback_id);
            return (
              <div key={fb.feedback_id}
                className={"bg-white rounded-2xl border border-gray-100 shadow-sm transition-all"}>

                <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 rounded-2xl"
                  onClick={() => handleExpand(fb.feedback_id)}>
                  <div className={`rounded-full p-2 flex-shrink-0 ${
                    fb.user_role === "TEACHER" ? "bg-emerald-100" :
                    fb.user_role === "MANAGER" ? "bg-indigo-100" : "bg-blue-100"}`}>
                    <User size={18} className={
                      fb.user_role === "TEACHER" ? "text-emerald-600" :
                      fb.user_role === "MANAGER" ? "text-indigo-600" : "text-blue-600"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-semibold text-gray-800 text-sm">{fb.student_name}</span>
                      <span className="text-xs text-gray-400 font-mono">{fb.user_id}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        fb.user_role === "TEACHER" ? "bg-emerald-100 text-emerald-700" :
                        fb.user_role === "MANAGER" ? "bg-indigo-100 text-indigo-700" :
                        "bg-blue-100 text-blue-700"}`}>{fb.user_role}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {fb.area && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{AREA_LABELS[fb.area] || fb.area}</span>}
                    </div>
                    {fb.rating && <StarDisplay value={fb.rating} />}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">{new Date(fb.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                    <p className="text-xs text-gray-400">{new Date(fb.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`} />
                </div>

                                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Full Message</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{fb.message}</p>
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <span className="text-xs text-gray-400 font-mono">ID: {fb.feedback_id}</span>
                      <button onClick={() => setDeleteId(fb.feedback_id)} disabled={isUpdating}
                        className="flex items-center gap-1.5 text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg disabled:opacity-60 transition-colors">
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                )}

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
              <h3 className="font-bold text-gray-800">Delete Feedback?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5">This will permanently delete this feedback.</p>
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
