import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const ProtectedRoute = ({ children }) => {
  const { session } = useAuth();

  if (!session) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
