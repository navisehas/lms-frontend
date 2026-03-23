"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Clock, BookOpen, CheckCircle, Video, ArrowRight, 
  Megaphone, Loader2, CalendarClock, MessageSquare, MapPin
} from "lucide-react";
import { authFetch, getUser } from "@/lib/auth"; 

const API = process.env.NEXT_PUBLIC_API_URL;

export default function StudentDashboard() {
  const [notices, setNotices] = useState([]);
  const [loadingNotices, setLoadingNotices] = useState(true);
  
  // Dynamic User & Dashboard Data States
  const [greeting, setGreeting] = useState("Hello"); // <-- ADDED MISSING STATE
  const [studentName, setStudentName] = useState("Student");
  const [loadingData, setLoadingData] = useState(true);
  const [stats, setStats] = useState({
    attendanceRate: 0,
    activeCourses: 0,
    dueAmount: 0,
    dueMonth: "No Dues"
  });
  const [todayClasses, setTodayClasses] = useState([]);
  const [nextExam, setNextExam] = useState(null); // Optional: null if no exams

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
    const user = getUser();
    if (user && user.name) {
      setStudentName(user.name.split(" ")[0]); // Get first name
    }

    // 3. Fetch Announcements
    const fetchAnnouncements = async () => {
      try {
        const res = await authFetch(`${API}/admin/notice`);
        if (res.ok) {
          const data = await res.json();
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

    // 4. Fetch Dashboard Stats & Schedule
    const fetchDashboardData = async () => {
      try {
        let attRate = 0;
        let coursesCount = 0;
        let schedule = [];

        // A. Calculate Attendance Rate
        const attRes = await authFetch(`${API}/student/profile/attendance`);
        if (attRes.ok) {
          const attData = await attRes.json();
          const total = attData.length;
          const attended = attData.filter(r => r.status === "PRESENT" || r.status === "LATE").length;
          attRate = total > 0 ? Math.round((attended / total) * 100) : 0;
        }

        // B. Get Active Courses Count
        const curRes = await authFetch(`${API}/student/courses`);
        if (curRes.ok) {
          const curData = await curRes.json();
          coursesCount = Array.isArray(curData) ? curData.length : 0;
        }

        // C. Get Today's Schedule
        const schRes = await authFetch(`${API}/student/schedule/today`);
        if (schRes.ok) {
          schedule = await schRes.json();
        }

        // D. Set State
        setStats({
          attendanceRate: attRate,
          activeCourses: coursesCount,
          dueAmount: 0, 
          dueMonth: "None"
        });
        setTodayClasses(Array.isArray(schedule) ? schedule : []);
        
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchAnnouncements();
    fetchDashboardData();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [h, m] = timeString.split(':');
    const date = new Date();
    date.setHours(h, m);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* 1. WELCOME SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{greeting}, {studentName}! 👋</h1>
          <p className="text-gray-500">
            {loadingData ? "Loading your schedule..." : 
             todayClasses.length > 0 
              ? `You have ${todayClasses.length} class${todayClasses.length > 1 ? 'es' : ''} scheduled for today.` 
              : "You have no classes scheduled for today."}
          </p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-sm font-medium text-gray-500">Next Exam In</p>
          <p className={`text-xl font-bold ${nextExam ? "text-blue-600" : "text-gray-400"}`}>
            {nextExam ? `${nextExam} Days` : "No upcoming exams"}
          </p>
        </div>
      </div>

      {/* 1.5 ANNOUNCEMENTS */}
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
            {stats.attendanceRate >= 80 && <span className="text-xs font-bold bg-green-50 text-green-700 px-2 py-1 rounded-full">Good Standing</span>}
            {stats.attendanceRate < 50 && <span className="text-xs font-bold bg-red-50 text-red-700 px-2 py-1 rounded-full">Action Needed</span>}
          </div>
          <h3 className="text-3xl font-extrabold text-gray-900">
            {loadingData ? <Loader2 className="animate-spin w-8 h-8 text-gray-300" /> : `${stats.attendanceRate}%`}
          </h3>
          <p className="text-gray-500 text-sm mt-1">Overall Attendance</p>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-4">
            <div className={`h-2 rounded-full ${stats.attendanceRate >= 50 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${stats.attendanceRate}%` }}></div>
          </div>
        </div>

        {/* Card 2: Active Courses */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <BookOpen size={24} />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-gray-900">
            {loadingData ? <Loader2 className="animate-spin w-8 h-8 text-gray-300" /> : stats.activeCourses}
          </h3>
          <p className="text-gray-500 text-sm mt-1">Active Courses</p>
          <Link href="/student/courses" className="mt-auto pt-4 text-sm text-blue-600 font-bold cursor-pointer hover:underline flex items-center gap-1">
            View All Courses <ArrowRight size={14} />
          </Link>
        </div>

        {/* Card 3: Pending Payments */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${stats.dueAmount > 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
              <Clock size={24} />
            </div>
            {stats.dueAmount > 0 ? (
              <span className="text-xs font-bold bg-red-50 text-red-700 px-2 py-1 rounded-full">Due</span>
            ) : (
              <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">Cleared</span>
            )}
          </div>
          <h3 className="text-3xl font-extrabold text-gray-900">
            {loadingData ? <Loader2 className="animate-spin w-8 h-8 text-gray-300" /> : `Rs. ${stats.dueAmount}`}
          </h3>
          <p className="text-gray-500 text-sm mt-1">{stats.dueAmount > 0 ? stats.dueMonth : "No Pending Dues"}</p>
          {stats.dueAmount > 0 && (
            <button className="mt-auto pt-4 w-full bg-gray-900 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-gray-800 transition">
              Pay Now
            </button>
          )}
        </div>
      </div>

      {/* 3. MAIN CONTENT GRID (Schedule & Quick Links) */}
      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        
        {/* Left Column: Schedule */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <CalendarClock size={20} className="text-blue-600" /> Today's Schedule
          </h2>
          
          <div className="space-y-4">
            {loadingData ? (
               <div className="bg-white p-10 rounded-2xl border border-gray-200 flex justify-center">
                 <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
               </div>
            ) : todayClasses.length === 0 ? (
               <div className="bg-white p-10 rounded-2xl border border-gray-200 text-center text-gray-500">
                 <CalendarClock size={40} className="mx-auto mb-3 opacity-20" />
                 <p className="font-medium">No classes scheduled for today. Enjoy your day!</p>
               </div>
            ) : (
              todayClasses.map((cls, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center gap-5">
                  <div className="flex-shrink-0 w-16 h-16 bg-blue-50 border border-blue-100 rounded-xl flex flex-col items-center justify-center text-blue-700">
                    <span className="text-[10px] font-bold uppercase tracking-wider">{new Date(cls.date).toLocaleString('en-US', { month: 'short' })}</span>
                    <span className="text-xl font-extrabold">{new Date(cls.date).getDate()}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{cls.course_title || cls.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {formatTime(cls.start_time)} - {formatTime(cls.end_time)} • {cls.teacher_name || 'Instructor'}
                    </p>
                    <span className={`inline-flex items-center gap-1.5 mt-3 text-xs font-bold px-2.5 py-1 rounded-md ${
                      cls.type === 'Online' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                      {cls.type === 'Online' ? <><Video size={14} /> Online Class</> : <><MapPin size={14} /> Physical • {cls.hall_name || 'Campus'}</>}
                    </span>
                  </div>
                  {cls.type === 'Online' ? (
                    <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-sm w-full sm:w-auto">
                      Join Zoom
                    </button>
                  ) : (
                    <button className="border-2 border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition w-full sm:w-auto">
                      View Note
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Quick Links */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 divide-y divide-gray-100">
              <Link href="/student/results" className="w-full text-left p-4 hover:bg-blue-50 rounded-t-2xl flex items-center justify-between group transition block">
                <span className="text-sm font-bold text-gray-700 group-hover:text-blue-700">Download Exam Results</span>
                <ArrowRight size={16} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/student/leave" className="w-full text-left p-4 hover:bg-blue-50 flex items-center justify-between group transition block">
                <span className="text-sm font-bold text-gray-700 group-hover:text-blue-700">Request Leave</span>
                <ArrowRight size={16} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/student/history" className="w-full text-left p-4 hover:bg-blue-50 rounded-b-2xl flex items-center justify-between group transition block">
                <span className="text-sm font-bold text-gray-700 group-hover:text-blue-700">View Payment History</span>
                <ArrowRight size={16} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

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
