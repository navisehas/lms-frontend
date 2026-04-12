"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building2, TrendingUp, Users, Download, Loader2,
  AlertCircle, RefreshCw, BarChart2, Receipt,
  Wallet, Info, CalendarDays, History, LayoutDashboard
} from "lucide-react";
import { guardRoute, authFetch } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;

const fmt = (n) =>
  parseFloat(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function AdminInstituteincomePage() {
  const router = useRouter();
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [exporting, setExporting] = useState(false);
  const [tab, setTab]             = useState("overview"); // overview | monthly | teachers
  const [expandedTeacher, setExpandedTeacher] = useState(null);

  useEffect(() => {
    const auth = guardRoute("ADMIN", router);
    if (auth) fetchData();
  }, [router]);

  /* ── Auto-refresh on the 8th of every month ── */
  useEffect(() => {
    const now      = new Date();
    const next8    = new Date(
      now.getDate() >= 8 ? now.getFullYear() : now.getFullYear(),
      now.getDate() >= 8 ? now.getMonth() + 1 : now.getMonth(),
      8, 0, 0, 0
    );
    const msUntil8 = next8.getTime() - now.getTime();
    const timeout  = setTimeout(() => fetchData(), msUntil8);
    return () => clearTimeout(timeout);
  }, [data]);

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const res  = await authFetch(`${API}/income/admin/institute`);
      const json = await res.json();
      if (json.success) setData(json);
      else setError(json.error || "Failed to load institute income.");
    } catch { setError("Network error. Please try again."); }
    finally  { setLoading(false); }
  }

  const dataReady    = !loading && data !== null;
  const totals       = data?.totals   || {};
  const monthly      = data?.monthly  || [];
  const teachers     = data?.teachers || [];
  const institutePct = data?.institute_share_pct || 20;
  const teacherPct   = data?.teacher_share_pct   || 80;

  /* ── Current month ── */
  const currentMonthKey = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  })();
  const currentMonth = monthly.find(m => m.month_key === currentMonthKey) || null;
  const currentLabel = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
  const bestMonth    = monthly.reduce(
    (best, m) => m.institute_income > (best?.institute_income || 0) ? m : best, null
  );

  /* ── Next auto-refresh label ── */
  const nextRefreshLabel = (() => {
    const now  = new Date();
    const next = new Date(
      now.getDate() >= 8 ? now.getFullYear() : now.getFullYear(),
      now.getDate() >= 8 ? now.getMonth() + 1 : now.getMonth(),
      8
    );
    return next.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" });
  })();

  /* ── Exports ── */
  function exportMonthly() {
    setExporting(true);
    try {
      const headers = ["Month", "Payments", "Gross Total (Rs.)", `Institute Income ${institutePct}% (Rs.)`, `Teacher Payouts ${teacherPct}% (Rs.)`];
      const rows    = monthly.map(m => [m.month_label, m.payment_count, m.gross_total.toFixed(2), m.institute_income.toFixed(2), m.teacher_payouts.toFixed(2)]);
      const summary = [[], ["--- TOTALS ---"], ["All Time", totals.payment_count, totals.gross_total?.toFixed(2), totals.institute_income?.toFixed(2), totals.teacher_payouts?.toFixed(2)]];
      const escape  = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
      const csv     = [...[headers, ...rows, ...summary].map(r => r.map(escape).join(","))].join("\n");
      const blob    = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url     = URL.createObjectURL(blob);
      const a       = document.createElement("a");
      a.href = url; a.download = `institute-income-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally { setTimeout(() => setExporting(false), 800); }
  }

  function exportTeachers() {
    setExporting(true);
    try {
      const headers = ["Teacher", "Gross Total (Rs.)", `Teacher Payout ${teacherPct}% (Rs.)`, `Institute Share ${institutePct}% (Rs.)`, "Payments"];
      const rows    = teachers.map(t => [t.teacher_name, t.gross_total.toFixed(2), t.teacher_payout.toFixed(2), t.institute_share.toFixed(2), t.payment_count]);
      const escape  = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
      const csv     = [...[headers, ...rows].map(r => r.map(escape).join(","))].join("\n");
      const blob    = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url     = URL.createObjectURL(blob);
      const a       = document.createElement("a");
      a.href = url; a.download = `teacher-payouts-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally { setTimeout(() => setExporting(false), 800); }
  }

  /* ══════════════════════════════════════════════════════════════ */
  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="text-blue-700" size={26} /> Institute Income
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-0.5">
            Institute retains <span className="font-bold text-blue-700">{institutePct}%</span> · Teachers receive <span className="font-bold text-blue-700">{teacherPct}%</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={tab === "teachers" ? exportTeachers : exportMonthly}
            disabled={exporting || !data}
            className="flex items-center gap-2 text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 px-4 py-2 rounded-lg transition shadow-sm"
          >
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* ── Policy banner ── */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm">
        <Info size={16} className="text-blue-700 mt-0.5 flex-shrink-0" />
        <span className="text-blue-800">
          <span className="font-bold">Revenue Split:</span> Every student payment is split automatically —{" "}
          <span className="font-bold">{teacherPct}%</span> goes to the assigned course teacher, and{" "}
          <span className="font-bold">{institutePct}%</span> is retained by the institute.
        </span>
      </div>

      {/* ── Tab bar — only show when data is ready ── */}
      {dataReady && (
        <div className="flex bg-white border border-gray-200 rounded-xl p-1 w-fit">
          {[
            { key: "overview", label: "This Month",      icon: <LayoutDashboard size={14} /> },
            { key: "monthly",  label: "Monthly History", icon: <BarChart2 size={14} /> },
            { key: "teachers", label: "Per-Teacher",     icon: <Users size={14} /> },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.key ? "bg-blue-700 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Single central loader — no partial renders ── */}
      {loading && (
        <div className="flex items-center justify-center py-32 text-gray-400 gap-3">
          <Loader2 size={24} className="animate-spin" />
          <span className="text-sm font-medium">Loading income data…</span>
        </div>
      )}

      {/* ════════════════════════════════════════
          TAB: THIS MONTH
      ════════════════════════════════════════ */}
      {dataReady && tab === "overview" && (
        <div className="space-y-6">

          {/* Month label + next refresh */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="text-blue-700" />
              <span className="text-base font-bold text-gray-900">{currentLabel}</span>
              <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">Current Month</span>
            </div>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <RefreshCw size={11} /> Auto-refreshes {nextRefreshLabel}
            </span>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                label: "Gross Revenue",
                val:   currentMonth ? `Rs. ${fmt(currentMonth.gross_total)}` : "Rs. 0.00",
                sub:   `${currentMonth?.payment_count || 0} payments this month`,
                iconBg: "bg-blue-50", iconColor: "text-blue-700", icon: <Receipt size={22} />,
              },
              {
                label: `Institute Income (${institutePct}%)`,
                val:   currentMonth ? `Rs. ${fmt(currentMonth.institute_income)}` : "Rs. 0.00",
                sub:   `${institutePct}% of gross revenue`,
                iconBg: "bg-indigo-50", iconColor: "text-indigo-700", icon: <Building2 size={22} />,
              },
              {
                label: `Teacher Payouts (${teacherPct}%)`,
                val:   currentMonth ? `Rs. ${fmt(currentMonth.teacher_payouts)}` : "Rs. 0.00",
                sub:   `Across ${teachers.length} teacher(s)`,
                iconBg: "bg-amber-50", iconColor: "text-amber-700", icon: <Wallet size={22} />,
              },
              {
                label: "Best Month Ever",
                val:   bestMonth ? `Rs. ${fmt(bestMonth.institute_income)}` : "—",
                sub:   bestMonth?.month_label || "No data yet",
                iconBg: "bg-green-50", iconColor: "text-green-700", icon: <TrendingUp size={22} />,
              },
            ].map((s, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                <div className="min-w-0 mr-3">
                  <p className="text-sm font-medium text-gray-500">{s.label}</p>
                  <h3 className={`font-bold text-gray-900 mt-1 leading-tight break-all ${
                    typeof s.val === "string" && s.val.length > 14 ? "text-lg" : "text-2xl"
                  }`}>
                    {s.val}
                  </h3>
                  <span className="text-xs text-gray-400 mt-1 block">{s.sub}</span>
                </div>
                <div className={`p-3 ${s.iconBg} ${s.iconColor} rounded-full flex-shrink-0`}>
                  {s.icon}
                </div>
              </div>
            ))}
          </div>

          {/* Split bar */}
          {currentMonth && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <p className="text-sm font-bold text-gray-900 mb-3">Revenue Split — {currentLabel}</p>
              <div className="flex rounded-full overflow-hidden h-4 mb-2">
                <div
                  className="bg-blue-700 flex items-center justify-center text-[10px] font-bold text-white transition-all"
                  style={{ width: `${institutePct}%` }}
                >
                  {institutePct}%
                </div>
                <div
                  className="bg-amber-400 flex items-center justify-center text-[10px] font-bold text-white transition-all"
                  style={{ width: `${teacherPct}%` }}
                >
                  {teacherPct}%
                </div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-blue-700 font-semibold">Institute — Rs. {fmt(currentMonth.institute_income)}</span>
                <span className="text-amber-600 font-semibold">Teachers — Rs. {fmt(currentMonth.teacher_payouts)}</span>
              </div>
            </div>
          )}

          {!currentMonth && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <CalendarDays size={48} className="mx-auto mb-3 text-gray-200" />
              <p className="font-bold text-gray-500">No payments yet this month.</p>
              <p className="text-sm text-gray-400 mt-1">Check Monthly History tab for past records.</p>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════
          TAB: MONTHLY HISTORY
      ════════════════════════════════════════ */}
      {dataReady && tab === "monthly" && (
        <div className="space-y-3">
          {monthly.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <History size={48} className="mx-auto mb-3 text-gray-200" />
              <p className="font-bold text-gray-500">No history yet.</p>
            </div>
          ) : monthly.map((m, idx) => {
            const pct = bestMonth ? (m.institute_income / bestMonth.institute_income) * 100 : 0;
            return (
              <div key={m.month_key} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900 text-base">{m.month_label}</span>
                      {idx === 0 && <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">Latest</span>}
                      {bestMonth && m.month_key === bestMonth.month_key && (
                        <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">Best Month</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{m.payment_count} payment{m.payment_count !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Gross Total</p>
                      <p className="text-base font-bold text-gray-700">Rs. {fmt(m.gross_total)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-blue-500">Institute ({institutePct}%)</p>
                      <p className="text-base font-bold text-blue-700">Rs. {fmt(m.institute_income)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-amber-500">Teacher Payouts ({teacherPct}%)</p>
                      <p className="text-base font-bold text-amber-700">Rs. {fmt(m.teacher_payouts)}</p>
                    </div>
                  </div>
                </div>
                <div className="flex rounded-full overflow-hidden h-3 mb-1">
                  <div className="bg-blue-700 transition-all" style={{ width: `${institutePct}%` }} />
                  <div className="bg-amber-400 transition-all" style={{ width: `${teacherPct}%` }} />
                </div>
                <div className="flex justify-between text-xs mb-3">
                  <span className="text-blue-700">Institute {institutePct}%</span>
                  <span className="text-amber-600">Teachers {teacherPct}%</span>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-blue-700 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{pct.toFixed(0)}% of best month</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ════════════════════════════════════════
          TAB: PER-TEACHER
      ════════════════════════════════════════ */}
      {dataReady && tab === "teachers" && (
        <div className="space-y-4">

          {/* Current month label */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <CalendarDays size={15} className="text-blue-700" />
              <span className="text-sm font-bold text-gray-900">{currentLabel}</span>
              <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">Current Month</span>
            </div>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <RefreshCw size={11} /> Auto-refreshes {nextRefreshLabel}
            </span>
          </div>

          {teachers.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Users size={48} className="mx-auto mb-3 text-gray-200" />
              <p className="font-bold text-gray-500">No teacher payout data yet.</p>
            </div>
          ) : teachers.map(t => {
            const isExpanded = expandedTeacher === t.teacher_id;

            // Current month data for this teacher
            const currentMonthData = t.monthly?.find(m => m.month_key === currentMonthKey) || null;

            // Past months only (exclude current month from history)
            const historyMonths = t.monthly?.filter(m => m.month_key !== currentMonthKey) || [];

            const topMonth = t.monthly?.reduce(
              (best, m) => m.teacher_payout > (best?.teacher_payout || 0) ? m : best, null
            );

            return (
              <div key={t.teacher_id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

                {/* ── Teacher name + current month stats ── */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-base">{t.teacher_name}</span>
                        <span className="text-xs font-mono text-gray-300">{t.teacher_id}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {currentMonthData?.payment_count || 0} payment{(currentMonthData?.payment_count || 0) !== 1 ? "s" : ""} this month
                      </p>
                    </div>
                    {topMonth && (
                      <span className="text-xs text-gray-400 hidden sm:block text-right">
                        Best: <span className="font-medium text-gray-600">{topMonth.month_label}</span><br />
                        Rs. {fmt(topMonth.teacher_payout)}
                      </span>
                    )}
                  </div>

                  {/* Current month 3 stat mini-cards */}
                  {currentMonthData ? (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                        <p className="text-xs text-gray-400 mb-1">Gross</p>
                        <p className="text-sm font-bold text-gray-700">Rs. {fmt(currentMonthData.gross_total)}</p>
                      </div>
                      <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-100">
                        <p className="text-xs text-amber-500 mb-1">Payout ({teacherPct}%)</p>
                        <p className="text-sm font-bold text-amber-700">Rs. {fmt(currentMonthData.teacher_payout)}</p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
                        <p className="text-xs text-blue-500 mb-1">Institute ({institutePct}%)</p>
                        <p className="text-sm font-bold text-blue-700">Rs. {fmt(currentMonthData.institute_share)}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                      <p className="text-xs text-gray-400">No payments recorded this month</p>
                    </div>
                  )}
                </div>

                {/* ── Show history toggle button ── */}
                {historyMonths.length > 0 && (
                  <div
                    className="flex items-center justify-between px-5 py-3 border-t border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedTeacher(isExpanded ? null : t.teacher_id)}
                  >
                    <div className="flex items-center gap-2">
                      <History size={13} className="text-gray-400" />
                      <span className="text-xs font-semibold text-gray-500">
                        Monthly History ({historyMonths.length} month{historyMonths.length !== 1 ? "s" : ""})
                      </span>
                    </div>
                    <span className={`text-xs font-semibold ${isExpanded ? "text-blue-700" : "text-gray-400"}`}>
                      {isExpanded ? "▲ Hide" : "▼ Show"}
                    </span>
                  </div>
                )}

                {/* ── Expandable monthly history table ── */}
                {isExpanded && historyMonths.length > 0 && (
                  <div className="border-t border-gray-100 px-5 pb-5 pt-3">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100">
                            {["Month", "Payments", "Gross", "Teacher Payout", "Institute Share"].map(h => (
                              <th key={h} className="text-left text-xs font-semibold text-gray-400 py-2 pr-6 whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {historyMonths.map(m => (
                            <tr key={m.month_key} className="hover:bg-gray-50">
                              <td className="py-2.5 pr-6 font-medium text-gray-700 whitespace-nowrap">{m.month_label}</td>
                              <td className="py-2.5 pr-6 text-gray-500">{m.payment_count}</td>
                              <td className="py-2.5 pr-6 text-gray-600">Rs. {fmt(m.gross_total)}</td>
                              <td className="py-2.5 pr-6 font-bold text-amber-700">Rs. {fmt(m.teacher_payout)}</td>
                              <td className="py-2.5 pr-6 font-bold text-blue-700">Rs. {fmt(m.institute_share)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-gray-200 font-bold bg-gray-50">
                            <td className="py-2.5 pr-6 text-gray-700">All Time Total</td>
                            <td className="py-2.5 pr-6 text-gray-600">{t.payment_count}</td>
                            <td className="py-2.5 pr-6 text-gray-700">Rs. {fmt(t.gross_total)}</td>
                            <td className="py-2.5 pr-6 text-amber-700">Rs. {fmt(t.teacher_payout)}</td>
                            <td className="py-2.5 pr-6 text-blue-700">Rs. {fmt(t.institute_share)}</td>
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