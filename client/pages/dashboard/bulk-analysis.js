import React from "react";
import BulkAnalysis from "../../components/Dashboard/Content/Bulk/BulkAnalysis";
import ProtectedRoute from "../../components/utilis/Protected";

function index() {
  return (
    <ProtectedRoute>
      <BulkAnalysis />
    </ProtectedRoute>
  );
}

export default index;
