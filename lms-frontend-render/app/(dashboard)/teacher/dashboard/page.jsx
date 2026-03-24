"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, BookOpen, Clock, FileText, Plus, 
  MoreVertical, Video, ArrowRight, PenTool, Loader2,
  Megaphone, MapPin // <-- Added MapPin here
} from "lucide-react";
import { authFetch, getUser } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function TeacherDashboard() {
  
  // Dynamic User & Dashboard States
  const [greeting, setGreeting] = useState("Hello");
  const [teacherName, setTeacherName] = useState("Teacher");
  const [loading, setLoading] = useState(true);
  const [loadingNotices, setLoadingNotices] = useState(true);
  const [notices, setNotices] = useState([]);
  
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    pendingExams: 0
  });
  
  const [todayClasses, setTodayClasses] = useState([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        // FIXED: Using dynamic API variable instead of hardcoded localhost
        const res = await authFetch(`${API}/admin/notice`);
        if (res.ok) {
          const data = await res.json();
          // Teachers should see "All Users" or "Teachers Only"
          const teacherNotices = data.filter(n =>
            n.target_audience === 'All Users' || n.target_audience === 'Teachers Only'
          );
          setNotices(teacherNotices);
        }
      } catch (error) {
        console.error("Failed to load announcements:", error);
      } finally {
        setLoadingNotices(false);
      }
    };

    fetchAnnouncements();
  }, []);

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
      // Get first name and ensure "Teacher" fallback if missing
      setTeacherName(user.name.split(" ")[0] || "Teacher"); 
    }

    // 3. Fetch Dashboard Stats & Schedule
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // A. Fetch Teacher Stats
        const statsRes = await authFetch(`${API}/teacher/dashboard/stats`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats({
            totalStudents: statsData.total_students || 0,
            activeCourses: statsData.active_courses || 0,
            pendingExams: statsData.pending_exams || 0
          });
        }

        // B. Fetch Today's Schedule
        const schRes = await authFetch(`${API}/teacher/schedule/today`);
        if (schRes.ok) {
          const scheduleData = await schRes.json();
          setTodayClasses(Array.isArray(scheduleData) ? scheduleData : []);
        }

      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper function to format time strings from the DB (e.g., "14:30:00" -> "02:30 PM")
  const formatTime = (timeString) => {
    if (!timeString) return { time: "", period: "" };
    const [h, m] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(h), parseInt(m));
    
    const formatted = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const [time, period] = formatted.split(' ');
    return { time, period };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* WELCOME GREETING */}
      <h1 className="text-2xl font-bold text-gray-900">
        {greeting}, {teacherName}! 👋
      </h1>

      {/* 1. STATS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Students */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Students</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">
              {loading ? <Loader2 className="w-6 h-6 animate-spin text-gray-300 mt-2" /> : stats.totalStudents}
            </h3>
            <span className="text-xs text-green-600 font-bold flex items-center mt-1">
              Active Enrollments
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
            <Users size={24} />
          </div>
        </div>

        {/* Active Courses */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Active Courses</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">
              {loading ? <Loader2 className="w-6 h-6 animate-spin text-gray-300 mt-2" /> : stats.activeCourses}
            </h3>
            <span className="text-xs text-gray-400 mt-1">Currently Teaching</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
            <BookOpen size={24} />
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Exams</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">
              {loading ? <Loader2 className="w-6 h-6 animate-spin text-gray-300 mt-2" /> : stats.pendingExams}
            </h3>
            <span className="text-xs text-orange-600 font-bold mt-1">
              Needs Grading
            </span>
          </div>
          <div className="p-3 bg-orange-50 text-orange-600 rounded-full">
            <PenTool size={24} />
          </div>
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
                  notice.target_audience === 'Teachers Only' ? 'border-l-purple-500' : 'border-l-blue-500'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                      notice.target_audience === 'Teachers Only' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {notice.target_audience === 'Teachers Only' ? 'Teachers' : 'General'}
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

      {/* FIXED: The Grid wrapper now properly wraps both columns instead of closing immediately */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* 3. TODAY'S SCHEDULE (Left - 2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Today's Schedule</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-12 flex justify-center items-center">
                <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
              </div>
            ) : todayClasses.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <Clock size={48} className="mx-auto mb-4 opacity-50" />
                <p className="font-medium text-gray-500">No classes scheduled for today.</p>
              </div>
            ) : (
              todayClasses.map((cls, idx) => {
                const { time, period } = formatTime(cls.start_time);
                
                return (
                  <div key={cls.schedule_id || idx} className="p-6 flex flex-col md:flex-row md:items-center gap-5 hover:bg-gray-50 transition">
                    
                    {/* Time Box */}
                    <div className="flex-shrink-0 w-20 h-20 bg-slate-50 rounded-xl flex flex-col items-center justify-center text-slate-700 border border-slate-200 shadow-sm">
                      <Clock size={16} className="mb-1 opacity-50" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{period || 'AM'}</span>
                      <span className="text-xl font-extrabold text-slate-900">{time || '--:--'}</span>
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{cls.course_title || cls.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-500 font-medium">
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                          cls.type === 'Online' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-purple-50 text-purple-700 border border-purple-100'
                        }`}>
                          {cls.type === 'Online' ? <Video size={14}/> : <Users size={14}/>}
                          {cls.type} Class
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="flex items-center gap-1">
                          <MapPin size={14} className="text-gray-400" />
                          {cls.hall_name || cls.hall || 'TBA'}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="flex items-center gap-1">
                          <Users size={14} className="text-gray-400" />
                          {cls.student_count || '0'} Enrolled
                        </span>
                      </div>
                    </div>

                    {/* Action */}
                    <button className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition shadow-sm w-full md:w-auto mt-2 md:mt-0">
                      {cls.type === 'Online' ? 'Start Zoom' : 'View Class'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 4. QUICK ACTIONS (Right - 1/3 width) */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-gray-900">Quick Create</h2>
          
          <div className="grid gap-4">
            <Link href="/teacher/materials/upload" className="group p-4 bg-white border border-gray-200 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Upload Material</h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">PDF Notes or Video Links</p>
              </div>
              <ArrowRight size={16} className="ml-auto text-gray-300 group-hover:text-emerald-600" />
            </Link>

            <Link href="/teacher/exams/create" className="group p-4 bg-white border border-gray-200 rounded-xl hover:border-orange-500 hover:shadow-md transition-all flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition">
                <PenTool size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Create Exam</h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">MCQ Quiz or Assignment</p>
              </div>
              <ArrowRight size={16} className="ml-auto text-gray-300 group-hover:text-orange-600" />
            </Link>

            <div className="bg-slate-900 text-white p-6 rounded-xl mt-4 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-bold text-lg mb-2">Teacher Tips</h3>
                <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                  Regularly uploading course materials and assigning quizzes significantly boosts student engagement and pass rates.
                </p>
              </div>
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white opacity-5 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
