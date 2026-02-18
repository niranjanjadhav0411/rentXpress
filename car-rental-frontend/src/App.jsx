import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cars from "./pages/Cars";
import CarDetails from "./pages/CarDetails";
import Booking from "./pages/Booking";
import MyBookings from "./pages/MyBookings";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminBookings from "./pages/admin/AdminBookings";
import CarManagement from "./pages/admin/CarManagement";
import AdminLayout from "./layout/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";

export default function App() {
  return (
    <>
      <Routes>
        {/* PUBLIC + USER ROUTES */}
        <Route
          path="/*"
          element={
            <div className="min-h-screen flex flex-col bg-gray-950 text-white">
              <Navbar />
              <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/cars" element={<Cars />} />
                  <Route path="/cars/:id" element={<CarDetails />} />

                  <Route
                    path="/booking/:carId"
                    element={
                      <ProtectedRoute>
                        <Booking />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/my-bookings"
                    element={
                      <ProtectedRoute>
                        <MyBookings />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </main>
            </div>
          }
        />

        {/* ADMIN ROUTES (Separate Layout) */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="cars" element={<CarManagement />} />
        </Route>
      </Routes>

      <ToastContainer position="top-right" autoClose={2000} theme="dark" />
    </>
  );
}
