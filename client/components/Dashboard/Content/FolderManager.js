// import React, { useState } from "react";
// import axios from "axios";
// import { Modal, Button } from "antd"; // Import Ant Design components
// import { FaTrashAlt, FaEdit, FaFolderPlus } from "react-icons/fa";
// import FolderDetails from "./FolderDetails"; // Import FolderDetails component

// const FolderManager = () => {
//   const [folders, setFolders] = useState([]);
//   const [newFolderName, setNewFolderName] = useState("");
//   const [selectedFolder, setSelectedFolder] = useState(null); // Track selected folder
//   const [isModalVisible, setIsModalVisible] = useState(false); // Track modal visibility

//   const handleCreateFolder = async () => {
//     try {
//       const response = await axios.post("http://localhost:5000/api/folders", {
//         name: newFolderName,
//       });
//       const newFolder = response.data.folder;
//       setFolders([...folders, newFolder]);
//       setNewFolderName("");
//       setIsModalVisible(false); // Close modal after creating folder
//     } catch (error) {
//       console.error("Error creating folder:", error);
//     }
//   };

//   const handleDeleteFolder = async (folderId) => {
//     try {
//       await axios.delete(`http://localhost:5000/api/folders/${folderId}`);
//       setFolders(folders.filter((folder) => folder._id !== folderId));
//     } catch (error) {
//       console.error("Error deleting folder:", error);
//     }
//   };

//   const handleRenameFolder = async (folderId, newName) => {
//     try {
//       await axios.put(`http://localhost:5000/api/folders/${folderId}`, {
//         name: newName,
//       });
//       setFolders(
//         folders.map((folder) =>
//           folder._id === folderId ? { ...folder, name: newName } : folder
//         )
//       );
//     } catch (error) {
//       console.error("Error renaming folder:", error);
//     }
//   };

//   const handleFolderClick = (folderId) => {
//     setSelectedFolder(folderId); // Set the selected folder ID
//   };

//   const showModal = () => {
//     setIsModalVisible(true);
//   };

//   const handleCancel = () => {
//     setIsModalVisible(false);
//   };

//   return (
//     <div className="max-w-4xl mx-auto px-4 py-8">
//       <h1 className="text-3xl font-semibold mb-6">
//         Bulk Analysis - Create Folder
//       </h1>
//       <Button
//         onClick={showModal}
//         className="bg-blue-500 text-white py-2 px-4 rounded-md flex items-center mb-4"
//       >
//         <FaFolderPlus className="mr-2" />
//         Create Folder
//       </Button>
//       <Modal
//         title="Enter Folder Name"
//         visible={isModalVisible}
//         onOk={handleCreateFolder}
//         onCancel={handleCancel}
//         okText="Create"
//         cancelText="Cancel"
//       >
//         <input
//           type="text"
//           value={newFolderName}
//           onChange={(e) => setNewFolderName(e.target.value)}
//           placeholder="Folder Name"
//           className="border border-gray-300 rounded-md px-4 py-2 mb-4 text-white"
//         />
//       </Modal>
//       <div>
//         {folders.map((folder) => (
//           <div
//             key={folder._id}
//             className="flex items-center justify-between border-b border-gray-300 py-4"
//           >
//             <span
//               onClick={() => handleFolderClick(folder._id)}
//               style={{ cursor: "pointer", textDecoration: "underline" }}
//             >
//               {folder.name}
//             </span>
//             <div className="flex">
//               <button
//                 onClick={() => handleDeleteFolder(folder._id)}
//                 className="text-red-500 mr-2"
//               >
//                 <FaTrashAlt />
//               </button>
//               <button
//                 onClick={() => {
//                   const newName = prompt("Enter new name:");
//                   if (newName) handleRenameFolder(folder._id, newName);
//                 }}
//                 className="text-blue-500"
//               >
//                 <FaEdit />
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//       {selectedFolder && <FolderDetails folderId={selectedFolder} />}{" "}
//       {/* Render FolderDetails component if folder is selected */}
//     </div>
//   );
// };

// export default FolderManager;

////////////////////////////

import React, { useState } from "react";
import axios from "axios";
import { Modal, Button, Table, Input, Space } from "antd";
import { FaTrashAlt, FaEdit, FaFolderPlus } from "react-icons/fa";
import FolderDetails from "./FolderDetails";

