import React, { useState, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import {
  Card,
  Button,
  Spin,
  Typography,
  Row,
  Col,
  Tag,
  Progress,
  Timeline,
  Space,
  Divider,
  Alert,
  Tooltip,
  Empty,
} from "antd";
import {
  FaTrashAlt,
  FaUpload,
  FaPlay,
  FaPause,
  FaFileAudio,
  FaChartLine,
  FaMicrophone,
  FaClock,
} from "react-icons/fa";
import { GetAudioUrl } from "../../utilis/get-audio-url";
import { Analysis } from "../../../api/api";

const { Title, Text, Paragraph } = Typography;

const UploadAudio = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [audioSrc, setAudioSrc] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentEmotions, setCurrentEmotions] = useState([]);
  const [currentText, setCurrentText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const [analysisData, setAnalysisData] = useState([]);
  const [url, setUrl] = useState("");
  const [check, setCheck] = useState(false);
  const [uploading, setUploading] = useState(false);

  const uploadAudioAndGetUrl = async (file) => {
    setUploading(true);
    try {
      const url = await GetAudioUrl(file);
      setUploading(false);
      return url;
    } catch (error) {
      setUploading(false);
      throw error;
    }
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
        setError("Failed to upload file. Please try again.");
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
    setAnalysisData([]);
    setCheck(false);
    setUrl("");
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  const handleAnalysis = async () => {
    setLoading(true);
    try {
      const response = await Analysis(url);
      setAnalysisData(response);
      console.log("Analysis: ", response);
    } catch (error) {
      console.log(error);
      setError("Failed to analyze audio. Please try again.");
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

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleIntervalClick = (startTime) => {
    if (audioRef.current) {
      audioRef.current.currentTime = startTime;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Calculate transcript sentiment
  const calculateTranscriptSentiment = (text) => {
    if (!text || text.trim() === "") return null;

    const positiveWords = [
      "good",
      "great",
      "excellent",
      "happy",
      "satisfied",
      "pleased",
      "thank",
      "appreciate",
      "love",
      "wonderful",
      "amazing",
      "perfect",
      "yes",
      "sure",
      "definitely",
    ];
    const negativeWords = [
      "bad",
      "terrible",
      "awful",
      "angry",
      "frustrated",
      "disappointed",
      "hate",
      "worst",
      "horrible",
      "no",
      "never",
      "can't",
      "won't",
      "problem",
      "issue",
      "complaint",
    ];

    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach((word) => {
      if (positiveWords.some((pw) => word.includes(pw))) positiveCount++;
      if (negativeWords.some((nw) => word.includes(nw))) negativeCount++;
    });

    const total = positiveCount + negativeCount;
    if (total === 0) return { sentiment: "neutral", score: 50 };

    const sentimentScore = (positiveCount / total) * 100;
    const sentiment =
      sentimentScore >= 70
        ? "positive"
        : sentimentScore >= 40
        ? "neutral"
        : "negative";

    return {
      sentiment,
      score: Math.round(sentimentScore),
      positiveCount,
      negativeCount,
    };
  };

  const transcriptSentiment = currentText
    ? calculateTranscriptSentiment(currentText)
    : null;

  const getEmotionColor = (emotionName) => {
    const colors = {
      Anger: "#EF4444",
      Distress: "#F97316",
      Disappointment: "#F59E0B",
      Disgust: "#84CC16",
      "Surprise (negative)": "#A855F7",
    };
    return colors[emotionName] || "#6366F1";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Title level={2} className="mb-2">
            Single Audio Analysis
          </Title>
          <Text type="secondary" className="text-base">
            Upload and analyze individual audio files with real-time emotion tracking
          </Text>
        </div>

        {/* Upload Area */}
        {!audioFile && (
          <Card className="shadow-lg mb-6 border-2 border-dashed border-gray-300 hover:border-blue-400 transition-all">
      <div
        {...getRootProps()}
              className={`p-12 text-center cursor-pointer rounded-lg transition-all ${
                isDragActive
                  ? "bg-blue-50 border-2 border-blue-400 border-dashed"
                  : "bg-white hover:bg-gray-50"
        }`}
      >
        <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                <div className="p-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full">
                  <FaUpload className="text-white text-4xl" />
                </div>
        {isDragActive ? (
                  <>
                    <Title level={4} className="text-blue-600">
                      Drop your audio file here
                    </Title>
                    <Text className="text-gray-600">
                      Release to upload the file
                    </Text>
                  </>
                ) : (
                  <>
                    <Title level={4} className="mb-2">
                      Drag & Drop Audio File
                    </Title>
                    <Text type="secondary" className="text-base mb-4">
                      or click to browse files
                    </Text>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FaFileAudio className="text-blue-500" />
                      <span>Supported: MP3, MP4, WAV, M4A</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            {uploading && (
              <div className="mt-4 text-center">
                <Spin size="large" />
                <div className="mt-2 text-gray-600">Uploading file...</div>
              </div>
            )}
            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                className="mt-4"
                closable
                onClose={() => setError("")}
              />
            )}
          </Card>
        )}

        {/* Audio Player and Controls */}
        {audioFile && (
          <Card className="shadow-lg mb-6">
            <div className="mb-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <FaFileAudio className="text-white text-2xl" />
                  </div>
                  <div>
                    <Title level={5} className="mb-1">
                      {audioFile.name}
                    </Title>
                    <Text type="secondary" className="text-sm">
                      {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                    </Text>
                  </div>
                </div>
                <Space>
                  <Button
                    type="primary"
                    size="large"
                    icon={<FaChartLine />}
                    onClick={handleAnalysis}
                    loading={loading}
                    className="shadow-md"
                  >
                    {loading ? "Analyzing..." : "Analyze Audio"}
                  </Button>
                  <Tooltip title="Remove file">
                    <Button
                      danger
                      size="large"
                      icon={<FaTrashAlt />}
                      onClick={handleDelete}
                    >
                      Remove
                    </Button>
                  </Tooltip>
                </Space>
              </div>
      </div>

            <Divider />

            {/* Audio Player */}
            <div className="mb-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Button
                  type="primary"
                  shape="circle"
                  size="large"
                  icon={isPlaying ? <FaPause /> : <FaPlay />}
                  onClick={handlePlayPause}
                  className="shadow-md"
                />
                <div className="flex-1">
            <audio
              ref={audioRef}
              src={audioSrc}
              onTimeUpdate={handleTimeUpdate}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    className="w-full"
                    controls
            >
              Your browser does not support the audio element.
            </audio>
                </div>
              </div>
            </div>

            {/* Analysis Results */}
            {loading && (
              <Card className="text-center py-12">
                <Spin size="large" />
                <div className="mt-4 text-gray-600">
                  Analyzing audio emotions and transcription...
                </div>
              </Card>
            )}

            {check && analysisData.length > 0 && (
              <Row gutter={[16, 16]}>
                {/* Time Intervals */}
                <Col xs={24} lg={6}>
                  <Card
                    title={
                      <div className="flex items-center gap-2">
                        <FaClock className="text-blue-500" />
                        <span>Time Segments</span>
          </div>
                    }
                    className="shadow-md h-full"
                  >
                    <Timeline className="mt-4">
                      {analysisData.map((data, index) => (
                        <Timeline.Item
                          key={index}
                          color={getEmotionColor(
                            data.emotions[0]?.name || "default"
                          )}
                        >
                          <div
                            className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                            onClick={() => handleIntervalClick(data.time.begin)}
                          >
                            <Text strong className="text-sm">
                              {data.time.begin.toFixed(1)}s -{" "}
                              {data.time.end.toFixed(1)}s
                            </Text>
                          </div>
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  </Card>
                </Col>

                {/* Current Emotions */}
                <Col xs={24} lg={9}>
                  <Card
                    title={
                      <div className="flex items-center gap-2">
                        <FaChartLine className="text-purple-500" />
                        <span>Current Emotions</span>
                  </div>
                    }
                    className="shadow-md h-full"
                  >
                    {currentEmotions.length > 0 ? (
                      <div className="space-y-3 mt-4">
                      {currentEmotions.map((emotion, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Text strong className="text-sm">
                            {emotion.name}
                              </Text>
                              <Text className="text-base font-bold text-gray-700">
                            {Math.round(emotion.score * 100)}%
                              </Text>
                            </div>
                            <Progress
                              percent={Math.round(emotion.score * 100)}
                              strokeColor={getEmotionColor(emotion.name)}
                              showInfo={false}
                              size="small"
                            />
                        </div>
                      ))}
                    </div>
                    ) : (
                      <Empty
                        description="No emotions detected for current time"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        className="py-8"
                      />
                    )}
                  </Card>
                </Col>

                {/* Transcription with Sentiment */}
                <Col xs={24} lg={9}>
                  <Card
                    title={
                      <div className="flex items-center gap-2">
                        <FaMicrophone className="text-green-500" />
                        <span>Transcription</span>
                        {transcriptSentiment && (
                          <Tag
                            color={
                              transcriptSentiment.sentiment === "positive"
                                ? "green"
                                : transcriptSentiment.sentiment === "negative"
                                ? "red"
                                : "default"
                            }
                            className="ml-2"
                          >
                            {transcriptSentiment.sentiment.toUpperCase()}
                          </Tag>
                        )}
                  </div>
                    }
                    className="shadow-md h-full"
                  >
                    {currentText ? (
                      <div className="mt-4">
                        <Paragraph className="text-base leading-relaxed mb-4">
                          {currentText}
                        </Paragraph>
                        {transcriptSentiment && (
                          <>
                            <Divider />
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Text type="secondary" className="text-sm">
                                  Sentiment Score
                                </Text>
                                <Text strong className="text-lg">
                                  {transcriptSentiment.score}%
                                </Text>
                              </div>
                              <Progress
                                percent={transcriptSentiment.score}
                                strokeColor={
                                  transcriptSentiment.sentiment === "positive"
                                    ? "#10B981"
                                    : transcriptSentiment.sentiment ===
                                      "negative"
                                    ? "#EF4444"
                                    : "#6B7280"
                                }
                                showInfo={false}
                              />
                              <div className="flex gap-4 text-xs text-gray-600 mt-2">
                                <span>
                                  Positive: {transcriptSentiment.positiveCount}
                                </span>
                                <span>
                                  Negative: {transcriptSentiment.negativeCount}
                                </span>
                  </div>
                </div>
            </>
          )}
        </div>
                    ) : (
                      <Empty
                        description="No transcription available for current time"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        className="py-8"
                      />
                    )}
                  </Card>
                </Col>
              </Row>
            )}

            {/* Summary Statistics */}
            {check && analysisData.length > 0 && (
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <FaChartLine className="text-indigo-500" />
                    <span>Analysis Summary</span>
                  </div>
                }
                className="mt-6 shadow-md"
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={6}>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {analysisData.length}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Time Segments
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {new Set(
                          analysisData.flatMap((d) =>
                            d.emotions.map((e) => e.name)
                          )
                        ).size}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Unique Emotions
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {analysisData.filter((d) => d.text && d.text.trim() !== "")
                          .length}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Transcribed Segments
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {audioRef.current
                          ? Math.round(audioRef.current.duration || 0)
                          : 0}
                        s
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Total Duration
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>
            )}
      </Card>
        )}
      </div>
    </div>
  );
};

export default UploadAudio;
