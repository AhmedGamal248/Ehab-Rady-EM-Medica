import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    localStorage.setItem("redirectAfterLogin", location.pathname);
    return <Navigate replace to="/login" />;
  }
  if (adminOnly && user.role !== "admin") return <Navigate replace to="/" />;

  return children;
}
