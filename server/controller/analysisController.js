const axios = require("axios");
const User = require("../model/User");

// Importing the Analysis model
const Analysis = require("../model/Analysis");

const createAnalysis = async (req, res) => {
  try {
    const link = req.body.url;

    const axiosResponse = await axios.post("http://127.0.0.1:8000/upload", {
      url: link,
    });
    const formattedData = formatData(axiosResponse.data);
    // await User.findOneAndUpdate(
    //   { _id: req.userId },
    //   { $inc: { analysisCount: 1 } }
    // );

    res.status(201).send(formattedData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing data");
  }
};

const formatData = (data) => {
  // Assuming that data is an array with a single object inside it
  if (Array.isArray(data) && data.length > 0) {
    const results = data[0].results;
    if (results && results.predictions && results.predictions.length > 0) {
      const predictions = results.predictions[0];
      const filteredEmotions = filterEmotions(
        predictions.models.prosody.grouped_predictions[0].predictions
      );
      return filteredEmotions;
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

    res.status(201).send(analysis);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error saving analysis");
  }
};

const deleteAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findOneAndDelete({
      _id: req.params.id,
      owner: req.userId,
    });
    if (!analysis) {
      return res.send({ error: "Error on deleting!" });
    }
    res.send(analysis);
  } catch (e) {
    res.send(e);
  }
};

// For getting the data from the database
const getAnalysis = async (req, res) => {
  try {
    // Return only the analysis that belongs to the user
    const analysis = await Analysis.find({ owner: req.userId });

    // Only send the response if analysis is found
    res.send(analysis);
  } catch (e) {
    // Handle errors appropriately, and send an error response
    console.error(e);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

module.exports = {
  createAnalysis,
  saveAnalysis,
  deleteAnalysis,
  getAnalysis,
};
