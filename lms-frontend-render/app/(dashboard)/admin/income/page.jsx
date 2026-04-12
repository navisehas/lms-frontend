"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp, DollarSign, Loader2, AlertCircle,
  RefreshCw, Users, Building2, GraduationCap,
  ChevronDown, ChevronUp, Calendar,
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
  return fmt(v);
};

const needsAbbrev = (n) => parseFloat(n || 0) >= 1_000_000;

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/* ─── AmountDisplay ─────────────────────────────────────────────────────── */
function AmountDisplay({
  value,
  prefix = "Rs. ",
  bigClass = "text-2xl font-bold text-gray-900 leading-tight",
  fullClass = "text-xs text-gray-400 mt-0.5",
}) {
  const [expanded, setExpanded] = useState(false);
  const num = parseFloat(value || 0);
  const abbrev = needsAbbrev(num);
  const bigText  = `${prefix}${fmtShort(num)}`;
  const fullText = `${prefix}${fmt(num)}`;

  if (!abbrev) return <p className={bigClass}>{fullText}</p>;

  return (
    <div>
      <button onClick={() => setExpanded((e) => !e)} title="Click to toggle full number" className="text-left focus:outline-none group">
        <p className={`${bigClass} group-hover:opacity-80 transition-opacity`}>
          {expanded ? fullText : bigText}
          <span className="ml-1 text-xs font-normal opacity-50">{expanded ? "▲" : "▼"}</span>
        </p>
      </button>
      {!expanded && <p className={fullClass}>{fullText}</p>}
    </div>
  );
}

/* ─── HighlightAmount ────────────────────────────────────────────────────── */
function HighlightAmount({ value }) {
  const [expanded, setExpanded] = useState(false);
  const num = parseFloat(value || 0);
  const abbrev = needsAbbrev(num);
  const fullText  = `Rs. ${fmt(num)}`;
  const shortText = `Rs. ${fmtShort(num)}`;

  if (!abbrev) return <p className="text-xl font-bold leading-tight">{fullText}</p>;

  return (
    <div>
      <button onClick={() => setExpanded((e) => !e)} title="Click to toggle full number" className="text-left focus:outline-none group">
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
  const num = parseFloat(value || 0);
  const abbrev = needsAbbrev(num);
  const fullText  = `Rs. ${fmt(num)}`;
  const shortText = `Rs. ${fmtShort(num)}`;

  if (!abbrev) return <span className={colorClass}>{fullText}</span>;

  return (
    <span>
      <button onClick={() => setExpanded((e) => !e)} title="Click to toggle full number" className="text-right focus:outline-none">
        <span className={`${colorClass} hover:underline cursor-pointer`}>
          {expanded ? fullText : shortText}
          <span className={`ml-0.5 text-xs opacity-50 ${dimClass}`}>{expanded ? "▲" : "▼"}</span>
        </span>
      </button>
      {!expanded && <span className={`block text-xs font-normal ${dimClass}`}>{fullText}</span>}
    </span>
  );
}

/* ─── Chart.js Line Chart ────────────────────────────────────────────────── */
function LineChart({ datasets, labels }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const init = () => {
      if (!canvasRef.current) return;
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }

      const Chart = window.Chart;
      if (!Chart) return;

      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const gridColor  = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
      const tickColor  = isDark ? "#9ca3af" : "#6b7280";

      chartRef.current = new Chart(canvasRef.current, {
        type: "line",
        data: {
          labels,
          datasets: datasets.map((ds) => ({
            label:           ds.label,
            data:            ds.data,
            borderColor:     ds.color,
            backgroundColor: ds.color + "18",
            borderWidth:     2,
            pointRadius:     4,
            pointHoverRadius:6,
            pointBackgroundColor: ds.color,
            pointBorderColor:     "#fff",
            pointBorderWidth:     1.5,
            fill:            true,
            tension:         0.35,
          })),
        },
        options: {
          responsive:          true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: isDark ? "#1f2937" : "#fff",
              borderColor:     isDark ? "#374151" : "#e5e7eb",
              borderWidth:     1,
              titleColor:      isDark ? "#f9fafb" : "#111827",
              bodyColor:       isDark ? "#d1d5db" : "#374151",
              padding:         10,
              callbacks: {
                label: (ctx) =>
                  ` ${ctx.dataset.label}: Rs. ${fmt(ctx.parsed.y)}`,
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
              ticks: {
                color: tickColor,
                font:  { size: 11 },
                callback: (v) => "Rs. " + fmtShort(v),
              },
              beginAtZero: true,
            },
          },
        },
      });
    };

    /* Load Chart.js once */
    if (window.Chart) {
      init();
    } else {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
      s.onload = init;
      document.head.appendChild(s);
    }

    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [datasets, labels]);

  if (!labels || labels.length < 2)
    return (
      <div className="flex items-center justify-center h-48 text-xs text-gray-300">
        Not enough data
      </div>
    );

  return (
    <div style={{ position: "relative", height: 220 }}>
      <canvas ref={canvasRef} role="img" aria-label="Monthly revenue line chart" />
    </div>
  );
}

