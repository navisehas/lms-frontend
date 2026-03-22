"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Search, Plus, Trash2, Edit, 
  User, GraduationCap, Download, Loader, X,
  Calendar, Camera, AlertTriangle, MapPin, Phone
} from "lucide-react";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { authFetch } from "@/lib/auth"; 
const API = process.env.NEXT_PUBLIC_API_URL;


export default function StudentManagement() {
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // Removed filterRole state
  
  const [idCardData, setIdCardData] = useState(null);
  const idCardRef = useRef(null);

  const [editingUser, setEditingUser] = useState(null);
  const [updating, setUpdating] = useState(false);
  const fileInputRef = useRef(null);

  const [deletingUser, setDeletingUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get today's date in YYYY-MM-DD format based on local timezone
  const todayObj = new Date();
  const maxDate = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await authFetch(`${API}/users`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);
    try {
      const res = await authFetch(`${API}/users/${deletingUser.user_id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setUsers(users.filter(u => u.user_id !== deletingUser.user_id));
        setDeletingUser(null);
      } else {
        const data = await res.json();
        alert(`❌ Failed to delete: ${data.error}`);
      }
    } catch (error) {
      alert("❌ Server connection failed");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    if (editingUser.birthday && editingUser.birthday >= maxDate) {
      alert("❌ Date of Birth must be a date in the past.");
      return;
    }

    setUpdating(true);
    try {
      const res = await authFetch(`${API}/users/${editingUser.user_id}`, {
        method: "PUT",
        body: JSON.stringify(editingUser)
      });
      if (res.ok) {
        setUsers(users.map(u => u.user_id === editingUser.user_id ? editingUser : u));
        setEditingUser(null);
      } else {
        const data = await res.json();
        alert(`❌ Failed to update: ${data.error}`);
      }
    } catch (error) {
      alert("❌ Server connection failed");
    } finally {
      setUpdating(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingUser({ ...editingUser, profile_picture_url: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadID = async (user) => {
    setIdCardData(user);
    setTimeout(async () => {
      if (idCardRef.current) {
        try {
          const canvas = await html2canvas(idCardRef.current, { 
            backgroundColor: "#ffffff", scale: 3, useCORS: true, logging: false
          });
          const link = document.createElement("a");
          link.href = canvas.toDataURL("image/png");
          link.download = `${user.user_id}_ID_Card.png`;
          link.click();
        } catch (err) {
          console.error("ID Gen Error:", err);
          alert("Failed to generate ID.");
        } finally {
          setIdCardData(null); 
        }
      }
    }, 150);
  };

  // --- STRICTLY FILTER FOR STUDENTS ONLY ---
  const filteredUsers = users.filter(user => {
    if (user.role !== 'STUDENT') return false; // Ignore Admins, Managers, Teachers

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = user.name.toLowerCase().includes(searchLower) || 
                          (user.phone_no && user.phone_no.includes(searchLower)) ||
                          user.user_id.toLowerCase().includes(searchLower);
    return matchesSearch;
  });

  // ==================== ADDED: PDF DOWNLOAD LOGIC ====================
  const downloadAllStudentsPDF = async () => {
    if (filteredUsers.length === 0) {
      return alert("No student data available to download.");
    }

    const doc = new jsPDF();
    
    // 1. Load Logo Image
    let logoDataUrl = null;
    try {
      const img = new Image();
      img.src = '/logo.png';
      
      await new Promise((resolve) => {
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          logoDataUrl = canvas.toDataURL("image/png");
          resolve();
        };
        img.onerror = resolve; 
      });
    } catch (e) {
      console.warn("Could not load logo for PDF");
    }

    // 2. Draw Header
    let textStartX = 14;
    let startYOffset = 34;

    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', 14, 12, 16, 16); 
      textStartX = 34; 
    }

    doc.setFontSize(22);
    doc.setTextColor(30, 58, 138); 
    doc.setFont("helvetica", "bold");
    doc.text("ENGLISH GATE", textStartX, 22);

    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.setFont("helvetica", "normal");
    doc.text("Student Directory Report", textStartX, 28);

    // 3. Draw Metadata & Filters
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, startYOffset + 6);
    doc.text(`Total Records: ${filteredUsers.length}`, 14, startYOffset + 12);
    
    if (searchTerm) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(79, 70, 229);
      doc.text(`Search Filter Applied: "${searchTerm}"`, 14, startYOffset + 18);
      startYOffset += 6; 
    }

    // 4. Generate Table
    const tableColumn = ["Student ID", "Full Name", "Phone No", "Gender", "Status"];
    const tableRows = filteredUsers.map(student => [
      student.user_id,
      student.name,
      student.phone_no || "N/A",
      student.gender || "N/A",
      student.status || "N/A"
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: startYOffset + 20, 
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      styles: { fontSize: 9 }
    });

    doc.save(`English_Gate_Students_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-6 space-y-6">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
          <p className="text-sm text-gray-500 mt-1">View, edit, and manage enrolled students.</p>
        </div>
        <Link 
          href="/manager/students/new" 
          className="flex items-center justify-center gap-2 w-full md:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-sm"
        >
          <Plus size={20} /> Add New Student
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-row gap-4 justify-between items-center text-gray-700">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3 top-3 text-gray-600 w-5 h-5" />
          <input 
            type="text" placeholder="Search by Student Name, ID, Phone..." 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* ADDED: Export PDF Button near the search bar */}
        <button 
          onClick={downloadAllStudentsPDF}
          disabled={loading || filteredUsers.length === 0}
          className="flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 px-4 py-2.5 rounded-lg font-bold transition shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={18} />
          <span className="hidden sm:inline">Export PDF</span>
        </button>
      </div>

      {/* Responsive Table Wrapper */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center text-blue-600"><Loader className="animate-spin" size={32} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap md:whitespace-normal">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-bold">Student Identity</th>
                  <th className="px-6 py-4 font-bold">Contact & Info</th>
                  <th className="px-6 py-4 font-bold w-48">Student Details</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan="5" className="p-12 text-center text-gray-500 font-medium">No students found matching your search criteria.</td></tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.user_id} className="hover:bg-blue-50/50 transition">
                      
                      {/* Identity */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                            {user.profile_picture_url ? (
                              <img src={user.profile_picture_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : <div className="w-full h-full flex items-center justify-center text-gray-700"><User size={20}/></div>}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{user.name}</div>
                            <div className="text-blue-600 text-xs font-mono font-bold mt-0.5">{user.user_id}</div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Contact & Info */}
                      <td className="px-6 py-4">
                        <div className="text-gray-700 flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-xs font-medium">
                            <Phone size={14} className="text-gray-700 shrink-0"/> {user.phone_no || "N/A"}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <Calendar size={14} className="text-gray-700 shrink-0"/> {user.birthday ? new Date(user.birthday).toLocaleDateString() : "N/A"}
                          </div>
                          <div className="flex items-start gap-2 text-xs max-w-[200px] whitespace-normal">
                            <MapPin size={14} className="text-gray-700 shrink-0 mt-0.5"/> 
                            <span className="line-clamp-2" title={user.address}>{user.address || "N/A"}</span>
                          </div>
                        </div>
                      </td>

                      {/* Student Specific Details */}
                      <td className="px-6 py-4 whitespace-normal">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100 mb-2">
                          <GraduationCap size={14} /> {user.role}
                        </span>
                        
                        <div className="text-xs text-gray-700 font-medium mt-1">
                          <span className="text-gray-700">ISIC:</span> {user.isic_no || "Not Provided"}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                          user.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : 
                          user.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {user.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleDownloadID(user)} title="Download ID Card" className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition">
                            <Download size={16} />
                          </button>
                          <button onClick={() => setEditingUser(user)} title="Edit Student" className="p-2 text-gray-600 bg-gray-50 hover:bg-gray-200 border border-gray-200 rounded-lg transition">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => setDeletingUser(user)} title="Delete Student" className="p-2 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- EDIT MODAL --- */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <form
            onSubmit={handleUpdateUser}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Edit size={20} className="text-blue-600" />
                Edit User Profile
              </h2>

              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-2 rounded-lg hover:bg-gray-200 transition"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 overflow-y-auto">
              
              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center justify-center p-2 text-gray-700">
                <div 
                  className="w-24 h-24 md:w-28 md:h-28 shrink-0 rounded-full border-4 border-dashed border-gray-300 shadow-sm bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer relative group"
                  onClick={() => fileInputRef.current.click()}
                >
                  {editingUser.profile_picture_url ? (
                    <img src={editingUser.profile_picture_url} alt="Preview" className="w-full h-full object-cover group-hover:opacity-40 transition" />
                  ) : <User size={40} className="text-gray-700" />}
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 text-white">
                    <Camera size={24} />
                  </div>
                </div>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                <p className="text-xs text-gray-700 mt-2 font-bold uppercase tracking-wider">Change Photo</p>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
                  <input type="text" required value={editingUser.name} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-600" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number</label>
                  <input type="tel" maxLength="10" value={editingUser.phone_no || ""} onChange={(e) => setEditingUser({...editingUser, phone_no: e.target.value.replace(/[^0-9]/g, '')})} className="w-full p-2.5 text-sm font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-600" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Birthday</label>
                  <input 
                    name="birthday"
                    type="date" 
                    max={maxDate}
                    value={editingUser.birthday ? new Date(editingUser.birthday).toISOString().split('T')[0] : ""} 
                    onChange={(e) => setEditingUser({...editingUser, birthday: e.target.value})} 
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-600" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Gender</label>
                  <select value={editingUser.gender || ""} onChange={(e) => setEditingUser({...editingUser, gender: e.target.value})} className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-600">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Account Status</label>
                  <select value={editingUser.status} onChange={(e) => setEditingUser({...editingUser, status: e.target.value})} className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-600">
                    <option value="ACTIVE">Active</option>
                    <option value="PENDING">Pending Approval</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Address</label>
                  <textarea 
                    rows="2" 
                    value={editingUser.address || ""} 
                    onChange={(e) => setEditingUser({...editingUser, address: e.target.value})} 
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-gray-600"
                  ></textarea>
                </div>

                {/* Role Specific Inputs */}
                {editingUser.role === 'STUDENT' && (
                  <div className="md:col-span-2 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <label className="block text-sm font-bold text-blue-900 mb-1.5">ISIC Number (Optional)</label>
                    <input type="text" value={editingUser.isic_no || ""} onChange={(e) => setEditingUser({...editingUser, isic_no: e.target.value})} className="w-full p-2.5 text-sm border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-600" />
                  </div>
                )}

                {editingUser.role === 'TEACHER' && (
                  <div className="md:col-span-2 p-4 bg-indigo-50 border border-indigo-100 rounded-xl space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-indigo-900 mb-1.5 text-gray-700">Specialization</label>
                      <input type="text" value={editingUser.specialization || ""} onChange={(e) => setEditingUser({...editingUser, specialization: e.target.value})} className="w-full p-2.5 text-sm border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-indigo-900 mb-1.5 text-gray-700">Description / Bio</label>
                      <textarea rows="2" value={editingUser.description || ""} onChange={(e) => setEditingUser({...editingUser, description: e.target.value})} className="w-full p-2.5 text-sm border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-white text-gray-600"></textarea>
                    </div>
                  </div>
                )}

              </div>
              <div className="flex flex-col sm:flex-row gap-3 p-5 border-t border-gray-100 bg-gray-50 shrink-0">
                <button type="button" onClick={() => setEditingUser(null)} className="w-full sm:w-1/2 px-3 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 font-bold transition">
                  Cancel
                </button>
                <button type="submit" disabled={updating} className="w-full sm:w-1/2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold disabled:bg-blue-400 transition flex justify-center items-center">
                  {updating ? <><Loader size={16} className="animate-spin mr-2"/> Saving...</> : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* --- DELETE MODAL --- */}
      {deletingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 md:p-8 text-center animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="text-red-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Account?</h3>
            <p className="text-gray-500 text-sm mb-8">
              Are you sure you want to delete <strong className="text-gray-800">{deletingUser.name}</strong>? This will permanently erase their data from the database.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setDeletingUser(null)} className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-bold transition">
                Cancel
              </button>
              <button onClick={confirmDeleteUser} disabled={isDeleting} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold disabled:bg-red-400 transition shadow-sm">
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ID CARD GENERATOR (Hidden) --- */}
      {idCardData && (
        <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
          <div ref={idCardRef} style={{ width: "340px", height: "540px", backgroundColor: "#ffffff", borderRadius: "16px", fontFamily: "sans-serif", position: "relative", overflow: "hidden", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "140px", background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)", zIndex: 0 }}></div>
            <div style={{ position: "relative", zIndex: 10, marginTop: "24px", color: "#ffffff", textAlign: "center", width: "100%" }}>
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "900", letterSpacing: "2px", textTransform: "uppercase" }}>ENGLISH GATE</h2>
            </div>
            <div style={{ position: "relative", zIndex: 10, marginTop: "20px", width: "120px", height: "120px", borderRadius: "50%", backgroundColor: "#ffffff", padding: "6px", boxShadow: "0 4px 10px rgba(0,0,0,0.15)" }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", backgroundColor: "#f3f4f6", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {idCardData.profile_picture_url ? (
                  <img src={idCardData.profile_picture_url} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : <User size={60} color="#9ca3af" />}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", padding: "16px 24px", zIndex: 10 }}>
              <h1 style={{ margin: "0 0 8px 0", fontSize: "24px", fontWeight: "800", color: "#111827", textAlign: "center", lineHeight: "1.2" }}>
                {idCardData.name}
              </h1>
              <div style={{ backgroundColor: '#e0e7ff', color: '#3730a3', padding: "4px 16px", borderRadius: "99px", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
                {idCardData.role}
              </div>
              <div style={{ fontSize: "16px", color: "#64748b", fontFamily: "monospace", fontWeight: "bold", letterSpacing: "2px" }}>
                ID: {idCardData.user_id}
              </div>
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", width: "100%", paddingBottom: "24px" }}>
              <div style={{ backgroundColor: "#ffffff", padding: "12px", borderRadius: "12px", border: "2px solid #e2e8f0", boxShadow: "0 8px 16px rgba(0,0,0,0.05)" }}>
                <QRCode value={idCardData.user_id} size={160} level="M" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
