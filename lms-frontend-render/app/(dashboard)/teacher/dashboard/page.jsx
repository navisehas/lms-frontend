"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, BookOpen, Clock, FileText, Plus, 
  MoreVertical, Video, ArrowRight, PenTool, Loader2
} from "lucide-react";
import { authFetch, getUser } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function TeacherDashboard() {
  
  // Dynamic User & Dashboard States
  const [greeting, setGreeting] = useState("Hello");
  const [teacherName, setTeacherName] = useState("Teacher");
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    pendingExams: 0
  });
  
  const [todayClasses, setTodayClasses] = useState([]);

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
        
        // Note: Replace these API endpoints with your actual backend routes
        
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

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* 2. TODAY'S SCHEDULE (Left - 2/3 width) */}
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

        {/* 3. QUICK ACTIONS (Right - 1/3 width) */}
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
