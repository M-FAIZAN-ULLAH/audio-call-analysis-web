const axios = require("axios");
const Analysis = require("../model/BulkAnalysis");
const Folder = require("../model/Folder");

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
    const folder = await Folder.findById(folderId);

    // Check if folder exists
    if (!folder) {
      return res.status(404).send({ message: "Folder not found" });
    }

    // Update the status field to true
    folder.status = true;

    // Save the updated folder
    await folder.save();
    await newAnalysis.save();

    res.status(201).json(newAnalysis);
  } catch (error) {
    console.error("Error performing bulk analysis:", error);
    res.status(500).json({ error: "Error performing bulk analysis" });
  }
};

const getAnalysisByFolderId = async (req, res) => {
  const { folderId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5; // Default: 5 files per page
  const fileIndex = parseInt(req.query.fileIndex); // Optional: get specific file

  try {
    const analysis = await Analysis.findOne({ folderId });

    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    // If requesting a specific file by index
    if (fileIndex !== undefined && !isNaN(fileIndex)) {
      if (fileIndex >= 0 && fileIndex < analysis.analysis.length) {
        return res.status(200).json({
          success: true,
          fileIndex,
          totalFiles: analysis.analysis.length,
          file: analysis.analysis[fileIndex],
          pagination: {
            currentPage: Math.floor(fileIndex / limit) + 1,
            totalPages: Math.ceil(analysis.analysis.length / limit),
            totalFiles: analysis.analysis.length,
            hasNext: fileIndex < analysis.analysis.length - 1,
            hasPrev: fileIndex > 0,
          },
        });
      } else {
        return res.status(404).json({ error: "File index out of range" });
      }
    }

    // Paginate the analysis array
    const totalFiles = analysis.analysis.length;
    const totalPages = Math.ceil(totalFiles / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedAnalysis = analysis.analysis.slice(startIndex, endIndex);

    // Aggregate emotions from paginated files for summary
    const aggregatedEmotions = {};
    paginatedAnalysis.forEach((item) => {
      try {
        if (
          item.result &&
          Array.isArray(item.result) &&
          item.result.length > 0
        ) {
          const result = item.result[0];
          if (
            result.results &&
            result.results.predictions &&
            result.results.predictions.length > 0
          ) {
            const predictions =
              result.results.predictions[0].models?.prosody
                ?.grouped_predictions?.[0]?.predictions || [];
            predictions.forEach((pred) => {
              if (pred.emotions && Array.isArray(pred.emotions)) {
                pred.emotions.forEach((emotion) => {
                  if (emotion.name && emotion.score) {
                    if (!aggregatedEmotions[emotion.name]) {
                      aggregatedEmotions[emotion.name] = {
                        name: emotion.name,
                        totalScore: 0,
                        count: 0,
                      };
                    }
                    aggregatedEmotions[emotion.name].totalScore +=
                      emotion.score;
                    aggregatedEmotions[emotion.name].count += 1;
                  }
                });
              }
            });
          }
        }
      } catch (err) {
        console.error("Error processing file emotions:", err);
      }
    });

    // Calculate average scores
    const emotionSummary = Object.values(aggregatedEmotions).map((emotion) => ({
      name: emotion.name,
      score: emotion.totalScore / emotion.count,
      count: emotion.count,
    }));

    res.status(200).json({
      success: true,
      analysis: paginatedAnalysis,
      pagination: {
        currentPage: page,
        totalPages,
        totalFiles,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      summary: {
        emotions: emotionSummary,
        filesInPage: paginatedAnalysis.length,
      },
    });
  } catch (error) {
    console.error("Error fetching analysis:", error);
    res.status(500).json({ error: "Error fetching analysis" });
  }
};

module.exports = {
  performBulkAnalysis,
  getAnalysisByFolderId,
};
