"use client";
import { useState, useEffect } from "react";
import { 
  Calendar, CheckCircle, XCircle, Clock, 
  CalendarCheck, BookOpen, ChevronDown, Loader 
} from "lucide-react";
import { authFetch } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function MyAttendance() {
  // State variables for data and loading
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  
  // State variables for filters
  const [filterCourse, setFilterCourse] = useState("ALL");
  const [filterMonth, setFilterMonth] = useState("ALL");

  // Fetch attendance data on component mount
  useEffect(() => {
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

    fetchAttendance();
  }, []);

  // ====================== FILTER & STATS LOGIC ======================
  // Extract unique courses and months for dropdowns
  const uniqueCourses = [...new Set(attendanceRecords.map(item => item.course_title))];
  
  const monthOptions = Array.from(new Set(
    attendanceRecords.map(p => {
      const d = new Date(p.date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    })
  )).sort().reverse();

  // Apply filters
  const filteredAttendance = attendanceRecords.filter(item => {
    const matchCourse = filterCourse === "ALL" || item.course_title === filterCourse;
    const d = new Date(item.date);
    const itemMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const matchMonth = filterMonth === "ALL" || itemMonth === filterMonth;
    return matchCourse && matchMonth;
  });

  // Calculate Statistics based on filtered data
  const totalClasses = filteredAttendance.length;
  const attendedClasses = filteredAttendance.filter(r => r.status === "PRESENT" || r.status === "LATE").length;
  const absentClasses = filteredAttendance.filter(r => r.status === "ABSENT").length;
  const attendancePercentage = totalClasses === 0 ? 0 : Math.round((attendedClasses / totalClasses) * 100);

  // Time formatter
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    const [h, m] = timeString.split(':');
    const date = new Date();
    date.setHours(h, m);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>

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
                      <tr key={record.attendance_id || record.id} className="hover:bg-indigo-50/30 transition-colors">
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
  );
}
