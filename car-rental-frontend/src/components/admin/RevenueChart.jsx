import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function RevenueChart({ data }) {
  // 🛡 SAFETY CHECK
  const safeData = Array.isArray(data)
    ? data.map((item) => ({
        month: item.month,
        revenue: Number(item.revenue),
      }))
    : [];

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-md w-full">
      <h3 className="text-xl font-semibold text-white mb-6">
        Revenue Overview
      </h3>

      {safeData.length === 0 ? (
        <p className="text-gray-400 text-center py-10">
          No revenue data available
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={safeData}>
            <CartesianGrid stroke="#374151" strokeDasharray="3 3" />

            <XAxis
              dataKey="month"
              stroke="#9CA3AF"
              tick={{ fill: "#9CA3AF" }}
            />

            <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />

            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "none",
                borderRadius: "8px",
                color: "white",
              }}
            />

            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#06b6d4"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
