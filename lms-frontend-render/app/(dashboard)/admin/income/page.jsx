"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp, DollarSign, Loader2, AlertCircle,
  RefreshCw, Users, BarChart3, ChevronDown, ChevronUp,
  Building2, GraduationCap, Calendar, ArrowUpRight,
} from "lucide-react";
import { guardRoute, authFetch } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL;

const fmt = (n) =>
  parseFloat(n || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// ─── Minimal SVG Line Chart ───────────────────────────────────────────────────
function LineChart({ data, color = "#6366f1", label = "Amount" }) {
  if (!data || data.length === 0) return null;

  const width = 600;
  const height = 160;
  const padX = 48;
  const padY = 16;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const values = data.map((d) => d.value);
  const maxVal = Math.max(...values, 1);
  const minVal = 0;

  const points = data.map((d, i) => {
    const x = padX + (i / Math.max(data.length - 1, 1)) * innerW;
    const y = padY + innerH - ((d.value - minVal) / (maxVal - minVal)) * innerH;
    return { x, y, ...d };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");

  // area fill path
  const areaD =
    pathD +
    ` L${points[points.length - 1].x.toFixed(1)},${(padY + innerH).toFixed(1)}` +
    ` L${points[0].x.toFixed(1)},${(padY + innerH).toFixed(1)} Z`;

  // Y axis ticks
  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => {
    const val = (maxVal / ticks) * i;
    const y = padY + innerH - (val / maxVal) * innerH;
    return { val, y };
  });

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: "100%", minWidth: 300, height: "auto", display: "block" }}
      >
        {/* Grid lines */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={padX}
              y1={t.y}
              x2={width - padX}
              y2={t.y}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="4,3"
            />
            <text
              x={padX - 6}
              y={t.y + 4}
              textAnchor="end"
              fontSize="10"
              fill="#9ca3af"
            >
              {t.val >= 1000 ? `${(t.val / 1000).toFixed(0)}k` : t.val.toFixed(0)}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <defs>
          <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#grad-${label})`} />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Data points + labels */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill={color} stroke="#fff" strokeWidth="2" />
            <text
              x={p.x}
              y={height - 2}
              textAnchor="middle"
              fontSize="9"
              fill="#6b7280"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, accent, loading }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        border: "1px solid #e5e7eb",
        padding: "20px 22px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {label}
        </p>
        {loading ? (
          <Loader2 size={20} style={{ color: "#d1d5db", animation: "spin 1s linear infinite" }} />
        ) : (
          <p style={{ fontSize: 26, fontWeight: 800, color: "#111827", lineHeight: 1.1 }}>{value}</p>
        )}
        {sub && <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>{sub}</p>}
      </div>
      <div style={{ width: 46, height: 46, borderRadius: 12, background: accent + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ color: accent }}>{icon}</span>
      </div>
    </div>
  );
}

