// controllers/bulkAnalysisController.js

const Folder = require("../model/Folder");
// const AudioFile = require("../model/AudioFile");

const bulkAnalysisController = {
  createFolder: async (req, res) => {
    try {
      const { name, userId } = req.body; // Added userId to the request body
      const folder = new Folder({ name, userId }); // Pass userId to the folder
      await folder.save();
      res.status(201).json({ message: "Folder created successfully", folder });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },

  renameFolder: async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      await Folder.findByIdAndUpdate(id, { name });
      res.json({ message: "Folder renamed successfully" });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },

  deleteFolder: async (req, res) => {
    try {
      const { id } = req.params;
      await Folder.findByIdAndDelete(id);
      res.json({ message: "Folder deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },

  getAllFolders: async (req, res) => {
    try {
      const userId = req.query.userId; // Get userId from query parameters
      const folders = await Folder.find({ userId });
      res.status(200).json({ folders });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
  uploadAudio: async (req, res) => {
    try {
      const { id } = req.params;
      const { url, fileName } = req.body;

      const folder = await Folder.findById(id);
      if (!folder) return res.status(404).json({ error: "Folder not found" });

      // Add the uploaded audio file to the folder's audioFiles array
      folder.audioFiles.push({ url, fileName });
      await folder.save();

      res.json({
        message: "Audio file uploaded and folder updated successfully",
      });
    } catch (error) {
      console.error("Error uploading audio file:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  deleteAudioFile: async (req, res) => {
    try {
      const { id, fileName } = req.params;

      const folder = await Folder.findById(id);
      if (!folder) return res.status(404).json({ error: "Folder not found" });

      // Remove the audio file from the folder's audioFiles array
      folder.audioFiles = folder.audioFiles.filter(
        (file) => file.fileName !== fileName
      );
      await folder.save();

      res.json({ message: "Audio file deleted successfully" });
    } catch (error) {
      console.error("Error deleting audio file:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = bulkAnalysisController;
