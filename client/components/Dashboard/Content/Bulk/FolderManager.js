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
import { useUser } from "../../../utilis/userContext";
import { useRouter } from "next/router";
import EmotionChart from "../EmotionAnalysisChart";

const FolderManager = () => {
  const { currentUser, isAuthenticated } = useUser();
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
  const [analysisResults, setAnalysisResults] = useState(null);
  const router = useRouter();

  useEffect(() => {
    handleFetchFolders();
  }, []);

  const handleCreateFolder = async () => {
    try {
      await axios.post("http://localhost:5000/api/folders", {
        name: newFolderName,
        userId: currentUser._id,
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
      const userId = currentUser._id;
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
      await axios.delete(
        `http://localhost:5000/api/folders/${selectedFolder._id}`
      );
      setFolders(folders.filter((folder) => folder._id !== editFolderId));
      setSelectedFolder(null);
      setIsDeleteModalVisible(false);
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
    await handleFetchFolders();
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
    setUploading(true);
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

        setUploadedFiles((prevFiles) => [
          ...prevFiles,
          { name: file.name, type: file.type, url: url },
        ]);

        await handleFetchFolders();

        message.success(`File "${file.name}" uploaded successfully!`);
      } catch (error) {
        console.error("Error uploading file:", error);
        message.error(`Failed to upload file "${file.name}"!`);
      }
    }

    setUploading(false);
  };

  const handleDeleteFile = async (fileName) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/folders/${selectedFolder._id}/audio/${fileName}`
      );

      setUploadedFiles(uploadedFiles.filter((file) => file.name !== fileName));

      await handleFetchFolders();

      message.success(`File "${fileName}" deleted successfully!`);
    } catch (error) {
      console.error("Error deleting file:", error);
      message.error(`Failed to delete file "${fileName}"!`);
    }
  };

  const handleViewFolderDetails = async () => {
    if (selectedFolder) {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/analysis/${selectedFolder._id}`
        );
        setAnalysisResults(response.data.analysis);
        setViewModalVisible(true);
      } catch (error) {
        console.error("Error fetching analysis:", error);
        message.error("Failed to fetch analysis data!");
      }
    }
  };

  const handleAnalyzeFolder = async () => {
    if (selectedFolder) {
      const urls = selectedFolder.audioFiles.map((file) => file.url);
      setLoading(true);
      try {
        const response = await axios.post(
          "http://localhost:5000/api/bulk-analysis",
          {
            folderId: selectedFolder._id,
            urls: urls,
          }
        );
        setAnalysisResults(response.data.analysis);
        message.success("Analysis completed successfully!");
        // setViewModalVisible(true);
        await handleFetchFolders(); // Fetch folder details again
      } catch (error) {
        console.error("Error performing bulk analysis:", error);
        message.error("Failed to perform analysis!");
      } finally {
        setLoading(false);
      }
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
        {/* {selectedFolder && selectedFolder.status === false && (
          <Button
            onClick={handleAnalyzeFolder}
            type="primary"
            icon={<FaTools />}
          >
            {loading ? (
              <Spin size="small" style={{ color: "white" }} />
            ) : (
              "Analyze"
            )}
          </Button>
        )} */}
        {selectedFolder && // Only render if selectedFolder exists
          (selectedFolder.status === "true" ? (
            <Button
              onClick={handleViewFolderDetails}
              type="primary"
              icon={<FaEye />}
            >
              View
            </Button>
          ) : (
            <Button
              onClick={handleAnalyzeFolder}
              type="primary"
              icon={<FaTools />}
              disabled={loading} // Disable button while loading
            >
              {loading ? (
                <Spin size="small" style={{ color: "white" }} />
              ) : (
                "Analyze"
              )}
            </Button>
          ))}
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
          rowKey="fileName"
          pagination={false}
        />
      )}
      <Modal
        title="Create New Folder"
        visible={isModalVisible}
        onOk={handleCreateFolder}
        onCancel={() => setIsModalVisible(false)}
      >
        <Input
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="Folder Name"
        />
      </Modal>
      <Modal
        title="Edit Folder Name"
        visible={isEditModalVisible}
        onOk={handleRenameFolder}
        onCancel={() => setIsEditModalVisible(false)}
      >
        <Input
          value={editFolderName}
          onChange={(e) => setEditFolderName(e.target.value)}
          placeholder="New Folder Name"
        />
      </Modal>
      <Modal
        title="Delete Folder"
        visible={isDeleteModalVisible}
        onOk={handleDeleteFolder}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Delete"
        okButtonProps={{ danger: true }}
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
            { title: "Folder Name", dataIndex: "name", key: "name" },
            {
              title: "Select",
              key: "select",
              render: (text, record) => (
                <Button
                  type="primary"
                  onClick={() => {
                    setSelectedFolder(record);
                    setUploadedFiles(record.audioFiles || []);
                    setIsSelectModalVisible(false);
                  }}
                >
                  Select
                </Button>
              ),
            },
          ]}
          rowKey="_id"
        />
      </Modal>
      <Modal
        title="Folder Analysis Results"
        visible={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
        width={800}
      >
        {analysisResults ? (
          // Pass analysisResults as a JSON string to EmotionChart
          <EmotionChart analysisResults={JSON.stringify(analysisResults)} />
        ) : (
          <Spin size="large" />
        )}
      </Modal>
    </div>
  );
};

export default FolderManager;
