"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building2, DollarSign, TrendingUp, Users, Download, Loader,
  AlertCircle, RefreshCw, ChevronDown, BarChart2, Receipt,
  Wallet, Percent, Info
} from "lucide-react";
import { guardRoute, authFetch } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminInstituteincomePage() {
  const router = useRouter();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [exporting, setExporting] = useState(false);
  const [tab, setTab]         = useState("overview");  // overview | monthly | teachers
  const [expandedTeacher, setExpandedTeacher] = useState(null);

  useEffect(() => {
    const auth = guardRoute("ADMIN", router);
    if (auth) fetchData();
  }, [router]);

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const res  = await authFetch(`${API}/income/admin/institute`);
      const json = await res.json();
      if (json.success) setData(json);
      else setError(json.error || "Failed to load institute income.");
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  const totals       = data?.totals   || {};
  const monthly      = data?.monthly  || [];
  const teachers     = data?.teachers || [];
  const institutePct = data?.institute_share_pct || 20;
  const teacherPct   = data?.teacher_share_pct   || 80;

  const bestMonth = monthly.reduce((best, m) => m.institute_income > (best?.institute_income || 0) ? m : best, null);
  const currentMonthKey = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  })();
  const currentMonth = monthly.find(m => m.month_key === currentMonthKey);

  const fmt = (n) => (parseFloat(n||0)).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});

  function exportMonthly() {
    setExporting(true);
    try {
      const headers = ["Month","Payments","Gross Total (Rs.)",`Institute Income ${institutePct}% (Rs.)`,`Teacher Payouts ${teacherPct}% (Rs.)`];
      const rows    = monthly.map(m=>[m.month_label,m.payment_count,m.gross_total.toFixed(2),m.institute_income.toFixed(2),m.teacher_payouts.toFixed(2)]);
      const summary = [[],["--- TOTALS ---"],["All Time",totals.payment_count,totals.gross_total?.toFixed(2),totals.institute_income?.toFixed(2),totals.teacher_payouts?.toFixed(2)]];
      const escape  = v=>`"${String(v??"").replace(/"/g,'""')}"`;
      const csv     = [...[headers,...rows,...summary].map(r=>r.map(escape).join(","))].join("\n");
      const blob    = new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});
      const url     = URL.createObjectURL(blob);
      const a       = document.createElement("a");
      a.href=url; a.download=`institute-income-${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);a.click();document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally { setTimeout(()=>setExporting(false),800); }
  }

  function exportTeachers() {
    setExporting(true);
    try {
      const headers = ["Teacher","Gross Total (Rs.)",`Teacher Payout ${teacherPct}% (Rs.)`,`Institute Share ${institutePct}% (Rs.)`,"Payments"];
      const rows    = teachers.map(t=>[t.teacher_name,t.gross_total.toFixed(2),t.teacher_payout.toFixed(2),t.institute_share.toFixed(2),t.payment_count]);
      const escape  = v=>`"${String(v??"").replace(/"/g,'""')}"`;
      const csv     = [...[headers,...rows].map(r=>r.map(escape).join(","))].join("\n");
      const blob    = new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});
      const url     = URL.createObjectURL(blob);
      const a       = document.createElement("a");
      a.href=url; a.download=`teacher-payouts-${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);a.click();document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally { setTimeout(()=>setExporting(false),800); }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Building2 className="text-blue-600" size={26}/> Institute Income
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Institute retains <span className="font-bold text-blue-600">{institutePct}%</span> · Teachers receive <span className="font-bold text-emerald-600">{teacherPct}%</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData}
            className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50">
            <RefreshCw size={14}/> Refresh
          </button>
          <button onClick={tab==="teachers"?exportTeachers:exportMonthly} disabled={exporting||!data}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            {exporting?<Loader size={14} className="animate-spin"/>:<Download size={14}/>}
            Export CSV
          </button>
        </div>
      </div>

      {error&&<div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm"><AlertCircle size={16}/>{error}</div>}

      {/* Policy banner */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-5 text-sm">
        <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0"/>
        <span className="text-blue-800">
          <span className="font-bold">Revenue Split:</span> Every student payment is split automatically —
          <span className="font-bold"> {teacherPct}%</span> goes to the assigned course teacher, and
          <span className="font-bold"> {institutePct}%</span> is retained by the institute.
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {label:"Total Gross Revenue",val:`Rs. ${fmt(totals.gross_total)}`,sub:`${totals.payment_count||0} total payments`,color:"text-gray-700",bg:"bg-gray-100",icon:<Receipt size={20}/>},
          {label:`Institute Income (${institutePct}%)`,val:`Rs. ${fmt(totals.institute_income)}`,sub:`This month: Rs. ${fmt(currentMonth?.institute_income)}`,color:"text-blue-600",bg:"bg-blue-50",icon:<Building2 size={20}/>},
          {label:`Total Teacher Payouts (${teacherPct}%)`,val:`Rs. ${fmt(totals.teacher_payouts)}`,sub:`Across ${teachers.length} teacher(s)`,color:"text-emerald-600",bg:"bg-emerald-50",icon:<Wallet size={20}/>},
          {label:"Best Month (Institute)",val:bestMonth?`Rs. ${fmt(bestMonth.institute_income)}`:"—",sub:bestMonth?.month_label||"",color:"text-purple-600",bg:"bg-purple-50",icon:<TrendingUp size={20}/>},
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

      {/* Tab bar */}
      <div className="flex bg-white border border-gray-200 rounded-xl p-1 mb-5 w-fit">
        {[
          {key:"monthly",  label:"Monthly Breakdown", icon:<BarChart2 size={14}/>},
          {key:"teachers", label:"Per-Teacher Payouts",icon:<Users size={14}/>},
        ].map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab===t.key?"bg-blue-600 text-white shadow-sm":"text-gray-500 hover:text-gray-700"}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {loading?(
        <div className="flex items-center justify-center py-24 text-gray-400 gap-2"><Loader size={20} className="animate-spin"/> Loading institute income…</div>
      ):!data||monthly.length===0?(
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100 text-gray-400">
          <Building2 size={48} className="mx-auto mb-3 opacity-20"/>
          <p className="font-medium">No income data yet.</p>
          <p className="text-sm mt-1">Income will appear once students make course payments.</p>
        </div>
      ):tab==="monthly"?(

        /* Monthly breakdown */
        <div className="space-y-3">
          {monthly.map((m,idx)=>{
            const pct = bestMonth ? (m.institute_income/bestMonth.institute_income)*100 : 0;
            return(
              <div key={m.month_key} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-800 text-base">{m.month_label}</span>
                      {idx===0&&<span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Latest</span>}
                      {bestMonth&&m.month_key===bestMonth.month_key&&<span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Best Month</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{m.payment_count} payment{m.payment_count!==1?"s":""}</p>
                  </div>
                  {/* Revenue split */}
                  <div className="flex flex-wrap gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Gross Total</p>
                      <p className="text-base font-bold text-gray-700">Rs. {fmt(m.gross_total)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-blue-400">Institute ({institutePct}%)</p>
                      <p className="text-base font-bold text-blue-600">Rs. {fmt(m.institute_income)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-emerald-400">Teacher Payouts ({teacherPct}%)</p>
                      <p className="text-base font-bold text-emerald-600">Rs. {fmt(m.teacher_payouts)}</p>
                    </div>
                  </div>
                </div>
                {/* Visual split bar */}
                <div className="flex rounded-full overflow-hidden h-3 mb-1">
                  <div className="bg-blue-500 transition-all" style={{width:`${institutePct}%`}}/>
                  <div className="bg-emerald-400 transition-all" style={{width:`${teacherPct}%`}}/>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span className="text-blue-500">Institute {institutePct}%</span>
                  <span className="text-emerald-500">Teachers {teacherPct}%</span>
                </div>
                <div className="mt-3 pt-2 border-t border-gray-50">
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-blue-400 h-1.5 rounded-full transition-all" style={{width:`${pct}%`}}/>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{pct.toFixed(0)}% of best month for institute</p>
                </div>
              </div>
            );
          })}
        </div>

      ):(

        /* Per-teacher payouts */
        <div className="space-y-3">
          {teachers.map(t=>{
            const isExpanded = expandedTeacher===t.teacher_id;
            const topMonth   = t.monthly.reduce((best,m)=>m.teacher_payout>(best?.teacher_payout||0)?m:best,null);
            return(
              <div key={t.teacher_id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 cursor-pointer hover:bg-gray-50 transition-colors" onClick={()=>setExpandedTeacher(isExpanded?null:t.teacher_id)}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800 text-base">{t.teacher_name}</span>
                        <span className="text-xs font-mono text-gray-300">{t.teacher_id}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{t.payment_count} payment{t.payment_count!==1?"s":""} · Click to {isExpanded?"hide":"view"} monthly breakdown</p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Gross</p>
                        <p className="text-base font-bold text-gray-700">Rs. {fmt(t.gross_total)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-emerald-400">Teacher Payout ({teacherPct}%)</p>
                        <p className="text-base font-bold text-emerald-600">Rs. {fmt(t.teacher_payout)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-blue-400">Institute Share ({institutePct}%)</p>
                        <p className="text-base font-bold text-blue-600">Rs. {fmt(t.institute_share)}</p>
                      </div>
                    </div>
                  </div>
                  {topMonth&&(
                    <p className="text-xs text-gray-400 mt-2">Best month: <span className="font-medium text-gray-600">{topMonth.month_label}</span> — Rs. {fmt(topMonth.teacher_payout)}</p>
                  )}
                </div>

                {isExpanded&&t.monthly.length>0&&(
                  <div className="border-t border-gray-100 px-5 pb-5 pt-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Monthly Payout History</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100">
                            {["Month","Payments","Gross","Teacher Payout","Institute Share"].map(h=>(
                              <th key={h} className="text-left text-xs font-semibold text-gray-400 py-2 pr-6 whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {t.monthly.map(m=>(
                            <tr key={m.month_key} className="hover:bg-gray-50">
                              <td className="py-2.5 pr-6 font-medium text-gray-700 whitespace-nowrap">{m.month_label}</td>
                              <td className="py-2.5 pr-6 text-gray-500">{m.payment_count}</td>
                              <td className="py-2.5 pr-6 text-gray-600">Rs. {fmt(m.gross_total)}</td>
                              <td className="py-2.5 pr-6 font-bold text-emerald-600">Rs. {fmt(m.teacher_payout)}</td>
                              <td className="py-2.5 pr-6 font-bold text-blue-600">Rs. {fmt(m.institute_share)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-gray-200 font-bold">
                            <td className="py-2.5 pr-6 text-gray-700">Total</td>
                            <td className="py-2.5 pr-6 text-gray-600">{t.payment_count}</td>
                            <td className="py-2.5 pr-6 text-gray-700">Rs. {fmt(t.gross_total)}</td>
                            <td className="py-2.5 pr-6 text-emerald-600">Rs. {fmt(t.teacher_payout)}</td>
                            <td className="py-2.5 pr-6 text-blue-600">Rs. {fmt(t.institute_share)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}