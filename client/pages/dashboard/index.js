import React from "react";
import Home from "../../components/Dashboard/Content/home";
import ProtectedRoute from "../../components/utilis/Protected";

function index() {
  return (
    <ProtectedRoute>
      <Home />
    </ProtectedRoute>
  );
}

export default index;
