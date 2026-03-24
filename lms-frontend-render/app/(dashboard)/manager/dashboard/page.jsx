"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Users, QrCode, Banknote, ArrowUpRight, 
  Clock, AlertCircle, PlusCircle, Search, 
  CheckCircle, Loader, User, Calendar, MapPin, Phone, GraduationCap,
  Megaphone, Loader2
} from "lucide-react";
import { authFetch, getUser } from "@/lib/auth"; // FIXED: Added getUser import

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ManagerDashboard() {
  const router = useRouter();

  // --- States ---
  const [greeting, setGreeting] = useState("Hello");
  const [managerName, setManagerName] = useState("Manager");
  
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [approvingId, setApprovingId] = useState(null);

  const [notices, setNotices] = useState([]);
  const [loadingNotices, setLoadingNotices] = useState(true);

  // --- Initial Data Load ---
  useEffect(() => {
    // 1. Set Greeting based on Time
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good Morning");
    } else if (hour < 18) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }

    // 2. Get Current User Name
    const currentUser = getUser();
    if (currentUser && currentUser.name) {
      setManagerName(currentUser.name.split(" ")[0]); 
    }

    // 3. Fetch Data
    fetchUsers();
    fetchAnnouncements();
  }, []);

  // --- Fetch Methods ---
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await authFetch(`${API}/users`);
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      setLoadingNotices(true);
      const res = await authFetch(`${API}/admin/notice`);
      if (res.ok) {
        const data = await res.json();
        // Managers should see "All Users" or "Managers Only"
        const managerNotices = data.filter(n =>
          n.target_audience === 'All Users' || n.target_audience === 'Managers Only'
        );
        setNotices(managerNotices);
      }
    } catch (error) {
      console.error("Failed to load announcements:", error);
    } finally {
      setLoadingNotices(false);
    }
  };

  const handleApprove = async (userToApprove) => {
    setApprovingId(userToApprove.user_id);
    try {
      const updatedUser = { ...userToApprove, status: 'ACTIVE' };
      const res = await authFetch(`${API}/users/${userToApprove.user_id}`, {
        method: "PUT",
        body: JSON.stringify(updatedUser)
      });
      
      if (res.ok) {
        setUsers(users.map(u => u.user_id === userToApprove.user_id ? { ...u, status: 'ACTIVE' } : u));
      } else {
        const data = await res.json();
        alert(`❌ Failed to approve: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert("❌ Server connection failed");
    } finally {
      setApprovingId(null);
    }
  };

  // --- Helpers & Filters ---
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const pendingStudents = users.filter(user => {
    if (user.role !== 'STUDENT' || user.status !== 'PENDING') return false; 
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = user.name.toLowerCase().includes(searchLower) || 
                          (user.phone_no && user.phone_no.includes(searchLower)) ||
                          user.user_id.toLowerCase().includes(searchLower);
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* 1. WELCOME SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{greeting}, {managerName}! 👋</h1>
          <p className="text-gray-500">Here's what's happening at the center today.</p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
          <p className={`text-xl font-bold ${pendingStudents.length > 0 ? "text-amber-600" : "text-green-600"}`}>
            {loadingUsers ? <Loader2 className="inline animate-spin w-5 h-5" /> : pendingStudents.length} Students
          </p>
        </div>
      </div>

      {/* 2. ANNOUNCEMENTS */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Megaphone size={20} className="text-blue-600" /> Important Announcements
        </h2>

        {loadingNotices ? (
          <div className="flex justify-center items-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
          </div>
        ) : notices.length === 0 ? (
          <div className="p-6 text-center text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center gap-3">
            <Megaphone className="w-5 h-5 text-gray-400" />
            <p className="text-sm font-medium">No new announcements at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {notices.slice(0, 3).map((notice) => (
              <div
                key={notice.announcement_id}
                className={`bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow border-y border-r border-gray-100 border-l-4 flex flex-col justify-between min-h-[120px] ${
                  notice.target_audience === 'Managers Only' ? 'border-l-amber-500' : 'border-l-blue-500'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                      notice.target_audience === 'Managers Only' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {notice.target_audience === 'Managers Only' ? 'Managers' : 'General'}
                    </span>
                    <span className="text-[11px] font-bold text-gray-400">{formatDate(notice.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{notice.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. QUICK ACTIONS */}
      <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/manager/scan" className="group relative bg-gradient-to-br from-indigo-600 to-blue-600 text-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
          <div className="absolute top-0 right-0 p-4 opacity-10"><QrCode size={100} /></div>
          <QrCode size={40} className="mb-4 text-white" />
          <h3 className="text-2xl font-bold">Scan QR Code</h3>
          <p className="text-indigo-100 mt-2">Mark attendance for incoming students.</p>
        </Link>

        <Link href="/manager/payments/new" className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm hover:border-indigo-500 hover:shadow-md transition-all group">
          <Banknote size={40} className="mb-4 text-green-600 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-bold text-gray-900">Collect Payment</h3>
          <p className="text-gray-500 mt-2">Record a cash payment manually.</p>
        </Link>

        <Link href="/manager/students/new" className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm hover:border-indigo-500 hover:shadow-md transition-all group">
          <PlusCircle size={40} className="mb-4 text-purple-600 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-bold text-gray-900">New Enrollment</h3>
          <p className="text-gray-500 mt-2">Register a walk-in student.</p>
        </Link>
      </div>

      {/* 4. PENDING APPROVALS FEED */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8 text-gray-700">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-yellow-50/30">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Clock className="text-yellow-600" size={20} />
              Pending Approvals
            </h2>
            <p className="text-xs text-gray-500 mt-1">Review and approve new student registrations before they can access the system.</p>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by ID or Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loadingUsers ? (
            <div className="p-12 flex justify-center text-blue-600"><Loader className="animate-spin" size={32} /></div>
          ) : (
            <table className="w-full text-left whitespace-nowrap md:whitespace-normal">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-bold">Student Identity</th>
                  <th className="px-6 py-4 font-bold">Contact & Info</th>
                  <th className="px-6 py-4 font-bold w-48">ISIC Card</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {pendingStudents.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-12 text-center text-gray-500 font-medium">
                      <div className="flex flex-col items-center justify-center">
                        <CheckCircle size={40} className="text-green-500 mb-3 opacity-50" />
                        <p>No pending approvals. You're all caught up!</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pendingStudents.map((u) => (
                    <tr key={u.user_id} className="hover:bg-blue-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                            {u.profile_picture_url ? (
                              <img src={u.profile_picture_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : <div className="w-full h-full flex items-center justify-center text-gray-700"><User size={20}/></div>}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{u.name}</div>
                            <div className="text-blue-600 text-xs font-mono font-bold mt-0.5">{u.user_id}</div>
                            <div className="text-[10px] text-gray-400 mt-0.5">Joined: {new Date(u.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-700 flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-xs font-medium">
                            <Phone size={14} className="text-gray-700 shrink-0"/> {u.phone_no || "N/A"}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <Calendar size={14} className="text-gray-700 shrink-0"/> {u.birthday ? new Date(u.birthday).toLocaleDateString() : "N/A"}
                          </div>
                          <div className="flex items-start gap-2 text-xs max-w-[200px] whitespace-normal">
                            <MapPin size={14} className="text-gray-700 shrink-0 mt-0.5"/> 
                            <span className="line-clamp-2" title={u.address}>{u.address || "N/A"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-normal">
                        <div className="text-xs text-gray-700 font-medium mt-1">
                          <span className="text-gray-700">ISIC:</span> {u.isic_no || "Not Provided"}
                        </div>
                        <span className="inline-flex mt-2 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-yellow-50 text-yellow-700 border-yellow-200">
                          {u.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleApprove(u)} 
                          disabled={approvingId === u.user_id}
                          className="inline-flex items-center justify-center min-w-[110px] gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg text-sm font-bold transition disabled:bg-green-400 shadow-sm"
                        >
                          {approvingId === u.user_id ? (
                            <><Loader size={16} className="animate-spin" /> ...</>
                          ) : (
                            <><CheckCircle size={16} /> Approve</>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {pendingStudents.length > 5 && (
          <div className="p-4 border-t border-gray-100 text-center bg-gray-50">
            <Link href="/manager/students" className="text-sm text-indigo-600 hover:text-indigo-800 font-bold transition">
              View All Students
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
