// FolderDetails.js
import React from 'react';

const FolderDetails = ({ folderId }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6">Folder Details</h1>
      <p>Folder ID: {folderId}</p>
      {/* Add more details as needed */}
    </div>
  );
};

export default FolderDetails;
