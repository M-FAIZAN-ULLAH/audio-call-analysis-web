import React, { useState } from 'react';
import axios from 'axios';
import { Modal, Button } from 'antd'; // Import Ant Design components
import { FaTrashAlt, FaEdit, FaFolderPlus } from 'react-icons/fa';
import FolderDetails from './FolderDetails'; // Import FolderDetails component

const FolderManager = () => {
  const [folders, setFolders] = useState([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(null); // Track selected folder
  const [isModalVisible, setIsModalVisible] = useState(false); // Track modal visibility

  const handleCreateFolder = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/folders', { name: newFolderName });
      const newFolder = response.data.folder;
      setFolders([...folders, newFolder]);
      setNewFolderName('');
      setIsModalVisible(false); // Close modal after creating folder
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleDeleteFolder = async (folderId) => {
    try {
      await axios.delete(`http://localhost:5000/api/folders/${folderId}`);
      setFolders(folders.filter(folder => folder._id !== folderId));
    } catch (error) {
      console.error('Error deleting folder:', error);
    }
  };

  const handleRenameFolder = async (folderId, newName) => {
    try {
      await axios.put(`http://localhost:5000/api/folders/${folderId}`, { name: newName });
      setFolders(folders.map(folder => folder._id === folderId ? { ...folder, name: newName } : folder));
    } catch (error) {
      console.error('Error renaming folder:', error);
    }
  };

  const handleFolderClick = (folderId) => {
    setSelectedFolder(folderId); // Set the selected folder ID
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6">Bulk Analysis - Create Folder</h1>
      <Button onClick={showModal} className="bg-blue-500 text-white py-2 px-4 rounded-md flex items-center mb-4"><FaFolderPlus className="mr-2" />Create Folder</Button>
      <Modal
        title="Enter Folder Name"
        visible={isModalVisible}
        onOk={handleCreateFolder}
        onCancel={handleCancel}
        okText="Create"
        cancelText="Cancel"
      >
        <input type="text" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="Folder Name" className="border border-gray-300 rounded-md px-4 py-2 mb-4 text-white" />
      </Modal>
      <div>
        {folders.map(folder => (
          <div key={folder._id} className="flex items-center justify-between border-b border-gray-300 py-4">
            <span onClick={() => handleFolderClick(folder._id)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>{folder.name}</span>
            <div className="flex">
              <button onClick={() => handleDeleteFolder(folder._id)} className="text-red-500 mr-2"><FaTrashAlt /></button>
              <button onClick={() => {
                const newName = prompt('Enter new name:');
                if (newName) handleRenameFolder(folder._id, newName);
              }} className="text-blue-500"><FaEdit /></button>
            </div>
          </div>
        ))}
      </div>
      {selectedFolder && <FolderDetails folderId={selectedFolder} />} {/* Render FolderDetails component if folder is selected */}
    </div>
  );
};

export default FolderManager;
