const mongoose = require("mongoose");

const bulkanalysisSchema = new mongoose.Schema(
  {
    folderId: {
      type: String,
      required: true,
    },
    analysis: [
      {
        url: String,
        result: mongoose.Schema.Types.Mixed,
      },
    ],
  },
  { timestamps: true }
);

const Analysis = mongoose.model("BulkAnalysis", bulkanalysisSchema);

module.exports = Analysis;