// ─── Monthly Table Row ────────────────────────────────────────────────────────
function MonthRow({ m }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid #f3f4f6" }}>
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr 40px",
          alignItems: "center",
          padding: "14px 20px",
          cursor: "pointer",
          background: open ? "#f9fafb" : "transparent",
          transition: "background 0.15s",
          gap: 8,
        }}
      >
        <span style={{ fontWeight: 700, color: "#111827", fontSize: 14 }}>{m.month_label}</span>
        <span style={{ fontWeight: 600, color: "#059669", fontSize: 14 }}>
          Rs. {fmt(m.gross_total)}
        </span>
        <span style={{ fontWeight: 600, color: "#6366f1", fontSize: 14 }}>
          Rs. {fmt(m.institute_income)}
        </span>
        <span style={{ fontWeight: 600, color: "#f59e0b", fontSize: 14 }}>
          Rs. {fmt(m.teacher_payouts)}
        </span>
        <span style={{ color: "#9ca3af" }}>
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </span>
      </div>
      {open && (
        <div style={{ background: "#fafafa", padding: "0 20px 14px 20px", fontSize: 13 }}>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", paddingTop: 10, color: "#6b7280" }}>
            <span>
              <strong style={{ color: "#374151" }}>{m.payment_count}</strong> payments
            </span>
            <span>
              Avg per payment:{" "}
              <strong style={{ color: "#374151" }}>
                Rs. {fmt(m.payment_count ? m.gross_total / m.payment_count : 0)}
              </strong>
            </span>
            <span>
              Institute (20%):{" "}
              <strong style={{ color: "#6366f1" }}>Rs. {fmt(m.institute_income)}</strong>
            </span>
            <span>
              Teacher payouts (80%):{" "}
              <strong style={{ color: "#f59e0b" }}>Rs. {fmt(m.teacher_payouts)}</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Teacher Card ─────────────────────────────────────────────────────────────
function TeacherCard({ t }) {
  const [open, setOpen] = useState(false);

  // Build sorted monthly for this teacher
  const sortedMonthly = useMemo(
    () => [...(t.monthly || [])].sort((a, b) => a.month_key.localeCompare(b.month_key)),
    [t.monthly]
  );

  const chartData = sortedMonthly.map((m) => ({
    label: m.month_key.slice(5), // "MM"
    value: parseFloat(m.teacher_payout || 0),
  }));

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          gap: 12,
        }}
        onClick={() => setOpen((o) => !o)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "#f0fdf4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <GraduationCap size={18} style={{ color: "#16a34a" }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {t.teacher_name}
            </p>
            <p style={{ fontSize: 11, color: "#9ca3af" }}>{t.payment_count} payments</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 12, color: "#9ca3af" }}>Total Payout</p>
            <p style={{ fontWeight: 800, fontSize: 16, color: "#f59e0b" }}>
              Rs. {fmt(t.teacher_payout)}
            </p>
          </div>
          <span style={{ color: "#9ca3af" }}>
            {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </span>
        </div>
      </div>

      {/* Expanded */}
      {open && (
        <div style={{ borderTop: "1px solid #f3f4f6", padding: "16px 20px" }}>
          {/* Summary row */}
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 16, fontSize: 13 }}>
            <div style={{ background: "#f9fafb", borderRadius: 10, padding: "10px 16px" }}>
              <p style={{ color: "#6b7280", fontSize: 11 }}>Gross Revenue</p>
              <p style={{ fontWeight: 700, color: "#059669" }}>Rs. {fmt(t.gross_total)}</p>
            </div>
            <div style={{ background: "#f9fafb", borderRadius: 10, padding: "10px 16px" }}>
              <p style={{ color: "#6b7280", fontSize: 11 }}>Teacher Payout (80%)</p>
              <p style={{ fontWeight: 700, color: "#f59e0b" }}>Rs. {fmt(t.teacher_payout)}</p>
            </div>
            <div style={{ background: "#f9fafb", borderRadius: 10, padding: "10px 16px" }}>
              <p style={{ color: "#6b7280", fontSize: 11 }}>Institute Share (20%)</p>
              <p style={{ fontWeight: 700, color: "#6366f1" }}>Rs. {fmt(t.institute_share)}</p>
            </div>
          </div>

          {/* Monthly line chart */}
          {chartData.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Monthly Payout Trend
              </p>
              <LineChart data={chartData} color="#f59e0b" label={`teacher-${t.teacher_id}`} />
            </div>
          )}

          {/* Monthly breakdown table */}
          {sortedMonthly.length > 0 && (
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Monthly Breakdown
              </p>
              <div style={{ border: "1px solid #f3f4f6", borderRadius: 10, overflow: "hidden" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    background: "#f9fafb",
                    padding: "8px 14px",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    gap: 8,
                  }}
                >
                  <span>Month</span>
                  <span>Gross</span>
                  <span>Payout</span>
                  <span>Payments</span>
                </div>
                {[...sortedMonthly].reverse().map((m, i) => (
                  <div
                    key={m.month_key}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr 1fr",
                      padding: "10px 14px",
                      borderTop: i === 0 ? "1px solid #f3f4f6" : "1px solid #f9fafb",
                      fontSize: 13,
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontWeight: 600, color: "#374151" }}>{m.month_label}</span>
                    <span style={{ color: "#059669", fontWeight: 600 }}>Rs. {fmt(m.gross_total)}</span>
                    <span style={{ color: "#f59e0b", fontWeight: 700 }}>Rs. {fmt(m.teacher_payout)}</span>
                    <span style={{ color: "#6b7280" }}>{m.payment_count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminIncomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "teachers"

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

  // Build chart data from monthly (ascending order)
  const monthlyChartData = useMemo(() => {
    if (!data?.monthly) return [];
    return [...data.monthly]
      .sort((a, b) => a.month_key.localeCompare(b.month_key))
      .map((m) => ({ label: m.month_key.slice(5), value: parseFloat(m.gross_total || 0) }));
  }, [data]);

  const instituteChartData = useMemo(() => {
    if (!data?.monthly) return [];
    return [...data.monthly]
      .sort((a, b) => a.month_key.localeCompare(b.month_key))
      .map((m) => ({ label: m.month_key.slice(5), value: parseFloat(m.institute_income || 0) }));
  }, [data]);

  const teacherChartData = useMemo(() => {
    if (!data?.monthly) return [];
    return [...data.monthly]
      .sort((a, b) => a.month_key.localeCompare(b.month_key))
      .map((m) => ({ label: m.month_key.slice(5), value: parseFloat(m.teacher_payouts || 0) }));
  }, [data]);

  const sortedMonthly = useMemo(() => {
    if (!data?.monthly) return [];
    return [...data.monthly].sort((a, b) => b.month_key.localeCompare(a.month_key));
  }, [data]);

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "24px", background: "#f8fafc" }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827", display: "flex", alignItems: "center", gap: 10, margin: 0 }}>
            <BarChart3 size={26} style={{ color: "#6366f1" }} />
            Income Overview
          </h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
            Institute revenue, teacher payouts &amp; monthly analytics
          </p>
        </div>
        <button
          onClick={fetchIncome}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
            color: "#374151",
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            padding: "8px 14px",
            cursor: "pointer",
          }}
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#dc2626",
            borderRadius: 10,
            padding: "12px 16px",
            fontSize: 14,
            marginBottom: 20,
          }}
        >
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard
          label="Gross Revenue"
          value={data ? `Rs. ${fmt(data.totals?.gross_total)}` : "—"}
          sub="All student payments"
          icon={<DollarSign size={20} />}
          accent="#059669"
          loading={loading}
        />
        <StatCard
          label="Institute Income"
          value={data ? `Rs. ${fmt(data.totals?.institute_income)}` : "—"}
          sub={`${data?.institute_share_pct ?? 20}% of revenue`}
          icon={<Building2 size={20} />}
          accent="#6366f1"
          loading={loading}
        />
        <StatCard
          label="Teacher Payouts"
          value={data ? `Rs. ${fmt(data.totals?.teacher_payouts)}` : "—"}
          sub={`${data?.teacher_share_pct ?? 80}% to teachers`}
          icon={<GraduationCap size={20} />}
          accent="#f59e0b"
          loading={loading}
        />
        <StatCard
          label="Total Payments"
          value={data ? data.totals?.payment_count : "—"}
          sub="Enrollment payments"
          icon={<Users size={20} />}
          accent="#0ea5e9"
          loading={loading}
        />
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "#f1f5f9", borderRadius: 12, padding: 4, width: "fit-content" }}>
        {[
          { key: "overview", label: "Overview & Charts" },
          { key: "teachers", label: "Teacher Payouts" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "8px 18px",
              fontSize: 13,
              fontWeight: 700,
              borderRadius: 9,
              border: "none",
              cursor: "pointer",
              background: activeTab === tab.key ? "#fff" : "transparent",
              color: activeTab === tab.key ? "#111827" : "#6b7280",
              boxShadow: activeTab === tab.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "#9ca3af" }}>
          <Loader2 size={28} style={{ animation: "spin 1s linear infinite", marginBottom: 10 }} />
          <p style={{ fontSize: 14 }}>Loading income data…</p>
        </div>
      ) : !data ? null : activeTab === "overview" ? (
        <>
          {/* ── Charts row ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 24 }}>
            {/* Gross Revenue Chart */}
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <TrendingUp size={16} style={{ color: "#059669" }} />
                <p style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>Gross Revenue</p>
              </div>
              <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 14 }}>Monthly total payments collected</p>
              {monthlyChartData.length > 0 ? (
                <LineChart data={monthlyChartData} color="#059669" label="gross" />
              ) : (
                <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "30px 0" }}>No data yet</p>
              )}
            </div>

            {/* Institute Income Chart */}
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <Building2 size={16} style={{ color: "#6366f1" }} />
                <p style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>Institute Income (20%)</p>
              </div>
              <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 14 }}>Monthly institute net share</p>
              {instituteChartData.length > 0 ? (
                <LineChart data={instituteChartData} color="#6366f1" label="institute" />
              ) : (
                <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "30px 0" }}>No data yet</p>
              )}
            </div>

            {/* Teacher Payouts Chart */}
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <GraduationCap size={16} style={{ color: "#f59e0b" }} />
                <p style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>Teacher Payouts (80%)</p>
              </div>
              <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 14 }}>Monthly total teacher disbursements</p>
              {teacherChartData.length > 0 ? (
                <LineChart data={teacherChartData} color="#f59e0b" label="teachers" />
              ) : (
                <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "30px 0" }}>No data yet</p>
              )}
            </div>
          </div>

          {/* ── Monthly breakdown table ── */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 8 }}>
              <Calendar size={15} style={{ color: "#6366f1" }} />
              <p style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>Monthly Breakdown</p>
              <span style={{ marginLeft: "auto", fontSize: 12, color: "#9ca3af" }}>
                {sortedMonthly.length} months
              </span>
            </div>

            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr 40px",
                padding: "10px 20px",
                background: "#f9fafb",
                fontSize: 11,
                fontWeight: 700,
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                gap: 8,
              }}
            >
              <span>Month</span>
              <span>Gross Total</span>
              <span>Institute (20%)</span>
              <span>Teacher (80%)</span>
              <span></span>
            </div>

            {sortedMonthly.length === 0 ? (
              <div style={{ padding: "48px 0", textAlign: "center", color: "#9ca3af" }}>
                <BarChart3 size={36} style={{ margin: "0 auto 10px", opacity: 0.3 }} />
                <p style={{ fontSize: 14 }}>No income records yet.</p>
              </div>
            ) : (
              sortedMonthly.map((m) => <MonthRow key={m.month_key} m={m} />)
            )}
          </div>
        </>
      ) : (
        /* ── Teachers Tab ── */
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {data.teachers?.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "64px 0", textAlign: "center" }}>
              <GraduationCap size={40} style={{ color: "#e5e7eb", margin: "0 auto 12px" }} />
              <p style={{ fontSize: 14, color: "#9ca3af" }}>No teacher payout data yet.</p>
            </div>
          ) : (
            data.teachers.map((t) => <TeacherCard key={t.teacher_id} t={t} />)
          )}
        </div>
      )}

      {/* Spin keyframes */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}