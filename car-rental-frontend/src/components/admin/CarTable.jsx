import { useEffect, useState } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";

const initialFormState = {
  brand: "",
  model: "",
  image: null,
  pricePerDay: "",
  available: true,
};

function Modal({
  editingCar,
  form,
  setForm,
  previewImage,
  onImageChange,
  onSubmit,
  onClose,
}) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center px-4 z-50 overflow-auto py-8">
      <div className="glass w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-fade-up">
        <div className="flex items-center justify-between mb-7">
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[var(--gold)] mb-1">
              Fleet Management
            </p>
            <h3
              className="text-2xl font-bold text-[var(--text-primary)]"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              {editingCar ? "Edit Vehicle" : "Add New Vehicle"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label
              className="block text-xs font-medium text-[var(--text-muted)] mb-2 tracking-wide uppercase"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Brand *
            </label>
            <input
              value={form.brand}
              placeholder="e.g. Toyota"
              className="input-premium"
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
            />
          </div>
          <div>
            <label
              className="block text-xs font-medium text-[var(--text-muted)] mb-2 tracking-wide uppercase"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Model *
            </label>
            <input
              value={form.model}
              placeholder="e.g. Camry"
              className="input-premium"
              onChange={(e) => setForm({ ...form, model: e.target.value })}
            />
          </div>
          <div>
            <label
              className="block text-xs font-medium text-[var(--text-muted)] mb-2 tracking-wide uppercase"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Price Per Day (₹) *
            </label>
            <input
              type="number"
              value={form.pricePerDay}
              placeholder="e.g. 1500"
              className="input-premium"
              onChange={(e) =>
                setForm({ ...form, pricePerDay: e.target.value })
              }
            />
          </div>

          {/* Image upload */}
          <div>
            <label
              className="block text-xs font-medium text-[var(--text-muted)] mb-2 tracking-wide uppercase"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Vehicle Image
            </label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--border)] hover:border-[var(--gold)]/40 rounded-2xl p-6 cursor-pointer transition-colors group">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="h-36 w-full object-cover rounded-xl"
                />
              ) : (
                <div className="text-center">
                  <svg
                    className="mx-auto mb-2 text-[var(--text-muted)] group-hover:text-[var(--gold)] transition-colors"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <p className="text-sm text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">
                    Click to upload image
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    PNG, JPG up to 10MB
                  </p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={onImageChange}
              />
            </label>
          </div>

          {/* Available toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={form.available}
                onChange={(e) =>
                  setForm({ ...form, available: e.target.checked })
                }
              />
              <div
                className={`w-11 h-6 rounded-full transition-colors duration-200 ${form.available ? "bg-[var(--gold)]" : "bg-[var(--surface-3)]"}`}
              />
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${form.available ? "translate-x-5" : "translate-x-0"}`}
              />
            </div>
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {form.available ? "Available for rent" : "Not available"}
            </span>
          </label>
        </div>

        <div className="flex gap-3 mt-7">
          <button onClick={onSubmit} className="btn-gold flex-1 py-3 text-sm">
            {editingCar ? "Save Changes" : "Add Vehicle"}
          </button>
          <button onClick={onClose} className="btn-ghost flex-1 py-3 text-sm">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CarTable() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [form, setForm] = useState(initialFormState);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const res = await api.get("/cars");
      setCars(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const openAddModal = () => {
    setEditingCar(null);
    setForm(initialFormState);
    setPreviewImage(null);
    setShowModal(true);
  };

  const openEditModal = (car) => {
    setEditingCar(car);
    setForm({
      brand: car.brand,
      model: car.model,
      image: null,
      pricePerDay: car.pricePerDay,
      available: car.available,
    });
    setPreviewImage(car.image);
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({ ...form, image: file });
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.brand || !form.model || !form.pricePerDay) {
      toast.error("Please fill all required fields");
      return;
    }
    const formData = new FormData();
    formData.append("brand", form.brand);
    formData.append("model", form.model);
    formData.append("pricePerDay", form.pricePerDay);
    formData.append("available", form.available);
    if (form.image) formData.append("image", form.image);

    try {
      if (editingCar) {
        await api.put(`/admin/cars/${editingCar.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Vehicle updated successfully");
      } else {
        await api.post("/admin/cars", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Vehicle added successfully");
      }
      fetchCars();
      setShowModal(false);
      setForm(initialFormState);
      setPreviewImage(null);
    } catch (error) {
      toast.error("Failed to save vehicle");
    }
  };

  const deleteCar = async (id) => {
    if (!window.confirm("Delete this vehicle?")) return;
    try {
      setDeletingId(id);
      await api.delete(`/admin/cars/${id}`);
      toast.success("Vehicle deleted");
      fetchCars();
    } catch {
      toast.error("Failed to delete vehicle");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = cars.filter((c) =>
    `${c.brand} ${c.model}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search vehicles..."
            className="input-premium pl-9 text-sm w-60"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={openAddModal}
          className="btn-gold px-6 py-2.5 text-sm inline-flex items-center gap-2 self-start"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Vehicle
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-64 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-muted)] text-sm">
          No vehicles found.
        </div>
      ) : (
        <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-5">
          {filtered.map((car) => (
            <div
              key={car.id}
              className="glass rounded-2xl overflow-hidden hover:border-[var(--border-hover)] transition-all duration-300 group"
            >
              <div className="relative h-44 overflow-hidden bg-[var(--surface-2)]">
                {car.image ? (
                  <img
                    src={car.image}
                    alt={car.model}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-[var(--text-muted)]">
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                    >
                      <rect x="1" y="3" width="15" height="13" rx="2" />
                      <path d="M16 8h4l3 3v5h-7V8z" />
                      <circle cx="5.5" cy="18.5" r="2.5" />
                      <circle cx="18.5" cy="18.5" r="2.5" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div
                  className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${car.available ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}
                >
                  {car.available ? "Available" : "Unavailable"}
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4
                      className="font-semibold text-[var(--text-primary)] text-sm"
                      style={{ fontFamily: "Syne, sans-serif" }}
                    >
                      {car.brand} {car.model}
                    </h4>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-[var(--gold)] font-bold text-sm"
                      style={{ fontFamily: "Syne, sans-serif" }}
                    >
                      ₹{car.pricePerDay}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)]">/day</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(car)}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/20 hover:bg-[var(--gold)]/20 transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCar(car.id)}
                    disabled={deletingId === car.id}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50"
                  >
                    {deletingId === car.id ? "..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal
          editingCar={editingCar}
          form={form}
          setForm={setForm}
          previewImage={previewImage}
          onImageChange={handleImageChange}
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
