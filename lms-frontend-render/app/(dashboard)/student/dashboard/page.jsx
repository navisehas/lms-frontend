"use client";
import { useState, useEffect } from "react";
import { 
  Clock, BookOpen, CheckCircle, Video, ArrowRight, 
  Megaphone, Loader2, CalendarClock, MessageSquare
} from "lucide-react";
import { authFetch } from "@/lib/auth"; 
const API = process.env.NEXT_PUBLIC_API_URL;


export default function StudentDashboard() {
  const [notices, setNotices] = useState([]);
  const [loadingNotices, setLoadingNotices] = useState(true);

  // Fetch Announcements on load
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await authFetch(`${API}/admin/notice`);
        if (res.ok) {
          const data = await res.json();
          // Filter: Students should only see "All Users" or "Students Only"
          const studentNotices = data.filter(n => 
            n.target_audience === 'All Users' || n.target_audience === 'Students Only'
          );
          setNotices(studentNotices);
        }
      } catch (error) {
        console.error("Failed to load announcements:", error);
      } finally {
        setLoadingNotices(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* 1. WELCOME SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Good Morning, Kasun! 👋</h1>
          <p className="text-gray-500">You have 2 classes scheduled for today.</p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-sm font-medium text-gray-500">Next Exam In</p>
          <p className="text-xl font-bold text-blue-600">12 Days</p>
        </div>
      </div>

      {/* 1.5 ANNOUNCEMENTS (Fixed: Replaced scroll with Responsive Grid) */}
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
            {/* Show only the latest 3 notices on the dashboard to keep it clean */}
            {notices.slice(0, 3).map((notice) => (
              <div 
                key={notice.announcement_id} 
                className={`bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow border-y border-r border-gray-100 border-l-4 flex flex-col justify-between min-h-[120px] ${
                  notice.target_audience === 'Students Only' ? 'border-l-emerald-500' : 'border-l-blue-500'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                      notice.target_audience === 'Students Only' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {notice.target_audience === 'Students Only' ? 'Students' : 'General'}
                    </span>
                    <span className="text-[11px] font-bold text-gray-400">
                      {formatDate(notice.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                    {notice.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Attendance */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
              <CheckCircle size={24} />
            </div>
            <span className="text-xs font-bold bg-green-50 text-green-700 px-2 py-1 rounded-full">+2%</span>
          </div>
          <h3 className="text-3xl font-extrabold text-gray-900">85%</h3>
          <p className="text-gray-500 text-sm mt-1">Overall Attendance</p>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-4">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: "85%" }}></div>
          </div>
        </div>

        {/* Card 2: Active Courses */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <BookOpen size={24} />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-gray-900">4</h3>
          <p className="text-gray-500 text-sm mt-1">Active Courses</p>
          <p className="text-sm text-blue-600 mt-4 font-bold cursor-pointer hover:underline flex items-center gap-1">
            View All Courses <ArrowRight size={14} />
          </p>
        </div>

        {/* Card 3: Pending Payments */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-xl">
              <Clock size={24} />
            </div>
            <span className="text-xs font-bold bg-red-50 text-red-700 px-2 py-1 rounded-full">Due</span>
          </div>
          <h3 className="text-3xl font-extrabold text-gray-900">Rs. 3,500</h3>
          <p className="text-gray-500 text-sm mt-1">January Fees</p>
          <button className="mt-auto pt-4 w-full bg-gray-900 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-gray-800 transition">
            Pay Now
          </button>
        </div>
      </div>

      {/* 3. MAIN CONTENT GRID (Schedule & Quick Links) */}
      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        
        {/* Left Column: Schedule (Takes up 2/3 space) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <CalendarClock size={20} className="text-blue-600" /> Today's Schedule
          </h2>
          
          <div className="space-y-4">
            {/* Class Card 1 */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="flex-shrink-0 w-16 h-16 bg-blue-50 border border-blue-100 rounded-xl flex flex-col items-center justify-center text-blue-700">
                <span className="text-[10px] font-bold uppercase tracking-wider">Feb</span>
                <span className="text-xl font-extrabold">12</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">A/L Combined Maths</h3>
                <p className="text-sm text-gray-500 mt-0.5">08:00 AM - 12:00 PM • Mr. Sameera Bandara</p>
                <span className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md">
                  <Video size={14} /> Online Class
                </span>
              </div>
              <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-sm w-full sm:w-auto">
                Join Zoom
              </button>
            </div>

            {/* Class Card 2 */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-purple-400 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="flex-shrink-0 w-16 h-16 bg-purple-50 border border-purple-100 rounded-xl flex flex-col items-center justify-center text-purple-700">
                <span className="text-[10px] font-bold uppercase tracking-wider">Feb</span>
                <span className="text-xl font-extrabold">12</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">A/L Physics (Theory)</h3>
                <p className="text-sm text-gray-500 mt-0.5">01:00 PM - 05:00 PM • Dr. Nimal Perera</p>
                <span className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200 px-2.5 py-1 rounded-md">
                  Physical • Hall A
                </span>
              </div>
              <button className="border-2 border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition w-full sm:w-auto">
                  View Note
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Links (Takes up 1/3 space) */}
        <div className="space-y-6">
          
          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 divide-y divide-gray-100">
              <button className="w-full text-left p-4 hover:bg-blue-50 rounded-t-2xl flex items-center justify-between group transition">
                <span className="text-sm font-bold text-gray-700 group-hover:text-blue-700">Download Exam Results</span>
                <ArrowRight size={16} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full text-left p-4 hover:bg-blue-50 flex items-center justify-between group transition">
                <span className="text-sm font-bold text-gray-700 group-hover:text-blue-700">Request Leave</span>
                <ArrowRight size={16} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full text-left p-4 hover:bg-blue-50 rounded-b-2xl flex items-center justify-between group transition">
                <span className="text-sm font-bold text-gray-700 group-hover:text-blue-700">View Payment History</span>
                <ArrowRight size={16} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Need Help Box */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="relative z-10">
               <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                 <MessageSquare size={18} /> Need Help?
               </h3>
               <p className="text-blue-100 text-sm mb-5 leading-relaxed">Have a question or facing technical issues? Chat with our support team.</p>
               <button className="bg-white text-blue-700 text-sm font-bold py-2.5 px-5 rounded-xl w-full hover:bg-blue-50 transition shadow-sm">
                 Start Chat
               </button>
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
            <div className="absolute -top-6 -left-6 w-20 h-20 bg-white opacity-10 rounded-full blur-xl"></div>
          </div>

        </div>
      </div>
    </div>
  );
}