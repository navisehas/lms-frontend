"use client";
import { useState, useEffect, useRef } from "react";
import { 
  Megaphone, Image as ImageIcon, Save, Loader, 
  X, CheckCircle, AlertTriangle, ToggleLeft, ToggleRight, FileWarning
} from "lucide-react";
import { authFetch } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Max file size: 2MB (Recommended for Base64 DB storage)
const MAX_FILE_SIZE_MB = 2; 
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function PopupSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  
  // Simplified state: Only tracking active status and the image
  const [formData, setFormData] = useState({
    is_active: false,
    image_url: "",
  });

  const fileInputRef = useRef(null);

  // Fetch current popup settings when the page loads
  useEffect(() => {
    fetchCurrentSettings();
  }, []);

  const fetchCurrentSettings = async () => {
    try {
      const res = await authFetch(`${API}/admin/popup`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setFormData({
            is_active: data.is_active || false,
            image_url: data.image_url || "",
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch popup settings", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setStatusMessage(null); // Clear previous errors

    if (file) {
      // 1. Enforce file size limit to protect the database
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setStatusMessage({ 
          type: "error", 
          text: `Image is too large! Please upload an image smaller than ${MAX_FILE_SIZE_MB}MB.` 
        });
        e.target.value = null; // Reset input
        return;
      }

      // 2. Convert to Base64
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, image_url: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await authFetch(`${API}/admin/popup`, {
        method: "PUT",
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setStatusMessage({ type: "success", text: "Popup settings updated successfully!" });
      } else {
        const err = await res.json();
        setStatusMessage({ type: "error", text: err.error || "Failed to update popup settings." });
      }
    } catch (error) {
      setStatusMessage({ type: "error", text: "Server connection failed." });
    } finally {
      setSaving(false);
      // Auto-hide success message after 4 seconds
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      
      {/* Page Header & Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="text-blue-600" /> Landing Page Popup
          </h1>
          <p className="text-sm text-gray-500 mt-1">Upload the promotional flyer to show visitors.</p>
        </div>
        
        {/* Active/Inactive Toggle Switch */}
        <button 
          type="button"
          onClick={() => setFormData({...formData, is_active: !formData.is_active})}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm ${
            formData.is_active 
              ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100' 
              : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
          }`}
        >
          {formData.is_active ? <ToggleRight size={24} className="text-green-600" /> : <ToggleLeft size={24} className="text-gray-400" />}
          {formData.is_active ? "Popup is Active" : "Popup is Hidden"}
        </button>
      </div>

      {/* Status Message Alert */}
      {statusMessage && (
        <div className={`p-4 rounded-xl flex items-center gap-3 font-bold animate-in fade-in slide-in-from-top-2 ${
          statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          {statusMessage.text}
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 md:p-8">
          
          {/* Image Upload Area */}
          <div>
            <div className="flex justify-between items-end mb-3">
              <label className="block text-sm font-bold text-gray-700">Popup Banner Image <span className="text-red-500">*</span></label>
              <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                <FileWarning size={14} /> Max size: {MAX_FILE_SIZE_MB}MB
              </span>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 p-4 flex flex-col items-center justify-center relative min-h-[350px] group hover:bg-gray-100 transition cursor-pointer">
              {formData.image_url ? (
                <>
                  <img src={formData.image_url} alt="Popup Preview" className="w-auto max-h-[400px] object-contain rounded-lg shadow-sm" />
                  <button 
                    type="button" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setFormData({...formData, image_url: ""}); 
                      if(fileInputRef.current) fileInputRef.current.value = null; // Reset input
                    }} 
                    className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition shadow-md"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <div className="text-center" onClick={() => fileInputRef.current.click()}>
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200 mx-auto mb-4 group-hover:scale-105 transition-transform">
                    <ImageIcon size={32} className="text-gray-400" />
                  </div>
                  <p className="text-base font-bold text-gray-700">Click to upload promotional banner</p>
                  <p className="text-sm text-gray-500 mt-2">Must contain all text and details within the image.</p>
                  <p className="text-xs text-gray-400 mt-1">Recommended format: Square or Portrait (JPG/PNG)</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/jpeg, image/png, image/webp" 
                onChange={handleImageUpload} 
              />
            </div>
          </div>

        </div>

        {/* Submit Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button 
            type="submit" 
            disabled={saving || (!formData.image_url && formData.is_active)} 
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm w-full md:w-auto"
          >
            {saving ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
            {saving ? "Saving Changes..." : "Save Popup Settings"}
          </button>
        </div>
      </form>

    </div>
  );
}