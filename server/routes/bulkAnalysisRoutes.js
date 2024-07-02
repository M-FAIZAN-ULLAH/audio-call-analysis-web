// routes/bulkanalysisroutes.js

const express = require("express");
// const { verifyToken } = require("../utilis/jwt");
const router = express.Router();
const bulkAnalysisController = require("../controller/bulkAnalysisController");

// Routes for folder operations
router.post("/folders", bulkAnalysisController.createFolder);
router.put("/folders/:id", bulkAnalysisController.renameFolder);
router.delete("/folders/:id", bulkAnalysisController.deleteFolder);
router.get("/folders", bulkAnalysisController.getAllFolders);

// Route for uploading audio files to a folder
router.post("/folders/:id/audio", bulkAnalysisController.uploadAudio);
router.delete(
  "/folders/:id/audio/:fileName",
  bulkAnalysisController.deleteAudioFile
);

module.exports = router;
