// pages/protected.js
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useUser } from "./userContext";

const ProtectedRoute = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated } = useUser();

  // Check if user is authenticated, if not, redirect to login page
  useEffect(() => {
    // Example logic to check if user is authenticated, replace with your own logic
    if (!isAuthenticated) {
      router.push("/login"); // Redirect to login page if not authenticated
    }
  }, []);

  return children;
};

export default ProtectedRoute;
