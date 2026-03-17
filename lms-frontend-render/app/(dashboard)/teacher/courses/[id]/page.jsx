"use client";
import { useState } from "react";
import { 
  Plus, Edit3, Trash2, Video, FileText, 
  MoreVertical, Eye, BarChart 
} from "lucide-react";

export default function TeacherCourseManage({ params }) {
  
  // Mock Data
  const [materials, setMaterials] = useState([
    { id: 1, title: "01. Complex Numbers", type: "video", views: 142, date: "2026-02-01" },
    { id: 2, title: "01. Complex Numbers - Tute PDF", type: "pdf", downloads: 130, date: "2026-02-01" },
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">A/L Combined Mathematics</h1>
          <p className="text-sm text-gray-500">Manage course content, assignments and live sessions.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 shadow-sm transition">
            <Plus size={18} /> Add Material
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 shadow-sm transition">
            <Video size={18} /> Start Live
          </button>
        </div>
      </div>

      {/* 2. STATS BAR */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-500 font-bold uppercase">Total Students</p>
          <p className="text-2xl font-bold text-slate-800">452</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-500 font-bold uppercase">Avg. Attendance</p>
          <p className="text-2xl font-bold text-emerald-600">88%</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
           <p className="text-xs text-gray-500 font-bold uppercase">Assignments Submitted</p>
          <p className="text-2xl font-bold text-blue-600">320</p>
        </div>
      </div>

      {/* 3. CONTENT LIST (Management Mode) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-gray-700">Course Materials</h3>
          <span className="text-xs text-gray-500">Drag and drop to reorder</span>
        </div>

        <div className="divide-y divide-gray-100">
          {materials.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50 group">
              
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${item.type === 'video' ? 'bg-purple-100 text-purple-600' : 'bg-red-100 text-red-600'}`}>
                  {item.type === 'video' ? <Video size={20} /> : <FileText size={20} />}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{item.title}</h4>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                    <span>Uploaded: {item.date}</span>
                    <span className="flex items-center gap-1">
                      <Eye size={12} /> {item.type === 'video' ? `${item.views} Views` : `${item.downloads} Downloads`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="View Stats">
                   <BarChart size={18} />
                </button>
                <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Edit">
                   <Edit3 size={18} />
                </button>
                <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                   <Trash2 size={18} />
                </button>
              </div>

            </div>
          ))}
        </div>
        
        {materials.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-400">No content uploaded yet.</p>
            <button className="mt-2 text-emerald-600 font-bold text-sm hover:underline">Upload your first video</button>
          </div>
        )}
      </div>

    </div>
  );
}