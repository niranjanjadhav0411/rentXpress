import BookingTable from "../../components/admin/BookingTable";

export default function BookingManagement() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 animate-fade-up">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--gold)] mb-1">
          Management
        </p>
        <h1
          className="text-3xl font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "Syne, sans-serif" }}
        >
          Booking Management
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Review and manage all booking requests.
        </p>
      </div>
      <div className="glass rounded-2xl p-6 animate-fade-up-1">
        <BookingTable />
      </div>
    </div>
  );
}
