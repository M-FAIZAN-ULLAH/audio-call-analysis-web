// controllers/bulkAnalysisController.js

const Folder = require("../model/Folder");
// const AudioFile = require("../model/AudioFile");

const bulkAnalysisController = {
  createFolder: async (req, res) => {
    try {
      console.log(`[API] POST /api/folders - Create Folder - Name: ${req.body.name}, User ID: ${req.body.userId}`);
      const { name, userId } = req.body; // Added userId to the request body
      const folder = new Folder({ name, userId }); // Pass userId to the folder
      await folder.save();
      console.log(`[API] POST /api/folders - Success - Folder ID: ${folder._id}`);
      res.status(201).json({ message: "Folder created successfully", folder });
    } catch (error) {
      console.error(`[API] POST /api/folders - Error: ${error.message}`);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  renameFolder: async (req, res) => {
    try {
      console.log(`[API] PUT /api/folders/:id - Rename Folder - Folder ID: ${req.params.id}, New Name: ${req.body.name}`);
      const { id } = req.params;
      const { name } = req.body;
      await Folder.findByIdAndUpdate(id, { name });
      console.log(`[API] PUT /api/folders/:id - Success - Folder ID: ${id}`);
      res.json({ message: "Folder renamed successfully" });
    } catch (error) {
      console.error(`[API] PUT /api/folders/:id - Error: ${error.message}`);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  deleteFolder: async (req, res) => {
    try {
      console.log(`[API] DELETE /api/folders/:id - Delete Folder - Folder ID: ${req.params.id}`);
      const { id } = req.params;
      await Folder.findByIdAndDelete(id);
      console.log(`[API] DELETE /api/folders/:id - Success - Folder ID: ${id}`);
      res.json({ message: "Folder deleted successfully" });
    } catch (error) {
      console.error(`[API] DELETE /api/folders/:id - Error: ${error.message}`);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  getAllFolders: async (req, res) => {
    try {
      console.log(`[API] GET /api/folders - Get All Folders - User ID: ${req.query.userId}`);
      const userId = req.query.userId; // Get userId from query parameters
      const folders = await Folder.find({ userId });
      console.log(`[API] GET /api/folders - Success - Found ${folders.length} folders`);
      res.status(200).json({ folders });
    } catch (error) {
      console.error(`[API] GET /api/folders - Error: ${error.message}`);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  uploadAudio: async (req, res) => {
    try {
      console.log(`[API] POST /api/folders/:id/audio - Upload Audio - Folder ID: ${req.params.id}, File: ${req.body.fileName}`);
      const { id } = req.params;
      const { url, fileName } = req.body;

      const folder = await Folder.findById(id);
      if (!folder) {
        console.log(`[API] POST /api/folders/:id/audio - Not Found - Folder ID: ${id}`);
        return res.status(404).json({ error: "Folder not found" });
      }

      // Add the uploaded audio file to the folder's audioFiles array
      folder.audioFiles.push({ url, fileName });
      await folder.save();

      console.log(`[API] POST /api/folders/:id/audio - Success - Folder ID: ${id}, Total Files: ${folder.audioFiles.length}`);
      res.json({
        message: "Audio file uploaded and folder updated successfully",
      });
    } catch (error) {
      console.error(`[API] POST /api/folders/:id/audio - Error: ${error.message}`);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  deleteAudioFile: async (req, res) => {
    try {
      console.log(`[API] DELETE /api/folders/:id/audio/:fileName - Delete Audio File - Folder ID: ${req.params.id}, File: ${req.params.fileName}`);
      const { id, fileName } = req.params;

      const folder = await Folder.findById(id);
      if (!folder) {
        console.log(`[API] DELETE /api/folders/:id/audio/:fileName - Not Found - Folder ID: ${id}`);
        return res.status(404).json({ error: "Folder not found" });
      }

      // Remove the audio file from the folder's audioFiles array
      folder.audioFiles = folder.audioFiles.filter(
        (file) => file.fileName !== fileName
      );
      await folder.save();

      console.log(`[API] DELETE /api/folders/:id/audio/:fileName - Success - Folder ID: ${id}, Remaining Files: ${folder.audioFiles.length}`);
      res.json({ message: "Audio file deleted successfully" });
    } catch (error) {
      console.error(`[API] DELETE /api/folders/:id/audio/:fileName - Error: ${error.message}`);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = bulkAnalysisController;