/* ─── Stat card ──────────────────────────────────────────────────────────── */
function StatCard({ label, rawValue, prefix = "", isCount = false, sub, icon, iconBg, iconColor, loading }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-gray-300 mt-1" />
        ) : isCount ? (
          <p className="text-2xl font-bold text-gray-900 leading-tight">
            {parseFloat(rawValue || 0).toLocaleString("en-US")}
          </p>
        ) : (
          <AmountDisplay
            value={rawValue}
            prefix={prefix}
            bigClass="text-2xl font-bold text-gray-900 leading-tight"
            fullClass="text-xs text-gray-400 mt-0.5"
          />
        )}
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
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
                          {isCurrent && (
                            <span className="ml-1 text-xs bg-blue-700 text-white px-1.5 py-0.5 rounded-full">Now</span>
                          )}
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

  const curKey = currentMonthKey();

  const currentMonth = useMemo(
    () => data?.monthly?.find((m) => m.month_key === curKey) || null,
    [data, curKey]
  );

  const prevMonthKey = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  const prevMonth = useMemo(
    () => data?.monthly?.find((m) => m.month_key === prevMonthKey) || null,
    [data, prevMonthKey]
  );

  const growth = useMemo(() => {
    if (!currentMonth || !prevMonth || !prevMonth.gross_total) return null;
    return (
      ((currentMonth.gross_total - prevMonth.gross_total) / prevMonth.gross_total) * 100
    ).toFixed(1);
  }, [currentMonth, prevMonth]);

  const sortedAsc = useMemo(
    () => [...(data?.monthly || [])].sort((a, b) => a.month_key.localeCompare(b.month_key)),
    [data]
  );

  const allMonthKeys = useMemo(
    () =>
      [...(data?.monthly || [])]
        .sort((a, b) => b.month_key.localeCompare(a.month_key))
        .map((m) => m.month_key),
    [data]
  );

  /* Chart.js data */
  const chartLabels   = sortedAsc.map((m) => m.month_key.slice(5));
  const combinedChartDatasets = [
    {
      label: "Gross Revenue",
      data:  sortedAsc.map((m) => parseFloat(m.gross_total   || 0)),
      color: "#16a34a",
    },
    {
      label: "Institute Income",
      data:  sortedAsc.map((m) => parseFloat(m.institute_income || 0)),
      color: "#1d4ed8",
    },
    {
      label: "Teacher Payouts",
      data:  sortedAsc.map((m) => parseFloat(m.teacher_payouts  || 0)),
      color: "#d97706",
    },
  ];

  const grossDatasets = [{ label: "Gross Revenue",   data: sortedAsc.map((m) => parseFloat(m.gross_total      || 0)), color: "#16a34a" }];
  const instDatasets  = [{ label: "Institute Income", data: sortedAsc.map((m) => parseFloat(m.institute_income || 0)), color: "#1d4ed8" }];
  const tchrDatasets  = [{ label: "Teacher Payouts",  data: sortedAsc.map((m) => parseFloat(m.teacher_payouts  || 0)), color: "#d97706" }];

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
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={15} className="text-blue-200" />
          <p className="text-sm font-semibold text-blue-100">{currentMonthLabel} — Current Month</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-blue-200 font-medium mb-1">Gross Revenue</p>
            {loading
              ? <Loader2 size={16} className="animate-spin text-blue-300 mt-1" />
              : <HighlightAmount value={currentMonth?.gross_total || 0} />
            }
            <p className="text-xs text-blue-300 mt-1">
              {growth !== null ? `${growth > 0 ? "+" : ""}${growth}% vs last month` : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-blue-200 font-medium mb-1">Institute Income</p>
            {loading
              ? <Loader2 size={16} className="animate-spin text-blue-300 mt-1" />
              : <HighlightAmount value={currentMonth?.institute_income || 0} />
            }
            <p className="text-xs text-blue-300 mt-1">20% share</p>
          </div>
          <div>
            <p className="text-xs text-blue-200 font-medium mb-1">Teacher Payouts</p>
            {loading
              ? <Loader2 size={16} className="animate-spin text-blue-300 mt-1" />
              : <HighlightAmount value={currentMonth?.teacher_payouts || 0} />
            }
            <p className="text-xs text-blue-300 mt-1">80% share</p>
          </div>
          <div>
            <p className="text-xs text-blue-200 font-medium mb-1">Payments</p>
            {loading
              ? <Loader2 size={16} className="animate-spin text-blue-300 mt-1" />
              : <p className="text-xl font-bold leading-tight">{currentMonth?.payment_count || 0}</p>
            }
            <p className="text-xs text-blue-300 mt-1">this month</p>
          </div>
        </div>
      </div>

      {/* All-time Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue"    rawValue={data?.totals?.gross_total}      prefix="Rs. " sub="All time"         icon={<DollarSign size={18} />}    iconBg="bg-green-50"  iconColor="text-green-600"  loading={loading} />
        <StatCard label="Institute Income" rawValue={data?.totals?.institute_income}  prefix="Rs. " sub="20% of revenue"   icon={<Building2 size={18} />}     iconBg="bg-blue-50"   iconColor="text-blue-700"   loading={loading} />
        <StatCard label="Teacher Payouts"  rawValue={data?.totals?.teacher_payouts}   prefix="Rs. " sub="80% to teachers"  icon={<GraduationCap size={18} />} iconBg="bg-amber-50"  iconColor="text-amber-600"  loading={loading} />
        <StatCard label="Total Payments"   rawValue={data?.totals?.payment_count ?? 0} isCount      sub="All enrollments"  icon={<Users size={18} />}         iconBg="bg-purple-50" iconColor="text-purple-600" loading={loading} />
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

          {/* Combined Chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-bold text-gray-900">Revenue Overview</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {combinedChartDatasets.map((ds) => (
                  <span key={ds.label} className="flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: ds.color }} />
                    {ds.label}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-4">All three revenue streams per month</p>
            <LineChart datasets={combinedChartDatasets} labels={chartLabels} />
          </div>

          {/* Individual Charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "Gross Revenue",         sub: "All payments monthly",         datasets: grossDatasets, color: "#16a34a" },
              { title: "Institute Income (20%)", sub: "Institute's monthly net share", datasets: instDatasets,  color: "#1d4ed8" },
              { title: "Teacher Payouts (80%)",  sub: "Monthly teacher disbursements", datasets: tchrDatasets,  color: "#d97706" },
            ].map((c) => (
              <div key={c.title} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block w-2 h-2 rounded-full" style={{ background: c.color }} />
                  <p className="text-sm font-bold text-gray-900">{c.title}</p>
                </div>
                <p className="text-xs text-gray-400 mb-3">{c.sub}</p>
                <LineChart datasets={c.datasets} labels={chartLabels} />
              </div>
            ))}
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
              <span>Month</span>
              <span>Gross</span>
              <span>Institute</span>
              <span>Teachers</span>
              <span className="text-right">Count</span>
            </div>

            {allMonthKeys.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <TrendingUp size={32} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">No income records yet.</p>
              </div>
            ) : (
              allMonthKeys.map((mk) => {
                const m = data.monthly.find((x) => x.month_key === mk);
                if (!m) return null;
                const isCur = mk === curKey;
                return (
                  <div
                    key={mk}
                    className={`grid gap-2 px-5 py-3.5 border-b border-gray-100 last:border-0 items-center text-sm ${isCur ? "bg-blue-50" : "hover:bg-gray-50"}`}
                    style={{ gridTemplateColumns: "1.4fr 1fr 1fr 1fr 60px" }}
                  >
                    <span className={`font-semibold flex items-center gap-2 ${isCur ? "text-blue-700" : "text-gray-900"}`}>
                      {m.month_label}
                      {isCur && (
                        <span className="text-xs bg-blue-700 text-white px-1.5 py-0.5 rounded-full font-bold leading-none">Now</span>
                      )}
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

        /* ─── Teacher Payouts Tab ────────────────────────────────────────── */
        <div className="space-y-4">

          {/* Summary — 3 cards: Teachers count | Total Paid Out | This Month */}
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