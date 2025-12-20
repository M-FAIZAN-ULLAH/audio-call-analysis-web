import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Modal,
  Button,
  Table,
  Input,
  Space,
  Spin,
  message,
  Card,
  Tag,
  Empty,
  Tooltip,
  Popconfirm,
  Badge,
  Row,
  Col,
  Typography,
  Divider,
} from "antd";
import {
  FaTrashAlt,
  FaEdit,
  FaFolderPlus,
  FaFolderOpen,
  FaUpload,
  FaEye,
  FaTools,
  FaFileAudio,
  FaCheckCircle,
  FaClock,
  FaFolder,
} from "react-icons/fa";
import { GetAudioUrl } from "../../../utilis/get-audio-url";
import { useUser } from "../../../utilis/userContext";
import { useRouter } from "next/router";
import EmotionChart from "../EmotionAnalysisChart";

const { Title, Text } = Typography;

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
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [fetchingFolders, setFetchingFolders] = useState(false);
  const router = useRouter();

  useEffect(() => {
    handleFetchFolders();
  }, []);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      message.warning("Please enter a folder name");
      return;
    }
    try {
      await axios.post("http://localhost:3001/api/folders", {
        name: newFolderName,
        userId: currentUser._id,
      });
      setNewFolderName("");
      setIsModalVisible(false);
      message.success("Folder created successfully!");
      await handleFetchFolders();
    } catch (error) {
      console.error("Error creating folder:", error);
      message.error("Failed to create folder");
    }
  };

  const handleFetchFolders = async () => {
    setFetchingFolders(true);
    try {
      const userId = currentUser._id;
      const response = await axios.get(
        `http://localhost:3001/api/folders?userId=${userId}`
      );
      setFolders(response.data.folders || []);
    } catch (error) {
      console.error("Error fetching folders:", error);
      message.error("Failed to fetch folders");
    } finally {
      setFetchingFolders(false);
    }
  };

  const handleDeleteFolder = async () => {
    try {
      await axios.delete(
        `http://localhost:3001/api/folders/${selectedFolder._id}`
      );
      setFolders(folders.filter((folder) => folder._id !== editFolderId));
      setSelectedFolder(null);
      setIsDeleteModalVisible(false);
      message.success("Folder deleted successfully!");
      await handleFetchFolders();
    } catch (error) {
      console.error("Error deleting folder:", error);
      message.error("Failed to delete folder");
    }
  };

  const handleRenameFolder = async () => {
    if (!editFolderName.trim()) {
      message.warning("Please enter a folder name");
      return;
    }
    try {
      await axios.put(`http://localhost:3001/api/folders/${editFolderId}`, {
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
      message.success("Folder renamed successfully!");
    } catch (error) {
      console.error("Error renaming folder:", error);
      message.error("Failed to rename folder");
    }
  };

  const handleUploadAudio = async (event) => {
    setUploading(true);
    const files = event.target.files;
    const filteredFiles = Array.from(files).filter(
      (file) => file.type === "audio/mpeg" || file.type === "video/mp4"
    );

    if (filteredFiles.length === 0) {
      message.warning("Please select audio or video files");
      setUploading(false);
      return;
    }

    for (const file of filteredFiles) {
      try {
        const url = await GetAudioUrl(file);

        await axios.post(
          `http://localhost:3001/api/folders/${selectedFolder._id}/audio`,
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
    // Reset file input
    event.target.value = "";
  };

  const handleDeleteFile = async (fileName) => {
    try {
      await axios.delete(
        `http://localhost:3001/api/folders/${selectedFolder._id}/audio/${fileName}`
      );

      setUploadedFiles(uploadedFiles.filter((file) => file.name !== fileName));

      await handleFetchFolders();

      message.success(`File "${fileName}" deleted successfully!`);
    } catch (error) {
      console.error("Error deleting file:", error);
      message.error(`Failed to delete file "${fileName}"!`);
    }
  };

  const handleViewFolderDetails = async (page = 1) => {
    if (selectedFolder) {
      setLoadingAnalysis(true);
      try {
        const response = await axios.get(
          `http://localhost:3001/api/analysis/${selectedFolder._id}?page=${page}&limit=5`
        );

        if (response.data.success) {
          setAnalysisResults(response.data);
          setPagination(response.data.pagination);
          setCurrentPage(page);
          setViewModalVisible(true);
        } else {
          message.error("Failed to fetch analysis data!");
        }
      } catch (error) {
        console.error("Error fetching analysis:", error);
        message.error(
          error.response?.data?.error ||
            "Failed to fetch analysis data! The data might be too large. Try again."
        );
      } finally {
        setLoadingAnalysis(false);
      }
    }
  };

  const handlePageChange = (page) => {
    handleViewFolderDetails(page);
  };

  const handleFileChange = async (fileIndex) => {
    if (selectedFolder) {
      setLoadingAnalysis(true);
      try {
        const response = await axios.get(
          `http://localhost:3001/api/analysis/${selectedFolder._id}?fileIndex=${fileIndex}`
        );

        if (response.data.success) {
          setAnalysisResults(response.data);
          setPagination(response.data.pagination);
          setViewModalVisible(true);
        }
      } catch (error) {
        console.error("Error fetching file analysis:", error);
        message.error("Failed to fetch file analysis!");
      } finally {
        setLoadingAnalysis(false);
      }
    }
  };

  const handleAnalyzeFolder = async () => {
    if (selectedFolder) {
      if (!selectedFolder.audioFiles || selectedFolder.audioFiles.length === 0) {
        message.warning("Please upload audio files first");
        return;
      }
      const urls = selectedFolder.audioFiles.map((file) => file.url);
      setLoading(true);
      try {
        const response = await axios.post(
          "http://localhost:3001/api/bulk-analysis",
          {
            folderId: selectedFolder._id,
            urls: urls,
          }
        );
        setAnalysisResults(response.data.analysis);
        message.success("Analysis completed successfully!");
        await handleFetchFolders();
      } catch (error) {
        console.error("Error performing bulk analysis:", error);
        message.error("Failed to perform analysis!");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSelectFolder = (folder) => {
    setSelectedFolder(folder);
    setUploadedFiles(folder.audioFiles || []);
    setIsSelectModalVisible(false);
  };

  const columns = [
    {
      title: (
        <div className="flex items-center gap-2">
          <FaFileAudio className="text-blue-500" />
          <span>File Name</span>
        </div>
      ),
      dataIndex: "fileName",
      key: "fileName",
      render: (text) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <FaFileAudio className="text-blue-600 text-lg" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-800 truncate">{text}</div>
            <div className="text-xs text-gray-500">
              {text.split(".").pop().toUpperCase()} file
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      align: "center",
      render: (text, record) => (
        <div className="flex items-center justify-center gap-2">
          <Tooltip title="Delete file">
            <Popconfirm
              title="Delete this file?"
              description="This action cannot be undone."
              onConfirm={() => handleDeleteFile(record.fileName)}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                danger
                icon={<FaTrashAlt />}
                size="middle"
                className="hover:bg-red-50"
              />
            </Popconfirm>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6">
          <Title level={2} className="mb-2">
            Bulk Analysis Manager
          </Title>
          <Text type="secondary" className="text-base">
            Manage your audio analysis folders and files
          </Text>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-3">
          <Button
            type="primary"
            size="large"
            icon={<FaFolderPlus />}
            onClick={() => setIsModalVisible(true)}
            className="shadow-md"
          >
            Create Folder
          </Button>
          <Button
            size="large"
            icon={<FaFolderOpen />}
            onClick={() => setIsSelectModalVisible(true)}
            className="shadow-md"
          >
            Select Folder
          </Button>
          {selectedFolder && selectedFolder.status === "true" && (
            <Button
              type="primary"
              size="large"
              icon={<FaEye />}
              onClick={handleViewFolderDetails}
              className="shadow-md bg-green-600 hover:bg-green-700"
            >
              View Analysis
            </Button>
          )}
          {selectedFolder && selectedFolder.status !== "true" && (
            <Button
              type="primary"
              size="large"
              icon={<FaTools />}
              onClick={handleAnalyzeFolder}
              disabled={loading}
              loading={loading}
              className="shadow-md"
            >
              {loading ? "Analyzing..." : "Run Analysis"}
            </Button>
          )}
        </div>

        {/* Folders Grid */}
        {!selectedFolder && (
          <Row gutter={[16, 16]} className="mb-6">
            {fetchingFolders ? (
              <Col span={24} className="text-center py-12">
                <Spin size="large" />
              </Col>
            ) : folders.length === 0 ? (
              <Col span={24}>
                <Card>
                  <Empty
                    description="No folders found. Create your first folder to get started."
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </Card>
              </Col>
            ) : (
              folders.map((folder) => (
                <Col xs={24} sm={12} md={8} lg={6} key={folder._id}>
                  <Card
                    hoverable
                    className="h-full cursor-pointer transition-all duration-300 hover:shadow-xl border border-gray-200"
                    onClick={() => handleSelectFolder(folder)}
                    actions={[
                      <Tooltip title="Edit Folder Name" key="edit">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditFolderId(folder._id);
                            setEditFolderName(folder.name);
                            setIsEditModalVisible(true);
                          }}
                          className="flex items-center justify-center h-full py-2 hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <FaEdit className="text-blue-600 text-lg" />
                        </div>
                      </Tooltip>,
                      <Tooltip title="Delete Folder" key="delete">
                        <Popconfirm
                          title="Delete folder?"
                          description="This will permanently delete the folder and all its files."
                          onConfirm={(e) => {
                            e?.stopPropagation();
                            setSelectedFolder(folder);
                            setIsDeleteModalVisible(true);
                          }}
                          okText="Delete"
                          cancelText="Cancel"
                          okButtonProps={{ danger: true }}
                        >
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center justify-center h-full py-2 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <FaTrashAlt className="text-red-600 text-lg" />
                          </div>
                        </Popconfirm>
                      </Tooltip>,
                    ]}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm flex-shrink-0">
                        <FaFolder className="text-3xl text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Title level={5} className="mb-2 truncate text-gray-800">
                          {folder.name}
                        </Title>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-2 px-2 py-1 bg-gray-100 rounded-md">
                            <FaFileAudio className="text-gray-600 text-sm" />
                            <Badge
                              count={folder.audioFiles?.length || 0}
                              showZero
                              className="bg-blue-500"
                            />
                            <Text type="secondary" className="text-xs ml-1">
                              files
                            </Text>
                          </div>
                        </div>
                        <div>
                          {folder.status === "true" ? (
                            <Tag
                              color="green"
                              icon={<FaCheckCircle />}
                              className="px-3 py-1"
                            >
                              Analysis Complete
                            </Tag>
                          ) : (
                            <Tag
                              color="orange"
                              icon={<FaClock />}
                              className="px-3 py-1"
                            >
                              Pending Analysis
                            </Tag>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))
            )}
          </Row>
        )}

        {/* Selected Folder Details */}
        {selectedFolder && (
          <Card className="shadow-lg mb-6">
            <div className="mb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <FaFolder className="text-3xl text-blue-600" />
                  </div>
                  <div>
                    <Title level={4} className="mb-1">
                      {selectedFolder.name}
                    </Title>
                    <div className="flex items-center gap-4 flex-wrap">
                      <Text type="secondary">
                        {selectedFolder.audioFiles?.length || 0} files
                      </Text>
                      {selectedFolder.status === "true" ? (
                        <Tag color="green" icon={<FaCheckCircle />}>
                          Analysis Complete
                        </Tag>
                      ) : (
                        <Tag color="orange" icon={<FaClock />}>
                          Analysis Pending
                        </Tag>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Tooltip title="Rename Folder">
                    <Button
                      icon={<FaEdit />}
                      onClick={() => {
                        setEditFolderId(selectedFolder._id);
                        setEditFolderName(selectedFolder.name);
                        setIsEditModalVisible(true);
                      }}
                      className="flex items-center gap-2"
                    >
                      <FaEdit />
                      <span className="hidden sm:inline">Rename</span>
                    </Button>
                  </Tooltip>
                  <Tooltip title="Delete Folder">
                    <Popconfirm
                      title="Delete folder?"
                      description="This will permanently delete the folder and all its files."
                      onConfirm={handleDeleteFolder}
                      okText="Delete"
                      cancelText="Cancel"
                      okButtonProps={{ danger: true }}
                    >
                      <Button
                        danger
                        icon={<FaTrashAlt />}
                        className="flex items-center gap-2"
                      >
                        <FaTrashAlt />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </Popconfirm>
                  </Tooltip>
                  <Button
                    onClick={() => {
                      setSelectedFolder(null);
                      setUploadedFiles([]);
                    }}
                    className="flex items-center gap-2"
                  >
                    <span className="hidden sm:inline">Close</span>
                    <span className="sm:hidden">×</span>
                  </Button>
                </div>
              </div>
            </div>

            <Divider />

            {/* Upload Section */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <FaUpload className="text-white text-lg" />
                    </div>
                    <div>
                      <Title level={5} className="mb-0">
                        Upload Audio Files
                      </Title>
                      <Text type="secondary" className="text-sm">
                        Supported formats: MP3, MP4 • Multiple files allowed
                      </Text>
                    </div>
                  </div>
                </div>
                <input
                  id="fileInput"
                  type="file"
                  accept="audio/mp3, video/mp4"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleUploadAudio}
                />
                <Button
                  type="primary"
                  size="large"
                  icon={<FaUpload />}
                  onClick={() => document.getElementById("fileInput").click()}
                  loading={uploading}
                  className="shadow-md"
                  style={{ minWidth: "150px" }}
                >
                  {uploading ? "Uploading..." : "Upload Files"}
                </Button>
              </div>
            </div>

            {/* Files Table */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <FaFileAudio className="text-gray-600 text-lg" />
                  </div>
                  <div>
                    <Title level={5} className="mb-0">
                      Audio Files
                    </Title>
                    <Text type="secondary" className="text-sm">
                      {selectedFolder.audioFiles?.length || 0} file
                      {(selectedFolder.audioFiles?.length || 0) !== 1
                        ? "s"
                        : ""}{" "}
                      in this folder
                    </Text>
                  </div>
                </div>
              </div>
              {selectedFolder.audioFiles &&
              selectedFolder.audioFiles.length > 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <Table
                    dataSource={selectedFolder.audioFiles}
                    columns={columns}
                    rowKey="fileName"
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} files`,
                      pageSizeOptions: ["5", "10", "20", "50"],
                    }}
                    className="bg-white"
                    rowClassName="hover:bg-gray-50 transition-colors"
                  />
                </div>
              ) : (
                <Card className="text-center py-12">
                  <Empty
                    description={
                      <div>
                        <div className="text-base font-medium text-gray-600 mb-2">
                          No files uploaded yet
                        </div>
                        <Text type="secondary" className="text-sm">
                          Click "Upload Files" to add audio files to this folder
                        </Text>
                      </div>
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </Card>
              )}
            </div>
          </Card>
        )}

        {/* Modals */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <FaFolderPlus className="text-blue-500" />
              <span>Create New Folder</span>
            </div>
          }
          open={isModalVisible}
          onOk={handleCreateFolder}
          onCancel={() => {
            setIsModalVisible(false);
            setNewFolderName("");
          }}
          okText="Create"
          cancelText="Cancel"
        >
          <Input
            placeholder="Enter folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onPressEnter={handleCreateFolder}
            size="large"
            className="mt-4"
          />
        </Modal>

        <Modal
          title={
            <div className="flex items-center gap-2">
              <FaEdit className="text-blue-500" />
              <span>Rename Folder</span>
            </div>
          }
          open={isEditModalVisible}
          onOk={handleRenameFolder}
          onCancel={() => {
            setIsEditModalVisible(false);
            setEditFolderName("");
          }}
          okText="Save"
          cancelText="Cancel"
        >
          <Input
            placeholder="Enter new folder name"
            value={editFolderName}
            onChange={(e) => setEditFolderName(e.target.value)}
            onPressEnter={handleRenameFolder}
            size="large"
            className="mt-4"
          />
        </Modal>

        <Modal
          title={
            <div className="flex items-center gap-2">
              <FaTrashAlt className="text-red-500" />
              <span>Delete Folder</span>
            </div>
          }
          open={isDeleteModalVisible}
          onOk={handleDeleteFolder}
          onCancel={() => setIsDeleteModalVisible(false)}
          okText="Delete"
          okButtonProps={{ danger: true }}
          cancelText="Cancel"
        >
          <p className="text-base">
            Are you sure you want to delete the folder "
            <strong>{selectedFolder?.name}</strong>"? This action cannot be
            undone and will delete all files in this folder.
          </p>
        </Modal>

        <Modal
          title={
            <div className="flex items-center gap-2">
              <FaFolderOpen className="text-blue-500" />
              <span>Select Folder</span>
            </div>
          }
          open={isSelectModalVisible}
          onCancel={() => setIsSelectModalVisible(false)}
          footer={null}
          width={800}
        >
          {fetchingFolders ? (
            <div className="text-center py-12">
              <Spin size="large" />
            </div>
          ) : folders.length === 0 ? (
            <Empty description="No folders available" />
          ) : (
            <div className="mt-4">
              <Table
                dataSource={folders}
                columns={[
                  {
                    title: "Folder Name",
                    dataIndex: "name",
                    key: "name",
                    render: (text, record) => (
                      <div className="flex items-center gap-3">
                        <FaFolder className="text-blue-500" />
                        <span className="font-medium">{text}</span>
                      </div>
                    ),
                  },
                  {
                    title: "Files",
                    key: "files",
                    render: (text, record) => (
                      <Badge
                        count={record.audioFiles?.length || 0}
                        showZero
                        className="bg-blue-500"
                      />
                    ),
                  },
                  {
                    title: "Status",
                    key: "status",
                    render: (text, record) =>
                      record.status === "true" ? (
                        <Tag color="green" icon={<FaCheckCircle />}>
                          Analyzed
                        </Tag>
                      ) : (
                        <Tag color="orange" icon={<FaClock />}>
                          Pending
                        </Tag>
                      ),
                  },
                  {
                    title: "Action",
                    key: "action",
                    render: (text, record) => (
                      <Button
                        type="primary"
                        onClick={() => handleSelectFolder(record)}
                      >
                        Select
                      </Button>
                    ),
                  },
                ]}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
              />
            </div>
          )}
        </Modal>

        <Modal
          title={
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaEye className="text-green-600 text-lg" />
              </div>
              <div>
                <div className="font-semibold text-lg">Customer Sentiment Analysis</div>
                <div className="text-xs text-gray-500">
                  {selectedFolder?.name} • Detailed Insights
                </div>
              </div>
            </div>
          }
          open={viewModalVisible}
          onCancel={() => {
            setViewModalVisible(false);
            setAnalysisResults(null);
            setPagination(null);
            setCurrentPage(1);
          }}
          footer={null}
          width="95%"
          style={{ top: 20, maxWidth: "1400px" }}
          bodyStyle={{ 
            maxHeight: "90vh", 
            overflow: "auto",
            padding: 0,
            backgroundColor: "#f5f5f5"
          }}
          className="analysis-modal"
        >
          {loadingAnalysis ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <Spin size="large" />
              <div style={{ marginTop: "16px" }}>Loading analysis data...</div>
            </div>
          ) : analysisResults ? (
            <EmotionChart
              analysisResults={analysisResults}
              pagination={pagination}
              onPageChange={handlePageChange}
              onFileChange={handleFileChange}
              loading={loadingAnalysis}
            />
          ) : (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <Spin size="large" />
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default FolderManager;
