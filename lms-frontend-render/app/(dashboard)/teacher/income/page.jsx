"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp, DollarSign, Download, Loader, AlertCircle,
  RefreshCw, Calendar, ChevronDown, BarChart2, Receipt, Info
} from "lucide-react";
import { guardRoute, authFetch } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function TeacherIncomePage() {
  const router = useRouter();
  const [user, setUser]         = useState(null);
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [exporting, setExporting] = useState(false);
  const [viewMode, setViewMode]   = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState("ALL");
  const [expandedMonth, setExpandedMonth] = useState(null);

  useEffect(() => {
    const auth = guardRoute("TEACHER", router);
    if (auth) { setUser(auth); fetchIncome(auth.user_id); }
  }, [router]);

  async function fetchIncome(teacherId) {
    setLoading(true);
    setError("");
    try {
      const res  = await authFetch(`${API}/income/teacher/${teacherId}/monthly`);
      const json = await res.json();
      if (json.success) setData(json);
      else setError(json.error || "Failed to load income data.");
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  const monthly      = data?.monthly || [];
  const totals       = data?.totals  || {};
  const teacherPct   = data?.teacher_share_pct || 80;
  const institutePct = data?.institute_share_pct || 20;

  const currentMonthKey = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  })();
  const currentMonth = monthly.find(m => m.month_key === currentMonthKey);
  const bestMonth    = monthly.reduce((best, m) => m.teacher_income > (best?.teacher_income || 0) ? m : best, null);

  const allPayments = monthly.flatMap(m => m.payments || []);
  const filteredPayments = selectedMonth === "ALL"
    ? allPayments
    : (monthly.find(m => m.month_key === selectedMonth)?.payments || []);

  function exportMonthly() {
    setExporting(true);
    try {
      const headers = ["Month","Total Payments","Gross Amount (Rs.)",`Your Share ${teacherPct}% (Rs.)`,`Institute ${institutePct}% (Rs.)`];
      const rows    = monthly.map(m=>[m.month_label,m.payment_count,m.gross_total.toFixed(2),m.teacher_income.toFixed(2),m.institute_cut.toFixed(2)]);
      const summary = [[],["--- TOTALS ---"],["All Time",totals.payment_count,totals.gross_total?.toFixed(2),totals.teacher_income?.toFixed(2),totals.institute_cut?.toFixed(2)]];
      const escape  = v=>`"${String(v??"").replace(/"/g,'""')}"`;
      const csv     = [...[headers,...rows,...summary].map(r=>r.map(escape).join(","))].join("\n");
      const blob    = new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});
      const url     = URL.createObjectURL(blob);
      const a       = document.createElement("a");
      a.href=url; a.download=`teacher-monthly-income-${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);a.click();document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally { setTimeout(()=>setExporting(false),800); }
  }

  function exportDetailed() {
    setExporting(true);
    try {
      const headers = ["Payment ID","Student Name","Student ID","Course","Gross Amount (Rs.)",`Your Share ${teacherPct}% (Rs.)`,"Method","Date"];
      const rows    = filteredPayments.map(p=>[p.payment_id,p.student_name,p.student_id,p.course_title,parseFloat(p.amount).toFixed(2),parseFloat(p.teacher_share).toFixed(2),p.payment_type==="ONLINE"?"Online":"Cash",new Date(p.payment_date).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"})]);
      const escape  = v=>`"${String(v??"").replace(/"/g,'""')}"`;
      const csv     = [...[headers,...rows].map(r=>r.map(escape).join(","))].join("\n");
      const blob    = new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});
      const url     = URL.createObjectURL(blob);
      const a       = document.createElement("a");
      a.href=url; a.download=`teacher-income-${selectedMonth==="ALL"?"all-time":selectedMonth}.csv`;
      document.body.appendChild(a);a.click();document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally { setTimeout(()=>setExporting(false),800); }
  }

  const fmt = (n) => (parseFloat(n||0)).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="text-emerald-600" size={26} /> My Monthly Income
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            You receive <span className="font-bold text-emerald-600">{teacherPct}%</span> of every course payment.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>user&&fetchIncome(user.user_id)}
            className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50">
            <RefreshCw size={14}/> Refresh
          </button>
          <button onClick={exportMonthly} disabled={exporting||monthly.length===0}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            {exporting?<Loader size={14} className="animate-spin"/>:<Download size={14}/>} Export Monthly
          </button>
        </div>
      </div>

      {error&&<div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm"><AlertCircle size={16}/>{error}</div>}

      {/* Income split banner */}
      <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-5 text-sm">
        <Info size={16} className="text-emerald-600 mt-0.5 flex-shrink-0"/>
        <span className="text-emerald-800">
          <span className="font-bold">Income Split Policy:</span> You earn <span className="font-bold">{teacherPct}%</span> of each student course fee.
          The institute retains <span className="font-bold">{institutePct}%</span>. All figures below show your {teacherPct}% share.
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {label:`All-Time Income (${teacherPct}%)`,val:`Rs. ${fmt(totals.teacher_income)}`,sub:`Gross: Rs. ${fmt(totals.gross_total)}`,color:"text-emerald-600",bg:"bg-emerald-50",icon:<DollarSign size={20}/>},
          {label:`This Month (${teacherPct}%)`,val:currentMonth?`Rs. ${fmt(currentMonth.teacher_income)}`:"Rs. 0.00",sub:currentMonth?`${currentMonth.payment_count} payment(s)`:"No payments yet",color:"text-blue-600",bg:"bg-blue-50",icon:<Calendar size={20}/>},
          {label:"Best Month",val:bestMonth?`Rs. ${fmt(bestMonth.teacher_income)}`:"—",sub:bestMonth?.month_label||"",color:"text-purple-600",bg:"bg-purple-50",icon:<BarChart2 size={20}/>},
          {label:"Total Payments",val:totals.payment_count||0,sub:"All-time enrollments",color:"text-orange-600",bg:"bg-orange-50",icon:<Receipt size={20}/>},
        ].map((s,i)=>(
          <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`${s.bg} ${s.color} p-3 rounded-xl flex-shrink-0`}>{s.icon}</div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 leading-tight">{s.label}</p>
              <p className={`text-xl font-bold ${s.color} mt-0.5`}>{s.val}</p>
              {s.sub&&<p className="text-xs text-gray-400 mt-0.5 truncate">{s.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Toggle */}
      <div className="flex bg-white border border-gray-200 rounded-xl p-1 mb-5 w-fit">
        {[{key:"monthly",label:"Monthly Summary",icon:<BarChart2 size={14}/>},{key:"all",label:"Payment Details",icon:<Receipt size={14}/>}].map(t=>(
          <button key={t.key} onClick={()=>setViewMode(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode===t.key?"bg-emerald-600 text-white shadow-sm":"text-gray-500 hover:text-gray-700"}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {loading?(
        <div className="flex items-center justify-center py-24 text-gray-400 gap-2"><Loader size={20} className="animate-spin"/> Loading income data…</div>
      ):monthly.length===0?(
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100 text-gray-400">
          <DollarSign size={48} className="mx-auto mb-3 opacity-20"/>
          <p className="font-medium">No income data yet.</p>
          <p className="text-sm mt-1">Income appears once students pay for your courses.</p>
        </div>
      ):viewMode==="monthly"?(
        /* Monthly summary */
        <div className="space-y-3">
          {monthly.map((m,idx)=>{
            const pct=bestMonth?(m.teacher_income/bestMonth.teacher_income)*100:0;
            const isExpanded=expandedMonth===m.month_key;
            return(
              <div key={m.month_key} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 cursor-pointer hover:bg-gray-50 transition-colors" onClick={()=>setExpandedMonth(isExpanded?null:m.month_key)}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-800 text-base">{m.month_label}</span>
                        {idx===0&&<span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Latest</span>}
                        {bestMonth&&m.month_key===bestMonth.month_key&&<span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Best Month</span>}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{m.payment_count} payment{m.payment_count!==1?"s":""} · Click to {isExpanded?"hide":"view"} breakdown</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-emerald-600">Rs. {fmt(m.teacher_income)}</p>
                      <p className="text-xs text-gray-400">Gross: Rs. {fmt(m.gross_total)} · <span className="text-emerald-500">{teacherPct}% your share</span></p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{width:`${pct}%`}}/>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">{pct.toFixed(0)}% of best month</p>
                </div>
                {isExpanded&&(
                  <div className="border-t border-gray-100 px-5 pb-5 pt-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Payment Breakdown</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(m.payments||[]).map(p=>(
                        <div key={p.payment_id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5">
                          <div className="min-w-0 mr-2">
                            <p className="text-xs font-medium text-gray-700 truncate">{p.student_name}</p>
                            <p className="text-xs text-gray-400 truncate">{p.course_title}</p>
                            <p className="text-xs text-gray-300 mt-0.5">
                              {new Date(p.payment_date).toLocaleDateString("en-US",{month:"short",day:"numeric"})}
                              {" · "}
                              <span className={`font-medium ${p.payment_type==="ONLINE"?"text-blue-500":"text-orange-400"}`}>
                                {p.payment_type==="ONLINE"?"Online":"Cash"}
                              </span>
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs font-bold text-emerald-600">Rs. {fmt(p.teacher_share)}</p>
                            <p className="text-xs text-gray-300">of Rs. {fmt(p.amount)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ):(
        /* Payment details */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <select value={selectedMonth} onChange={e=>setSelectedMonth(e.target.value)}
                className="pl-8 pr-8 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 appearance-none cursor-pointer">
                <option value="ALL">All Months</option>
                {monthly.map(m=><option key={m.month_key} value={m.month_key}>{m.month_label}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
            </div>
            <button onClick={exportDetailed} disabled={exporting||filteredPayments.length===0}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg">
              {exporting?<Loader size={14} className="animate-spin"/>:<Download size={14}/>}
              Export {selectedMonth==="ALL"?"All":"Month"}
            </button>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-4 items-center">
              <span className="text-sm text-gray-500"><span className="font-bold text-gray-800">{filteredPayments.length}</span> payments</span>
              <span className="text-sm text-gray-500">Your {teacherPct}% income: <span className="font-bold text-emerald-600">Rs. {fmt(filteredPayments.reduce((s,p)=>s+parseFloat(p.teacher_share||0),0))}</span></span>
              <span className="text-sm text-gray-500">Gross: <span className="font-bold text-gray-700">Rs. {fmt(filteredPayments.reduce((s,p)=>s+parseFloat(p.amount||0),0))}</span></span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>{["Student","Course","Gross Amount",`Your Share (${teacherPct}%)`, "Method","Date"].map(h=><th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredPayments.map(p=>(
                    <tr key={p.payment_id} className="hover:bg-gray-50">
                      <td className="px-5 py-3.5"><p className="font-medium text-gray-800">{p.student_name}</p><p className="text-xs font-mono text-gray-400">{p.student_id}</p></td>
                      <td className="px-5 py-3.5 text-gray-600 max-w-40"><p className="truncate">{p.course_title}</p></td>
                      <td className="px-5 py-3.5 text-gray-600">Rs. {fmt(p.amount)}</td>
                      <td className="px-5 py-3.5"><span className="font-bold text-emerald-600">Rs. {fmt(p.teacher_share)}</span></td>
                      <td className="px-5 py-3.5"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.payment_type==="ONLINE"?"bg-blue-100 text-blue-700":"bg-orange-100 text-orange-700"}`}>{p.payment_type==="ONLINE"?"Online":"Cash"}</span></td>
                      <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">{new Date(p.payment_date).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"})}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}