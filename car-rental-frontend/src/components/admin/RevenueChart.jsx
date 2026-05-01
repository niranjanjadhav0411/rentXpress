import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

const MONTH_ORDER = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function fmtRevenue(v) {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(1)}k`;
  return `₹${v}`;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value ?? 0;
  const prev = payload[0]?.payload?.prevRevenue;
  const growth = prev != null && prev > 0 ? ((val - prev) / prev) * 100 : null;

  return (
    <div
      style={{
        background: "var(--chart-tooltip-bg)",
        border: "1px solid var(--chart-tooltip-border)",
        borderRadius: 14,
        padding: "12px 16px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        minWidth: 160,
      }}
    >
      <p
        style={{
          fontSize: 11,
          color: "var(--text-muted)",
          marginBottom: 6,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 20,
          fontWeight: 800,
          color: "var(--gold)",
          fontFamily: "Syne, sans-serif",
          lineHeight: 1,
        }}
      >
        {fmtRevenue(val)}
      </p>
      {growth != null && (
        <p
          style={{
            fontSize: 12,
            marginTop: 6,
            color: growth >= 0 ? "#4ade80" : "#f87171",
            fontWeight: 600,
          }}
        >
          {growth >= 0 ? "▲" : "▼"} {Math.abs(growth).toFixed(1)}% vs prev month
        </p>
      )}
      {prev != null && (
        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
          Prev: {fmtRevenue(prev)}
        </p>
      )}
    </div>
  );
}

function KpiCard({ label, value, sub, color, positive }) {
  return (
    <div
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "12px 16px",
        flex: "1 1 110px",
      }}
    >
      <p
        style={{
          fontSize: 10,
          color: "var(--text-muted)",
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 4,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 18,
          fontWeight: 800,
          color: color || "var(--gold)",
          fontFamily: "Syne, sans-serif",
          lineHeight: 1.1,
        }}
      >
        {value}
      </p>
      {sub && (
        <p
          style={{
            fontSize: 11,
            color:
              positive === true
                ? "#4ade80"
                : positive === false
                  ? "#f87171"
                  : "var(--text-muted)",
            marginTop: 4,
            fontWeight: 500,
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

export default function RevenueChart({ data }) {
  const [chartType, setChartType] = useState("area");
  const [period, setPeriod] = useState("all");

  const sortedAll = useMemo(() => {
    const raw = Array.isArray(data) ? data : [];
    return [...raw]
      .sort(
        (a, b) => MONTH_ORDER.indexOf(a.month) - MONTH_ORDER.indexOf(b.month),
      )
      .map((item, idx, arr) => ({
        month: item.month,
        revenue: Number(item.revenue) || 0,
        prevRevenue: idx > 0 ? Number(arr[idx - 1].revenue) || 0 : null,
      }));
  }, [data]);

  const chartData = useMemo(() => {
    if (period === "3m") return sortedAll.slice(-3);
    if (period === "6m") return sortedAll.slice(-6);
    return sortedAll;
  }, [sortedAll, period]);

  const analytics = useMemo(() => {
    if (!sortedAll.length) return null;
    const total = sortedAll.reduce((s, d) => s + d.revenue, 0);
    const avg = total / sortedAll.length;
    const peak = sortedAll.reduce(
      (best, d) => (d.revenue > best.revenue ? d : best),
      sortedAll[0],
    );
    const last = sortedAll[sortedAll.length - 1];
    const prev = sortedAll.length > 1 ? sortedAll[sortedAll.length - 2] : null;
    const momGrowth =
      prev && prev.revenue > 0
        ? ((last.revenue - prev.revenue) / prev.revenue) * 100
        : null;
    const mid = Math.floor(sortedAll.length / 2);
    const firstHalf = sortedAll
      .slice(0, mid)
      .reduce((s, d) => s + d.revenue, 0);
    const secondHalf = sortedAll.slice(mid).reduce((s, d) => s + d.revenue, 0);
    const trendGrowth =
      firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : null;
    return { total, avg, peak, momGrowth, trendGrowth, last };
  }, [sortedAll]);

  if (!sortedAll.length) {
    return (
      <div
        className="glass rounded-2xl p-6"
        style={{
          minHeight: 360,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{ margin: "0 auto 12px", display: "block", opacity: 0.4 }}
          >
            <path d="M3 3v18h18M7 16l4-4 4 4 4-4" />
          </svg>
          <p style={{ fontSize: 14 }}>No revenue data available yet</p>
        </div>
      </div>
    );
  }

  const avgRevenue = analytics?.avg ?? 0;

  return (
    <div
      className="glass rounded-2xl overflow-hidden"
      style={{ position: "relative" }}
    >
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: "var(--gold)",
          opacity: 0.04,
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          padding: "20px 24px 0",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: 4,
            }}
          >
            Revenue Analytics
          </p>
          <h2
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 700,
              fontSize: 18,
              color: "var(--text-primary)",
              margin: 0,
              lineHeight: 1,
            }}
          >
            Monthly Revenue
          </h2>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {["3m", "6m", "all"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: "5px 12px",
                borderRadius: 8,
                border: "1px solid",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
                letterSpacing: "0.04em",
                borderColor: period === p ? "var(--gold)" : "var(--border)",
                background:
                  period === p ? "rgba(201,168,76,0.12)" : "var(--surface-2)",
                color: period === p ? "var(--gold)" : "var(--text-muted)",
              }}
            >
              {p === "all" ? "All" : p.toUpperCase()}
            </button>
          ))}

          <div style={{ width: 1, height: 20, background: "var(--border)" }} />

          {[
            { type: "area", path: "M22 12 18 12 15 21 9 3 6 12 2 12" },
            { type: "bar", rects: true },
          ].map(({ type, path, rects }) => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              title={type + " chart"}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "1px solid",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.15s",
                borderColor:
                  chartType === type ? "var(--gold)" : "var(--border)",
                background:
                  chartType === type
                    ? "rgba(201,168,76,0.12)"
                    : "var(--surface-2)",
                color: chartType === type ? "var(--gold)" : "var(--text-muted)",
              }}
            >
              {rects ? (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="10" width="4" height="11" />
                  <rect x="10" y="5" width="4" height="16" />
                  <rect x="17" y="13" width="4" height="8" />
                </svg>
              ) : (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points={path} />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          padding: "16px 24px 0",
        }}
      >
        <KpiCard
          label="Total Revenue"
          value={fmtRevenue(analytics?.total ?? 0)}
          sub={
            analytics?.trendGrowth != null
              ? `${analytics.trendGrowth >= 0 ? "▲" : "▼"} ${Math.abs(analytics.trendGrowth).toFixed(1)}% trend`
              : undefined
          }
          positive={analytics?.trendGrowth >= 0}
          color="var(--gold)"
        />
        <KpiCard
          label="Monthly Avg"
          value={fmtRevenue(avgRevenue)}
          sub="per month"
          color="var(--text-primary)"
        />
        <KpiCard
          label="Peak Month"
          value={analytics?.peak?.month ?? "—"}
          sub={analytics?.peak ? fmtRevenue(analytics.peak.revenue) : undefined}
          color="#a78bfa"
        />
        <KpiCard
          label="MoM Growth"
          value={
            analytics?.momGrowth != null
              ? `${analytics.momGrowth >= 0 ? "+" : ""}${analytics.momGrowth.toFixed(1)}%`
              : "—"
          }
          sub={
            analytics?.last && sortedAll.length > 1
              ? `vs ${sortedAll[sortedAll.length - 2].month}`
              : undefined
          }
          positive={analytics?.momGrowth >= 0}
          color={
            analytics?.momGrowth == null
              ? "var(--text-muted)"
              : analytics.momGrowth >= 0
                ? "#4ade80"
                : "#f87171"
          }
        />
      </div>

      <div style={{ padding: "20px 24px 24px" }}>
        <ResponsiveContainer width="100%" height={240}>
          {chartType === "area" ? (
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 4, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c9a84c" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#c9a84c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--chart-grid)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                stroke="var(--text-muted)"
                tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="var(--text-muted)"
                tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={fmtRevenue}
                width={52}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: "var(--gold)",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
              />
              <ReferenceLine
                y={avgRevenue}
                stroke="rgba(201,168,76,0.35)"
                strokeDasharray="5 5"
                label={{
                  value: "Avg",
                  position: "insideTopRight",
                  fontSize: 10,
                  fill: "var(--gold)",
                  dy: -4,
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#c9a84c"
                strokeWidth={2.5}
                fill="url(#revenueGrad)"
                dot={{
                  r: 4,
                  fill: "#c9a84c",
                  stroke: "var(--surface-1)",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  fill: "#c9a84c",
                  stroke: "var(--surface-1)",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          ) : (
            <BarChart
              data={chartData}
              barSize={28}
              margin={{ top: 10, right: 4, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c9a84c" />
                  <stop offset="100%" stopColor="#c9a84c" stopOpacity={0.45} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--chart-grid)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                stroke="var(--text-muted)"
                tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="var(--text-muted)"
                tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={fmtRevenue}
                width={52}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(201,168,76,0.05)" }}
              />
              <ReferenceLine
                y={avgRevenue}
                stroke="rgba(201,168,76,0.35)"
                strokeDasharray="5 5"
                label={{
                  value: "Avg",
                  position: "insideTopRight",
                  fontSize: 10,
                  fill: "var(--gold)",
                  dy: -4,
                }}
              />
              <Bar
                dataKey="revenue"
                fill="url(#barGrad)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div
        style={{
          borderTop: "1px solid var(--border)",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          overflowX: "auto",
        }}
      >
        <span
          style={{
            fontSize: 10,
            color: "var(--text-muted)",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          Breakdown
        </span>
        <div style={{ display: "flex", gap: 8, flex: 1, overflowX: "auto" }}>
          {chartData.map((d) => {
            const pct =
              analytics?.peak?.revenue > 0
                ? (d.revenue / analytics.peak.revenue) * 100
                : 0;
            const isBest = d.month === analytics?.peak?.month;
            return (
              <div
                key={d.month}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  minWidth: 36,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 40,
                    borderRadius: 6,
                    background: "var(--surface-3)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: `${pct}%`,
                      background: isBest
                        ? "linear-gradient(to top, #c9a84c, #e8c97a)"
                        : "rgba(201,168,76,0.4)",
                      borderRadius: 6,
                      transition: "height 0.4s ease",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 9,
                    color: isBest ? "var(--gold)" : "var(--text-muted)",
                    fontWeight: isBest ? 700 : 400,
                  }}
                >
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
