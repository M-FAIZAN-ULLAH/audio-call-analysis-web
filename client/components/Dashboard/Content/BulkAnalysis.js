// BulkAnalysis.js
import React from 'react';
import DashboardLayout from '../Layout';
import FolderManager from '../Content/FolderManager';

const BulkAnalysis = () => {
  return (
    <DashboardLayout>
      <div style={{ marginTop: "100px", marginLeft: "30px", backgroundColor: "white", height: "620px", width: "1220px" }}>
        <div style={{ marginTop: "20px" }}>
          <FolderManager />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BulkAnalysis;