const FolderManager = () => {
  const [folders, setFolders] = useState([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [editFolderId, setEditFolderId] = useState(null);
  const [editFolderName, setEditFolderName] = useState("");

  const handleCreateFolder = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/folders", {
        name: newFolderName,
      });
      const newFolder = response.data.folder;
      setFolders([...folders, newFolder]);
      setNewFolderName("");
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  const handleDeleteFolder = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/folders/${editFolderId}`);
      setFolders(folders.filter((folder) => folder._id !== editFolderId));
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
      setIsEditModalVisible(false);
    } catch (error) {
      console.error("Error renaming folder:", error);
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setIsEditModalVisible(false);
    setIsDeleteModalVisible(false);
  };

  const columns = [
    {
      title: "Folder Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <span
          onClick={() => setSelectedFolder(record._id)}
          style={{ cursor: "pointer", textDecoration: "underline" }}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space size="middle">
          <Button
            type="link"
            onClick={() => {
              setEditFolderId(record._id);
              setEditFolderName(record.name);
              setIsEditModalVisible(true);
            }}
          >
            <FaEdit />
          </Button>
          <Button
            type="link"
            danger
            onClick={() => {
              setEditFolderId(record._id);
              setIsDeleteModalVisible(true);
            }}
          >
            <FaTrashAlt />
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6">
        Bulk Analysis - Create Folder
      </h1>
      <Button
        onClick={showModal}
        type="primary"
        icon={<FaFolderPlus />}
        className="mb-4"
      >
        Create Folder
      </Button>
      <Table dataSource={folders} columns={columns} rowKey="_id" />

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

      {selectedFolder && <FolderDetails folderId={selectedFolder} />}
    </div>
  );
};

export default FolderManager;

/////////////////////////////

// import React, { useState } from "react";
// import axios from "axios";
// import { Table, Modal, Button, Input } from "antd"; // Import Ant Design components
// import { FaTrashAlt, FaEdit, FaFolderPlus } from "react-icons/fa";
// import FolderDetails from "./FolderDetails"; // Import FolderDetails component

// const FolderManager = () => {
//   const [folders, setFolders] = useState([]);
//   const [newFolderName, setNewFolderName] = useState("");
//   const [selectedFolder, setSelectedFolder] = useState(null); // Track selected folder
//   const [isModalVisible, setIsModalVisible] = useState(false); // Track modal visibility
//   const [deleteModalVisible, setDeleteModalVisible] = useState(false); // Track delete modal visibility
//   const [renameModalVisible, setRenameModalVisible] = useState(false); // Track rename modal visibility
//   const [currentFolderId, setCurrentFolderId] = useState(null); // Track folder id for delete/rename operation
//   const [newName, setNewName] = useState("");

//   const handleCreateFolder = async () => {
//     try {
//       const response = await axios.post("http://localhost:5000/api/folders", {
//         name: newFolderName,
//       });
//       const newFolder = response.data.folder;
//       setFolders([...folders, newFolder]);
//       setNewFolderName("");
//       setIsModalVisible(false); // Close modal after creating folder
//     } catch (error) {
//       console.error("Error creating folder:", error);
//     }
//   };

//   const showModal = () => {
//     setIsModalVisible(true);
//   };

//   const handleCancel = () => {
//     setIsModalVisible(false);
//   };

//   const handleFolderClick = (folderId) => {
//     setSelectedFolder(folderId); // Set the selected folder ID
//   };
//   const handleDeleteFolder = async () => {
//     try {
//       await axios.delete(
//         `http://localhost:5000/api/folders/${currentFolderId}`
//       );
//       setFolders(folders.filter((folder) => folder._id !== currentFolderId));
//       setDeleteModalVisible(false);
//     } catch (error) {
//       console.error("Error deleting folder:", error);
//     }
//   };

//   const handleRenameFolder = async () => {
//     try {
//       await axios.put(`http://localhost:5000/api/folders/${currentFolderId}`, {
//         name: newName,
//       });
//       setFolders(
//         folders.map((folder) =>
//           folder._id === currentFolderId ? { ...folder, name: newName } : folder
//         )
//       );
//       setRenameModalVisible(false);
//     } catch (error) {
//       console.error("Error renaming folder:", error);
//     }
//   };

//   const columns = [
//     {
//       title: "Folder Name",
//       dataIndex: "name",
//       key: "_id",
//       render: (text, record) => (
//         <a onClick={() => handleFolderClick(record._id)}>{text}</a>
//       ),
//     },
//     {
//       title: "Actions",
//       key: "actions",
//       render: (_, record) => (
//         <>
//           <Button
//             style={{ width: "100px", marginLeft: "10px" }}
//             icon={<FaEdit />}
//             onClick={() => {
//               setCurrentFolderId(record._id);
//               setRenameModalVisible(true);
//             }}
//           >
//             Edit
//           </Button>

//           <Button
//             style={{ marginLeft: "50px" }}
//             danger
//             icon={<FaTrashAlt />}
//             onClick={() => {
//               setCurrentFolderId(record._id);
//               setDeleteModalVisible(true);
//             }}
//           >
//             Delete
//           </Button>
//         </>
//       ),
//     },
//   ];

//   return (
//     <div className="max-w-4xl mx-auto px-4 py-8">
//       <h1 className="text-3xl font-semibold mb-6">
//         Bulk Analysis - Create Folder
//       </h1>
//       <Button
//         onClick={showModal}
//         className="bg-blue-500 text-white py-2 px-4 rounded-md flex items-center mb-4"
//       >
//         <FaFolderPlus className="mr-2" />
//         Create Folder
//       </Button>
//       <Modal
//         title="Enter Folder Name"
//         visible={isModalVisible}
//         onOk={handleCreateFolder}
//         onCancel={handleCancel}
//         okText="Create"
//         cancelText="Cancel"
//       >
//         <Input
//           placeholder="Folder Name"
//           value={newFolderName}
//           onChange={(e) => setNewFolderName(e.target.value)}
//         />
//       </Modal>
//       <Table
//         dataSource={folders}
//         columns={columns}
//         rowKey="_id"
//         pagination={false}
//         bordered
//       />
//       <Modal
//         title="Are you sure?"
//         visible={deleteModalVisible}
//         onOk={handleDeleteFolder}
//         onCancel={() => setDeleteModalVisible(false)}
//         okText="Yes"
//         cancelText="No"
//       >
//         <p>Do you really want to delete this folder?</p>
//       </Modal>
//       <Modal
//         title="Rename Folder"
//         visible={renameModalVisible}
//         onOk={handleRenameFolder}
//         onCancel={() => setRenameModalVisible(false)}
//         okText="Save"
//         cancelText="Cancel"
//       >
//         <Input
//           placeholder="New Folder Name"
//           value={newName}
//           onChange={(e) => setNewName(e.target.value)}
//         />
//       </Modal>
//       {selectedFolder && <FolderDetails folderId={selectedFolder} />}{" "}
//       {/* Render FolderDetails component if folder is selected */}
//     </div>
//   );
// };

// export default FolderManager;
