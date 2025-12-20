// BulkAnalysis.js
import React from 'react';
import DashboardLayout from '../../Layout';
import FolderManager from './FolderManager';

const BulkAnalysis = () => {
  return (
    <DashboardLayout>
      <div className="w-full">
        <FolderManager />
      </div>
    </DashboardLayout>
  );
};

export default BulkAnalysis;
