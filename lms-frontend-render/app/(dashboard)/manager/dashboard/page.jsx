import Link from "next/link";
import { 
  Users, QrCode, Banknote, ArrowUpRight, 
  Clock, AlertCircle, PlusCircle, Search 
} from "lucide-react";

export default function ManagerDashboard() {
  
  // Mock Data for "Recent Scans"
  const recentActivity = [
    { id: 1, student: "Kasun Perera", time: "10:45 AM", status: "Present", course: "A/L Combined Maths", type: "QR Scan" },
    { id: 2, student: "Amal Silva", time: "10:42 AM", status: "Late", course: "A/L Combined Maths", type: "Manual" },
    { id: 3, student: "Nimali Fernando", time: "10:40 AM", status: "Present", course: "A/L Physics", type: "QR Scan" },
    { id: 4, student: "Ruwan Dias", time: "10:38 AM", status: "Present", course: "A/L Physics", type: "QR Scan" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* 1. KEY METRICS (Live Stats) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Attendance Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Present Today</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">124</h3>
            </div>
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <Users size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-green-600 font-bold">
            <ArrowUpRight size={14} className="mr-1" />
            <span>+12 from yesterday</span>
          </div>
        </div>

        {/* Cash Collection Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Cash Collected</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">Rs. 45k</h3>
            </div>
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Banknote size={24} />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Updated just now
          </div>
        </div>

        {/* Active Classes Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Classes</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">03</h3>
            </div>
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <Clock size={24} />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Next break at 12:00 PM
          </div>
        </div>

        {/* Issue Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Payment Due</p>
              <h3 className="text-3xl font-bold text-red-600 mt-1">12</h3>
            </div>
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <AlertCircle size={24} />
            </div>
          </div>
          <div className="mt-4 text-xs text-red-600 font-bold cursor-pointer hover:underline">
            View List
          </div>
        </div>
      </div>

      {/* 2. QUICK ACTIONS (Big Buttons for Touchscreens) */}
      <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* The Main SCAN Button */}
        <Link href="/manager/scan" className="group relative bg-gradient-to-br from-indigo-600 to-blue-600 text-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <QrCode size={100} />
          </div>
          <QrCode size={40} className="mb-4 text-white" />
          <h3 className="text-2xl font-bold">Scan QR Code</h3>
          <p className="text-indigo-100 mt-2">Mark attendance for incoming students.</p>
        </Link>

        {/* Manual Payment Button */}
        <Link href="/manager/payments/new" className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm hover:border-indigo-500 hover:shadow-md transition-all group">
          <Banknote size={40} className="mb-4 text-green-600 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-bold text-gray-900">Collect Payment</h3>
          <p className="text-gray-500 mt-2">Record a cash payment manually.</p>
        </Link>

        {/* Enroll New Student Button */}
        <Link href="/manager/students/new" className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm hover:border-indigo-500 hover:shadow-md transition-all group">
          <PlusCircle size={40} className="mb-4 text-purple-600 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-bold text-gray-900">New Enrollment</h3>
          <p className="text-gray-500 mt-2">Register a walk-in student.</p>
        </Link>
      </div>

      {/* 3. LIVE ACTIVITY FEED */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-gray-900">Live Attendance Feed</h2>
          
          {/* Mini Search */}
          <div className="relative">
             <Search size={16} className="absolute left-3 top-3 text-gray-400" />
             <input 
               type="text" 
               placeholder="Search student..." 
               className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
             />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Class</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentActivity.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">{item.time}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{item.student}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.course}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs">
                      {item.type === 'QR Scan' ? <QrCode size={12}/> : <Users size={12}/>}
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 text-center">
          <button className="text-sm text-gray-500 hover:text-indigo-600 font-medium">View Full Attendance Log</button>
        </div>
      </div>

    </div>
  );
}
