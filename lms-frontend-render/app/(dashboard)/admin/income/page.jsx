"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Building2, TrendingUp, TrendingDown, Users, Download, Loader2,
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

/* ────────────────────────────────────────────────────────────────
   Inline SVG Line Chart (no extra dependencies)
──────────────────────────────────────────────────────────────── */
function LineChart({ months }) {
  const [hovered, setHovered] = useState(null);
  if (!months || months.length === 0) return null;

  const W = 900, H = 200;
  const PAD = { top: 20, right: 20, bottom: 44, left: 70 };
  const iW  = W - PAD.left - PAD.right;
  const iH  = H - PAD.top  - PAD.bottom;

  const sorted = [...months].sort((a, b) => a.month_key.localeCompare(b.month_key));
  const n      = sorted.length;

  const allVals = sorted.flatMap(m => [m.gross_total, m.institute_income, m.teacher_payouts]);
  const maxV    = Math.max(...allVals, 1);

  const xOf = i => PAD.left + (n === 1 ? iW / 2 : (i / (n - 1)) * iW);
  const yOf = v => PAD.top  + iH - (v / maxV) * iH;

  const pts = (key) => sorted.map((m, i) => `${xOf(i)},${yOf(m[key])}`).join(" ");

  const area = (key, color) => {
    if (n < 2) return null;
    return (
      <path
        d={`M${xOf(0)},${PAD.top + iH} ${sorted.map((m, i) => `L${xOf(i)},${yOf(m[key])}`).join(" ")} L${xOf(n - 1)},${PAD.top + iH} Z`}
        fill={color} fillOpacity="0.07"
      />
    );
  };

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => maxV * f);

  return (
    <div className="relative w-full" style={{ paddingBottom: `${(H / W) * 100}%` }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full" onMouseLeave={() => setHovered(null)}>
        {yTicks.map((v, i) => (
          <g key={i}>
            <line x1={PAD.left} y1={yOf(v)} x2={W - PAD.right} y2={yOf(v)} stroke="#f3f4f6" strokeWidth="1" />
            <text x={PAD.left - 6} y={yOf(v) + 4} textAnchor="end" fontSize="9.5" fill="#9ca3af">
              {v >= 1000 ? `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}K` : v.toFixed(0)}
            </text>
          </g>
        ))}

        {area("gross_total",     "#3b82f6")}
        {area("institute_income","#6366f1")}

        {[
          { key: "gross_total",      color: "#3b82f6", dash: false },
          { key: "institute_income", color: "#6366f1", dash: false },
          { key: "teacher_payouts",  color: "#f59e0b", dash: true  },
        ].map(({ key, color, dash }) => (
          <polyline key={key} points={pts(key)} fill="none" stroke={color} strokeWidth="2.5"
            strokeLinejoin="round" strokeLinecap="round"
            strokeDasharray={dash ? "6,4" : undefined} />
        ))}

        {sorted.map((m, i) => {
          const hov  = hovered === i;
          const tipX = Math.min(xOf(i) + 10, W - PAD.right - 158);
          return (
            <g key={m.month_key}>
              <text x={xOf(i)} y={H - 6} textAnchor="middle" fontSize="9.5" fill="#9ca3af">
                {m.month_label.slice(0, 3)} {m.month_label.slice(-4)}
              </text>
              <rect
                x={xOf(i) - iW / n / 2} y={PAD.top} width={iW / n} height={iH}
                fill="transparent" onMouseEnter={() => setHovered(i)}
              />
              {hov && <line x1={xOf(i)} y1={PAD.top} x2={xOf(i)} y2={PAD.top + iH} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3,2" />}
              {[
                { key: "gross_total",      c: "#3b82f6" },
                { key: "institute_income", c: "#6366f1" },
                { key: "teacher_payouts",  c: "#f59e0b" },
              ].map(({ key, c }) => (
                <circle key={key} cx={xOf(i)} cy={yOf(m[key])} r={hov ? 5 : 3} fill={c} />
              ))}
              {hov && (
                <g>
                  <rect x={tipX} y={PAD.top + 2} width={156} height={70} rx="6"
                    fill="white" stroke="#e5e7eb" strokeWidth="1"
                    style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.09))" }} />
                  <text x={tipX + 10} y={PAD.top + 17} fontSize="10" fontWeight="600" fill="#374151">{m.month_label}</text>
                  <text x={tipX + 10} y={PAD.top + 31} fontSize="9.5" fill="#3b82f6">Gross: Rs. {fmt(m.gross_total)}</text>
                  <text x={tipX + 10} y={PAD.top + 45} fontSize="9.5" fill="#6366f1">Institute: Rs. {fmt(m.institute_income)}</text>
                  <text x={tipX + 10} y={PAD.top + 59} fontSize="9.5" fill="#f59e0b">Teachers: Rs. {fmt(m.teacher_payouts)}</text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Main Page
════════════════════════════════════════════════════════════════ */
export default function AdminInstituteincomePage() {
  const router = useRouter();
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [exporting, setExporting] = useState(false);
  const [tab, setTab]             = useState("overview");
  const [expandedTeacher, setExpandedTeacher] = useState(null);

  // ── Stable derived values (memoized so they never flicker) ──────────────
  const dataReady    = !loading && data !== null;
  const totals       = data?.totals   || {};
  const monthly      = data?.monthly  || [];
  const teachers     = data?.teachers || [];
  const institutePct = data?.institute_share_pct || 20;
  const teacherPct   = data?.teacher_share_pct   || 80;

  // FIX 1: currentMonthKey computed once, stable — not recalculated on every render
  const currentMonthKey = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  const currentLabel = useMemo(() =>
    new Date().toLocaleString("en-US", { month: "long", year: "numeric" })
  , []);

  // FIX 2: All derived data memoized — no recompute on unrelated state changes
  const currentMonth = useMemo(
    () => monthly.find(m => m.month_key === currentMonthKey) || null,
    [monthly, currentMonthKey]
  );

  const bestMonth = useMemo(() =>
    monthly.length > 0
      ? monthly.reduce((b, m) => m.institute_income > (b?.institute_income || 0) ? m : b, null)
      : null
  , [monthly]);

  const monthlyForHistory = useMemo(() => {
    const cur  = monthly.find(m => m.month_key === currentMonthKey);
    const rest = monthly
      .filter(m => m.month_key !== currentMonthKey)
      .sort((a, b) => b.month_key.localeCompare(a.month_key));
    return cur ? [cur, ...rest] : rest;
  }, [monthly, currentMonthKey]);

  const nextRefreshLabel = useMemo(() => {
    const now  = new Date();
    const next = new Date(
      now.getDate() >= 8 ? now.getFullYear() : now.getFullYear(),
      now.getDate() >= 8 ? now.getMonth() + 1 : now.getMonth(),
      8
    );
    return next.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }, []);

  // FIX 3: fetchData wrapped in useCallback so it's stable
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res  = await authFetch(`${API}/income/admin/institute`);
      const json = await res.json();
      if (json.success) setData(json);
      else setError(json.error || "Failed to load institute income.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const auth = guardRoute("ADMIN", router);
    if (auth) fetchData();
  }, [router, fetchData]);

  // FIX 4: Auto-refresh timer — depends only on fetchData (stable), NOT on data.
  // Previously depending on [data] caused this effect to re-run every load → extra renders.
  useEffect(() => {
    const now   = new Date();
    const next8 = new Date(
      now.getDate() >= 8 ? now.getFullYear() : now.getFullYear(),
      now.getDate() >= 8 ? now.getMonth() + 1 : now.getMonth(),
      8, 0, 0, 0
    );
    const t = setTimeout(fetchData, next8.getTime() - now.getTime());
    return () => clearTimeout(t);
  }, [fetchData]); // ← was [data], caused re-run on every fetch

  // ── Trend vs previous month ────────────────────────────────────────────
  function trendVs(key) {
    if (!currentMonth) return null;
    const prev = monthly
      .filter(m => m.month_key < currentMonthKey)
      .sort((a, b) => b.month_key.localeCompare(a.month_key))[0];
    if (!prev) return null;
    const diff = currentMonth[key] - prev[key];
    const pct  = prev[key] > 0 ? (diff / prev[key]) * 100 : 0;
    return { pct, up: diff >= 0 };
  }

  // ── Exports ───────────────────────────────────────────────────────────
  function exportMonthly() {
    setExporting(true);
    try {
      const headers = ["Month","Payments","Gross Total (Rs.)",`Institute Income ${institutePct}% (Rs.)`,`Teacher Payouts ${teacherPct}% (Rs.)`];
      const rows    = monthly.map(m => [m.month_label, m.payment_count, m.gross_total.toFixed(2), m.institute_income.toFixed(2), m.teacher_payouts.toFixed(2)]);
      const summary = [[],["--- TOTALS ---"],["All Time", totals.payment_count, totals.gross_total?.toFixed(2), totals.institute_income?.toFixed(2), totals.teacher_payouts?.toFixed(2)]];
      const esc = v => `"${String(v ?? "").replace(/"/g,'""')}"`;
      const csv = [...[headers, ...rows, ...summary].map(r => r.map(esc).join(","))].join("\n");
      const a   = Object.assign(document.createElement("a"), {
        href: URL.createObjectURL(new Blob(["\uFEFF"+csv], { type:"text/csv;charset=utf-8;" })),
        download: `institute-income-${new Date().toISOString().slice(0,10)}.csv`,
      });
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } finally { setTimeout(() => setExporting(false), 800); }
  }

  function exportTeachers() {
    setExporting(true);
    try {
      const headers = ["Teacher",`Gross Total (Rs.)`,`Teacher Payout ${teacherPct}% (Rs.)`,`Institute Share ${institutePct}% (Rs.)`,"Payments"];
      const rows    = teachers.map(t => [t.teacher_name, t.gross_total.toFixed(2), t.teacher_payout.toFixed(2), t.institute_share.toFixed(2), t.payment_count]);
      const esc = v => `"${String(v ?? "").replace(/"/g,'""')}"`;
      const csv = [...[headers, ...rows].map(r => r.map(esc).join(","))].join("\n");
      const a   = Object.assign(document.createElement("a"), {
        href: URL.createObjectURL(new Blob(["\uFEFF"+csv], { type:"text/csv;charset=utf-8;" })),
        download: `teacher-payouts-${new Date().toISOString().slice(0,10)}.csv`,
      });
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } finally { setTimeout(() => setExporting(false), 800); }
  }

  /* ══════════════════════════════════════════════════════════════ */
  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* Header */}
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
          <button onClick={fetchData} className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={tab === "teachers" ? exportTeachers : exportMonthly} disabled={exporting || !data}
            className="flex items-center gap-2 text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 px-4 py-2 rounded-lg transition shadow-sm">
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Export CSV
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Policy banner */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm">
        <Info size={16} className="text-blue-700 mt-0.5 flex-shrink-0" />
        <span className="text-blue-800">
          <span className="font-bold">Revenue Split:</span> Every student payment is split automatically —{" "}
          <span className="font-bold">{teacherPct}%</span> goes to the assigned course teacher, and{" "}
          <span className="font-bold">{institutePct}%</span> is retained by the institute.
        </span>
      </div>

      {/* Single loader */}
      {loading && (
        <div className="flex items-center justify-center py-32 text-gray-400 gap-3">
          <Loader2 size={24} className="animate-spin" />
          <span className="text-sm font-medium">Loading income data…</span>
        </div>
      )}

      {/* Tab bar */}
      {dataReady && (
        <div className="flex bg-white border border-gray-200 rounded-xl p-1 w-fit">
          {[
            { key: "overview", label: "This Month",      icon: <LayoutDashboard size={14} /> },
            { key: "monthly",  label: "Monthly History", icon: <BarChart2 size={14} /> },
            { key: "teachers", label: "Per-Teacher",     icon: <Users size={14} /> },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.key ? "bg-blue-700 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>
      )}

      {/* ════════════════════════════════════════
          TAB: THIS MONTH
          Shows current month data. If April has no payments yet,
          cards show Rs. 0.00 stably (no blink) with a notice below.
      ════════════════════════════════════════ */}
      {dataReady && tab === "overview" && (
        <div className="space-y-6">

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

          {/* FIX 5: Stat cards — values read from memoized currentMonth, no intermediate 0 flash */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Gross Revenue",                  valKey: "gross_total",      tKey: "gross_total",      iconBg: "bg-blue-50",   iconColor: "text-blue-700",   icon: <Receipt   size={22} /> },
              { label: `Institute Income (${institutePct}%)`, valKey: "institute_income", tKey: "institute_income", iconBg: "bg-indigo-50", iconColor: "text-indigo-700", icon: <Building2 size={22} /> },
              { label: `Teacher Payouts (${teacherPct}%)`,   valKey: "teacher_payouts",  tKey: "teacher_payouts",  iconBg: "bg-amber-50",  iconColor: "text-amber-700",  icon: <Wallet    size={22} /> },
              { label: "Best Month Ever",                 valKey: null,              tKey: null,               iconBg: "bg-green-50",  iconColor: "text-green-700",  icon: <TrendingUp size={22} /> },
            ].map((s, i) => {
              // Read from memoized currentMonth — stable, no flicker
              const val = s.valKey
                ? (currentMonth ? `Rs. ${fmt(currentMonth[s.valKey])}` : "Rs. 0.00")
                : (bestMonth ? `Rs. ${fmt(bestMonth.institute_income)}` : "—");

              const sub = i === 0 ? `${currentMonth?.payment_count ?? 0} payments this month`
                        : i === 1 ? `${institutePct}% of gross revenue`
                        : i === 2 ? `Across ${teachers.length} teacher(s)`
                        : (bestMonth?.month_label || "No data yet");

              const trend = s.tKey ? trendVs(s.tKey) : null;

              return (
                <div key={i} className={`bg-white p-6 rounded-xl shadow-sm border flex items-center justify-between ${
                  !currentMonth && i < 3 ? "border-gray-100 opacity-70" : "border-gray-200"
                }`}>
                  <div className="min-w-0 mr-3">
                    <p className="text-sm font-medium text-gray-500">{s.label}</p>
                    <h3 className={`font-bold text-gray-900 mt-1 leading-tight break-all ${val.length > 14 ? "text-lg" : "text-2xl"}`}>
                      {val}
                    </h3>
                    <span className="text-xs text-gray-400 mt-0.5 block">{sub}</span>
                    {trend && (
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold mt-1 ${trend.up ? "text-green-600" : "text-red-500"}`}>
                        {trend.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {trend.up ? "+" : ""}{trend.pct.toFixed(1)}% vs last month
                      </span>
                    )}
                  </div>
                  <div className={`p-3 ${s.iconBg} ${s.iconColor} rounded-full flex-shrink-0`}>{s.icon}</div>
                </div>
              );
            })}
          </div>

          {/* Split bar */}
          {currentMonth && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <p className="text-sm font-bold text-gray-900 mb-3">Revenue Split — {currentLabel}</p>
              <div className="flex rounded-full overflow-hidden h-4 mb-2">
                <div className="bg-blue-700 flex items-center justify-center text-[10px] font-bold text-white" style={{ width: `${institutePct}%` }}>{institutePct}%</div>
                <div className="bg-amber-400 flex items-center justify-center text-[10px] font-bold text-white" style={{ width: `${teacherPct}%` }}>{teacherPct}%</div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-blue-700 font-semibold">Institute — Rs. {fmt(currentMonth.institute_income)}</span>
                <span className="text-amber-600 font-semibold">Teachers — Rs. {fmt(currentMonth.teacher_payouts)}</span>
              </div>
            </div>
          )}

          {/* Empty state — shown only after data is fully loaded (no blink) */}
          {!currentMonth && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm">
              <Info size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <span className="text-amber-800">
                <span className="font-bold">No payments recorded yet for {currentLabel}.</span>{" "}
                Payments will appear above once students enroll this month.
              </span>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════
          TAB: MONTHLY HISTORY
      ════════════════════════════════════════ */}
      {dataReady && tab === "monthly" && (
        <div className="space-y-6">
          {monthly.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <History size={48} className="mx-auto mb-3 text-gray-200" />
              <p className="font-bold text-gray-500">No history yet.</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <p className="text-sm font-bold text-gray-900">Income Trend</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5"><span className="inline-block w-4 h-0.5 bg-blue-500 rounded" />Gross</span>
                    <span className="flex items-center gap-1.5"><span className="inline-block w-4 h-0.5 bg-indigo-500 rounded" />Institute</span>
                    <span className="flex items-center gap-1.5"><span className="inline-block w-4 h-0.5 bg-amber-400 rounded" style={{ borderBottom: "2px dashed #f59e0b", background: "none", height: 0, width: 16 }} />Teachers</span>
                  </div>
                </div>
                <LineChart months={monthly} />
              </div>

              {/* FIX 6: monthlyForHistory is memoized — no re-sort on unrelated state changes */}
              <div className="space-y-3">
                {monthlyForHistory.map((m, idx) => {
                  const isCurrent = m.month_key === currentMonthKey;
                  const pct = (bestMonth && bestMonth.institute_income > 0)
                    ? Math.min((m.institute_income / bestMonth.institute_income) * 100, 100) : 0;
                  const isLastMonth = !isCurrent && monthlyForHistory[0]?.month_key === currentMonthKey && idx === 1;

                  return (
                    <div key={m.month_key} className={`bg-white rounded-xl border shadow-sm p-5 ${
                      isCurrent ? "border-blue-200 ring-1 ring-blue-100" : "border-gray-200"
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-gray-900 text-base">{m.month_label}</span>
                            {isCurrent && <span className="text-xs font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">Current Month</span>}
                            {isLastMonth && <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Last Month</span>}
                            {bestMonth && m.month_key === bestMonth.month_key && !isCurrent && (
                              <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">Best Month</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {isCurrent && m.payment_count === 0
                              ? "No payments yet this month"
                              : `${m.payment_count} payment${m.payment_count !== 1 ? "s" : ""}`}
                          </p>
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
                        <div className="bg-blue-700" style={{ width: `${institutePct}%` }} />
                        <div className="bg-amber-400" style={{ width: `${teacherPct}%` }} />
                      </div>
                      <div className="flex justify-between text-xs mb-3">
                        <span className="text-blue-700">Institute {institutePct}%</span>
                        <span className="text-amber-600">Teachers {teacherPct}%</span>
                      </div>

                      {isCurrent && m.payment_count === 0 ? (
                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-xs text-amber-500 flex items-center gap-1">
                            <Info size={11} /> Waiting for first payment this month
                          </p>
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-gray-100">
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div className="bg-blue-700 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{pct.toFixed(0)}% of best month</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════
          TAB: PER-TEACHER
      ════════════════════════════════════════ */}
      {dataReady && tab === "teachers" && (
        <div className="space-y-4">

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
            const isExpanded       = expandedTeacher === t.teacher_id;
            const currentMonthData = t.monthly?.find(m => m.month_key === currentMonthKey) || null;
            const historyMonths    = (t.monthly || []).filter(m => m.month_key !== currentMonthKey);
            const topMonth         = t.monthly?.length > 0
              ? t.monthly.reduce((b, m) => m.teacher_payout > (b?.teacher_payout || 0) ? m : b, null)
              : null;

            return (
              <div key={t.teacher_id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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

                {isExpanded && historyMonths.length > 0 && (
                  <div className="border-t border-gray-100 px-5 pb-5 pt-3 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          {["Month","Payments","Gross","Teacher Payout","Institute Share"].map(h => (
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
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}