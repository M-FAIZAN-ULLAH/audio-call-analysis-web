import React, { useState } from "react";
import axios from "axios";
import { Modal, Button, Table, Input, Space } from "antd";
import {
  FaTrashAlt,
  FaEdit,
  FaFolderPlus,
  FaFolderOpen,
  FaUpload,
  FaArrowRight,
} from "react-icons/fa";
import FolderDetails from "../FolderDetails";

const FolderManager = () => {
  const [folders, setFolders] = useState([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isSelectModalVisible, setIsSelectModalVisible] = useState(false);
  const [editFolderId, setEditFolderId] = useState(null);
  const [editFolderName, setEditFolderName] = useState("");
  const [viewModalVisible, setViewModalVisible] = useState(false);
const [selectedFolderId, setSelectedFolderId] = useState(null);


  const handleCreateFolder = async () => {
    try {
      await axios.post("http://localhost:5000/api/folders", {
        name: newFolderName,
      });
      setNewFolderName("");
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  const handleFetchFolders = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/folders");
      setFolders(response.data.folders);
      setIsSelectModalVisible(true);
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  };

  const handleDeleteFolder = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/folders/${editFolderId}`);
      setFolders(folders.filter((folder) => folder._id !== editFolderId));
      setSelectedFolder(null);
      setIsDeleteModalVisible(false);
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  };

  const handleRenameFolder = async () => {
    try {
      await axios.put(`http://localhost:5000/api/folders/${editFolderId}`, {
        name: editFolderName,
      });
      setFolders(
        folders.map((folder) =>
          folder._id === editFolderId
            ? { ...folder, name: editFolderName }
            : folder
        )
      );
      setSelectedFolder({ ...selectedFolder, name: editFolderName });
      setIsEditModalVisible(false);
    } catch (error) {
      console.error("Error renaming folder:", error);
    }
  };

  const handleUploadAudio = (event) => {
    const files = event.target.files;
    // Filter only mp3 and mp4 files
    const filteredFiles = Array.from(files).filter(
      (file) => file.type === "audio/mpeg" || file.type === "video/mp4"
    );
    setUploadedFiles([...uploadedFiles, ...filteredFiles]);
  };

  const handleViewFolder = (folderId) => {
    setSelectedFolderId(folderId);
    setViewModalVisible(true);
  };

  const handleAnalyzeFolder = (folderId) => {
    console.log("Folder ID: ",folderId);
  };

  

  const handleViewModalCancel = () => {
    setViewModalVisible(false);
  };
  
  

  const showModal = () => {
    setIsModalVisible(true);
  };

  const showSelectModal = () => {
    handleFetchFolders();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setIsEditModalVisible(false);
    setIsDeleteModalVisible(false);
    setIsSelectModalVisible(false);
  };

  const handleSelectFolder = (folder) => {
    setSelectedFolder(folder);
    setIsSelectModalVisible(false);
  };

  const columns = [
    {
      title: "File Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Actions",
      key: "actions",
      render: () => (
        <Button type="link" danger icon={<FaTrashAlt />} />
      ),
    },
  ];
  

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6">Bulk Analysis</h1>
      <Space className="mb-4">
        <Button onClick={showModal} type="primary" style={{backgroundColor:"black"}} icon={<FaFolderPlus />}>
          Create Folder
        </Button>
        <Button onClick={showSelectModal} type="primary" style={{backgroundColor:"black"}} icon={<FaFolderOpen />}>
          Select Folder
        </Button>
      </Space>
      {selectedFolder && (
       <div className="mb-4 p-4 border rounded bg-light" style={{ backgroundColor: "#f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <h2 className="text-1xl font-bold underline">
    {selectedFolder.name}
    <span style={{ marginLeft: "10px" }}>
      <Button
        type="link"
        onClick={() => {
          setEditFolderId(selectedFolder._id);
          setEditFolderName(selectedFolder.name);
          setIsEditModalVisible(true);
        }}
      >
        <FaEdit />
      </Button>
      <Button
        type="link"
        danger
        onClick={() => {
          setEditFolderId(selectedFolder._id);
          setIsDeleteModalVisible(true);
        }}
      >
        <FaTrashAlt />
      </Button>
    </span>
  </h2>
  <div>
  <Button type="primary" icon={<FaUpload />} onClick={() => document.getElementById('fileInput').click()}>
           Upload Audio
         </Button>
         <input
           id="fileInput"
           type="file"
           accept="audio/mp3, video/mp4"
           multiple
           style={{ display: 'none' }}
           onChange={handleUploadAudio}
         />
    <Button type="primary" onClick={() => handleAnalyzeFolder(selectedFolder._id)} style={{ marginLeft: "10px" }}>Analyze</Button>
    <Button type="primary" onClick={() => handleViewFolder(selectedFolder._id)} style={{ marginLeft: "10px" }}>View</Button>
  </div>
</div>

     
      )}
    <Table
  dataSource={uploadedFiles}
  columns={columns}
  rowKey={(record, index) => index}
  pagination={{ pageSize: 4 }}

/>


      <Modal
        title="Enter Folder Name"
        visible={isModalVisible}
        onOk={handleCreateFolder}
        onCancel={handleCancel}
        okText="Create"
        cancelText="Cancel"
      >
        <Input
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="Folder Name"
        />
      </Modal>

      <Modal
        title="Rename Folder"
        visible={isEditModalVisible}
        onOk={handleRenameFolder}
        onCancel={handleCancel}
        okText="Save"
        cancelText="Cancel"
      >
        <Input
          value={editFolderName}
          onChange={(e) => setEditFolderName(e.target.value)}
          placeholder="New Folder Name"
        />
      </Modal>

      <Modal
        title="Confirm Deletion"
        visible={isDeleteModalVisible}
        onOk={handleDeleteFolder}
        onCancel={handleCancel}
        okText="Delete"
        cancelText="Cancel"
      >
        <p>Are you sure you want to delete this folder?</p>
      </Modal>

      <Modal
        title="Select Folder"
        visible={isSelectModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Table
          dataSource={folders}
          columns={[
            {
              title: "Folder Name",
              dataIndex: "name",
              key: "name",
              render: (text, record) => (
                <span
                  onClick={() => handleSelectFolder(record)}
                  style={{ cursor: "pointer", textDecoration: "underline" }}
                >
                  {text}
                </span>
              ),
            },
           
          ]}
          rowKey="_id"
          pagination={{ pageSize: 4 }}
        />
        
      </Modal>

      <Modal
  title="View Page"
  visible={viewModalVisible}
  onCancel={handleViewModalCancel}
  footer={null}
  width={900}
  bodyStyle={{ maxHeight: '800px', minHeight: '530px', overflowY: 'auto' }}
  style={{ marginLeft: '30%' }} // Adjust the margin-left value as needed
>
  <p>Folder ID: {selectedFolderId}</p>
</Modal>




    </div>
  );
};

export default FolderManager;

