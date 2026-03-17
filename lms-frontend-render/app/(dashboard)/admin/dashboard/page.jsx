import Link from "next/link";
import { 
  Users, DollarSign, BookOpen, Activity, 
  TrendingUp, ArrowRight, UserPlus 
} from "lucide-react";

export default function AdminDashboard() {
  
  // MOCK DATA for Chart/List
  const recentPayments = [
    { id: 1, student: "Kasun Perera", amount: "Rs. 3,500", date: "Just now", method: "Online (PayHere)" },
    { id: 2, student: "Amal Silva", amount: "Rs. 3,000", date: "5 mins ago", method: "Cash (Counter)" },
    { id: 3, student: "Nimali Fernando", amount: "Rs. 2,500", date: "1 hour ago", method: "Online (PayHere)" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* 1. FINANCIAL & USER STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">Rs. 1.2M</h3>
            </div>
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <DollarSign size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-green-600 font-bold">
            <TrendingUp size={14} className="mr-1" />
            <span>+15% from last month</span>
          </div>
        </div>

        {/* Total Students */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">1,250</h3>
            </div>
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Users size={24} />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            54 new enrollments this week
          </div>
        </div>

        {/* Active Courses */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Courses</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">24</h3>
            </div>
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <BookOpen size={24} />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Across 3 main departments
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">System Status</p>
              <h3 className="text-xl font-bold text-gray-900 mt-2">Operational</h3>
            </div>
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <Activity size={24} />
            </div>
          </div>
          <div className="mt-4 text-xs text-emerald-600 font-bold">
            All services running
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* 2. RECENT FINANCIAL ACTIVITY (2/3 Width) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
            <Link href="/admin/finance" className="text-sm text-blue-600 hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3">Student</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Method</th>
                  <th className="px-6 py-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{pay.student}</td>
                    <td className="px-6 py-4 text-sm text-green-600 font-bold">{pay.amount}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{pay.method}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{pay.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. QUICK ACTIONS (1/3 Width) */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Management</h2>
            <div className="space-y-3">
              <Link href="/admin/users/new" className="flex items-center justify-between p-3 rounded-lg border hover:border-blue-500 hover:bg-blue-50 transition group">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                    <UserPlus size={18} />
                  </div>
                  <span className="font-medium text-gray-700">Add New User</span>
                </div>
                <ArrowRight size={16} className="text-gray-400 group-hover:text-blue-600" />
              </Link>

              <Link href="/admin/courses/new" className="flex items-center justify-between p-3 rounded-lg border hover:border-purple-500 hover:bg-purple-50 transition group">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 text-purple-600 p-2 rounded-full">
                    <BookOpen size={18} />
                  </div>
                  <span className="font-medium text-gray-700">Create Course</span>
                </div>
                <ArrowRight size={16} className="text-gray-400 group-hover:text-purple-600" />
              </Link>
            </div>
          </div>

          <div className="bg-gray-900 text-white p-6 rounded-xl">
            <h3 className="font-bold text-lg mb-2">System Update</h3>
            <p className="text-gray-400 text-sm mb-4">
              A new security patch (v2.4.0) is available for the PayHere integration.
            </p>
            <button className="w-full bg-white text-gray-900 text-sm font-bold py-2 rounded-lg hover:bg-gray-100">
              View Changelog
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}