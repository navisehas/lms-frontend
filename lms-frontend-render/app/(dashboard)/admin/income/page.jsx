"use client";
import { useState, useEffect, useMemo } from "react";
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

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function MiniLineChart({ data, color }) {
  if (!data || data.length < 2)
    return <div className="flex items-center justify-center h-20 text-xs text-gray-300">Not enough data</div>;

  const W = 500, H = 90, PX = 36, PY = 10;
  const iW = W - PX * 2, iH = H - PY * 2;
  const vals = data.map((d) => d.value);
  const maxV = Math.max(...vals, 1);

  const pts = data.map((d, i) => ({
    x: PX + (i / (data.length - 1)) * iW,
    y: PY + iH - (d.value / maxV) * iH,
    ...d,
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPath = linePath +
    ` L${pts[pts.length - 1].x.toFixed(1)},${(PY + iH).toFixed(1)} L${pts[0].x.toFixed(1)},${(PY + iH).toFixed(1)} Z`;

  const gradId = `g${color.replace("#", "")}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 90 }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3.5" fill={color} stroke="white" strokeWidth="2" />
          <text x={p.x} y={H - 1} textAnchor="middle" fontSize="9" fill="#9ca3af">{p.label}</text>
        </g>
      ))}
    </svg>
  );
}

function StatCard({ label, value, sub, icon, iconBg, iconColor, loading }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
        {loading
          ? <Loader2 className="w-5 h-5 animate-spin text-gray-300 mt-1" />
          : <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>}
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg} ${iconColor}`}>
        {icon}
      </div>
    </div>
  );
}

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
        <div className="text-right flex-shrink-0 mr-2">
          <p className="text-sm font-bold text-amber-600">Rs. {fmt(t.teacher_payout)}</p>
          <p className="text-xs text-gray-400">Total payout</p>
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
                      <td className="px-3 py-2 text-right text-gray-600">{m ? `Rs. ${fmt(m.gross_total)}` : "—"}</td>
                      <td className="px-3 py-2 text-right font-semibold text-amber-600">{m ? `Rs. ${fmt(m.teacher_payout)}` : "—"}</td>
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

export default function AdminIncomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    const auth = guardRoute("ADMIN", router);
    if (auth) fetchIncome();
  }, [router]);

  async function fetchIncome() {
    setLoading(true);
    setError("");
    try {
      const res = await authFetch(`${API}/income/admin/institute`);
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

  const grossChart = sortedAsc.map((m) => ({ label: m.month_key.slice(5), value: parseFloat(m.gross_total || 0) }));
  const instChart  = sortedAsc.map((m) => ({ label: m.month_key.slice(5), value: parseFloat(m.institute_income || 0) }));
  const tchrChart  = sortedAsc.map((m) => ({ label: m.month_key.slice(5), value: parseFloat(m.teacher_payouts || 0) }));

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
          {[
            {
              label: "Gross Revenue",
              value: `Rs. ${fmt(currentMonth?.gross_total || 0)}`,
              sub: growth !== null ? `${growth > 0 ? "+" : ""}${growth}% vs last month` : "—",
            },
            { label: "Institute Income", value: `Rs. ${fmt(currentMonth?.institute_income || 0)}`, sub: "20% share" },
            { label: "Teacher Payouts", value: `Rs. ${fmt(currentMonth?.teacher_payouts || 0)}`, sub: "80% share" },
            { label: "Payments", value: (currentMonth?.payment_count || 0), sub: "this month" },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-xs text-blue-200 font-medium mb-1">{s.label}</p>
              {loading
                ? <Loader2 size={16} className="animate-spin text-blue-300 mt-1" />
                : <p className="text-xl font-bold leading-tight">{s.value}</p>}
              <p className="text-xs text-blue-300 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* All-time Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue"   value={data ? `Rs. ${fmt(data.totals?.gross_total)}`     : "—"} sub="All time"         icon={<DollarSign size={18} />}    iconBg="bg-green-50"  iconColor="text-green-600"  loading={loading} />
        <StatCard label="Institute Income" value={data ? `Rs. ${fmt(data.totals?.institute_income)}` : "—"} sub="20% of revenue"  icon={<Building2 size={18} />}     iconBg="bg-blue-50"   iconColor="text-blue-700"   loading={loading} />
        <StatCard label="Teacher Payouts" value={data ? `Rs. ${fmt(data.totals?.teacher_payouts)}`  : "—"} sub="80% to teachers" icon={<GraduationCap size={18} />} iconBg="bg-amber-50"  iconColor="text-amber-600"  loading={loading} />
        <StatCard label="Total Payments"  value={data ? (data.totals?.payment_count ?? 0)           : "—"} sub="All enrollments"  icon={<Users size={18} />}         iconBg="bg-purple-50" iconColor="text-purple-600" loading={loading} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[{ key: "overview", label: "Monthly Charts" }, { key: "teachers", label: "Teacher Payouts" }].map((t) => (
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

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 gap-3">
          <Loader2 size={22} className="animate-spin" />
          <span className="text-sm">Loading income data…</span>
        </div>
      ) : !data ? null : tab === "overview" ? (

        <div className="space-y-6">
          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "Gross Revenue",          sub: "All payments collected monthly",     data: grossChart, color: "#16a34a" },
              { title: "Institute Income (20%)",  sub: "Institute's monthly net share",      data: instChart,  color: "#1d4ed8" },
              { title: "Teacher Payouts (80%)",   sub: "Monthly teacher disbursements",      data: tchrChart,  color: "#d97706" },
            ].map((c) => (
              <div key={c.title} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <p className="text-sm font-bold text-gray-900">{c.title}</p>
                <p className="text-xs text-gray-400 mb-3">{c.sub}</p>
                <MiniLineChart data={c.data} color={c.color} />
              </div>
            ))}
          </div>

          {/* Monthly table */}
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
              <span>Month</span><span>Gross</span><span>Institute</span><span>Teachers</span><span className="text-right">Count</span>
            </div>

            {allMonthKeys.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <TrendingUp size={32} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">No income records yet.</p>
              </div>
            ) : allMonthKeys.map((mk) => {
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
                    {isCur && <span className="text-xs bg-blue-700 text-white px-1.5 py-0.5 rounded-full font-bold leading-none">Now</span>}
                  </span>
                  <span className="font-semibold text-green-700">Rs. {fmt(m.gross_total)}</span>
                  <span className="text-blue-700 font-medium">Rs. {fmt(m.institute_income)}</span>
                  <span className="text-amber-600 font-medium">Rs. {fmt(m.teacher_payouts)}</span>
                  <span className="text-right text-gray-500">{m.payment_count}</span>
                </div>
              );
            })}
          </div>
        </div>

      ) : (

        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex flex-wrap gap-6">
            <div>
              <p className="text-xs text-amber-600 font-semibold">Total Teachers</p>
              <p className="text-xl font-bold text-gray-900">{data.teachers?.length || 0}</p>
            </div>
            <div>
              <p className="text-xs text-amber-600 font-semibold">Total Paid Out</p>
              <p className="text-xl font-bold text-amber-700">Rs. {fmt(data.totals?.teacher_payouts)}</p>
            </div>
            <div>
              <p className="text-xs text-amber-600 font-semibold">This Month</p>
              <p className="text-xl font-bold text-gray-900">Rs. {fmt(currentMonth?.teacher_payouts || 0)}</p>
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