"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Receipt, Search, Filter, ChevronDown, RefreshCw,
  CheckCircle, AlertCircle, Loader, Download,
  Banknote, Wifi, Building2, Users, DollarSign, TrendingUp
} from "lucide-react";
import { guardRoute, authFetch } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [user, setUser]         = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [search, setSearch]     = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [exporting, setExporting]   = useState(false);

  useEffect(() => {
    const auth = guardRoute("ADMIN", router);
    if (auth) { setUser(auth); fetchPayments(); }
  }, [router]);

  async function fetchPayments() {
    setLoading(true);
    try {
      const res  = await authFetch(`${API}/payments/admin/all`);
      const data = await res.json();
      if (data.success) setPayments(data.payments);
      else setError(data.error || "Failed to load payments.");
    } catch { setError("Network error."); }
    finally { setLoading(false); }
  }

  const filtered = payments.filter(p => {
    const q = search.toLowerCase();
    const matchSearch =
      (p.student_name || "").toLowerCase().includes(q) ||
      (p.student_id   || "").toLowerCase().includes(q) ||
      (p.course_title || "").toLowerCase().includes(q) ||
      (p.payment_id   || "").toLowerCase().includes(q);
    const matchType =
      filterType === "ALL" ||
      (filterType === "ONLINE" && p.payment_type === "ONLINE") ||
      (filterType === "CASH"   && p.payment_type === "CASH");
    return matchSearch && matchType;
  });

  const stats = {
    total:    payments.length,
    revenue:  payments.reduce((s, p) => s + parseFloat(p.amount || 0), 0),
    online:   payments.filter(p => p.payment_type === "ONLINE").length,
    cash:     payments.filter(p => p.payment_type === "CASH").length,
  };

  /* ── Excel export (pure JS, no library needed) ── */
  function exportToExcel() {
    setExporting(true);
    try {
      const headers = ["Payment ID", "Student Name", "Student ID", "Course", "Amount (Rs.)", "Method", "Date"];
      const rows = filtered.map(p => [
        p.payment_id,
        p.student_name,
        p.student_id,
        p.course_title,
        parseFloat(p.amount).toFixed(2),
        p.payment_type === "ONLINE" ? "Online (PayHere)" : "Cash at Counter",
        new Date(p.payment_date).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      ]);

      /* Build CSV (Excel opens .csv natively) */
      const escape = v => `"${String(v).replace(/"/g, '""')}"`;
      const csv = [headers, ...rows].map(r => r.map(escape).join(",")).join("\n");
      const BOM = "\uFEFF"; // UTF-8 BOM so Excel reads Sri Lankan chars correctly
      const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `payment-history-${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setTimeout(() => setExporting(false), 800);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Receipt className="text-blue-600" size={26} /> Payment History
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">View all payment records and export to Excel.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchPayments}
            className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={exportToExcel} disabled={exporting || filtered.length === 0}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            {exporting ? <Loader size={14} className="animate-spin" /> : <Download size={14} />}
            Export Excel
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total Payments", val: stats.total,                              color: "text-blue-600",   bg: "bg-blue-50",   icon: <Receipt size={18} /> },
          { label: "Total Revenue",  val: `Rs. ${stats.revenue.toLocaleString()}`,  color: "text-green-600",  bg: "bg-green-50",  icon: <DollarSign size={18} /> },
          { label: "Online",         val: stats.online,                             color: "text-indigo-600", bg: "bg-indigo-50", icon: <Wifi size={18} /> },
          { label: "Cash",           val: stats.cash,                               color: "text-orange-600", bg: "bg-orange-50", icon: <Building2 size={18} /> },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`${s.color} ${s.bg} p-2 rounded-lg flex-shrink-0`}>{s.icon}</div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 truncate">{s.label}</p>
              <p className={`text-lg font-bold ${s.color} truncate`}>{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by student, course, or payment ID…"
            className="w-full pl-9 pr-4 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="pl-8 pr-8 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 appearance-none cursor-pointer">
            <option value="ALL">All Methods</option>
            <option value="ONLINE">Online (PayHere)</option>
            <option value="CASH">Cash at Counter</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
          <Loader size={20} className="animate-spin" /> Loading payment records…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100 text-gray-400">
          <Receipt size={48} className="mx-auto mb-3 opacity-20" />
          <p className="font-medium">{search || filterType !== "ALL" ? "No payments match your filter." : "No payment records yet."}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Summary row */}
          <div className="flex flex-wrap items-center gap-6 px-5 py-3 bg-gray-50 border-b border-gray-100 text-sm">
            <span className="text-gray-500">Showing <span className="font-bold text-gray-800">{filtered.length}</span> of {payments.length} records</span>
            <span className="text-gray-500">Filtered total: <span className="font-bold text-green-600">Rs. {filtered.reduce((s,p) => s + parseFloat(p.amount||0), 0).toLocaleString()}</span></span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Student", "Course", "Amount", "Method", "Date", "Ref ID"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => (
                  <tr key={p.payment_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-gray-800">{p.student_name}</p>
                      <p className="text-xs font-mono text-gray-400">{p.student_id}</p>
                    </td>
                    <td className="px-5 py-3.5 max-w-[180px]">
                      <p className="text-gray-700 truncate">{p.course_title}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-green-600">Rs. {parseFloat(p.amount).toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        p.payment_type === "ONLINE"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-orange-100 text-orange-700"
                      }`}>
                        {p.payment_type === "ONLINE" ? <Wifi size={11} /> : <Building2 size={11} />}
                        {p.payment_type === "ONLINE" ? "Online" : "Cash"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(p.payment_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      <br />
                      <span className="text-gray-400">{new Date(p.payment_date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono text-gray-300">{p.payment_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}