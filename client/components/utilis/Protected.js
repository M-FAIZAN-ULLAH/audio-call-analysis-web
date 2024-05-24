// pages/protected.js
import { useRouter } from "next/router";
import { useEffect } from "react";

const ProtectedRoute = ({ children }) => {
  const router = useRouter();

  // Check if user is authenticated, if not, redirect to login page
  useEffect(() => {
    // Example logic to check if user is authenticated, replace with your own logic
    const isAuthenticated = true; // Replace this with your authentication logic
    if (!isAuthenticated) {
      router.push("/login"); // Redirect to login page if not authenticated
    }
  }, []);

  return children;
};

export default ProtectedRoute;
