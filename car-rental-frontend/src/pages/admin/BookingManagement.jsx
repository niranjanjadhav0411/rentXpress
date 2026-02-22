import BookingTable from "../../components/admin/BookingTable";

export default function BookingManagement() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-6 text-cyan-400">
        Booking Management
      </h1>

      <div className="bg-gray-900 rounded-2xl shadow p-4">
        <BookingTable />
      </div>
    </div>
  );
}
