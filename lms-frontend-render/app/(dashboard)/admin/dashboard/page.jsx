"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, DollarSign, BookOpen, Activity, 
  TrendingUp, ArrowRight, UserPlus, AlertCircle
} from "lucide-react";
import { getUser } from "@/lib/auth";

export default function AdminDashboard() {
  // --- Dynamic States ---
  const [greeting, setGreeting] = useState("Hello");
  const [adminName, setAdminName] = useState("Admin");
  
  // 1. HARDCODED STATS
  const [stats] = useState({
    monthlyRevenue: 1754000, // Rs. 1,254,000
    revenueGrowth: 12.5,     // +12.5%
    totalStudents: 540,
    newStudents: 42,
    activeCourses: 6,
    systemStatus: "Operational"
  });
  
  // 2. HARDCODED RECENT TRANSACTIONS
  const [recentPayments] = useState([
    { transaction_id: "TXN-001", student_name: "THisen Nambukara", amount: 3500, method: "Card (PayHere)", created_at: new Date().toISOString() },
    { transaction_id: "TXN-002", student_name: "Naviru Sehas", amount: 2500, method: "Bank Transfer", created_at: new Date(Date.now() - 15 * 60000).toISOString() },
    { transaction_id: "TXN-003", student_name: "Sajana Hasanga", amount: 4000, method: "Cash", created_at: new Date(Date.now() - 45 * 60000).toISOString() },
    { transaction_id: "TXN-004", student_name: "Tharidi Gamage", amount: 3000, method: "Card (PayHere)", created_at: new Date(Date.now() - 120 * 60000).toISOString() },
    { transaction_id: "TXN-005", student_name: "Yasindu Mihiranga", amount: 3500, method: "Card (PayHere)", created_at: new Date(Date.now() - 180 * 60000).toISOString() },
  ]);

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

    // 2. Get Current Admin Name
    const user = getUser();
    if (user && user.name) {
      setAdminName(user.name.split(" ")[0] || "Admin"); 
    }
  }, []);

  // Helper to format timestamps to readable time (e.g., "10:30 AM")
  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* WELCOME GREETING */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{greeting}, {adminName}! 👋</h1>
        <p className="text-gray-500 mt-1">Here is your system overview for today.</p>
      </div>

      {/* 1. FINANCIAL & USER STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">
                Rs. {stats.monthlyRevenue.toLocaleString()}
              </h3>
            </div>
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <DollarSign size={24} />
            </div>
          </div>
          <div className={`mt-4 flex items-center text-xs font-bold ${stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp size={14} className={`mr-1 ${stats.revenueGrowth < 0 && 'rotate-180'}`} />
            <span>{stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth}% from last month</span>
          </div>
        </div>

        {/* Total Students */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">
                {stats.totalStudents.toLocaleString()}
              </h3>
            </div>
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Users size={24} />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            <span className="font-bold text-blue-600">+{stats.newStudents}</span> new enrollments this week
          </div>
        </div>

        {/* Active Courses */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Courses</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">
                {stats.activeCourses}
              </h3>
            </div>
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <BookOpen size={24} />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Across all departments
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">System Status</p>
              <h3 className={`text-xl font-bold mt-2 ${stats.systemStatus === 'Operational' ? 'text-gray-900' : 'text-red-600'}`}>
                {stats.systemStatus}
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${stats.systemStatus === 'Operational' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
              {stats.systemStatus === 'Operational' ? <Activity size={24} /> : <AlertCircle size={24} />}
            </div>
          </div>
          <div className={`mt-4 text-xs font-bold ${stats.systemStatus === 'Operational' ? 'text-emerald-600' : 'text-red-600'}`}>
            {stats.systemStatus === 'Operational' ? 'All services running' : 'Attention required'}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* 2. RECENT FINANCIAL ACTIVITY (2/3 Width) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
            <Link href="/admin/finance" className="text-sm text-blue-600 hover:underline font-medium">View All</Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3 font-semibold">Student</th>
                  <th className="px-6 py-3 font-semibold">Amount</th>
                  <th className="px-6 py-3 font-semibold">Method</th>
                  <th className="px-6 py-3 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentPayments.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      No recent transactions found.
                    </td>
                  </tr>
                ) : (
                  recentPayments.map((pay, idx) => (
                    <tr key={pay.transaction_id || idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">{pay.student_name}</td>
                      <td className="px-6 py-4 text-sm text-green-600 font-bold">Rs. {pay.amount?.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{pay.method}</td>
                      <td className="px-6 py-4 text-sm text-gray-400 font-mono">{formatTime(pay.created_at)}</td>
                    </tr>
                  ))
                )}
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

          <div className="bg-gray-900 text-white p-6 rounded-xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-2">System Update</h3>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                A new security patch (v2.4.0) is available for the PayHere integration.
              </p>
              <button className="w-full bg-white text-gray-900 text-sm font-bold py-2.5 rounded-lg hover:bg-gray-100 transition shadow-sm">
                View Changelog
              </button>
            </div>
            {/* Background design elements */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-white opacity-5 rounded-full blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-white opacity-5 rounded-full blur-lg"></div>
          </div>
        </div>

      </div>
    </div>
  );
}