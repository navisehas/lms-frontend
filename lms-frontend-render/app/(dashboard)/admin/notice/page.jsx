"use client";
import { useState, useEffect } from "react";
import { 
  Megaphone, Edit2, Trash2, X, Loader2, AlertTriangle, 
  CheckCircle, Clock, Users, Plus, Search, MessageSquare
} from "lucide-react";
import { authFetch } from "@/lib/auth"; 
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";


export default function NoticeManagement() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); 
  
  // Unified Modal State for Create & Edit
  const [formModal, setFormModal] = useState({ isOpen: false, mode: "create", noticeId: null });
  const [formData, setFormData] = useState({ message: "", target_audience: "All Users" });
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Delete Modal State
  const [deletingNotice, setDeletingNotice] = useState(null);
  
  // Toast Alert State
  const [alert, setAlert] = useState({ isOpen: false, type: "success", message: "" });

  useEffect(() => {
    fetchNotices();
  }, []);

  const showAlert = (type, message) => {
    setAlert({ isOpen: true, type, message });
    setTimeout(() => setAlert({ isOpen: false, type: "success", message: "" }), 3500);
  };

  // --- API CALLS ---
  const fetchNotices = async () => {
    try {
      const res = await authFetch(`${API}/admin/notice`);
      if (res.ok) {
        const data = await res.json();
        setNotices(data);
      } else {
        showAlert("error", "Failed to fetch announcements.");
      }
    } catch (error) {
      showAlert("error", "Failed to fetch announcements.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.message.trim()) {
      showAlert("error", "Message cannot be empty.");
      return;
    }
    setIsProcessing(true);
    
    const isEdit = formModal.mode === "edit";
    const url = isEdit 
      ? `${API}/admin/notice/${formModal.noticeId}` 
      : `${API}/admin/notice`;
      
    try {
      const res = await authFetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        if (isEdit) {
          setNotices(notices.map(n => n.announcement_id === formModal.noticeId ? data.notice : n));
          showAlert("success", "Announcement updated successfully!");
        } else {
          setNotices([data.notice, ...notices]); 
          showAlert("success", "Announcement published!");
        }
        closeFormModal();
      } else {
        showAlert("error", data.error || "Operation failed.");
      }
    } catch (error) {
      showAlert("error", "Server connection failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      const res = await authFetch(`${API}/admin/notice/${deletingNotice.announcement_id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setNotices(notices.filter(n => n.announcement_id !== deletingNotice.announcement_id));
        setDeletingNotice(null);
        showAlert("success", "Announcement deleted.");
      } else {
        const errData = await res.json();
        showAlert("error", errData.error || "Deletion failed.");
      }
    } catch (error) {
      showAlert("error", "Server connection failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- MODAL HANDLERS ---
  const openCreateModal = () => {
    setFormData({ message: "", target_audience: "All Users" });
    setFormModal({ isOpen: true, mode: "create", noticeId: null });
  };

  const openEditModal = (notice) => {
    setFormData({ message: notice.message, target_audience: notice.target_audience });
    setFormModal({ isOpen: true, mode: "edit", noticeId: notice.announcement_id });
  };

  const closeFormModal = () => {
    setFormModal({ isOpen: false, mode: "create", noticeId: null });
    setFormData({ message: "", target_audience: "All Users" });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  // Filter notices based on search query
  const filteredNotices = notices.filter(notice => 
    notice.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notice.target_audience.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- UI HELPER: Color code audiences ---
  const getAudienceTheme = (audience) => {
    switch(audience) {
      case 'Students Only': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Teachers Only': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Managers Only': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200'; // All Users
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Toast Notification */}
      {alert.isOpen && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center justify-between px-5 py-4 min-w-[320px] rounded-xl border shadow-xl animate-in fade-in slide-in-from-top-4 duration-300 ${
          alert.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
        }`}>
          <div className="flex items-center gap-3">
            {alert.type === "success" ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
            <span className="font-bold">{alert.message}</span>
          </div>
          <button onClick={() => setAlert({ ...alert, isOpen: false })} className="opacity-60 hover:opacity-100 transition">
            <X size={20} />
          </button>
        </div>
      )}

      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-md shrink-0">
            <Megaphone size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Announcements</h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">Create and manage broadcast messages. ({notices.length} total)</p>
          </div>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition shadow-lg hover:shadow-xl w-full sm:w-auto shrink-0 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" /> 
          New Notice
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search announcements by message or audience..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-4 pl-14 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white shadow-sm transition"
        />
        <Search size={22} className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>

      {/* Notices Grid */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-32 space-y-4">
          <Loader2 className="animate-spin text-blue-600 w-12 h-12" />
          <p className="text-gray-400 font-medium">Loading announcements...</p>
        </div>
      ) : filteredNotices.length === 0 ? (
        <div className="bg-white p-16 rounded-3xl border-2 border-dashed border-gray-200 text-center text-gray-500 flex flex-col items-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-5">
            {searchQuery ? <Search className="w-10 h-10 text-gray-300" /> : <MessageSquare className="w-10 h-10 text-gray-300" />}
          </div>
          <p className="text-xl font-bold text-gray-700">
            {searchQuery ? "No matching announcements found" : "No announcements yet"}
          </p>
          <p className="text-base mt-2 max-w-sm">
            {searchQuery ? "Try adjusting your search terms." : "Keep your users informed. Click 'New Notice' to broadcast your first message."}
          </p>
          {!searchQuery && (
            <button onClick={openCreateModal} className="mt-6 px-6 py-2.5 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition">
              Create One Now
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredNotices.map((notice) => (
            <div key={notice.announcement_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md hover:border-blue-200 transition-all duration-300 overflow-hidden">
              
              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${getAudienceTheme(notice.target_audience)}`}>
                    <Users size={14} /> {notice.target_audience}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg">
                    <Clock size={14} /> {formatDate(notice.created_at)}
                  </span>
                </div>
                
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap flex-1">
                  {notice.message}
                </p>
              </div>

              {/* Card Footer (Actions) */}
              <div className="bg-gray-50/50 px-6 py-3 border-t border-gray-100 flex justify-end gap-2">
                <button 
                  onClick={() => openEditModal(notice)} 
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button 
                  onClick={() => setDeletingNotice(notice)} 
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- UNIFIED CREATE / EDIT MODAL --- */}
      {formModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center p-6 md:p-8 border-b border-gray-100 shrink-0">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${formModal.mode === "create" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"}`}>
                  {formModal.mode === "create" ? <Megaphone size={20} /> : <Edit2 size={20} />}
                </div>
                {formModal.mode === "create" ? "New Announcement" : "Edit Announcement"}
              </h2>
              <button type="button" onClick={closeFormModal} className="text-gray-400 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition"><X size={20}/></button>
            </div>
            
            <div className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1">
              <div>
                <label htmlFor="target_audience" className="block text-sm font-bold text-gray-700 mb-2">Who should see this?</label>
                <div className="relative">
                  <Users className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                  <select 
                    id="target_audience"
                    value={formData.target_audience} 
                    onChange={(e) => setFormData({...formData, target_audience: e.target.value})} 
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 hover:bg-white transition text-sm font-medium text-gray-800 appearance-none cursor-pointer"
                  >
                    <option>All Users</option>
                    <option>Students Only</option>
                    <option>Teachers Only</option>
                    <option>Managers Only</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="message" className="flex justify-between items-center mb-2">
                  <span className="block text-sm font-bold text-gray-700">Message Content</span>
                  <span className={`text-xs font-medium ${formData.message.length > 1800 ? 'text-amber-500' : 'text-gray-400'}`}>
                    {formData.message.length} / 2000
                  </span>
                </label>
                <textarea 
                  id="message"
                  rows="7" 
                  required
                  maxLength={2000}
                  placeholder="Type your important announcement here..."
                  value={formData.message} 
                  onChange={(e) => setFormData({...formData, message: e.target.value})} 
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm bg-gray-50 hover:bg-white transition text-gray-800 leading-relaxed"
                ></textarea>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 p-6 md:p-8 border-t border-gray-100 bg-gray-50 shrink-0">
              <button type="button" onClick={closeFormModal} className="w-full sm:flex-1 px-4 py-3.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 font-bold transition">
                Cancel
              </button>
              <button type="submit" disabled={isProcessing || !formData.message.trim()} className="w-full sm:flex-1 px-4 py-3.5 bg-gray-900 text-white rounded-xl hover:bg-black font-bold disabled:opacity-50 transition flex justify-center items-center shadow-md">
                {isProcessing ? <><Loader2 size={18} className="animate-spin mr-2"/> Processing...</> : formModal.mode === "create" ? "Publish Now" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- DELETE MODAL --- */}
      {deletingNotice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-500" size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Delete Notice?</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Are you completely sure? This announcement will be permanently removed from all user dashboards immediately.
            </p>
            <p className="text-gray-600 text-sm italic mb-8 bg-gray-50 p-3 rounded-xl border border-gray-100 text-left line-clamp-3">
              "{deletingNotice.message}"
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={handleDelete} disabled={isProcessing} className="w-full px-4 py-3.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold disabled:opacity-50 transition shadow-md flex justify-center items-center">
                {isProcessing ? <Loader2 size={20} className="animate-spin"/> : "Yes, Permanently Delete"}
              </button>
              <button onClick={() => setDeletingNotice(null)} disabled={isProcessing} className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 font-bold transition">
                Keep Announcement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}