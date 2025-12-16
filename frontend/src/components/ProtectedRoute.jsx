// Create: ProtectedRoute.jsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

const ProtectedRoute = ({ children }) => {
  const { isLoggedin, isLoading } = useContext(ShopContext);

  // Show loading indicator while auth state is being checked
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg">
        Loading...
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!isLoggedin) {
    return <Navigate to="/login" replace />;
  }

  // Render protected content if user is logged in
  return children;
};

export default ProtectedRoute;