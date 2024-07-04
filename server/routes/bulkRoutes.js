const express = require("express");
const router = express.Router();
const {
  performBulkAnalysis,
  getAnalysisByFolderId,
} = require("../controller/bulkController");

router.post("/bulk-analysis", performBulkAnalysis);
router.get("/analysis/:folderId", getAnalysisByFolderId);

module.exports = router;
