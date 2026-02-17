import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show nothing while loading auth state
  if (loading) return null;

  // Not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Role check: only block if role is specified
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
