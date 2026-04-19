"use client";
import { useState, useEffect, useRef } from "react";
import { 
  User, Phone, MapPin, Lock, Download, Loader, 
  Eye, EyeOff, CheckCircle, AlertCircle,
  Hash, Calendar, Users, ShieldCheck
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";
import { authFetch, guardRoute } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ManagerProfile() {
  const router = useRouter();

  // Profile data (View Only)
  const [user, setUser] = useState({
    user_id: "",
    name: "",
    phone_no: "",
    address: "",
    gender: "",        
    birthday: "",      
    profile_picture_url: "",
    status: "",
  });

  const [loading, setLoading] = useState(true);

  // Change Password states
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [passMessage, setPassMessage] = useState({ type: "", text: "" });

  const cardRef = useRef(null);

  // ====================== AUTH CHECK ======================
  useEffect(() => {
    // Guard route for MANAGER
    const authorised = guardRoute("MANAGER", router);
    if (authorised) {
      fetchProfile(authorised.user_id);
    }
  }, [router]);

  const fetchProfile = async (id) => {
    try {
      const res = await authFetch(`${API}/manager/profile/${id}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (error) {
      console.error("Network error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // ====================== HANDLERS ======================
  const handleDownloadID = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, { 
        backgroundColor: "#ffffff", 
        scale: 3, 
        useCORS: true,
        logging: false
      });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${user.user_id}_Manager_ID.png`;
      link.click();
    } catch (error) {
      console.error("Failed to generate ID card:", error);
      alert("Failed to generate ID card. Please try again.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMessage({ type: "", text: "" });
    
    if (newPassword !== confirmPassword) {
      return setPassMessage({ type: "error", text: "New passwords do not match!" });
    }
    
    setChangingPass(true);
    try {
      const res = await authFetch(`${API}/manager/profile/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          user_id: user.user_id, 
          old_password: oldPassword, 
          new_password: newPassword 
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setPassMessage({ type: "success", text: "Password changed successfully!" });
        setOldPassword(""); setNewPassword(""); setConfirmPassword("");
        setTimeout(() => {
          setPassMessage({ type: "", text: "" });
          setShowPasswordSection(false);
        }, 3000);
      } else {
        setPassMessage({ type: "error", text: data.error || "Failed to change password." });
      }
    } catch (error) {
      setPassMessage({ type: "error", text: "Connection failed." });
    } finally {
      setChangingPass(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader className="animate-spin text-teal-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative pb-12">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Manager Profile</h1>
        <p className="text-gray-500 text-sm mt-1">View your administrative information and manage security settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* ==================== LEFT: VISIBLE UI PROFILE SUMMARY ==================== */}
        <div className="space-y-6 lg:sticky lg:top-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden text-center">
            {/* Manager specific header color (Teal/Emerald) */}
            <div className="h-28 bg-teal-700 relative">
               <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                 <div className="relative">
                   <div className="w-24 h-24 rounded-full border-4 border-white bg-white overflow-hidden shadow-sm">
                     {user.profile_picture_url ? (
                       <img src={user.profile_picture_url} alt="Profile" className="w-full h-full object-cover" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400"><User size={40}/></div>
                     )}
                   </div>
                 </div>
               </div>
            </div>
            <div className="pt-16 pb-6 px-6">
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-sm font-mono text-gray-500 mt-1">{user.user_id}</p>
              <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                {user.status || "Active Manager"}
              </div>
            </div>
            <div className="bg-gray-50 border-t border-gray-100 p-6 flex flex-col items-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Admin Gate Pass</p>
              <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200">
                {user.user_id && <QRCodeSVG value={user.user_id} size={120} />}
              </div>
              <p className="text-[10px] text-gray-400 mt-2">Scan at entrance</p>
            </div>
          </div>

          <button onClick={handleDownloadID} className="w-full flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-bold py-3.5 rounded-xl transition shadow-md">
            <Download size={20} /> Download Official ID
          </button>
        </div>

        {/* ==================== RIGHT: FORMS & DETAILS ==================== */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Profile Details (Read Only) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="p-2 bg-teal-50 text-teal-700 rounded-lg"><ShieldCheck size={20} /></div>
              <h2 className="text-lg font-bold text-gray-900">Administrative Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-3 text-gray-400" />
                  <input type="text" className="w-full pl-10 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed text-sm font-medium" value={user.name || ""} readOnly />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Manager ID</label>
                <div className="relative">
                  <Hash size={18} className="absolute left-3 top-3 text-gray-400" />
                  <input type="text" className="w-full pl-10 py-2.5 px-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed text-sm font-mono font-medium" value={user.user_id || ""} readOnly />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Gender</label>
                <div className="relative">
                  <Users size={18} className="absolute left-3 top-3 text-gray-400" />
                  <input type="text" className="w-full pl-10 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed text-sm font-medium" value={user.gender || "N/A"} readOnly />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Date of Birth</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-3 top-3 text-gray-400" />
                  <input type="text" className="w-full pl-10 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed text-sm font-medium" value={formatDate(user.birthday)} readOnly />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-3 text-gray-400" />
                  <input type="text" className="w-full pl-10 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed text-sm font-medium" value={user.phone_no || "N/A"} readOnly />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Home Address</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-3 text-gray-400" />
                  <textarea rows="2" className="w-full pl-10 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed text-sm font-medium resize-none" value={user.address || "N/A"} readOnly />
                </div>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => setShowPasswordSection(!showPasswordSection)}>
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Lock size={20} /></div>
                 <div>
                   <h2 className="text-lg font-bold text-gray-900">Security</h2>
                   <p className="text-xs text-gray-500">Change your password</p>
                 </div>
               </div>
               <button className="text-sm font-bold text-teal-700 hover:underline">
                 {showPasswordSection ? "Hide" : "Edit"}
               </button>
            </div>
            {showPasswordSection && (
              <form onSubmit={handleChangePassword} className="mt-6 pt-6 border-t border-gray-100 space-y-5 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Current Password</label>
                  <div className="relative">
                    <input type={showOldPass ? "text" : "password"} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-500 outline-none text-sm text-gray-900" required />
                    <button type="button" onClick={() => setShowOldPass(!showOldPass)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                      {showOldPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">New Password</label>
                    <div className="relative">
                      <input type={showNewPass ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-500 outline-none text-sm text-gray-900" required />
                      <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                        {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <input type={showConfirmPass ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-500 outline-none text-sm text-gray-900" required />
                      <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                        {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
                {passMessage.text && (
                  <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${passMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {passMessage.type === 'success' ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}
                    {passMessage.text}
                  </div>
                )}
                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={changingPass} className="bg-gray-900 hover:bg-black disabled:bg-gray-400 text-white font-bold px-6 py-2.5 rounded-xl transition flex items-center gap-2 shadow-sm">
                    {changingPass ? <Loader className="animate-spin" size={18} /> : <Lock size={18} />}
                    {changingPass ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      </div>

      {/* --- HIDDEN ID CARD GENERATOR (For Download ONLY) --- */}
      <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
        <div ref={cardRef} style={{ width: "340px", height: "540px", backgroundColor: "#ffffff", borderRadius: "16px", fontFamily: "sans-serif", position: "relative", overflow: "hidden", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Teal Gradient for Manager ID */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "140px", background: "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)", zIndex: 0 }}></div>
          <div style={{ position: "relative", zIndex: 10, marginTop: "24px", color: "#ffffff", textAlign: "center", width: "100%" }}>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "900", letterSpacing: "2px", textTransform: "uppercase" }}>ENGLISH GATE</h2>
          </div>
          <div style={{ position: "relative", zIndex: 10, marginTop: "20px", width: "120px", height: "120px", borderRadius: "50%", backgroundColor: "#ffffff", padding: "6px", boxShadow: "0 4px 10px rgba(0,0,0,0.15)" }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", backgroundColor: "#f3f4f6", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {user.profile_picture_url ? (
                <img src={user.profile_picture_url} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : <User size={60} color="#9ca3af" />}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", padding: "16px 24px", zIndex: 10 }}>
            <h1 style={{ margin: "0 0 8px 0", fontSize: "24px", fontWeight: "800", color: "#111827", textAlign: "center", lineHeight: "1.2" }}>
              {user.name}
            </h1>
            <div style={{ backgroundColor: '#ccfbf1', color: '#0f766e', padding: "4px 16px", borderRadius: "99px", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
              CENTER MANAGER
            </div>
            <div style={{ fontSize: "16px", color: "#64748b", fontFamily: "monospace", fontWeight: "bold", letterSpacing: "2px" }}>
              ID: {user.user_id}
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", width: "100%", paddingBottom: "24px" }}>
            <div style={{ backgroundColor: "#ffffff", padding: "12px", borderRadius: "12px", border: "2px solid #e2e8f0", boxShadow: "0 8px 16px rgba(0,0,0,0.05)" }}>
              {user.user_id && <QRCodeSVG value={user.user_id} size={160} level="M" />}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}