// import React from "react";
// import BulkAnalysis from "../../components/Dashboard/Content/Bulk/BulkAnalysis";
// import ProtectedRoute from "../../components/utilis/Protected";

// function index() {
//   return (
//     <ProtectedRoute>
//       <BulkAnalysis />
//     </ProtectedRoute>
//   );
// }

// export default index;

import React from "react";
import dynamic from "next/dynamic";
import ProtectedRoute from "../../components/utilis/Protected";

// Dynamically import BulkAnalysis with SSR disabled
const BulkAnalysis = dynamic(
  () => import("../../components/Dashboard/Content/Bulk/BulkAnalysis"),
  {
    ssr: false,
  }
);

function Index() {
  return (
    <ProtectedRoute>
      <BulkAnalysis />
    </ProtectedRoute>
  );
}

export default Index;
