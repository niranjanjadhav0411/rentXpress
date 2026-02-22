export default function StatCard({ title, value }) {
  return (
    <div
      className="p-6 rounded-xl shadow-lg bg-gradient-to
      from-gray-800 to-gray-900 
      dark:from-[#1f2937] dark:to-[#111827]
      hover:scale-[1.02] transition"
    >
      <p className="text-sm text-gray-400">{title}</p>

      <h2 className="text-3xl font-bold mt-2">{value}</h2>
    </div>
  );
}
