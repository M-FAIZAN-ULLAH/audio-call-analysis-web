const axios = require("axios");
const Analysis = require("../model/BulkAnalysis");
const Folder = require("../model/Folder");

const performBulkAnalysis = async (req, res) => {
  const { folderId, urls } = req.body;

  try {
    console.log(`[API] POST /api/bulk-analysis - Perform Bulk Analysis - Folder ID: ${folderId}, Files: ${urls.length}`);
    console.log(`[QUEUE] Starting sequential queue processing for ${urls.length} files`);
    
    const analysisResults = [];
    const startTime = Date.now();
    
    // Process files sequentially in queue (one at a time)
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const queuePosition = i + 1;
      const queueTotal = urls.length;
      
      console.log(`[QUEUE] [${queuePosition}/${queueTotal}] Processing file in queue - URL: ${url}`);
      console.log(`[QUEUE] [${queuePosition}/${queueTotal}] Queue status: Processing (${((queuePosition - 1) / queueTotal * 100).toFixed(1)}% complete)`);
      
      const fileStartTime = Date.now();
      
      try {
        // Process file through Flask API (sequential - waits for completion before next)
        // Set timeout to 20 minutes (1200000ms) - Hume jobs can take 2-10 minutes per file
        const response = await axios.post("http://127.0.0.1:8000/upload", {
          url,
        }, {
          timeout: 1200000, // 20 minutes timeout
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const fileProcessingTime = ((Date.now() - fileStartTime) / 1000).toFixed(2);
        console.log(`[QUEUE] [${queuePosition}/${queueTotal}] File processed successfully in ${fileProcessingTime}s`);
        
        // Handle new standardized format from Flask
        const flaskData = response.data;
        
        // Check if Flask returned error
        if (flaskData && flaskData.success === false) {
          console.error(`[QUEUE] [${queuePosition}/${queueTotal}] Flask Error: ${flaskData.message}`);
          analysisResults.push({ 
            url, 
            result: flaskData,
            error: flaskData.message || "Error processing file"
          });
        } else {
          // Store the standardized result
          analysisResults.push({ url, result: flaskData });
          console.log(`[QUEUE] [${queuePosition}/${queueTotal}] File analysis completed and queued for next file`);
        }
      } catch (error) {
        const fileProcessingTime = ((Date.now() - fileStartTime) / 1000).toFixed(2);
        console.error(`[QUEUE] [${queuePosition}/${queueTotal}] Error processing file (${fileProcessingTime}s): ${error.message}`);
        
        // Handle timeout errors specifically
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          console.error(`[QUEUE] [${queuePosition}/${queueTotal}] Timeout Error: Flask request took too long`);
          analysisResults.push({ 
            url, 
            result: {
              success: false,
              error: "Request timeout",
              message: "Audio processing is taking longer than expected. The file may be too large.",
              results: null
            },
            error: "Request timeout"
          });
        } else if (error.code === 'ECONNREFUSED' || error.message.includes('connect')) {
          console.error(`[QUEUE] [${queuePosition}/${queueTotal}] Connection Error: Cannot connect to Flask service`);
          analysisResults.push({ 
            url, 
            result: {
              success: false,
              error: "Service unavailable",
              message: "Cannot connect to audio processing service. Please ensure Flask service is running.",
              results: null
            },
            error: "Service unavailable"
          });
        } else {
          analysisResults.push({ 
            url, 
            result: {
              success: false,
              error: error.message,
              message: `Error processing file: ${error.message}`,
              results: null
            },
            error: error.message
          });
        }
      }
      
      // Log queue progress
      const progressPercent = ((queuePosition / queueTotal) * 100).toFixed(1);
      console.log(`[QUEUE] Progress: ${progressPercent}% (${queuePosition}/${queueTotal} files completed)`);
    }
    
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[QUEUE] Queue processing completed in ${totalTime}s - All ${urls.length} files processed sequentially`);

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

    console.log(`[API] POST /api/bulk-analysis - Success - Analysis ID: ${newAnalysis._id}, Processed ${urls.length} files`);
    res.status(201).json(newAnalysis);
  } catch (error) {
    console.error(`[API] POST /api/bulk-analysis - Error: ${error.message}`);
    res.status(500).json({ error: "Error performing bulk analysis" });
  }
};

const getAnalysisByFolderId = async (req, res) => {
  const { folderId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5; // Default: 5 files per page
  const fileIndex = req.query.fileIndex !== undefined ? parseInt(req.query.fileIndex) : null;

  try {
    if (fileIndex !== null) {
      console.log(`[API] GET /api/analysis/:folderId - Get Single File Analysis - Folder ID: ${folderId}, File Index: ${fileIndex}`);
    } else {
      console.log(`[API] GET /api/analysis/:folderId - Get Paginated Analysis - Folder ID: ${folderId}, Page: ${page}, Limit: ${limit}`);
    }
    const analysis = await Analysis.findOne({ folderId });

    if (!analysis) {
      console.log(`[API] GET /api/analysis/:folderId - Not Found - Folder ID: ${folderId}`);
      return res.status(404).json({ error: "Analysis not found" });
    }

    // If requesting a specific file by index
    if (fileIndex !== null && fileIndex >= 0 && fileIndex < analysis.analysis.length) {
      // Aggregate emotions for single file
      const aggregateEmotions = (files) => {
        const aggregatedEmotions = {};
        files.forEach((item) => {
          try {
            if (item.result && Array.isArray(item.result) && item.result.length > 0) {
              const result = item.result[0];
              if (result.results && result.results.predictions && result.results.predictions.length > 0) {
                const predictions = result.results.predictions[0].models?.prosody?.grouped_predictions?.[0]?.predictions || [];
                predictions.forEach((pred) => {
                  if (pred.emotions && Array.isArray(pred.emotions)) {
                    pred.emotions.forEach((emotion) => {
                      if (emotion.name && emotion.score) {
                        if (!aggregatedEmotions[emotion.name]) {
                          aggregatedEmotions[emotion.name] = { name: emotion.name, totalScore: 0, count: 0 };
                        }
                        aggregatedEmotions[emotion.name].totalScore += emotion.score;
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
        return Object.values(aggregatedEmotions).map((emotion) => ({
          name: emotion.name,
          score: emotion.totalScore / emotion.count,
          count: emotion.count,
        }));
      };
      
      console.log(`[API] GET /api/analysis/:folderId - Success - File Index: ${fileIndex}, Total Files: ${analysis.analysis.length}`);
      return res.status(200).json({
        success: true,
        analysis: [analysis.analysis[fileIndex]],
        summary: {
          emotions: aggregateEmotions([analysis.analysis[fileIndex]]),
        },
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalFiles: analysis.analysis.length,
          fileIndex: fileIndex,
          hasNext: fileIndex < analysis.analysis.length - 1,
          hasPrev: fileIndex > 0,
        },
      });
    } else if (fileIndex !== null) {
      console.log(`[API] GET /api/analysis/:folderId - Error - File Index ${fileIndex} out of range`);
      return res.status(404).json({ error: "File index out of range" });
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

    console.log(`[API] GET /api/analysis/:folderId - Success - Page: ${page}/${totalPages}, Files: ${paginatedAnalysis.length}/${totalFiles}`);
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
    console.error(`[API] GET /api/analysis/:folderId - Error: ${error.message}`);
    res.status(500).json({ error: "Error fetching analysis" });
  }
};

module.exports = {
  performBulkAnalysis,
  getAnalysisByFolderId,
};
