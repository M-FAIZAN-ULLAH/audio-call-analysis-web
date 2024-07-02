import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Table, Input, Space, Spin, message } from "antd";
import {
  FaTrashAlt,
  FaEdit,
  FaFolderPlus,
  FaFolderOpen,
  FaUpload,
  FaEye,
  FaTools,
} from "react-icons/fa";
import { GetAudioUrl } from "../../../utilis/get-audio-url";

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
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    handleFetchFolders();
  }, []);

  const handleCreateFolder = async () => {
    try {
      await axios.post("http://localhost:5000/api/folders", {
        name: newFolderName,
        userId: "6683be750f05823c3fde43c9",
      });
      setNewFolderName("");
      setIsModalVisible(false);
      handleFetchFolders();
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  const handleFetchFolders = async () => {
    try {
      const userId = "6683be750f05823c3fde43c9";
      const response = await axios.get(
        `http://localhost:5000/api/folders?userId=${userId}`
      );
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

  const handleUploadAudio = async (event) => {
    setUploading(true); // Show uploading indicator
    const files = event.target.files;
    const filteredFiles = Array.from(files).filter(
      (file) => file.type === "audio/mpeg" || file.type === "video/mp4"
    );

    for (const file of filteredFiles) {
      const url = await GetAudioUrl(file);

      try {
        await axios.post(
          `http://localhost:5000/api/folders/${selectedFolder._id}/audio`,
          {
            url: url,
            fileName: file.name,
          }
        );

        // Update uploadedFiles state instantly
        setUploadedFiles((prevFiles) => [
          ...prevFiles,
          { name: file.name, type: file.type, url: url },
        ]);

        // Refresh audio files after upload
        await handleFetchFolders();

        message.success(`File "${file.name}" uploaded successfully!`);
      } catch (error) {
        console.error("Error uploading file:", error);
        message.error(`Failed to upload file "${file.name}"!`);
      }
    }

    setUploading(false); // Hide uploading indicator
  };

  const handleDeleteFile = async (fileName) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/folders/${selectedFolder._id}/audio/${fileName}`
      );

      // Update uploadedFiles state instantly
      setUploadedFiles(uploadedFiles.filter((file) => file.name !== fileName));

      // Refresh audio files after delete
      await handleFetchFolders();

      message.success(`File "${fileName}" deleted successfully!`);
    } catch (error) {
      console.error("Error deleting file:", error);
      message.error(`Failed to delete file "${fileName}"!`);
    }
  };

  const handleViewFolderDetails = () => {
    setViewModalVisible(true);
  };

  const handleAnalyzeFolder = () => {
    if (selectedFolder) {
      console.log("Selected Folder ID:", selectedFolder._id);
      console.log("Audio URLs:");
      selectedFolder.audioFiles.forEach((file) => {
        console.log(file.url);
      });
    }
  };

  const columns = [
    {
      title: "File Name",
      dataIndex: "fileName",
      key: "fileName",
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space>
          <Button
            type="link"
            danger
            icon={<FaTrashAlt />}
            onClick={() => handleDeleteFile(record.fileName)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6">Bulk Analysis</h1>
      <Space className="mb-4">
        <Button
          onClick={() => setIsModalVisible(true)}
          type="primary"
          style={{ backgroundColor: "black" }}
          icon={<FaFolderPlus />}
        >
          Create Folder
        </Button>
        <Button
          onClick={() => setIsSelectModalVisible(true)}
          type="primary"
          style={{ backgroundColor: "black" }}
          icon={<FaFolderOpen />}
        >
          Select Folder
        </Button>
        <Button onClick={handleAnalyzeFolder} type="primary" icon={<FaTools />}>
          Analyze
        </Button>
        <Button
          onClick={handleViewFolderDetails}
          type="primary"
          icon={<FaEye />}
        >
          View
        </Button>
      </Space>
      {selectedFolder && (
        <div
          className="mb-4 p-4 border rounded bg-light"
          style={{
            backgroundColor: "#f0f0f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
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
                onClick={() => setIsDeleteModalVisible(true)}
              >
                <FaTrashAlt />
              </Button>
            </span>
          </h2>
          <div>
            {uploading ? (
              <Spin size="large" />
            ) : (
              <Button
                type="primary"
                icon={<FaUpload />}
                onClick={() => document.getElementById("fileInput").click()}
              >
                Upload Audio
              </Button>
            )}
            <input
              id="fileInput"
              type="file"
              accept="audio/mp3, video/mp4"
              multiple
              style={{ display: "none" }}
              onChange={handleUploadAudio}
            />
          </div>
        </div>
      )}
      {selectedFolder && (
        <Table
          dataSource={selectedFolder.audioFiles}
          columns={columns}
          rowKey={(record, index) => index}
          pagination={{ pageSize: 4 }}
        />
      )}

      <Modal
        title="Enter Folder Name"
        visible={isModalVisible}
        onOk={handleCreateFolder}
        onCancel={() => setIsModalVisible(false)}
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
        onCancel={() => setIsEditModalVisible(false)}
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
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Delete"
        cancelText="Cancel"
      >
        <p>Are you sure you want to delete this folder?</p>
      </Modal>

      <Modal
        title="Select Folder"
        visible={isSelectModalVisible}
        onCancel={() => setIsSelectModalVisible(false)}
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
                  onClick={() => {
                    setSelectedFolder(record);
                    setIsSelectModalVisible(false);
                  }}
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
        title="Folder Details"
        visible={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
      >
        <p>Selected Folder ID: {selectedFolder ? selectedFolder._id : ""}</p>
      </Modal>

      {/* Loading indicator during file upload */}
      {loading && (
        <div className="loading-overlay">
          <Spin size="large" />
        </div>
      )}
    </div>
  );
};

export default FolderManager;
