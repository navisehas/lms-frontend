"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp, TrendingDown, DollarSign, Loader2, AlertCircle,
  RefreshCw, Users, Building2, GraduationCap,
  ChevronDown, ChevronUp, Calendar, Minus,
} from "lucide-react";
import { guardRoute, authFetch } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;

const fmt = (n) =>
  parseFloat(n || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const fmtShort = (n) => {
  const v = parseFloat(n || 0);
  if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(2).replace(/\.?0+$/, "") + "B";
  if (v >= 1_000_000)     return (v / 1_000_000).toFixed(2).replace(/\.?0+$/, "") + "M";
  if (v >= 1_000)         return (v / 1_000).toFixed(1).replace(/\.?0+$/, "") + "K";
  return fmt(v);
};

const needsAbbrev = (n) => parseFloat(n || 0) >= 1_000_000;

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function prevMonthKeyFn() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/* ─── AmountDisplay ─────────────────────────────────────────────────────── */
function AmountDisplay({ value, prefix = "Rs. ", bigClass, fullClass }) {
  const [expanded, setExpanded] = useState(false);
  const num      = parseFloat(value || 0);
  const abbrev   = needsAbbrev(num);
  const bigText  = `${prefix}${fmtShort(num)}`;
  const fullText = `${prefix}${fmt(num)}`;
  const bc = bigClass  || "text-2xl font-bold text-gray-900 leading-tight";
  const fc = fullClass || "text-xs text-gray-400 mt-0.5";

  if (!abbrev) return <p className={bc}>{fullText}</p>;
  return (
    <div>
      <button onClick={() => setExpanded((e) => !e)} title="Toggle full amount" className="text-left focus:outline-none group">
        <p className={`${bc} group-hover:opacity-80 transition-opacity`}>
          {expanded ? fullText : bigText}
          <span className="ml-1 text-xs font-normal opacity-50">{expanded ? "▲" : "▼"}</span>
        </p>
      </button>
      {!expanded && <p className={fc}>{fullText}</p>}
    </div>
  );
}

/* ─── HighlightAmount ────────────────────────────────────────────────────── */
function HighlightAmount({ value }) {
  const [expanded, setExpanded] = useState(false);
  const num       = parseFloat(value || 0);
  const abbrev    = needsAbbrev(num);
  const fullText  = `Rs. ${fmt(num)}`;
  const shortText = `Rs. ${fmtShort(num)}`;
  if (!abbrev) return <p className="text-xl font-bold leading-tight">{fullText}</p>;
  return (
    <div>
      <button onClick={() => setExpanded((e) => !e)} className="text-left focus:outline-none group">
        <p className="text-xl font-bold leading-tight group-hover:text-blue-200 transition-colors">
          {expanded ? fullText : shortText}
          <span className="ml-1 text-xs font-normal text-blue-300 opacity-70">{expanded ? "▲" : "▼"}</span>
        </p>
      </button>
      {!expanded && <p className="text-xs text-blue-300 mt-0.5">{fullText}</p>}
    </div>
  );
}

/* ─── TableAmount ────────────────────────────────────────────────────────── */
function TableAmount({ value, colorClass = "text-gray-700", dimClass = "text-gray-400" }) {
  const [expanded, setExpanded] = useState(false);
  const num       = parseFloat(value || 0);
  const abbrev    = needsAbbrev(num);
  const fullText  = `Rs. ${fmt(num)}`;
  const shortText = `Rs. ${fmtShort(num)}`;
  if (!abbrev) return <span className={colorClass}>{fullText}</span>;
  return (
    <span>
      <button onClick={() => setExpanded((e) => !e)} className="text-right focus:outline-none">
        <span className={`${colorClass} hover:underline cursor-pointer`}>
          {expanded ? fullText : shortText}
          <span className={`ml-0.5 text-xs opacity-50 ${dimClass}`}>{expanded ? "▲" : "▼"}</span>
        </span>
      </button>
      {!expanded && <span className={`block text-xs font-normal ${dimClass}`}>{fullText}</span>}
    </span>
  );
}

/* ─── Delta badge ────────────────────────────────────────────────────────── */
function DeltaBadge({ current, previous, label = "" }) {
  if (previous === undefined || previous === null) return null;
  const cur  = parseFloat(current  || 0);
  const prev = parseFloat(previous || 0);
  if (!prev) return null;
  const diff = cur - prev;
  const pct  = ((diff / prev) * 100).toFixed(1);
  const up   = diff >= 0;
  const zero = diff === 0;

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
      zero ? "text-gray-500 bg-gray-100" : up ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"
    }`}>
      {zero ? <Minus size={10} /> : up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {zero ? "0%" : `${up ? "+" : ""}${pct}%`}{label}
    </span>
  );
}

/* ─── Revenue Overview Chart ─────────────────────────────────────────────── */
function RevenueOverviewChart({ sortedAsc, currentMonthKey: curKey, prevMonthKey: prevKey }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  const labels    = sortedAsc.map((m) => m.month_key.slice(5));
  const grossData = sortedAsc.map((m) => parseFloat(m.gross_total      || 0));
  const instData  = sortedAsc.map((m) => parseFloat(m.institute_income || 0));
  const tchrData  = sortedAsc.map((m) => parseFloat(m.teacher_payouts  || 0));
  const curIdx    = sortedAsc.findIndex((m) => m.month_key === curKey);
  const prevIdx   = sortedAsc.findIndex((m) => m.month_key === prevKey);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const init = () => {
      if (!canvasRef.current) return;
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
      const Chart = window.Chart;
      if (!Chart) return;

      const isDark     = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const gridColor  = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
      const tickColor  = isDark ? "#9ca3af" : "#6b7280";
      const bgColor    = isDark ? "#1f2937" : "#ffffff";
      const textColor  = isDark ? "#f9fafb" : "#111827";
      const mutedColor = isDark ? "#d1d5db" : "#374151";

      const bandPlugin = {
        id: "monthBands",
        beforeDraw(chart) {
          const { ctx, chartArea, scales } = chart;
          if (!chartArea) return;
          const xScale = scales.x;
          const bw = xScale.getPixelForValue(1) - xScale.getPixelForValue(0);

          const drawBand = (idx, color, alpha) => {
            if (idx < 0) return;
            const x = xScale.getPixelForValue(idx);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle   = color;
            ctx.fillRect(x - bw / 2, chartArea.top, bw, chartArea.bottom - chartArea.top);
            ctx.restore();
          };

          drawBand(prevIdx, "#f59e0b", 0.12);
          drawBand(curIdx,  "#1d4ed8", 0.13);
        },
      };

      const makePointSizes = (data) =>
        data.map((_, i) => (i === curIdx || i === prevIdx) ? 7 : 3);

      /* Per-point colors: highlighted months get a white-bordered ring in the dataset color,
         NOT amber — so tooltip legend boxes stay correct (they read dataset borderColor). */
      const makePointColors = (baseColor, data) =>
        data.map(() => baseColor);

      chartRef.current = new Chart(canvasRef.current, {
        type: "line",
        plugins: [bandPlugin],
        data: {
          labels,
          datasets: [
            {
              label: "Gross Revenue",
              data: grossData,
              borderColor: "#16a34a",
              backgroundColor: "#16a34a14",
              pointBackgroundColor: makePointColors("#16a34a", grossData),
              pointRadius:      makePointSizes(grossData),
              pointHoverRadius: 8,
              pointBorderColor: grossData.map((_, i) => (i === curIdx || i === prevIdx) ? "#f59e0b" : "#fff"),
              pointBorderWidth: grossData.map((_, i) => (i === curIdx || i === prevIdx) ? 3 : 2),
              borderWidth: 2.5,
              fill: true,
              tension: 0.38,
              borderDash: [],
            },
            {
              label: "Institute Income",
              data: instData,
              borderColor: "#1d4ed8",
              backgroundColor: "transparent",
              pointBackgroundColor: makePointColors("#1d4ed8", instData),
              pointRadius:      makePointSizes(instData),
              pointHoverRadius: 8,
              pointBorderColor: instData.map((_, i) => (i === curIdx || i === prevIdx) ? "#f59e0b" : "#fff"),
              pointBorderWidth: instData.map((_, i) => (i === curIdx || i === prevIdx) ? 3 : 2),
              borderWidth: 2,
              fill: false,
              tension: 0.38,
              borderDash: [6, 3],
            },
            {
              label: "Teacher Payouts",
              data: tchrData,
              borderColor: "#d97706",
              backgroundColor: "transparent",
              pointBackgroundColor: makePointColors("#d97706", tchrData),
              pointRadius:      makePointSizes(tchrData),
              pointHoverRadius: 8,
              pointBorderColor: tchrData.map((_, i) => (i === curIdx || i === prevIdx) ? "#f59e0b" : "#fff"),
              pointBorderWidth: tchrData.map((_, i) => (i === curIdx || i === prevIdx) ? 3 : 2),
              borderWidth: 2,
              fill: false,
              tension: 0.38,
              borderDash: [2, 3],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: bgColor,
              borderColor: isDark ? "#374151" : "#e5e7eb",
              borderWidth: 1,
              titleColor: textColor,
              bodyColor: mutedColor,
              padding: 12,
              usePointStyle: false,
              boxWidth: 10,
              boxHeight: 10,
              callbacks: {
                title: (items) => {
                  const idx = items[0]?.dataIndex;
                  const m   = sortedAsc[idx];
                  const tag = idx === curIdx ? " — Current Month" : idx === prevIdx ? " — Previous Month" : "";
                  return (m?.month_label || labels[idx]) + tag;
                },
                label: (ctx) => ` ${ctx.dataset.label}: Rs. ${fmt(ctx.parsed.y)}`,
                afterBody: (items) => {
                  const idx = items[0]?.dataIndex;
                  if (idx !== curIdx || prevIdx < 0) return [];
                  const fields = ["gross_total", "institute_income", "teacher_payouts"];
                  const lines  = ["", "vs " + (sortedAsc[prevIdx]?.month_label || "Previous Month") + ":"];
                  items.forEach((item, i) => {
                    const cur  = parseFloat(item.parsed.y);
                    const prev = parseFloat(sortedAsc[prevIdx]?.[fields[i]] || 0);
                    if (!prev) return;
                    const pct   = ((cur - prev) / prev * 100).toFixed(1);
                    const arrow = cur >= prev ? "▲" : "▼";
                    lines.push(` ${arrow} ${item.dataset.label.split(" ")[0]}: ${cur >= prev ? "+" : ""}${pct}%`);
                  });
                  return lines;
                },
              },
            },
          },
          scales: {
            x: {
              grid:  { color: gridColor },
              ticks: { color: tickColor, font: { size: 11 }, autoSkip: false, maxRotation: 45 },
            },
            y: {
              grid:  { color: gridColor },
              ticks: { color: tickColor, font: { size: 11 }, callback: (v) => "Rs. " + fmtShort(v) },
              beginAtZero: true,
            },
          },
        },
      });
    };

    if (window.Chart) { init(); }
    else {
      const s = document.createElement("script");
      s.src   = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
      s.onload = init;
      document.head.appendChild(s);
    }
    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [sortedAsc, curIdx, prevIdx]);

  const curM  = sortedAsc[curIdx];
  const prevM = sortedAsc[prevIdx];

  const compRows = [
    { label: "Gross Revenue",    field: "gross_total",      color: "text-green-700",  borderColor: "border-green-200",  bg: "bg-green-50"  },
    { label: "Institute Income", field: "institute_income",  color: "text-blue-700",   borderColor: "border-blue-200",   bg: "bg-blue-50"   },
    { label: "Teacher Payouts",  field: "teacher_payouts",   color: "text-amber-600",  borderColor: "border-amber-200",  bg: "bg-amber-50"  },
    { label: "Payments",         field: "payment_count",     color: "text-purple-700", borderColor: "border-purple-200", bg: "bg-purple-50", isCount: true },
  ];

  if (!sortedAsc.length || sortedAsc.length < 2) return (
    <div className="flex items-center justify-center h-48 text-xs text-gray-300">Not enough data</div>
  );

  return (
    <div className="space-y-5">

      {/* Legend row */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-500">
        <span className="flex items-center gap-2">
          <svg width="24" height="10"><line x1="0" y1="5" x2="24" y2="5" stroke="#16a34a" strokeWidth="2.5" /></svg>
          Gross Revenue
        </span>
        <span className="flex items-center gap-2">
          <svg width="24" height="10"><line x1="0" y1="5" x2="24" y2="5" stroke="#1d4ed8" strokeWidth="2" strokeDasharray="6 3" /></svg>
          Institute Income
        </span>
        <span className="flex items-center gap-2">
          <svg width="24" height="10"><line x1="0" y1="5" x2="24" y2="5" stroke="#d97706" strokeWidth="2" strokeDasharray="2 3" /></svg>
          Teacher Payouts
        </span>
        <span className="flex items-center gap-2 ml-auto">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "#1d4ed820" }} />
          Current month
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "#f59e0b20" }} />
          Previous month
        </span>
      </div>

      {/* Chart canvas */}
      <div style={{ position: "relative", height: 260 }}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Monthly revenue overview — gross revenue, institute income, and teacher payouts across all months"
        />
      </div>

      {/* Current vs Previous comparison mini-cards */}
      {curM && prevM && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2.5">
            {curM.month_label} vs {prevM.month_label} — Comparison
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {compRows.map((row) => {
              const curNum  = parseFloat(curM[row.field]  || 0);
              const prevNum = parseFloat(prevM[row.field] || 0);
              const diff    = curNum - prevNum;
              const pct     = prevNum ? ((diff / prevNum) * 100).toFixed(1) : null;
              const up      = diff > 0;
              const zero    = diff === 0;
              return (
                <div key={row.label} className={`rounded-xl border ${row.borderColor} ${row.bg} p-3`}>
                  <p className="text-xs text-gray-500 font-medium mb-2">{row.label}</p>

                  {/* Current */}
                  <p className={`text-sm font-bold ${row.color} leading-tight`}>
                    {row.isCount ? curNum.toLocaleString("en-US") : `Rs. ${fmtShort(curNum)}`}
                  </p>
                  {!row.isCount && needsAbbrev(curNum) && (
                    <p className="text-xs text-gray-400 leading-tight">Rs. {fmt(curNum)}</p>
                  )}

                  <div className="my-2 border-t border-white/60" />

                  {/* Previous */}
                  <p className="text-xs text-gray-400 mb-1.5">
                    Prev: <span className="font-medium text-gray-600">
                      {row.isCount ? prevNum.toLocaleString("en-US") : `Rs. ${fmtShort(prevNum)}`}
                    </span>
                  </p>

                  {/* Delta pill */}
                  {pct !== null && (
                    <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                      zero ? "bg-white/70 text-gray-500" : up ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {zero ? <Minus size={9} /> : up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                      {zero ? "No change" : `${up ? "+" : ""}${pct}%`}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Stat card ──────────────────────────────────────────────────────────── */
function StatCard({ label, rawValue, prefix = "", isCount = false, sub, icon, iconBg, iconColor, loading, prevValue }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-gray-300 mt-1" />
        ) : isCount ? (
          <p className="text-2xl font-bold text-gray-900 leading-tight">
            {parseFloat(rawValue || 0).toLocaleString("en-US")}
          </p>
        ) : (
          <AmountDisplay value={rawValue} prefix={prefix} />
        )}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {sub && <p className="text-xs text-gray-400">{sub}</p>}
          {!loading && prevValue !== undefined && (
            <DeltaBadge current={rawValue} previous={prevValue} />
          )}
        </div>
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg} ${iconColor}`}>
        {icon}
      </div>
    </div>
  );
}

