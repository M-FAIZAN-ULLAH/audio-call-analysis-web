import React from "react";
import BulkAnalysis from "../../components/Dashboard/Content/BulkAnalysis";
import ProtectedRoute from "../../components/utilis/Protected";

function index() {
  return (
    <ProtectedRoute>
      <BulkAnalysis />
    </ProtectedRoute>
  );
}

export default index;
