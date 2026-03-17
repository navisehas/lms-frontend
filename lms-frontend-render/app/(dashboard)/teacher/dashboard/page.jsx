import Link from "next/link";
import { 
  Users, BookOpen, Clock, FileText, Plus, 
  MoreVertical, Video, ArrowRight, PenTool 
} from "lucide-react";

export default function TeacherDashboard() {
  
  // Mock Schedule
  const todayClasses = [
    { id: 1, time: "08:30 AM", title: "A/L Combined Maths (2026)", type: "Physical", hall: "Hall A", students: 120 },
    { id: 2, time: "10:30 AM", title: "A/L Combined Maths (2027)", type: "Online", hall: "Zoom", students: 350 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* 1. STATS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Students */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Students</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">450+</h3>
            <span className="text-xs text-green-600 font-bold flex items-center mt-1">
              Active across 2 batches
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
            <h3 className="text-3xl font-bold text-gray-900 mt-1">04</h3>
            <span className="text-xs text-gray-400 mt-1">A/L 2026, 2027 & Revision</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
            <BookOpen size={24} />
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Exams</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">02</h3>
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
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
            {todayClasses.map((cls) => (
              <div key={cls.id} className="p-6 flex flex-col md:flex-row md:items-center gap-4 hover:bg-gray-50 transition">
                
                {/* Time Box */}
                <div className="flex-shrink-0 w-20 h-20 bg-slate-100 rounded-lg flex flex-col items-center justify-center text-slate-700 border border-slate-200">
                  <Clock size={20} className="mb-1" />
                  <span className="text-xs font-bold uppercase">{cls.time.split(' ')[1]}</span>
                  <span className="text-lg font-bold">{cls.time.split(' ')[0]}</span>
                </div>

                {/* Details */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{cls.title}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      {cls.type === 'Online' ? <Video size={14} className="text-blue-500"/> : <Users size={14} className="text-purple-500"/>}
                      {cls.type} Class
                    </span>
                    <span>•</span>
                    <span>{cls.hall}</span>
                    <span>•</span>
                    <span>{cls.students} Students</span>
                  </div>
                </div>

                {/* Action */}
                <button className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition">
                  {cls.type === 'Online' ? 'Start Zoom' : 'View Class'}
                </button>
              </div>
            ))}

            {todayClasses.length === 0 && (
              <div className="p-12 text-center text-gray-400">
                <Clock size={48} className="mx-auto mb-4 opacity-50" />
                <p>No classes scheduled for today.</p>
              </div>
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
                <p className="text-xs text-gray-500">PDF Notes or Video Links</p>
              </div>
              <ArrowRight size={16} className="ml-auto text-gray-300 group-hover:text-emerald-600" />
            </Link>

            <Link href="/teacher/exams/create" className="group p-4 bg-white border border-gray-200 rounded-xl hover:border-orange-500 hover:shadow-md transition-all flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition">
                <PenTool size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Create Exam</h3>
                <p className="text-xs text-gray-500">MCQ Quiz or Assignment</p>
              </div>
              <ArrowRight size={16} className="ml-auto text-gray-300 group-hover:text-orange-600" />
            </Link>

            <div className="bg-slate-900 text-white p-6 rounded-xl mt-4">
              <h3 className="font-bold text-lg mb-2">Teacher Tips</h3>
              <p className="text-slate-300 text-sm mb-4">
                Remember to upload the "Calculus Part 2" notes before Friday's class.
              </p>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 w-3/4 h-full rounded-full"></div>
              </div>
              <p className="text-xs text-slate-400 mt-2 text-right">75% Weekly Goal</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}