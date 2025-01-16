import React, { useState, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { FaTrashAlt } from "react-icons/fa";
import { GetAudioUrl } from "../../utilis/get-audio-url";
import { Analysis } from "../../../api/api";
import { Spin } from "antd"; // Import Spin from Ant Design

const UploadAudio = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [audioSrc, setAudioSrc] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state
  const [currentEmotions, setCurrentEmotions] = useState([]);
  const [currentText, setCurrentText] = useState("");
  const audioRef = useRef(null);
  const [analysisData, setAnalysisData] = useState([]);
  const [url, setUrl] = useState("");
  const [check, setCheck] = useState(false);
  const uploadAudioAndGetUrl = async (file) => {
    return await GetAudioUrl(file);
  };

  useEffect(() => {
    setCurrentEmotions([]);
    setCurrentText("");
  }, [audioFile]);

  const onDrop = async (acceptedFiles, rejectedFiles) => {
    const file = acceptedFiles[0];

    if (file && file.type.startsWith("audio/")) {
      try {
        const url = await uploadAudioAndGetUrl(file);
        setUrl(url);
      } catch (error) {
        console.log(error);
      }

      setAudioFile(file);
      setAudioSrc(URL.createObjectURL(file));
      setError("");
    } else {
      setError("Please select an audio file.");
      setAudioFile(null);
      setAudioSrc("");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "audio/*",
    multiple: false,
  });

  const handleDelete = () => {
    setAudioFile(null);
    setAudioSrc("");
    setCurrentEmotions([]);
    setCurrentText("");
  };

  const handleAnalysis = async () => {
    setLoading(true); // Start loading
    try {
      const response = await Analysis(url);
      setAnalysisData(response);
      console.log("Analysis: ", response);
      console.log("Url: ", url);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
    setCheck(true);
  };

  const handleTimeUpdate = (e) => {
    const currentTime = e.target.currentTime;
    const currentData = analysisData.find(
      (data) => currentTime >= data.time.begin && currentTime <= data.time.end
    );
    if (currentData) {
      setCurrentEmotions(currentData.emotions);
      setCurrentText(currentData.text);
    } else {
      setCurrentEmotions([]);
      setCurrentText("");
    }
  };

  const handleIntervalClick = (startTime) => {
    if (audioRef.current) {
      audioRef.current.currentTime = startTime;
      audioRef.current.play();
    }
  };

  return (
    <div className="p-4 rounded-md shadow-md">
      <div
        {...getRootProps()}
        className={`p-4 border-2 border-dashed rounded-md cursor-pointer ${
          isDragActive ? "border-blue-500" : "border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the audio file here...</p>
        ) : (
          <p>Drag and drop an audio file here or click to select one</p>
        )}
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {audioFile && (
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <audio
              ref={audioRef}
              controls
              src={audioSrc}
              className="flex-grow"
              onTimeUpdate={handleTimeUpdate}
            >
              Your browser does not support the audio element.
            </audio>
            <div>
              <button
                onClick={handleAnalysis}
                className="px-4 py-2 bg-violet-400 text-white rounded-md mr-2 ml-2"
              >
                Analyze
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md"
              >
                <FaTrashAlt />
              </button>
            </div>
          </div>
          {loading ? (
            <Spin
              style={{
                marginLeft: "500px",
                marginTop: "200px",
                height: "300px",
              }}
              size="large"
            /> // Show spinner while loading
          ) : (
            <>
              {check ? (
                <div className="mt-3 flex gap-2">
                  {/* Intervals */}
                  <div
                    className="p-2 bg-blue-100 rounded-md shadow-md"
                    style={{ width: "200px" }}
                  >
                    {/* {check ? (
                    <h4 className="text-lg font-semibold mb-2">Intervals</h4>
                   */}
                    <h4 className="text-lg font-semibold mb-2">Intervals</h4>
                    <ul className="text-sm">
                      {analysisData.map((data, index) => (
                        <li
                          key={index}
                          className="cursor-pointer mb-2 p-2 rounded hover:bg-gray-300"
                          onClick={() => handleIntervalClick(data.time.begin)}
                        >
                          {data.time.begin.toFixed(2)} -{" "}
                          {data.time.end.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Emotions */}
                  <div
                    className="p-4 bg-white rounded-md shadow-md flex-grow"
                    style={{ maxWidth: "600px" }}
                  >
                    <h4 className="text-lg font-semibold mb-2">Emotions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {currentEmotions.map((emotion, index) => (
                        <div
                          key={index}
                          className="p-2 bg-white rounded-md shadow-md flex flex-col items-center"
                          style={{
                            width: "250px",
                            height: "100px",
                            backgroundColor:
                              emotion.name === "Anger"
                                ? "#F4c5c5"
                                : emotion.name === "Disappointment"
                                ? "#FFF5BA"
                                : emotion.name === "Disgust"
                                ? "#cdebc5"
                                : emotion.name === "Distress"
                                ? "#Ffd8b2"
                                : emotion.name === "Surprise (negative)"
                                ? "#Eacaff"
                                : "#FFFFFF",
                          }}
                        >
                          <h4 className="text-sm font-semibold mb-1">
                            {emotion.name}
                          </h4>
                          <p className="text-md">
                            {Math.round(emotion.score * 100)}%
                          </p>
                          <div className="w-full bg-gray-300 rounded-full h-2.5 dark:bg-gray-300">
                            <div
                              className="h-2.5 rounded-full"
                              style={{
                                width: `${Math.round(emotion.score * 100)}%`,
                                backgroundColor:
                                  emotion.name === "Anger"
                                    ? "#FF6ec7"
                                    : emotion.name === "Disappointment"
                                    ? "#e6cc00"
                                    : emotion.name === "Disgust"
                                    ? "#008631"
                                    : emotion.name === "Distress"
                                    ? "#FF4f00"
                                    : emotion.name === "Surprise (negative)"
                                    ? "#A000c8"
                                    : "#4C4C4C",
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Transcription */}
                  <div
                    className="p-2 rounded-md shadow-md"
                    style={{ width: "400px" }}
                  >
                    <h4 className="text-lg font-semibold mb-2">
                      Transcription
                    </h4>
                    <p className="text-sm">{currentText}</p>
                  </div>
                </div>
              ) : (
                <></>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadAudio;
