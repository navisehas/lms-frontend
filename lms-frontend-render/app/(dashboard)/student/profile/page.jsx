"use client";
import { useState, useEffect, useRef } from "react";
import { 
  User, Phone, MapPin, Lock, Download, Loader, 
  Eye, EyeOff, CheckCircle, AlertCircle,
  CalendarCheck, BookOpen, Calendar, ChevronDown, XCircle, Clock, Hash
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";
import { authFetch, guardRoute } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function StudentProfile() {
  const router = useRouter();

  // Profile data (View Only)
  const [user, setUser] = useState({
    user_id: "",
    name: "",
    phone_no: "",
    isic_no: "",
    address: "",
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

  // Attendance states
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [filterCourse, setFilterCourse] = useState("ALL");
  const [filterMonth, setFilterMonth] = useState("ALL");

  const cardRef = useRef(null);

  // ====================== AUTH CHECK ======================
  useEffect(() => {
    const authorised = guardRoute("STUDENT", router);
    if (authorised) {
      fetchProfile(authorised.user_id);
      fetchAttendance();
    }
  }, [router]);

  const fetchProfile = async (id) => {
    try {
      const res = await authFetch(`${API}/student/profile/${id}`);
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

  const fetchAttendance = async () => {
    try {
      const res = await authFetch(`${API}/student/profile/attendance`);
      if (res.ok) {
        const data = await res.json();
        setAttendanceRecords(data);
      }
    } catch (error) {
      console.error("Failed to load attendance", error);
    } finally {
      setLoadingAttendance(false);
    }
  };

  // ====================== HANDLERS ======================
  const handleDownloadID = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { backgroundColor: "#ffffff", scale: 2, useCORS: true });
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${user.user_id}_ID.png`;
    link.click();
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMessage({ type: "", text: "" });
    
    if (newPassword !== confirmPassword) {
      return setPassMessage({ type: "error", text: "New passwords do not match!" });
    }
    
    setChangingPass(true);
    try {
      const res = await authFetch(`${API}/student/profile/change-password`, {
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

  // ====================== ATTENDANCE FILTER & STATS LOGIC ======================
  const uniqueCourses = [...new Set(attendanceRecords.map(item => item.course_title))];
  
  const monthOptions = Array.from(new Set(
    attendanceRecords.map(p => {
      const d = new Date(p.date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    })
  )).sort().reverse();

  const filteredAttendance = attendanceRecords.filter(item => {
    const matchCourse = filterCourse === "ALL" || item.course_title === filterCourse;
    const d = new Date(item.date);
    const itemMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const matchMonth = filterMonth === "ALL" || itemMonth === filterMonth;
    return matchCourse && matchMonth;
  });

  // Calculate Statistics dynamically based on the filtered list
  const totalClasses = filteredAttendance.length;
  const attendedClasses = filteredAttendance.filter(r => r.status === "PRESENT" || r.status === "LATE").length;
  const absentClasses = filteredAttendance.filter(r => r.status === "ABSENT").length;
  const attendancePercentage = totalClasses === 0 ? 0 : Math.round((attendedClasses / totalClasses) * 100);

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    const [h, m] = timeString.split(':');
    const date = new Date();
    date.setHours(h, m);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader className="animate-spin text-indigo-600 w-10 h-10" /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Student Profile</h1>
        <p className="text-gray-500 text-sm mt-1">View your personal information, security settings, and attendance logs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* ==================== LEFT: ID CARD ==================== */}
        <div className="space-y-6 lg:sticky lg:top-6">
          <div ref={cardRef} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative text-center">
            <div className="h-28 bg-indigo-600 relative">
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
              <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                {user.status || "Active Student"}
              </div>
            </div>
            <div className="bg-gray-50 border-t border-gray-100 p-6 flex flex-col items-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Gate Pass QR</p>
              <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200">
                {user.user_id && <QRCodeSVG value={user.user_id} size={120} />}
              </div>
              <p className="text-[10px] text-gray-400 mt-2">Scan at entrance</p>
            </div>
          </div>

          <button onClick={handleDownloadID} className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-xl transition shadow-sm">
            <Download size={18} /> Download ID Card
          </button>
        </div>

        {/* ==================== RIGHT: FORMS & ATTENDANCE ==================== */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Profile Details (Read Only) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><User size={20} /></div>
              <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
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
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Student ID</label>
                <input type="text" className="w-full py-2.5 px-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed text-sm font-mono font-medium" value={user.user_id || ""} readOnly />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">ISIC Number</label>
                <div className="relative">
                  <Hash size={18} className="absolute left-3 top-3 text-gray-400" />
                  <input type="text" className="w-full pl-10 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed text-sm font-medium" value={user.isic_no || "N/A"} readOnly />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-3 text-gray-400" />
                  <input type="text" className="w-full pl-10 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed text-sm font-medium" value={user.phone_no || ""} readOnly />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Home Address</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-3 text-gray-400" />
                  <textarea rows="2" className="w-full pl-10 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed text-sm font-medium resize-none" value={user.address || ""} readOnly />
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
               <button className="text-sm font-bold text-indigo-600 hover:underline">
                 {showPasswordSection ? "Hide" : "Edit"}
               </button>
            </div>
            {showPasswordSection && (
              <form onSubmit={handleChangePassword} className="mt-6 pt-6 border-t border-gray-100 space-y-5 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Current Password</label>
                  <div className="relative">
                    <input type={showOldPass ? "text" : "password"} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-gray-900" required />
                    <button type="button" onClick={() => setShowOldPass(!showOldPass)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                      {showOldPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">New Password</label>
                    <div className="relative">
                      <input type={showNewPass ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-gray-900" required />
                      <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                        {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <input type={showConfirmPass ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-gray-900" required />
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

          {/* ==================== ATTENDANCE HISTORY ==================== */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            
            {/* Header & Filters */}
            <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <CalendarCheck size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Attendance History</h2>
                  <p className="text-xs text-gray-500">Track your class presence</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <BookOpen size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select 
                    value={filterCourse} 
                    onChange={(e) => setFilterCourse(e.target.value)}
                    className="w-full sm:w-48 pl-9 pr-8 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                  >
                    <option value="ALL">All Courses</option>
                    {uniqueCourses.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                <div className="relative flex-1 sm:flex-none">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select 
                    value={filterMonth} 
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="w-full sm:w-40 pl-9 pr-8 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                  >
                    <option value="ALL">All Months</option>
                    {monthOptions.map(m => {
                      const [y, mo] = m.split("-");
                      const label = new Date(parseInt(y), parseInt(mo) - 1).toLocaleString("en-US", { month: "short", year: "numeric" });
                      return <option key={m} value={m}>{label}</option>;
                    })}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="p-0">
              {loadingAttendance ? (
                <div className="flex justify-center items-center py-16"><Loader className="animate-spin text-indigo-600" size={28} /></div>
              ) : filteredAttendance.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <CalendarCheck size={40} className="mx-auto mb-3 opacity-20" />
                  <p className="font-medium text-sm text-gray-500">No attendance records found for this selection.</p>
                </div>
              ) : (
                <>
                  {/* --- SUMMARY STATISTICS BAR --- */}
                  <div className="bg-gray-50 border-b border-gray-100 p-4 md:p-5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-2 md:divide-x divide-gray-200">
                      
                      <div className="flex flex-col px-2 md:px-4 text-center md:text-left">
                        <span className="text-[10px] md:text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1 truncate">Total Classes</span>
                        <span className="text-2xl font-black text-gray-900">{totalClasses}</span>
                      </div>
                      
                      <div className="flex flex-col px-2 md:px-4 text-center md:text-left">
                        <span className="text-[10px] md:text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1 truncate">Attended</span>
                        <span className="text-2xl font-black text-green-600">{attendedClasses}</span>
                      </div>
                      
                      <div className="flex flex-col px-2 md:px-4 text-center md:text-left">
                        <span className="text-[10px] md:text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1 truncate">Absent</span>
                        <span className="text-2xl font-black text-red-600">{absentClasses}</span>
                      </div>
                      
                      <div className="flex flex-col px-2 md:px-4 text-center md:text-left">
                        <span className="text-[10px] md:text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1 truncate">Attendance Rate</span>
                        <span className={`text-2xl font-black ${
                          attendancePercentage >= 80 ? 'text-green-600' : 
                          attendancePercentage >= 50 ? 'text-yellow-600' : 
                          'text-red-600'
                        }`}>
                          {attendancePercentage}%
                        </span>
                      </div>

                    </div>
                  </div>

                  {/* --- ATTENDANCE TABLE --- */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4 border-b border-gray-100">Date</th>
                          <th className="px-6 py-4 border-b border-gray-100">Course</th>
                          <th className="px-6 py-4 border-b border-gray-100">Arrival Time</th>
                          <th className="px-6 py-4 border-b border-gray-100 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {filteredAttendance.map((record) => (
                          <tr key={record.attendance_id} className="hover:bg-indigo-50/30 transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-semibold text-gray-900">
                                {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-700 font-medium">
                              {record.course_title}
                            </td>
                            <td className="px-6 py-4 text-gray-500 font-medium">
                              {record.status === "ABSENT" || record.status === "EXCUSED" ? "--:--" : (
                                <span className="flex items-center gap-1.5"><Clock size={14}/> {formatTime(record.arrival_time)}</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                                record.status === "PRESENT" ? "bg-green-50 text-green-700 border-green-200" : 
                                record.status === "LATE" ? "bg-yellow-50 text-yellow-700 border-yellow-200" : 
                                record.status === "EXCUSED" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                "bg-red-50 text-red-700 border-red-200"
                              }`}>
                                {record.status === "PRESENT" ? <CheckCircle size={14} /> : 
                                 record.status === "LATE" ? <Clock size={14} /> : 
                                 record.status === "EXCUSED" ? <CheckCircle size={14} className="opacity-70" /> :
                                 <XCircle size={14} />}
                                {record.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}