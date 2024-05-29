const express = require("express");
const { verifyToken } = require("../utilis/jwt");
const {
  createAnalysis,
  saveAnalysis,
  getAnalysis,
  deleteAnalysis,
} = require("../controller/analysisController");

const router = express.Router();

// For analyzing the audio file. Also saves it to the database.
router.post("/analysis", createAnalysis);

// For saving the analysis to the database.
router.post("/save", verifyToken, saveAnalysis);

// For getting the data from the database.
router.get("/", verifyToken, getAnalysis);

// For deleting the analysis from the database.
router.delete("/:id", verifyToken, deleteAnalysis);

module.exports = router;
