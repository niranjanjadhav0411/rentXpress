import CarTable from "../../components/admin/CarTable";

export default function CarManagement() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-6 text-cyan-400">
        Car Management
      </h1>

      <div className="bg-gray-900 rounded-2xl shadow p-4">
        <CarTable />
      </div>
    </div>
  );
}
