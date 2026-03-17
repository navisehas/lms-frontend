"use client";
import { useState, useEffect } from "react";
import { 
  Calendar, Download, Filter, Users, BookOpen, 
  TrendingUp, TrendingDown, CheckCircle, XCircle 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

export default function AttendanceReport() {
  // --- STATE ---
  const [reportType, setReportType] = useState("DAILY"); // DAILY, WEEKLY, MONTHLY
  const [viewBy, setViewBy] = useState("COURSE"); // COURSE, STUDENT
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  // Mock Data State
  const [summaryData, setSummaryData] = useState({ present: 0, absent: 0, percentage: 0, totalSessions: 0 });
  const [chartData, setChartData] = useState([]);
  const [tableData, setTableData] = useState([]);

  // Colors for Charts
  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

  // --- MOCK DATA GENERATOR (Replace with actual API call) ---
  useEffect(() => {
    generateMockData();
  }, [reportType, viewBy, startDate, endDate]);

  const generateMockData = () => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      // 1. Summary Metrics
      const present = Math.floor(Math.random() * 500) + 800;
      const absent = Math.floor(Math.random() * 100) + 50;
      const total = present + absent;
      const percentage = ((present / total) * 100).toFixed(1);
      
      setSummaryData({
        present,
        absent,
        percentage,
        totalSessions: Math.floor(Math.random() * 20) + 10
      });

      // 2. Chart Data (Trend over time)
      const mockChart = [];
      const dataPoints = reportType === 'DAILY' ? 7 : reportType === 'WEEKLY' ? 4 : 6;
      const labels = reportType === 'DAILY' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] 
                   : reportType === 'WEEKLY' ? ['Week 1', 'Week 2', 'Week 3', 'Week 4'] 
                   : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

      for (let i = 0; i < dataPoints; i++) {
        mockChart.push({
          name: labels[i % labels.length],
          Present: Math.floor(Math.random() * 80) + 40,
          Absent: Math.floor(Math.random() * 20) + 5,
        });
      }
      setChartData(mockChart);

      // 3. Table Data (Student or Course breakdown)
      const mockTable = [];
      const itemsCount = viewBy === 'COURSE' ? 5 : 10;
      for (let i = 1; i <= itemsCount; i++) {
        const p = Math.floor(Math.random() * 100) + 20;
        const a = Math.floor(Math.random() * 15) + 1;
        mockTable.push({
          id: i,
          name: viewBy === 'COURSE' ? `Spoken English Batch ${i}` : `Student Name ${i}`,
          identifier: viewBy === 'COURSE' ? `CRS-${100+i}` : `STU-${900+i}`,
          present: p,
          absent: a,
          total: p + a,
          percentage: ((p / (p + a)) * 100).toFixed(1)
        });
      }
      setTableData(mockTable);
      setLoading(false);
    }, 600);
  };

  const pieData = [
    { name: 'Present', value: summaryData.present },
    { name: 'Absent', value: summaryData.absent },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Reports</h1>
          <p className="text-sm text-gray-500">Analyze student participation and class attendance trends.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition shadow-sm">
          <Download size={18} /> Export Report
        </button>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Report Period</label>
          <select 
            value={reportType} onChange={(e) => setReportType(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">View By</label>
          <select 
            value={viewBy} onChange={(e) => setViewBy(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="COURSE">Course / Batch</option>
            <option value="STUDENT">Individual Student</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Start Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            <input 
              type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">End Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            <input 
              type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Attendance Rate</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{summaryData.percentage}%</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><TrendingUp size={24} /></div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Present</p>
              <h3 className="text-3xl font-bold text-green-600 mt-1">{summaryData.present}</h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-lg"><CheckCircle size={24} /></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Absent</p>
              <h3 className="text-3xl font-bold text-red-600 mt-1">{summaryData.absent}</h3>
            </div>
            <div className="p-3 bg-red-50 text-red-600 rounded-lg"><XCircle size={24} /></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Classes Monitored</p>
              <h3 className="text-3xl font-bold text-purple-600 mt-1">{summaryData.totalSessions}</h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><BookOpen size={24} /></div>
          </div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Attendance Trend ({reportType.toLowerCase()})</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{fill: '#f3f4f6'}}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="Present" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Overall Ratio</h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#ef4444'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">
            {viewBy === 'COURSE' ? 'Course-wise Breakdown' : 'Student-wise Breakdown'}
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">{viewBy === 'COURSE' ? 'Course Name' : 'Student Name'}</th>
                <th className="px-6 py-4">{viewBy === 'COURSE' ? 'Course ID' : 'Student ID'}</th>
                <th className="px-6 py-4 text-center">Total Sessions</th>
                <th className="px-6 py-4 text-center text-green-600">Present</th>
                <th className="px-6 py-4 text-center text-red-600">Absent</th>
                <th className="px-6 py-4 text-right">Attendance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-400">Loading data...</td></tr>
              ) : tableData.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-400">No data found for this period.</td></tr>
              ) : (
                tableData.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-3">
                      {viewBy === 'COURSE' ? <BookOpen size={18} className="text-blue-500"/> : <Users size={18} className="text-blue-500"/>}
                      {row.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-500 text-xs">{row.identifier}</td>
                    <td className="px-6 py-4 text-center font-medium">{row.total}</td>
                    <td className="px-6 py-4 text-center text-green-600 font-bold">{row.present}</td>
                    <td className="px-6 py-4 text-center text-red-600 font-bold">{row.absent}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                        row.percentage >= 75 ? 'bg-green-100 text-green-700' : 
                        row.percentage >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {row.percentage}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}