"use client";

import { useState, useEffect } from "react";
import { 
  User, Mail, Phone, MapPin, Calendar, Camera, 
  Key, Save, Loader2, ShieldCheck, CheckCircle, AlertCircle 
} from "lucide-react";
import { authFetch, getUser } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passSaving, setPassSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Profile Form State (Matching your SQL Schema)
  const [profile, setProfile] = useState({
    user_id: "",
    name: "",
    role: "ADMIN",
    gender: "",
    birthday: "",
    address: "",
    phone_no: "",
    created_at: "",
    profile_picture: null,
  });

  // Password State
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Load Profile Data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const currentUser = getUser();
        if (!currentUser) return;

        // Replace with your actual profile fetch endpoint
        const res = await authFetch(`${API}/users/${currentUser.user_id}`);
        if (res.ok) {
          const data = await res.json();
          setProfile({
            user_id: data.user_id || currentUser.user_id,
            name: data.name || "",
            role: data.role || "ADMIN",
            gender: data.gender || "",
            birthday: data.birthday ? data.birthday.split('T')[0] : "", // Format for date input
            address: data.address || "",
            phone_no: data.phone_no || "",
            created_at: data.created_at || "",
            profile_picture: data.profile_picture || null,
          });
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await authFetch(`${API}/users/${profile.user_id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: profile.name,
          gender: profile.gender,
          birthday: profile.birthday,
          address: profile.address,
          phone_no: profile.phone_no
        }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.error || "Failed to update profile." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Server connection failed." });
    } finally {
      setSaving(false);
    }
  };

  // Handle Password Update
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match!" });
      return;
    }

    setPassSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await authFetch(`${API}/users/${profile.user_id}/password`, {
        method: "PUT",
        body: JSON.stringify({
          current_password: passwords.currentPassword,
          new_password: passwords.newPassword
        }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Password changed successfully!" });
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.error || "Failed to change password." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Server connection failed." });
    } finally {
      setPassSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your personal information and security settings.</p>
      </div>

      {/* Global Message Banner */}
      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center">
          <div className="relative group cursor-pointer">
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center">
              {profile.profile_picture ? (
                <img src={profile.profile_picture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-gray-400" />
              )}
            </div>
            {/* Hover overlay for profile picture upload */}
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white" size={24} />
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mt-4">{profile.name}</h2>
          <p className="text-blue-600 font-mono font-bold text-sm mt-1">{profile.user_id}</p>
          
          <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-100">
            <ShieldCheck size={14} />
            {profile.role}
          </span>

          <div className="w-full border-t border-gray-100 mt-6 pt-6 flex flex-col gap-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span className="font-medium text-gray-500">Joined</span>
              <span className="font-semibold text-gray-900">
                {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-500">Status</span>
              <span className="font-semibold text-emerald-600">Active</span>
            </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Personal Information Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
              <p className="text-sm text-gray-500 mt-1">Update your basic profile details.</p>
            </div>
            
            <form onSubmit={handleProfileSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700">Full Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-3 text-gray-400" />
                    <input 
                      type="text" name="name" value={profile.name} onChange={handleInputChange} required
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-3 text-gray-400" />
                    <input 
                      type="tel" name="phone_no" value={profile.phone_no} onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Birthday</label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-3 top-3 text-gray-400" />
                    <input 
                      type="date" name="birthday" value={profile.birthday} onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Gender</label>
                  <select 
                    name="gender" value={profile.gender} onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700">Address</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3 top-3 text-gray-400" />
                    <input 
                      type="text" name="address" value={profile.address} onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

              </div>

              <div className="mt-8 flex justify-end">
                <button 
                  type="submit" disabled={saving}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Security / Password Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Key size={20} className="text-gray-500" /> Security & Password
              </h2>
              <p className="text-sm text-gray-500 mt-1">Ensure your account is using a long, random password.</p>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Current Password</label>
                <input 
                  type="password" name="currentPassword" value={passwords.currentPassword} onChange={handlePasswordChange} required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">New Password</label>
                  <input 
                    type="password" name="newPassword" value={passwords.newPassword} onChange={handlePasswordChange} required minLength={6}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Confirm New Password</label>
                  <input 
                    type="password" name="confirmPassword" value={passwords.confirmPassword} onChange={handlePasswordChange} required minLength={6}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button 
                  type="submit" disabled={passSaving || !passwords.currentPassword || !passwords.newPassword}
                  className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {passSaving ? <Loader2 size={18} className="animate-spin" /> : "Update Password"}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
