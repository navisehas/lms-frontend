"use client";
import { useState } from "react";
import { 
  Calendar, Search, Download, Filter, 
  BarChart2, Users, AlertCircle 
} from "lucide-react";

const getLocalISODate = (value = new Date()) => {
  const offsetMs = value.getTimezoneOffset() * 60000;
  return new Date(value.getTime() - offsetMs).toISOString().slice(0, 10);
};

export default function AdminAttendance() {
  
  // 1. MOCK DATA
  const attendanceLogs = [
    { id: 1, date: "2026-02-03", student: "Kasun Perera", course: "A/L Maths", status: "Present", method: "QR Scan" },
    { id: 2, date: "2026-02-03", student: "Amal Silva", course: "A/L Maths", status: "Late", method: "Manual" },
    { id: 3, date: "2026-02-03", student: "Nimali Fernando", course: "A/L Physics", status: "Absent", method: "-" },
    { id: 4, date: "2026-02-03", student: "Ruwan Dias", course: "A/L Maths", status: "Present", method: "QR Scan" },
  ];

  const [date, setDate] = useState(getLocalISODate());

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Reports</h1>
          <p className="text-sm text-gray-500">Monitor institute-wide attendance and generate monthly reports.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
            <Filter size={16} /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* 2. ANALYTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Average Attendance</p>
              <h3 className="text-3xl font-bold text-gray-900">88%</h3>
            </div>
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <BarChart2 size={24} />
            </div>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
             <div className="bg-green-500 h-full w-[88%]"></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
           <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Present Today</p>
              <h3 className="text-3xl font-bold text-gray-900">412</h3>
            </div>
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Users size={24} />
            </div>
          </div>
          <p className="text-xs text-blue-600 font-bold">+24 from last week</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
           <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Absentees</p>
              <h3 className="text-3xl font-bold text-red-600">45</h3>
            </div>
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <AlertCircle size={24} />
            </div>
          </div>
          <p className="text-xs text-red-500">SMS Notifications sent</p>
        </div>
      </div>

      {/* 3. DETAILED LOG TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Filters */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-4 items-center">
          <div className="relative">
             <Search size={16} className="absolute left-3 top-3 text-gray-400"/>
             <input type="text" placeholder="Search Student..." className="pl-9 pr-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 w-64"/>
          </div>
          <div className="flex items-center gap-2">
             <Calendar size={16} className="text-gray-500"/>
             <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border rounded-lg px-3 py-2 text-sm outline-none"/>
          </div>
          <select className="border rounded-lg px-3 py-2 text-sm outline-none bg-white">
             <option>All Courses</option>
             <option>A/L Combined Maths</option>
             <option>A/L Physics</option>
          </select>
        </div>

        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-6 py-4 border-b">Date</th>
              <th className="px-6 py-4 border-b">Student</th>
              <th className="px-6 py-4 border-b">Course</th>
              <th className="px-6 py-4 border-b">Method</th>
              <th className="px-6 py-4 border-b">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {attendanceLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-500 font-mono">{log.date}</td>
                <td className="px-6 py-4 font-bold text-gray-900">{log.student}</td>
                <td className="px-6 py-4 text-gray-600">{log.course}</td>
                <td className="px-6 py-4 text-gray-500 text-xs">{log.method}</td>
                <td className="px-6 py-4">
                   <span className={`px-2 py-1 rounded text-xs font-bold ${
                     log.status === 'Present' ? 'bg-green-100 text-green-700' :
                     log.status === 'Late' ? 'bg-yellow-100 text-yellow-700' :
                     'bg-red-100 text-red-700'
                   }`}>
                     {log.status}
                   </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="p-4 bg-gray-50 text-center border-t text-sm text-gray-500">
           Showing {attendanceLogs.length} Records
        </div>
      </div>
    </div>
  );
}