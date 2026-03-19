"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Receipt, Download, Loader2, AlertCircle,
  CheckCircle, RefreshCw, Wifi, Building2,
  DollarSign, BookOpen, Calendar, ChevronDown, CreditCard
} from "lucide-react";
import { guardRoute, authFetch } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function StudentPaymentHistoryPage() {
  const router = useRouter();
  const [user, setUser]           = useState(null);
  const [payments, setPayments]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [exporting, setExporting] = useState(false);
  const [filterMonth, setFilterMonth] = useState("ALL");

  useEffect(() => {
    const auth = guardRoute("STUDENT", router);
    if (auth) { setUser(auth); fetchPayments(auth.user_id); }
  }, [router]);

  async function fetchPayments(studentId) {
    setLoading(true);
    setError("");
    try {
      const res  = await authFetch(`${API}/payments/history/${studentId}`);
      const data = await res.json();
      if (data.success) setPayments(data.payments);
      else setError(data.error || "Failed to load payment history.");
    } catch { setError("Network error."); }
    finally { setLoading(false); }
  }

  // Month options derived from payment dates
  const monthOptions = Array.from(new Set(
    payments.map(p => {
      const d = new Date(p.payment_date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    })
  )).sort().reverse();

  const filtered = filterMonth === "ALL"
    ? payments
    : payments.filter(p => {
        const d = new Date(p.payment_date);
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}` === filterMonth;
      });

  const totalSpent    = payments.reduce((s, p) => s + parseFloat(p.amount || 0), 0);
  const filteredTotal = filtered.reduce((s, p) => s + parseFloat(p.amount || 0), 0);

  /* ── CSV export ── */
  function exportToCSV() {
    setExporting(true);
    try {
      const headers = ["Payment ID", "Course", "Amount (Rs.)", "Method", "Date & Time"];
      const rows = filtered.map(p => [
        p.payment_id,
        p.course_title,
        parseFloat(p.amount).toFixed(2),
        p.payment_type === "ONLINE" ? "Online (PayHere)" : "Cash at Counter",
        new Date(p.payment_date).toLocaleString("en-US", {
          year: "numeric", month: "short", day: "numeric",
          hour: "2-digit", minute: "2-digit"
        }),
      ]);
      const summary = [
        [],
        ["--- SUMMARY ---"],
        ["Student",           user?.name || ""],
        ["Student ID",        user?.user_id || ""],
        ["Total Records",     filtered.length],
        ["Total Spent (Rs.)", filteredTotal.toFixed(2)],
        ["Exported On",       new Date().toLocaleString("en-US")],
      ];
      const escape = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
      const csv    = [...[headers, ...rows, ...summary].map(r => r.map(escape).join(","))].join("\n");
      const blob   = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url    = URL.createObjectURL(blob);
      const a      = document.createElement("a");
      const label  = filterMonth === "ALL" ? "all" : filterMonth;
      a.href = url; a.download = `payment-history-${label}.csv`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally { setTimeout(() => setExporting(false), 800); }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Receipt className="text-blue-600" size={26} /> Payment History
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">All your course payment records.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => router.push("/student/payments")}
            className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg hover:bg-blue-100"
          >
            <CreditCard size={14} /> Pay for Course
          </button>
          <button
            onClick={() => user && fetchPayments(user.user_id)}
            className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={exportToCSV}
            disabled={exporting || filtered.length === 0}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
          <AlertCircle size={16}/>{error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Payments",   val: payments.length,   color: "text-blue-600",   bg: "bg-blue-50",   icon: <BookOpen size={18}/> },
          { label: "Total Spent",      val: `Rs. ${totalSpent.toLocaleString()}`, color: "text-green-600", bg: "bg-green-50", icon: <DollarSign size={18}/> },
          { label: "Online Payments",  val: payments.filter(p => p.payment_type === "ONLINE").length, color: "text-indigo-600", bg: "bg-indigo-50", icon: <Wifi size={18}/> },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`${s.bg} ${s.color} p-2.5 rounded-xl flex-shrink-0`}>{s.icon}</div>
            <div>
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className={`text-xl font-bold ${s.color} mt-0.5`}>{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Month filter */}
      {monthOptions.length > 1 && (
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <select
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              className="pl-8 pr-8 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 appearance-none cursor-pointer"
            >
              <option value="ALL">All Months</option>
              {monthOptions.map(m => {
                const [y, mo] = m.split("-");
                const label = new Date(parseInt(y), parseInt(mo)-1).toLocaleString("en-US", { month: "long", year: "numeric" });
                return <option key={m} value={m}>{label}</option>;
              })}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
          </div>
          {filterMonth !== "ALL" && (
            <button onClick={() => setFilterMonth("ALL")} className="text-xs text-blue-600 hover:underline">Clear</button>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
          <Loader2 size={20} className="animate-spin"/> Loading payment history…
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100 text-gray-400">
          <Receipt size={48} className="mx-auto mb-3 opacity-20"/>
          <p className="font-medium">No payments yet.</p>
          <p className="text-sm mt-1 mb-4">Enroll in a course to get started.</p>
          <button
            onClick={() => router.push("/student/payments")}
            className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700"
          >
            <CreditCard size={14}/> Browse & Pay Courses
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100 text-gray-400">
          <Receipt size={40} className="mx-auto mb-3 opacity-20"/>
          <p className="font-medium">No payments in this period.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-6">
            <span className="text-sm text-gray-500">
              Showing <span className="font-bold text-gray-800">{filtered.length}</span> {filtered.length === 1 ? "payment" : "payments"}
            </span>
            <span className="text-sm text-gray-500">
              {filterMonth !== "ALL" ? "Period " : ""}Total:{" "}
              <span className="font-bold text-green-600">Rs. {filteredTotal.toLocaleString()}</span>
            </span>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-gray-50 sm:hidden">
            {filtered.map(p => (
              <div key={p.payment_id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold text-gray-800 text-sm">{p.course_title}</p>
                  <span className="font-bold text-green-600 text-sm">Rs. {parseFloat(p.amount).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${p.payment_type==="ONLINE"?"bg-blue-100 text-blue-700":"bg-orange-100 text-orange-700"}`}>
                    {p.payment_type==="ONLINE"?<Wifi size={10}/>:<Building2 size={10}/>}
                    {p.payment_type==="ONLINE"?"Online":"Cash"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(p.payment_date).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"})}
                  </span>
                  <span className="text-xs font-mono text-gray-300">{p.payment_id}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Course","Amount","Method","Date","Payment ID"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => (
                  <tr key={p.payment_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookOpen size={14}/>
                        </div>
                        <p className="font-medium text-gray-800">{p.course_title}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-green-600 text-base">Rs. {parseFloat(p.amount).toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${p.payment_type==="ONLINE"?"bg-blue-100 text-blue-700":"bg-orange-100 text-orange-700"}`}>
                        {p.payment_type==="ONLINE"?<Wifi size={11}/>:<Building2 size={11}/>}
                        {p.payment_type==="ONLINE"?"Online (PayHere)":"Cash at Counter"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(p.payment_date).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"})}
                      <br/>
                      <span className="text-gray-400">{new Date(p.payment_date).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={13} className="text-green-500"/>
                        <span className="text-xs font-mono text-gray-400">{p.payment_id}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer total */}
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
            <span className="text-sm font-bold text-gray-700">
              Total Spent: <span className="text-green-600">Rs. {filteredTotal.toLocaleString()}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
