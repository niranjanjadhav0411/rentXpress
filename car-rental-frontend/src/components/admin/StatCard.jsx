export default function StatCard({ title, value, color = "", icon, change }) {
  return (
    <div className="glass rounded-2xl p-6 hover:border-[var(--border-hover)] transition-all duration-300 group relative overflow-hidden">
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"
        style={{ background: color ? `${color}15` : "rgba(201,168,76,0.08)" }}
      />

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p
            className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-[0.1em]"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            {title}
          </p>
          <p
            className={`text-3xl font-bold mt-3 ${color || "text-[var(--text-primary)]"}`}
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            {value ?? 0}
          </p>
          {change !== undefined && (
            <p
              className={`text-xs mt-2 ${change >= 0 ? "text-green-400" : "text-red-400"}`}
            >
              {change >= 0 ? "↑" : "↓"} {Math.abs(change)}% vs last month
            </p>
          )}
        </div>

        {icon && (
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center ml-4 shrink-0"
            style={{
              background: color ? `${color}15` : "rgba(201,168,76,0.08)",
              border: `1px solid ${color ? `${color}25` : "rgba(201,168,76,0.15)"}`,
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