/* ─── Teacher row ────────────────────────────────────────────────────────── */
function TeacherRow({ t, allMonthKeys }) {
  const [open, setOpen] = useState(false);
  const monthlyMap = useMemo(() => {
    const map = {};
    for (const m of t.monthly || []) map[m.month_key] = m;
    return map;
  }, [t.monthly]);
  const curKey = currentMonthKey();

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <GraduationCap size={14} className="text-blue-700" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{t.teacher_name}</p>
          <p className="text-xs text-gray-400">{t.payment_count} payments</p>
        </div>
        <div className="text-right flex-shrink-0 mr-2" onClick={(e) => e.stopPropagation()}>
          <TableAmount value={t.teacher_payout} colorClass="text-amber-600 text-sm font-bold" dimClass="text-amber-400" />
          <p className="text-xs text-gray-400 mt-0.5">Total payout</p>
        </div>
        {open ? <ChevronUp size={14} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />}
      </button>

      {open && (
        <div className="px-4 pb-4 bg-gray-50">
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-3 py-2 font-semibold text-gray-500">Month</th>
                  <th className="text-right px-3 py-2 font-semibold text-gray-500">Gross</th>
                  <th className="text-right px-3 py-2 font-semibold text-gray-500">Payout (80%)</th>
                  <th className="text-right px-3 py-2 font-semibold text-gray-500">Payments</th>
                </tr>
              </thead>
              <tbody>
                {allMonthKeys.map((mk) => {
                  const m = monthlyMap[mk];
                  const isCurrent = mk === curKey;
                  return (
                    <tr key={mk} className={`border-b border-gray-50 last:border-0 ${isCurrent ? "bg-blue-50" : ""}`}>
                      <td className="px-3 py-2">
                        <span className={`font-medium ${isCurrent ? "text-blue-700" : "text-gray-700"}`}>
                          {m?.month_label || mk}
                          {isCurrent && <span className="ml-1 text-xs bg-blue-700 text-white px-1.5 py-0.5 rounded-full">Now</span>}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        {m ? <TableAmount value={m.gross_total} colorClass="text-gray-600" dimClass="text-gray-400" /> : "—"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {m ? <TableAmount value={m.teacher_payout} colorClass="text-amber-600 font-semibold" dimClass="text-amber-400" /> : "—"}
                      </td>
                      <td className="px-3 py-2 text-right text-gray-500">{m ? m.payment_count : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function AdminIncomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [data, setData]       = useState(null);
  const [tab, setTab]         = useState("overview");

  useEffect(() => {
    const auth = guardRoute("ADMIN", router);
    if (auth) fetchIncome();
  }, [router]);

  async function fetchIncome() {
    setLoading(true);
    setError("");
    try {
      const res  = await authFetch(`${API}/income/admin/institute`);
      const json = await res.json();
      if (json.success) setData(json);
      else setError(json.error || "Failed to load income data.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const curKey  = currentMonthKey();
  const prevKey = prevMonthKeyFn();

  const currentMonth = useMemo(() => data?.monthly?.find((m) => m.month_key === curKey)  || null, [data, curKey]);
  const prevMonth    = useMemo(() => data?.monthly?.find((m) => m.month_key === prevKey) || null, [data, prevKey]);

  const growth = useMemo(() => {
    if (!currentMonth || !prevMonth || !prevMonth.gross_total) return null;
    return (((currentMonth.gross_total - prevMonth.gross_total) / prevMonth.gross_total) * 100).toFixed(1);
  }, [currentMonth, prevMonth]);

  const sortedAsc = useMemo(
    () => [...(data?.monthly || [])].sort((a, b) => a.month_key.localeCompare(b.month_key)),
    [data]
  );

  const allMonthKeys = useMemo(
    () => [...(data?.monthly || [])].sort((a, b) => b.month_key.localeCompare(a.month_key)).map((m) => m.month_key),
    [data]
  );

  const now = new Date();
  const currentMonthLabel = now.toLocaleString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="text-blue-700" size={24} />
            Institute Income
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Revenue overview &amp; teacher payouts</p>
        </div>
        <button
          onClick={fetchIncome}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition w-fit"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* Current Month Highlight */}
      <div className="bg-blue-700 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Calendar size={15} className="text-blue-200" />
          <p className="text-sm font-semibold text-blue-100">{currentMonthLabel} — Current Month</p>
          {growth !== null && (
            <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
              parseFloat(growth) >= 0 ? "bg-green-500/30 text-green-200" : "bg-red-500/30 text-red-200"
            }`}>
              {parseFloat(growth) >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {parseFloat(growth) >= 0 ? "+" : ""}{growth}% vs last month
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-blue-200 font-medium mb-1">Gross Revenue</p>
            {loading ? <Loader2 size={16} className="animate-spin text-blue-300 mt-1" /> : <HighlightAmount value={currentMonth?.gross_total || 0} />}
          </div>
          <div>
            <p className="text-xs text-blue-200 font-medium mb-1">Institute Income</p>
            {loading ? <Loader2 size={16} className="animate-spin text-blue-300 mt-1" /> : <HighlightAmount value={currentMonth?.institute_income || 0} />}
            <p className="text-xs text-blue-300 mt-1">20% share</p>
          </div>
          <div>
            <p className="text-xs text-blue-200 font-medium mb-1">Teacher Payouts</p>
            {loading ? <Loader2 size={16} className="animate-spin text-blue-300 mt-1" /> : <HighlightAmount value={currentMonth?.teacher_payouts || 0} />}
            <p className="text-xs text-blue-300 mt-1">80% share</p>
          </div>
          <div>
            <p className="text-xs text-blue-200 font-medium mb-1">Payments</p>
            {loading ? <Loader2 size={16} className="animate-spin text-blue-300 mt-1" /> : <p className="text-xl font-bold leading-tight">{currentMonth?.payment_count || 0}</p>}
            <p className="text-xs text-blue-300 mt-1">this month</p>
          </div>
        </div>
      </div>

      {/* All-time Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue"    rawValue={data?.totals?.gross_total}       prefix="Rs. " sub="All time"        prevValue={prevMonth?.gross_total}      icon={<DollarSign size={18} />}    iconBg="bg-green-50"  iconColor="text-green-600"  loading={loading} />
        <StatCard label="Institute Income" rawValue={data?.totals?.institute_income}   prefix="Rs. " sub="20% of revenue"  prevValue={prevMonth?.institute_income}  icon={<Building2 size={18} />}     iconBg="bg-blue-50"   iconColor="text-blue-700"   loading={loading} />
        <StatCard label="Teacher Payouts"  rawValue={data?.totals?.teacher_payouts}    prefix="Rs. " sub="80% to teachers" prevValue={prevMonth?.teacher_payouts}   icon={<GraduationCap size={18} />} iconBg="bg-amber-50"  iconColor="text-amber-600"  loading={loading} />
        <StatCard label="Total Payments"   rawValue={data?.totals?.payment_count ?? 0} isCount       sub="All enrollments" prevValue={prevMonth?.payment_count}     icon={<Users size={18} />}         iconBg="bg-purple-50" iconColor="text-purple-600" loading={loading} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { key: "overview", label: "Monthly Charts" },
          { key: "teachers", label: "Teacher Payouts" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              tab === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 gap-3">
          <Loader2 size={22} className="animate-spin" />
          <span className="text-sm">Loading income data…</span>
        </div>
      ) : !data ? null : tab === "overview" ? (

        <div className="space-y-6">

          {/* Revenue Overview Chart — single chart with comparison */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-start justify-between mb-5 flex-wrap gap-2">
              <div>
                <p className="text-sm font-bold text-gray-900">Revenue Overview</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Hover any month to see values · Highlighted bands show current &amp; previous month
                </p>
              </div>
              {currentMonth && prevMonth && (
                <DeltaBadge current={currentMonth.gross_total} previous={prevMonth.gross_total} label=" gross" />
              )}
            </div>
            <RevenueOverviewChart sortedAsc={sortedAsc} currentMonthKey={curKey} prevMonthKey={prevKey} />
          </div>

          {/* Monthly breakdown table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <TrendingUp size={15} className="text-blue-700" />
              <p className="font-bold text-gray-900 text-sm">Monthly Breakdown</p>
              <span className="ml-auto text-xs text-gray-400">{data.monthly?.length || 0} months</span>
            </div>
            <div
              className="grid gap-2 px-5 py-2.5 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide"
              style={{ gridTemplateColumns: "1.4fr 1fr 1fr 1fr 60px" }}
            >
              <span>Month</span><span>Gross</span><span>Institute</span><span>Teachers</span>
              <span className="text-right">Count</span>
            </div>

            {allMonthKeys.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <TrendingUp size={32} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">No income records yet.</p>
              </div>
            ) : (
              allMonthKeys.map((mk) => {
                const m    = data.monthly.find((x) => x.month_key === mk);
                if (!m) return null;
                const isCur  = mk === curKey;
                const isPrev = mk === prevKey;
                return (
                  <div
                    key={mk}
                    className={`grid gap-2 px-5 py-3.5 border-b border-gray-100 last:border-0 items-center text-sm ${
                      isCur ? "bg-blue-50" : isPrev ? "bg-amber-50" : "hover:bg-gray-50"
                    }`}
                    style={{ gridTemplateColumns: "1.4fr 1fr 1fr 1fr 60px" }}
                  >
                    <span className={`font-semibold flex items-center gap-2 ${isCur ? "text-blue-700" : isPrev ? "text-amber-700" : "text-gray-900"}`}>
                      {m.month_label}
                      {isCur  && <span className="text-xs bg-blue-700 text-white px-1.5 py-0.5 rounded-full font-bold leading-none">Now</span>}
                      {isPrev && <span className="text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-bold leading-none">Prev</span>}
                    </span>
                    <span><TableAmount value={m.gross_total}      colorClass="text-green-700 font-semibold" dimClass="text-green-400" /></span>
                    <span><TableAmount value={m.institute_income} colorClass="text-blue-700 font-medium"    dimClass="text-blue-300"  /></span>
                    <span><TableAmount value={m.teacher_payouts}  colorClass="text-amber-600 font-medium"   dimClass="text-amber-400" /></span>
                    <span className="text-right text-gray-500">{m.payment_count}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

      ) : (

        /* ─── Teacher Payouts Tab ─────────────────────────────────────────── */
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex flex-wrap gap-6">
            <div>
              <p className="text-xs text-amber-600 font-semibold">Total Teachers</p>
              <p className="text-xl font-bold text-gray-900">{data.teachers?.length || 0}</p>
            </div>
            <div>
              <p className="text-xs text-amber-600 font-semibold">Total Paid Out</p>
              <AmountDisplay
                value={data.totals?.teacher_payouts}
                prefix="Rs. "
                bigClass="text-xl font-bold text-amber-700 leading-tight"
                fullClass="text-xs text-amber-500 mt-0.5"
              />
              <p className="text-xs text-amber-500 mt-0.5">All time</p>
            </div>
            <div>
              <p className="text-xs text-amber-600 font-semibold">This Month</p>
              <AmountDisplay
                value={currentMonth?.teacher_payouts || 0}
                prefix="Rs. "
                bigClass="text-xl font-bold text-gray-900 leading-tight"
                fullClass="text-xs text-gray-400 mt-0.5"
              />
              <p className="text-xs text-gray-400 mt-0.5">{currentMonthLabel}</p>
            </div>
          </div>

          {!data.teachers?.length ? (
            <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
              <GraduationCap size={36} className="mx-auto mb-3 text-gray-200" />
              <p className="text-sm text-gray-400">No teacher payout data yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <GraduationCap size={15} className="text-amber-600" />
                <p className="font-bold text-gray-900 text-sm">All Teachers</p>
                <span className="text-xs text-gray-400 ml-auto">Click a teacher to see monthly history</span>
              </div>
              {data.teachers.map((t) => (
                <TeacherRow key={t.teacher_id} t={t} allMonthKeys={allMonthKeys} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}