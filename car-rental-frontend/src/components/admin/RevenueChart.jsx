import { useState, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine,
} from "recharts";

// ── Month ordering — handles BOTH full names AND abbreviations
const MONTH_FULL  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Returns 0-11 for any month format, -1 if unknown
function monthIndex(m) {
  if (!m) return -1;
  const s = String(m).trim();
  const fi = MONTH_FULL.findIndex(x => x.toLowerCase() === s.toLowerCase());
  if (fi !== -1) return fi;
  const si = MONTH_SHORT.findIndex(x => x.toLowerCase() === s.toLowerCase());
  return si;
}

// Normalize any month string to 3-letter abbreviation for display
function toShort(m) {
  if (!m) return m;
  const idx = monthIndex(m);
  return idx !== -1 ? MONTH_SHORT[idx] : String(m).slice(0, 3);
}

// ── Formatters
function fmtRevenue(v) {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000)   return `₹${(v / 1000).toFixed(1)}k`;
  return `₹${v}`;
}

// ── Custom Tooltip
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const val  = payload[0]?.value ?? 0;
  const prev = payload[0]?.payload?.prevRevenue;
  const growth = prev != null && prev > 0 ? ((val - prev) / prev) * 100 : null;

  return (
    <div style={{
      background: "var(--chart-tooltip-bg)",
      border: "1px solid var(--chart-tooltip-border)",
      borderRadius: 16,
      padding: "14px 18px",
      boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
      minWidth: 170,
    }}>
      <p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 8, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
        {label}
      </p>
      <p style={{ fontSize: 22, fontWeight: 800, color: "var(--gold)", fontFamily: "Syne, sans-serif", lineHeight: 1 }}>
        {fmtRevenue(val)}
      </p>
      {growth != null && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 18, height: 18, borderRadius: 4,
            background: growth >= 0 ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)",
            fontSize: 10, fontWeight: 700,
            color: growth >= 0 ? "#4ade80" : "#f87171",
          }}>
            {growth >= 0 ? "▲" : "▼"}
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: growth >= 0 ? "#4ade80" : "#f87171" }}>
            {Math.abs(growth).toFixed(1)}% vs prev
          </span>
        </div>
      )}
      {prev != null && (
        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
          Prev: {fmtRevenue(prev)}
        </p>
      )}
    </div>
  );
}

