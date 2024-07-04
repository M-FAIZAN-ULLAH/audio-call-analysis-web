const axios = require("axios");
const Analysis = require("../model/BulkAnalysis");

const performBulkAnalysis = async (req, res) => {
  const { folderId, urls } = req.body;

  try {
    const analysisResults = [];
    for (const url of urls) {
      const response = await axios.post("http://127.0.0.1:8000/upload", {
        url,
      });
      analysisResults.push({ url, result: response.data });
    }

    const newAnalysis = new Analysis({
      folderId,
      analysis: analysisResults,
    });

    await newAnalysis.save();

    res.status(201).json(newAnalysis);
  } catch (error) {
    console.error("Error performing bulk analysis:", error);
    res.status(500).json({ error: "Error performing bulk analysis" });
  }
};

const getAnalysisByFolderId = async (req, res) => {
  const { folderId } = req.params;

  try {
    const analysis = await Analysis.findOne({ folderId });

    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    res.status(200).json(analysis);
  } catch (error) {
    console.error("Error fetching analysis:", error);
    res.status(500).json({ error: "Error fetching analysis" });
  }
};

module.exports = {
  performBulkAnalysis,
  getAnalysisByFolderId,
};
