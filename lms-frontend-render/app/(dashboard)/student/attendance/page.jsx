"use client";
import { Calendar, CheckCircle, XCircle, Clock, PieChart } from "lucide-react";

export default function MyAttendance() {
  
  // MOCK DATA
  const history = [
    { id: 1, date: "2026-02-01", course: "Combined Maths", status: "Present", time: "08:05 AM" },
    { id: 2, date: "2026-01-28", course: "Physics", status: "Present", time: "01:00 PM" },
    { id: 3, date: "2026-01-25", course: "Combined Maths", status: "Late", time: "08:45 AM" },
    { id: 4, date: "2026-01-21", course: "Physics", status: "Absent", time: "-" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>

      {/* 1. STATS OVERVIEW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">85%</div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Attendance</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
          <div className="text-3xl font-bold text-green-600 mb-1">12</div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Days Present</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-1">02</div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Days Late</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
          <div className="text-3xl font-bold text-red-600 mb-1">01</div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Days Absent</div>
        </div>
      </div>

      {/* 2. HISTORY LIST */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Calendar size={20} className="text-gray-400" /> Recent History
          </h2>
        </div>
        
        <div className="divide-y divide-gray-100">
          {history.map((record) => (
            <div key={record.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
              
              {/* Left Side: Date & Course */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-600 font-bold border border-gray-200">
                  <span className="text-xs uppercase">{new Date(record.date).toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-lg leading-none">{new Date(record.date).getDate()}</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{record.course}</h3>
                  <p className="text-xs text-gray-500">Checked in at: <span className="font-mono">{record.time}</span></p>
                </div>
              </div>

              {/* Right Side: Status Indicator */}
              <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border ${
                record.status === "Present" ? "bg-green-50 text-green-700 border-green-200" :
                record.status === "Late" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                "bg-red-50 text-red-700 border-red-200"
              }`}>
                {record.status === "Present" && <CheckCircle size={12} />}
                {record.status === "Late" && <Clock size={12} />}
                {record.status === "Absent" && <XCircle size={12} />}
                {record.status}
              </div>

            </div>
          ))}
        </div>
        
        <div className="bg-gray-50 p-4 text-center">
          <button className="text-sm text-blue-600 font-bold hover:underline">View All History</button>
        </div>
      </div>

    </div>
  );
}