// ── KPI Card
function KpiCard({ label, value, sub, color, positive, icon }) {
  return (
    <div style={{
      background: "var(--surface-2)",
      border: "1px solid var(--border)",
      borderRadius: 14,
      padding: "14px 16px",
      flex: "1 1 120px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: -16, right: -16, width: 64, height: 64,
        borderRadius: "50%", background: color || "var(--gold)", opacity: 0.06,
        filter: "blur(12px)",
      }} />
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        {icon && <span style={{ fontSize: 13 }}>{icon}</span>}
        <p style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {label}
        </p>
      </div>
      <p style={{ fontSize: 20, fontWeight: 800, color: color || "var(--gold)", fontFamily: "Syne, sans-serif", lineHeight: 1.1 }}>
        {value}
      </p>
      {sub && (
        <p style={{
          fontSize: 10, marginTop: 5, fontWeight: 600,
          color: positive === true ? "#4ade80" : positive === false ? "#f87171" : "var(--text-muted)",
        }}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────
export default function RevenueChart({ data }) {
  const [chartType, setChartType] = useState("bar");
  const [period,    setPeriod]    = useState("all");

  // 1. Normalize + sort by real calendar order
  const sortedAll = useMemo(() => {
    const raw = Array.isArray(data) ? data : [];
    return [...raw]
      .map(item => ({ ...item, _idx: monthIndex(item.month) }))
      .filter(item => item._idx !== -1)
      .sort((a, b) => a._idx - b._idx)
      .map((item, idx, arr) => ({
        month: toShort(item.month),
        revenue: Number(item.revenue) || 0,
        prevRevenue: idx > 0 ? Number(arr[idx - 1].revenue) || 0 : null,
      }));
  }, [data]);

  // 2. Period slice
  const chartData = useMemo(() => {
    if (period === "3m") return sortedAll.slice(-3);
    if (period === "6m") return sortedAll.slice(-6);
    return sortedAll;
  }, [sortedAll, period]);

  // 3. Analytics
  const analytics = useMemo(() => {
    if (!sortedAll.length) return null;
    const total = sortedAll.reduce((s, d) => s + d.revenue, 0);
    const avg   = total / sortedAll.length;
    const peak  = sortedAll.reduce((b, d) => d.revenue > b.revenue ? d : b, sortedAll[0]);
    const last  = sortedAll[sortedAll.length - 1];
    const prev  = sortedAll.length > 1 ? sortedAll[sortedAll.length - 2] : null;
    const momGrowth    = prev && prev.revenue > 0 ? ((last.revenue - prev.revenue) / prev.revenue) * 100 : null;
    const mid          = Math.floor(sortedAll.length / 2);
    const firstHalf    = sortedAll.slice(0, mid).reduce((s, d) => s + d.revenue, 0);
    const secondHalf   = sortedAll.slice(mid).reduce((s, d) => s + d.revenue, 0);
    const trendGrowth  = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : null;
    return { total, avg, peak, momGrowth, trendGrowth, last };
  }, [sortedAll]);

  if (!sortedAll.length) {
    return (
      <div className="glass rounded-2xl" style={{ minHeight: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"
            style={{ margin: "0 auto 14px", display: "block", opacity: 0.3 }}>
            <path d="M3 3v18h18M7 16l4-4 4 4 4-4" />
          </svg>
          <p style={{ fontSize: 15, fontWeight: 600, fontFamily: "Syne, sans-serif" }}>No revenue data yet</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>Data will appear once bookings are confirmed</p>
        </div>
      </div>
    );
  }

  const avgRevenue = analytics?.avg ?? 0;
  const chartHeight = 260;

  return (
    <div className="glass rounded-2xl overflow-hidden" style={{ position: "relative" }}>
      <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "var(--gold)", opacity: 0.03, filter: "blur(60px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -40, left: -40, width: 180, height: 180, borderRadius: "50%", background: "#6366f1", opacity: 0.03, filter: "blur(50px)", pointerEvents: "none" }} />

      {/* HEADER */}
      <div style={{ padding: "22px 24px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 5 }}>
            Analytics · Revenue
          </p>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, color: "var(--text-primary)", margin: 0 }}>
            Monthly Revenue
          </h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {/* Period pills */}
          <div style={{ display: "flex", background: "var(--surface-2)", borderRadius: 10, padding: 3, border: "1px solid var(--border)", gap: 2 }}>
            {["3m","6m","all"].map((p) => (
              <button key={p} onClick={() => setPeriod(p)} style={{
                padding: "4px 11px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer",
                transition: "all 0.18s", border: "none", letterSpacing: "0.04em",
                background: period === p ? "var(--gold)" : "transparent",
                color: period === p ? "var(--surface)" : "var(--text-muted)",
                boxShadow: period === p ? "0 2px 8px rgba(201,168,76,0.3)" : "none",
              }}>
                {p === "all" ? "All" : p.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Chart type toggle */}
          <div style={{ display: "flex", background: "var(--surface-2)", borderRadius: 10, padding: 3, border: "1px solid var(--border)", gap: 2 }}>
            {[
              { type: "area", tip: "Area", icon: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/> },
              { type: "bar",  tip: "Bar",  icon: <><rect x="3" y="10" width="4" height="11"/><rect x="10" y="5" width="4" height="16"/><rect x="17" y="13" width="4" height="8"/></> },
            ].map(({ type, tip, icon }) => (
              <button key={type} onClick={() => setChartType(type)} title={tip} style={{
                width: 30, height: 28, borderRadius: 8, border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all 0.18s",
                background: chartType === type ? "var(--gold)" : "transparent",
                color: chartType === type ? "var(--surface)" : "var(--text-muted)",
                boxShadow: chartType === type ? "0 2px 8px rgba(201,168,76,0.3)" : "none",
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  {icon}
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI ROW */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", padding: "16px 24px 0" }}>
        <KpiCard icon="💰" label="Total Revenue"
          value={fmtRevenue(analytics?.total ?? 0)}
          sub={analytics?.trendGrowth != null ? `${analytics.trendGrowth >= 0 ? "▲" : "▼"} ${Math.abs(analytics.trendGrowth).toFixed(1)}% overall trend` : undefined}
          positive={analytics?.trendGrowth >= 0} color="var(--gold)" />
        <KpiCard icon="📊" label="Monthly Avg"
          value={fmtRevenue(avgRevenue)} sub="average per month" color="var(--text-primary)" />
        <KpiCard icon="🏆" label="Peak Month"
          value={analytics?.peak?.month ?? "—"}
          sub={analytics?.peak ? fmtRevenue(analytics.peak.revenue) : undefined}
          color="#a78bfa" />
        <KpiCard icon="📈" label="MoM Growth"
          value={analytics?.momGrowth != null ? `${analytics.momGrowth >= 0 ? "+" : ""}${analytics.momGrowth.toFixed(1)}%` : "—"}
          sub={analytics?.last && sortedAll.length > 1 ? `vs ${sortedAll[sortedAll.length - 2].month}` : undefined}
          positive={analytics?.momGrowth >= 0}
          color={analytics?.momGrowth == null ? "var(--text-muted)" : analytics.momGrowth >= 0 ? "#4ade80" : "#f87171"} />
      </div>

      {/* ═══ CHART ═══ */}
      <div style={{ padding: "20px 24px 0" }}>
        <ResponsiveContainer width="100%" height={chartHeight}>
          {chartType === "area" ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#c9a84c" stopOpacity={0.4} />
                  <stop offset="75%"  stopColor="#c9a84c" stopOpacity={0.05} />
                  <stop offset="100%" stopColor="#c9a84c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="month" stroke="transparent" tick={{ fontSize: 11, fill: "var(--text-muted)", fontWeight: 500 }} axisLine={false} tickLine={false} dy={6} />
              <YAxis stroke="transparent" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} tickFormatter={fmtRevenue} width={54} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--gold)", strokeWidth: 1.5, strokeDasharray: "5 4" }} />
              <ReferenceLine y={avgRevenue} stroke="rgba(201,168,76,0.4)" strokeDasharray="6 4"
                label={{ value: "Avg", position: "insideTopRight", fontSize: 9, fill: "var(--gold)", fontWeight: 700, dy: -6 }} />
              <Area type="monotone" dataKey="revenue" stroke="#c9a84c" strokeWidth={2.5} fill="url(#rg)"
                dot={{ r: 4, fill: "#c9a84c", stroke: "var(--surface-1)", strokeWidth: 2 }}
                activeDot={{ r: 7, fill: "#c9a84c", stroke: "var(--surface-1)", strokeWidth: 2.5 }} />
            </AreaChart>
          ) : (
            <BarChart data={chartData} barSize={Math.max(18, Math.min(36, 180 / Math.max(chartData.length, 1)))} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#e8c97a" />
                  <stop offset="100%" stopColor="#c9a84c" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="month" stroke="transparent" tick={{ fontSize: 11, fill: "var(--text-muted)", fontWeight: 500 }} axisLine={false} tickLine={false} dy={6} />
              <YAxis stroke="transparent" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} tickFormatter={fmtRevenue} width={54} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(201,168,76,0.04)", radius: 6 }} />
              <ReferenceLine y={avgRevenue} stroke="rgba(201,168,76,0.4)" strokeDasharray="6 4"
                label={{ value: "Avg", position: "insideTopRight", fontSize: 9, fill: "var(--gold)", fontWeight: 700, dy: -6 }} />
              <Bar dataKey="revenue" fill="url(#bg)" radius={[6, 6, 2, 2]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* FOOTER BREAKDOWN */}
      <div style={{ margin: "16px 24px 0", borderTop: "1px solid var(--border)", paddingTop: 14, paddingBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, overflowX: "auto" }}>
          <span style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginRight: 6, whiteSpace: "nowrap", paddingBottom: 18 }}>
            Breakdown
          </span>
          {chartData.map((d) => {
            const pct    = analytics?.peak?.revenue > 0 ? (d.revenue / analytics.peak.revenue) * 100 : 0;
            const isBest = d.month === analytics?.peak?.month;
            return (
              <div key={d.month} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, minWidth: 38 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: "var(--text-muted)" }}>{fmtRevenue(d.revenue)}</span>
                <div style={{ width: 30, height: 44, borderRadius: 8, background: "var(--surface-3)", position: "relative", overflow: "hidden" }}>
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    height: `${Math.max(pct, 4)}%`,
                    background: isBest
                      ? "linear-gradient(to top, #c9a84c, #f5d78e)"
                      : "rgba(201,168,76,0.35)",
                    borderRadius: 8,
                    transition: "height 0.5s ease",
                    boxShadow: isBest ? "0 0 8px rgba(201,168,76,0.4)" : "none",
                  }} />
                </div>
                <span style={{ fontSize: 9, color: isBest ? "var(--gold)" : "var(--text-muted)", fontWeight: isBest ? 800 : 500 }}>
                  {d.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
