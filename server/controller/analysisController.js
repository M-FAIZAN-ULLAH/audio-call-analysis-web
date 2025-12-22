const axios = require("axios");
const User = require("../model/User");

// Importing the Analysis model
const Analysis = require("../model/Analysis");

const createAnalysis = async (req, res) => {
  try {
    console.log(`[API] POST /api/analysis - Create Audio Analysis - URL: ${req.body.url}`);
    const link = req.body.url;

    const axiosResponse = await axios.post("http://127.0.0.1:8000/upload", {
      url: link,
    });
    
    // Handle new standardized format from Flask
    const flaskData = axiosResponse.data;
    
    // Check if Flask returned standardized format
    if (flaskData && flaskData.success === false) {
      console.error(`[API] POST /api/analysis - Flask Error: ${flaskData.message}`);
      return res.status(500).json({ 
        error: flaskData.message || "Error processing audio file",
        details: flaskData.error 
      });
    }
    
    // Format data for consistent response (handles both old and new formats)
    const formattedData = formatData(flaskData);
    
    // await User.findOneAndUpdate(
    //   { _id: req.userId },
    //   { $inc: { analysisCount: 1 } }
    // );

    console.log(`[API] POST /api/analysis - Success - Processed audio analysis`);
    res.status(201).send(formattedData);
  } catch (error) {
    console.error(`[API] POST /api/analysis - Error: ${error.message}`);
    res.status(500).send("Error processing data");
  }
};

const formatData = (data) => {
  // Handle new standardized format from Flask
  if (data && data.results) {
    // New format: data.results contains the actual results
    const results = data.results;
    
    // Check if results is an array (old format) or object (new format)
    if (Array.isArray(results) && results.length > 0) {
      const firstResult = results[0];
      if (firstResult.results && firstResult.results.predictions && firstResult.results.predictions.length > 0) {
        const predictions = firstResult.results.predictions[0];
        if (predictions.models && predictions.models.prosody && 
            predictions.models.prosody.grouped_predictions && 
            predictions.models.prosody.grouped_predictions.length > 0) {
          const filteredEmotions = filterEmotions(
            predictions.models.prosody.grouped_predictions[0].predictions
          );
          return filteredEmotions;
        }
      }
    } else if (results && results.predictions && results.predictions.length > 0) {
      // Direct predictions in results
      const predictions = results.predictions[0];
      if (predictions.models && predictions.models.prosody && 
          predictions.models.prosody.grouped_predictions && 
          predictions.models.prosody.grouped_predictions.length > 0) {
        const filteredEmotions = filterEmotions(
          predictions.models.prosody.grouped_predictions[0].predictions
        );
        return filteredEmotions;
      }
    }
  }
  
  // Fallback: Handle old format (array with single object)
  if (Array.isArray(data) && data.length > 0) {
    const results = data[0].results;
    if (results && results.predictions && results.predictions.length > 0) {
      const predictions = results.predictions[0];
      if (predictions.models && predictions.models.prosody && 
          predictions.models.prosody.grouped_predictions && 
          predictions.models.prosody.grouped_predictions.length > 0) {
        const filteredEmotions = filterEmotions(
          predictions.models.prosody.grouped_predictions[0].predictions
        );
        return filteredEmotions;
      }
    }
  }
  
  return {};
};

const filterEmotions = (predictions) => {
  const desiredEmotions = [
    "Anger",
    "Distress",
    "Disappointment",
    "Disgust",
    "Surprise (negative)",
  ]; // Customize desired emotions here
  const filteredData = predictions
    .filter((prediction) => {
      const matchingEmotions = prediction.emotions.filter((emotion) =>
        desiredEmotions.includes(emotion.name)
      );
      return matchingEmotions.length > 0;
    })
    .map((prediction) => {
      return {
        time: prediction.time,
        emotions: prediction.emotions.filter((emotion) =>
          desiredEmotions.includes(emotion.name)
        ),
        text: prediction.text,
      };
    });
  return filteredData;
};

const saveAnalysis = async (req, res) => {
  try {
    console.log(`[API] POST /api/save - Save Analysis - Owner: ${req.body.owner}, Agent: ${req.body.agentName}`);
    // Getting these variables from the front end in the ResultForm component.
    const { analysisData, audioUrl, agentName, reason, date, owner } = req.body;

    // Assuming you want to save this data in the MongoDB database
    const analysis = new Analysis({
      description: analysisData,
      file_url: audioUrl,
      agent_name: agentName,
      reason: reason,
      date: date,
      owner: owner,
    });
    await analysis.save();

    const savedAnalysis = await Analysis.countDocuments({ owner: req.userId });
    await User.findOneAndUpdate(
      { _id: req.userId },
      { $set: { savedAnalysis } }
    );

    console.log(`[API] POST /api/save - Success - Analysis ID: ${analysis._id}`);
    res.status(201).send(analysis);
  } catch (error) {
    console.error(`[API] POST /api/save - Error: ${error.message}`);
    res.status(500).send("Error saving analysis");
  }
};

const deleteAnalysis = async (req, res) => {
  try {
    console.log(`[API] DELETE /api/:id - Delete Analysis - Analysis ID: ${req.params.id}, User ID: ${req.userId}`);
    const analysis = await Analysis.findOneAndDelete({
      _id: req.params.id,
      owner: req.userId,
    });
    if (!analysis) {
      console.log(`[API] DELETE /api/:id - Not Found - Analysis ID: ${req.params.id}`);
      return res.send({ error: "Error on deleting!" });
    }
    console.log(`[API] DELETE /api/:id - Success - Analysis ID: ${req.params.id}`);
    res.send(analysis);
  } catch (e) {
    console.error(`[API] DELETE /api/:id - Error: ${e.message}`);
    res.send(e);
  }
};

// For getting the data from the database
const getAnalysis = async (req, res) => {
  try {
    console.log(`[API] GET /api/ - Get All Analysis - User ID: ${req.userId}`);
    // Return only the analysis that belongs to the user
    const analysis = await Analysis.find({ owner: req.userId });

    // Only send the response if analysis is found
    console.log(`[API] GET /api/ - Success - Found ${analysis.length} analysis records`);
    res.send(analysis);
  } catch (e) {
    // Handle errors appropriately, and send an error response
    console.error(`[API] GET /api/ - Error: ${e.message}`);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

module.exports = {
  createAnalysis,
  saveAnalysis,
  deleteAnalysis,
  getAnalysis,
};
