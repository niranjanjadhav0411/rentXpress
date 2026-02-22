import { useEffect, useState } from "react";
import api from "../../services/api";

export default function CarTable() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const initialFormState = {
    brand: "",
    model: "",
    image: null,
    pricePerDay: "",
    available: true,
  };

  const [form, setForm] = useState(initialFormState);

  // ================= FETCH CARS =================
  const fetchCars = async () => {
    setLoading(true);
    try {
      const res = await api.get("/cars");
      setCars(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  // ================= OPEN ADD =================
  const openAddModal = () => {
    setEditingCar(null);
    setForm(initialFormState);
    setPreviewImage(null);
    setShowModal(true);
  };

  // ================= OPEN EDIT =================
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

  // ================= IMAGE CHANGE =================
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setForm({ ...form, image: file });
    setPreviewImage(URL.createObjectURL(file));
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (!form.brand || !form.model || !form.pricePerDay) {
      alert("Please fill all required fields");
      return;
    }

    const formData = new FormData();
    formData.append("brand", form.brand);
    formData.append("model", form.model);
    formData.append("pricePerDay", form.pricePerDay);
    formData.append("available", form.available);

    if (form.image) {
      formData.append("image", form.image);
    }

    try {
      if (editingCar) {
        await api.put(`/admin/cars/${editingCar.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/admin/cars", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      fetchCars();
      setShowModal(false);
      setForm(initialFormState);
      setPreviewImage(null);
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert("Failed to save car");
    }
  };

  // ================= DELETE =================
  const deleteCar = async (id) => {
    if (!window.confirm("Delete this car?")) return;

    try {
      await api.delete(`/admin/cars/${id}`);
      fetchCars();
    } catch (error) {
      console.error(error);
      alert("Failed to delete car");
    }
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 p-6 rounded-2xl shadow-xl">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-bold text-cyan-400">Car Management</h3>
        <button
          onClick={openAddModal}
          className="bg-cyan-600 hover:bg-cyan-500 transition px-5 py-2 rounded-lg font-semibold"
        >
          + Add Car
        </button>
      </div>

      {/* CAR GRID */}
      <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6">
        {cars.map((car) => (
          <div
            key={car.id}
            className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-1 transition duration-300"
          >
            {car.image ? (
              <img
                src={car.image}
                alt={car.model}
                className="h-44 w-full object-cover"
              />
            ) : (
              <div className="h-44 w-full flex items-center justify-center bg-gray-700 text-gray-400">
                No Image
              </div>
            )}

            <div className="p-4">
              <h4 className="text-lg font-semibold text-white">
                {car.brand} {car.model}
              </h4>

              <p className="text-gray-400 mt-1">₹{car.pricePerDay}/day</p>

              <p
                className={`mt-2 font-semibold ${
                  car.available ? "text-green-400" : "text-red-400"
                }`}
              >
                {car.available ? "Available" : "Not Available"}
              </p>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => openEditModal(car)}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black py-1 rounded-md text-sm font-semibold"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteCar(car.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 py-1 rounded-md text-sm font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center px-4 z-50 overflow-auto">
          <div className="bg-gray-900 w-full max-w-lg rounded-2xl p-8 shadow-2xl animate-fadeIn">
            <h3 className="text-2xl font-bold mb-6 text-cyan-400">
              {editingCar ? "Edit Car" : "Add New Car"}
            </h3>

            <div className="space-y-4">
              <input
                value={form.brand}
                placeholder="Brand"
                className="w-full p-3 bg-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
              />

              <input
                value={form.model}
                placeholder="Model"
                className="w-full p-3 bg-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                onChange={(e) => setForm({ ...form, model: e.target.value })}
              />

              <input
                type="number"
                value={form.pricePerDay}
                placeholder="Price Per Day"
                className="w-full p-3 bg-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                onChange={(e) =>
                  setForm({ ...form, pricePerDay: e.target.value })
                }
              />

              {/* CAMERA + UPLOAD */}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="w-full text-white"
                onChange={handleImageChange}
              />

              {previewImage && (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="h-40 w-full object-cover rounded-lg border border-gray-700"
                />
              )}

              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={(e) =>
                    setForm({ ...form, available: e.target.checked })
                  }
                />
                Available
              </label>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-cyan-600 hover:bg-cyan-500 transition py-2 rounded-lg font-semibold"
              >
                Save
              </button>

              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 transition py-2 rounded-lg font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
