import React, { useState, useMemo } from "react";
import { Pie, Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Typography,
  Divider,
  Space,
  Button,
  Pagination,
  Spin,
  Progress,
  Alert,
  Tooltip,
} from "antd";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import {
  FaSmile,
  FaFrown,
  FaMeh,
  FaExclamationTriangle,
  FaCheckCircle,
  FaChartLine,
  FaUsers,
  FaFileAudio,
  FaArrowUp,
  FaArrowDown,
  FaMicrophone,
} from "react-icons/fa";

const { Title, Text, Paragraph } = Typography;

ChartJS.register(
  ArcElement,
  ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler
);

const EmotionChart = ({
  analysisResults,
  pagination,
  onPageChange,
  onFileChange,
  loading,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [viewMode, setViewMode] = useState("all"); // "all" or "single"
  const [selectedFileIndex, setSelectedFileIndex] = useState(0); // Default to call 1 (index 0)

  // Safely parse and extract emotions
  const { emotions, error, businessInsights } = useMemo(() => {
    try {
      let results;
      if (typeof analysisResults === "string") {
        results = JSON.parse(analysisResults);
      } else {
        results = analysisResults;
      }

      let extractedEmotions = [];

      // Handle paginated response structure
      if (results.summary && results.summary.emotions) {
        extractedEmotions = results.summary.emotions.map((e) => ({
          name: e.name,
          score: e.score,
        }));
      } else if (results.analysis && Array.isArray(results.analysis)) {
        const allEmotions = [];
        results.analysis.forEach((item) => {
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
                    allEmotions.push(...pred.emotions);
                  }
                });
              }
            }
          } catch (err) {
            console.error("Error processing item:", err);
          }
        });

        const emotionMap = {};
        allEmotions.forEach((emotion) => {
          if (emotion.name && emotion.score !== undefined) {
            if (!emotionMap[emotion.name]) {
              emotionMap[emotion.name] = { name: emotion.name, scores: [] };
            }
            emotionMap[emotion.name].scores.push(emotion.score);
          }
        });

        extractedEmotions = Object.values(emotionMap).map((emotion) => ({
          name: emotion.name,
          score:
            emotion.scores.reduce((a, b) => a + b, 0) / emotion.scores.length,
        }));
      } else if (results.file && results.file.result) {
        const allEmotions = [];
        try {
          const fileResult = Array.isArray(results.file.result)
            ? results.file.result[0]
            : results.file.result;

          if (
            fileResult.results &&
            fileResult.results.predictions &&
            fileResult.results.predictions.length > 0
          ) {
            const predictions =
              fileResult.results.predictions[0].models?.prosody
                ?.grouped_predictions?.[0]?.predictions || [];
            predictions.forEach((pred) => {
              if (pred.emotions && Array.isArray(pred.emotions)) {
                allEmotions.push(...pred.emotions);
              }
            });
          }
        } catch (err) {
          console.error("Error processing file:", err);
        }

        const emotionMap = {};
        allEmotions.forEach((emotion) => {
          if (emotion.name && emotion.score !== undefined) {
            if (!emotionMap[emotion.name]) {
              emotionMap[emotion.name] = { name: emotion.name, scores: [] };
            }
            emotionMap[emotion.name].scores.push(emotion.score);
          }
        });

        extractedEmotions = Object.values(emotionMap).map((emotion) => ({
          name: emotion.name,
          score:
            emotion.scores.reduce((a, b) => a + b, 0) / emotion.scores.length,
        }));
      }

      // Calculate business insights
      const negativeEmotions = [
        "Anger",
        "Distress",
        "Disappointment",
        "Disgust",
        "Surprise (negative)",
        "Fear",
        "Sadness",
      ];
      const positiveEmotions = [
        "Joy",
        "Satisfaction",
        "Contentment",
        "Excitement",
        "Relief",
        "Pride",
        "Amusement",
      ];

      const negativeScore = extractedEmotions
        .filter((e) => negativeEmotions.includes(e.name))
        .reduce((sum, e) => sum + e.score, 0);
      const positiveScore = extractedEmotions
        .filter((e) => positiveEmotions.includes(e.name))
        .reduce((sum, e) => sum + e.score, 0);

      const totalScore = negativeScore + positiveScore;
      const sentimentScore = totalScore > 0 ? (positiveScore / totalScore) * 100 : 50;

      const topEmotions = [...extractedEmotions]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      const insights = {
        sentimentScore: Math.round(sentimentScore),
        topEmotions,
        negativeScore: Math.round((negativeScore / totalScore) * 100),
        positiveScore: Math.round((positiveScore / totalScore) * 100),
        recommendation:
          sentimentScore >= 70
            ? "Excellent customer sentiment. Maintain current service quality."
            : sentimentScore >= 50
            ? "Moderate sentiment. Focus on improving customer experience."
            : "Low sentiment detected. Immediate action required to address concerns.",
        riskLevel:
          sentimentScore >= 70
            ? "low"
            : sentimentScore >= 50
            ? "medium"
            : "high",
      };

      return {
        emotions: extractedEmotions,
        error: null,
        businessInsights: insights,
      };
    } catch (err) {
      console.error("Error parsing analysis results:", err);
      return { emotions: [], error: err.message, businessInsights: null };
    }
  }, [analysisResults]);

  // Extract individual files for single call view (must be before early returns)
  const individualFiles = useMemo(() => {
    try {
      let results;
      if (typeof analysisResults === "string") {
        results = JSON.parse(analysisResults);
      } else {
        results = analysisResults;
      }

      if (results.analysis && Array.isArray(results.analysis)) {
        return results.analysis.map((file, index) => {
          let fileEmotions = [];
          try {
            if (
              file.result &&
              Array.isArray(file.result) &&
              file.result.length > 0
            ) {
              const result = file.result[0];
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
                    fileEmotions.push(...pred.emotions);
                  }
                });
              }
            }
          } catch (err) {
            console.error("Error processing file:", err);
          }

          // Calculate file-level insights
          const negativeEmotions = [
            "Anger",
            "Distress",
            "Disappointment",
            "Disgust",
            "Surprise (negative)",
            "Fear",
            "Sadness",
          ];
          const positiveEmotions = [
            "Joy",
            "Satisfaction",
            "Contentment",
            "Excitement",
            "Relief",
            "Pride",
            "Amusement",
          ];

          const negativeScore = fileEmotions
            .filter((e) => negativeEmotions.includes(e.name))
            .reduce((sum, e) => sum + e.score, 0);
          const positiveScore = fileEmotions
            .filter((e) => positiveEmotions.includes(e.name))
            .reduce((sum, e) => sum + e.score, 0);

          const totalScore = negativeScore + positiveScore;
          const sentimentScore =
            totalScore > 0 ? (positiveScore / totalScore) * 100 : 50;

          // Extract transcript if available
          let transcript = "";
          try {
            if (file.result && Array.isArray(file.result) && file.result.length > 0) {
              const result = file.result[0];
              if (result.results && result.results.predictions) {
                const predictions = result.results.predictions[0]?.models?.prosody
                  ?.grouped_predictions?.[0]?.predictions || [];
                transcript = predictions
                  .map((p) => p.text || "")
                  .filter((t) => t)
                  .join(" ");
              }
            }
          } catch (err) {
            console.error("Error extracting transcript:", err);
          }

          // Calculate transcript sentiment
          const calculateTranscriptSentiment = (text) => {
            if (!text || text.trim() === "") return null;
            const positiveWords = [
              "good", "great", "excellent", "happy", "satisfied", "pleased",
              "thank", "appreciate", "love", "wonderful", "amazing", "perfect",
              "yes", "sure", "definitely",
            ];
            const negativeWords = [
              "bad", "terrible", "awful", "angry", "frustrated", "disappointed",
              "hate", "worst", "horrible", "no", "never", "can't", "won't",
              "problem", "issue", "complaint",
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
            return {
              sentiment:
                sentimentScore >= 70
                  ? "positive"
                  : sentimentScore >= 40
                  ? "neutral"
                  : "negative",
              score: Math.round(sentimentScore),
              positiveCount,
              negativeCount,
            };
          };

          const transcriptSentiment = calculateTranscriptSentiment(transcript);

          // Generate call-specific recommendations
          const getCallRecommendations = (sentiment, transcriptSent) => {
            const recommendations = [];
            if (sentiment < 50) {
              recommendations.push(
                "⚠️ High negative sentiment detected. Escalate to supervisor immediately."
              );
              recommendations.push(
                "📞 Consider follow-up call to address customer concerns."
              );
            } else if (sentiment < 70) {
              recommendations.push(
                "💡 Moderate sentiment. Review call script for improvement opportunities."
              );
              recommendations.push(
                "📋 Identify specific pain points mentioned in the conversation."
              );
            } else {
              recommendations.push(
                "✅ Positive interaction. Use as training example for best practices."
              );
            }

            if (transcriptSent && transcriptSent.sentiment === "negative") {
              recommendations.push(
                "📝 Transcript analysis shows negative language. Review conversation details."
              );
            }

            const topNegative = fileEmotions
              .filter((e) => negativeEmotions.includes(e.name))
              .sort((a, b) => b.score - a.score)[0];
            if (topNegative && topNegative.score > 0.3) {
              recommendations.push(
                `🎯 Strong ${topNegative.name} detected. Focus on de-escalation techniques.`
              );
            }

            return recommendations;
          };

          return {
            index,
            url: file.url || `File ${index + 1}`,
            emotions: fileEmotions,
            sentimentScore: Math.round(sentimentScore),
            transcript,
            transcriptSentiment,
            recommendations: getCallRecommendations(sentimentScore, transcriptSentiment),
            topEmotions: [...fileEmotions]
              .sort((a, b) => b.score - a.score)
              .slice(0, 3),
          };
        });
      }
      return [];
    } catch (err) {
      console.error("Error processing individual files:", err);
      return [];
    }
  }, [analysisResults]);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
            <div>
              <Title level={2} className="mb-1">
                Customer Sentiment Analysis
              </Title>
              <Text type="secondary" className="text-base">
                Comprehensive emotion insights from your audio interactions
              </Text>
            </div>
            <Space>
              {individualFiles.length > 0 && (
                <Button.Group>
                  <Button
                    type={viewMode === "all" ? "primary" : "default"}
                    onClick={() => {
                      setViewMode("all");
                      setSelectedFileIndex(0);
                    }}
                  >
                    All Calls Overview
                  </Button>
                  <Button
                    type={viewMode === "single" ? "primary" : "default"}
                    onClick={() => {
                      setViewMode("single");
                      setSelectedFileIndex(0); // Always start with call 1 (index 0)
                    }}
                  >
                    Single Call View
                  </Button>
                </Button.Group>
              )}
              {pagination && viewMode === "all" && (
                <div className="flex items-center gap-2">
                  <Text type="secondary" className="text-sm">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </Text>
                  <Pagination
                    current={pagination.currentPage}
                    total={pagination.totalFiles}
                    pageSize={pagination.limit || 5}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                    size="small"
                  />
                </div>
              )}
            </Space>
          </div>
        </div>

        {/* Single Call View */}
        {viewMode === "single" && individualFiles.length > 0 && (
          <>
            <Card className="mb-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <Title level={4}>Select Call to Analyze</Title>
                <Space>
                  <Button
                    disabled={selectedFileIndex === 0}
                    onClick={() =>
                      setSelectedFileIndex(Math.max(0, selectedFileIndex - 1))
                    }
                  >
                    Previous
                  </Button>
                  <Text>
                    Call {selectedFileIndex + 1} of {individualFiles.length}
                  </Text>
                  <Button
                    disabled={selectedFileIndex === individualFiles.length - 1}
                    onClick={() =>
                      setSelectedFileIndex(
                        Math.min(
                          individualFiles.length - 1,
                          selectedFileIndex + 1
                        )
                      )
                    }
                  >
                    Next
                  </Button>
                </Space>
              </div>
              <Row gutter={[16, 16]}>
                {individualFiles.map((file, idx) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={idx}>
                    <Card
                      hoverable
                      className={`cursor-pointer transition-all ${
                        selectedFileIndex === idx
                          ? "border-2 border-blue-500 shadow-lg"
                          : ""
                      }`}
                      onClick={() => setSelectedFileIndex(idx)}
                    >
                      <div className="text-center">
                        <FaFileAudio className="text-3xl text-blue-500 mb-2" />
                        <Text strong>Call {idx + 1}</Text>
                        <div className="mt-2">
                          <Tag
                            color={
                              file.sentimentScore >= 70
                                ? "green"
                                : file.sentimentScore >= 50
                                ? "orange"
                                : "red"
                            }
                          >
                            {file.sentimentScore}% Sentiment
                          </Tag>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>

            {selectedFileIndex >= 0 && selectedFileIndex < individualFiles.length && individualFiles[selectedFileIndex] && (
              <>
                {(() => {
                  const file = individualFiles[selectedFileIndex];
                  const fileEmotions = file.emotions.reduce((acc, e) => {
                    if (!acc[e.name]) {
                      acc[e.name] = { name: e.name, scores: [] };
                    }
                    acc[e.name].scores.push(e.score);
                    return acc;
                  }, {});

                  const aggregatedEmotions = Object.values(fileEmotions).map(
                    (e) => ({
                      name: e.name,
                      score: e.scores.reduce((a, b) => a + b, 0) / e.scores.length,
                    })
                  );

                  // Calculate additional business metrics
                  const negativeEmotions = ["Anger", "Distress", "Disappointment", "Disgust", "Surprise (negative)", "Fear", "Sadness"];
                  const negativeEmotionScore = aggregatedEmotions
                    .filter((e) => negativeEmotions.includes(e.name))
                    .reduce((sum, e) => sum + e.score, 0);

                  // 1. Customer Retention Risk Score (0-100, higher = more risk)
                  const retentionRiskScore = Math.min(100, Math.round(
                    (negativeEmotionScore * 100) + 
                    (file.sentimentScore < 50 ? 30 : file.sentimentScore < 70 ? 15 : 0) +
                    (file.transcriptSentiment && file.transcriptSentiment.sentiment === "negative" ? 20 : 0)
                  ));

                  // 2. Agent Performance Rating (0-100, higher = better)
                  const agentPerformanceScore = Math.round(
                    file.sentimentScore * 0.6 + 
                    (file.transcriptSentiment ? (file.transcriptSentiment.score * 0.4) : 50 * 0.4)
                  );

                  // 3. Service Quality Index (0-100)
                  const serviceQualityScore = Math.round(
                    (file.sentimentScore >= 70 ? 85 : file.sentimentScore >= 50 ? 65 : 40) +
                    (file.transcriptSentiment && file.transcriptSentiment.sentiment === "positive" ? 10 : 0) -
                    (negativeEmotionScore > 0.3 ? 15 : 0)
                  );

                  // 4. Generate Action Items
                  const actionItems = [];
                  if (retentionRiskScore > 60) {
                    actionItems.push({
                      priority: "HIGH",
                      task: "Immediate customer follow-up required within 24 hours",
                      reason: "High retention risk detected",
                      icon: "🚨"
                    });
                  }
                  if (file.sentimentScore < 50) {
                    actionItems.push({
                      priority: "HIGH",
                      task: "Escalate to supervisor for quality review",
                      reason: "Negative sentiment below acceptable threshold",
                      icon: "📞"
                    });
                  }
                  if (file.transcriptSentiment && file.transcriptSentiment.negativeCount > file.transcriptSentiment.positiveCount) {
                    actionItems.push({
                      priority: "MEDIUM",
                      task: "Review call script and agent training materials",
                      reason: "Negative language patterns detected in transcript",
                      icon: "📚"
                    });
                  }
                  if (agentPerformanceScore < 60) {
                    actionItems.push({
                      priority: "MEDIUM",
                      task: "Schedule coaching session with agent",
                      reason: "Agent performance below target",
                      icon: "👥"
                    });
                  }
                  if (serviceQualityScore < 60) {
                    actionItems.push({
                      priority: "MEDIUM",
                      task: "Identify root cause and implement corrective action",
                      reason: "Service quality below standards",
                      icon: "🔍"
                    });
                  }
                  if (actionItems.length === 0) {
                    actionItems.push({
                      priority: "LOW",
                      task: "Maintain current service standards",
                      reason: "Call meets quality expectations",
                      icon: "✅"
                    });
                  }

                  return (
                    <>
                      {/* Call-specific Business Insights */}
                      <Row gutter={[16, 16]} className="mb-6">
                        <Col xs={24} sm={12} lg={6}>
                          <Card className="shadow-md">
                            <Statistic
                              title="Call Sentiment"
                              value={file.sentimentScore}
                              suffix="%"
                              prefix={
                                file.sentimentScore >= 70 ? (
                                  <FaSmile className="text-green-500" />
                                ) : file.sentimentScore >= 50 ? (
                                  <FaMeh className="text-yellow-500" />
                                ) : (
                                  <FaFrown className="text-red-500" />
                                )
                              }
                              valueStyle={{
                                color:
                                  file.sentimentScore >= 70
                                    ? "#10B981"
                                    : file.sentimentScore >= 50
                                    ? "#F59E0B"
                                    : "#EF4444",
                                fontSize: "32px",
                                fontWeight: "bold",
                              }}
                            />
                            <Progress
                              percent={file.sentimentScore}
                              strokeColor={
                                file.sentimentScore >= 70
                                  ? "#10B981"
                                  : file.sentimentScore >= 50
                                  ? "#F59E0B"
                                  : "#EF4444"
                              }
                              showInfo={false}
                              className="mt-2"
                            />
                          </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                          <Card className="shadow-md">
                            <Statistic
                              title="Top Emotion"
                              value={file.topEmotions[0]?.name || "N/A"}
                              prefix={<FaChartLine className="text-purple-500" />}
                              valueStyle={{ fontSize: "18px" }}
                            />
                            <Text type="secondary" className="text-sm">
                              {file.topEmotions[0]
                                ? Math.round(file.topEmotions[0].score * 100) + "%"
                                : ""}
                            </Text>
                          </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                          <Card className="shadow-md">
                            <div>
                              <Text type="secondary" className="text-sm">
                                Transcript Sentiment
                              </Text>
                              {file.transcriptSentiment ? (
                                <>
                                  <div className="mt-2">
                                    <Tag
                                      color={
                                        file.transcriptSentiment.sentiment ===
                                        "positive"
                                          ? "green"
                                          : file.transcriptSentiment.sentiment ===
                                            "negative"
                                          ? "red"
                                          : "default"
                                      }
                                      className="text-base px-3 py-1"
                                    >
                                      {file.transcriptSentiment.sentiment.toUpperCase()}
                                    </Tag>
                                  </div>
                                  <Text className="text-lg font-bold mt-2">
                                    {file.transcriptSentiment.score}%
                                  </Text>
                                </>
                              ) : (
                                <Text className="text-gray-400">No transcript</Text>
                              )}
                            </div>
                          </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                          <Card className="shadow-md">
                            <div>
                              <Text type="secondary" className="text-sm">
                                Emotions Detected
                              </Text>
                              <div className="text-2xl font-bold text-gray-800 mt-2">
                                {aggregatedEmotions.length}
                              </div>
                            </div>
                          </Card>
                        </Col>
                      </Row>

                      {/* Additional Business Metrics */}
                      <Row gutter={[16, 16]} className="mb-6">
                        <Col xs={24} sm={12} lg={6}>
                          <Card className="shadow-md">
                            <Statistic
                              title="Customer Retention Risk"
                              value={retentionRiskScore}
                              suffix="%"
                              prefix={
                                retentionRiskScore > 60 ? (
                                  <FaExclamationTriangle className="text-red-500" />
                                ) : retentionRiskScore > 40 ? (
                                  <FaMeh className="text-yellow-500" />
                                ) : (
                                  <FaCheckCircle className="text-green-500" />
                                )
                              }
                              valueStyle={{
                                color:
                                  retentionRiskScore > 60
                                    ? "#EF4444"
                                    : retentionRiskScore > 40
                                    ? "#F59E0B"
                                    : "#10B981",
                                fontSize: "28px",
                                fontWeight: "bold",
                              }}
                            />
                            <Text type="secondary" className="text-xs mt-2 block">
                              {retentionRiskScore > 60
                                ? "High risk - Immediate action needed"
                                : retentionRiskScore > 40
                                ? "Moderate risk - Monitor closely"
                                : "Low risk - Customer satisfied"}
                            </Text>
                          </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                          <Card className="shadow-md">
                            <Statistic
                              title="Agent Performance"
                              value={agentPerformanceScore}
                              suffix="/100"
                              prefix={<FaUsers className="text-blue-500" />}
                              valueStyle={{
                                color:
                                  agentPerformanceScore >= 80
                                    ? "#10B981"
                                    : agentPerformanceScore >= 60
                                    ? "#F59E0B"
                                    : "#EF4444",
                                fontSize: "28px",
                                fontWeight: "bold",
                              }}
                            />
                            <Progress
                              percent={agentPerformanceScore}
                              strokeColor={
                                agentPerformanceScore >= 80
                                  ? "#10B981"
                                  : agentPerformanceScore >= 60
                                  ? "#F59E0B"
                                  : "#EF4444"
                              }
                              showInfo={false}
                              className="mt-2"
                            />
                          </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                          <Card className="shadow-md">
                            <Statistic
                              title="Service Quality Index"
                              value={serviceQualityScore}
                              suffix="/100"
                              prefix={<FaChartLine className="text-indigo-500" />}
                              valueStyle={{
                                color:
                                  serviceQualityScore >= 75
                                    ? "#10B981"
                                    : serviceQualityScore >= 60
                                    ? "#F59E0B"
                                    : "#EF4444",
                                fontSize: "28px",
                                fontWeight: "bold",
                              }}
                            />
                            <Text type="secondary" className="text-xs mt-2 block">
                              {serviceQualityScore >= 75
                                ? "Excellent service delivery"
                                : serviceQualityScore >= 60
                                ? "Good service with room for improvement"
                                : "Service quality needs attention"}
                            </Text>
                          </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                          <Card className="shadow-md">
                            <div>
                              <Text type="secondary" className="text-sm">
                                Action Items Required
                              </Text>
                              <div className="text-2xl font-bold text-gray-800 mt-2">
                                {actionItems.filter(a => a.priority !== "LOW").length}
                              </div>
                              <Text type="secondary" className="text-xs mt-1">
                                {actionItems.filter(a => a.priority === "HIGH").length} high priority
                              </Text>
                            </div>
                          </Card>
                        </Col>
                      </Row>

                      {/* Action Items / Next Steps */}
                      <Card
                        title={
                          <div className="flex items-center gap-2">
                            <FaExclamationTriangle className="text-red-500" />
                            <span>Action Items & Next Steps</span>
                          </div>
                        }
                        className="mb-6 shadow-md"
                      >
                        <Row gutter={[16, 16]}>
                          {actionItems.map((item, idx) => (
                            <Col xs={24} sm={12} lg={8} key={idx}>
                              <Card
                                size="small"
                                className={`${
                                  item.priority === "HIGH"
                                    ? "border-l-4 border-red-500 bg-red-50"
                                    : item.priority === "MEDIUM"
                                    ? "border-l-4 border-yellow-500 bg-yellow-50"
                                    : "border-l-4 border-green-500 bg-green-50"
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <span className="text-2xl">{item.icon}</span>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Tag
                                        color={
                                          item.priority === "HIGH"
                                            ? "red"
                                            : item.priority === "MEDIUM"
                                            ? "orange"
                                            : "green"
                                        }
                                        className="text-xs"
                                      >
                                        {item.priority} PRIORITY
                                      </Tag>
      </div>
                                    <Text strong className="block mb-1">
                                      {item.task}
                                    </Text>
                                    <Text type="secondary" className="text-xs">
                                      {item.reason}
                                    </Text>
                                  </div>
                                </div>
                              </Card>
                            </Col>
                          ))}
                        </Row>
                      </Card>

                      {/* Call-specific Recommendations */}
                      {file.recommendations.length > 0 && (
                        <Card
                          title={
                            <div className="flex items-center gap-2">
                              <FaExclamationTriangle className="text-orange-500" />
                              <span>Call-Specific Business Recommendations</span>
                            </div>
                          }
                          className="mb-6 shadow-md"
                        >
                          <ul className="space-y-2">
                            {file.recommendations.map((rec, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-lg">{rec.split(" ")[0]}</span>
                                <Text>{rec.substring(rec.indexOf(" ") + 1)}</Text>
                              </li>
                            ))}
                          </ul>
                        </Card>
                      )}

                      {/* Transcript with Sentiment */}
                      {file.transcript && (
                        <Card
                          title={
                            <div className="flex items-center gap-2">
                              <FaMicrophone className="text-green-500" />
                              <span>Call Transcript</span>
                              {file.transcriptSentiment && (
                                <Tag
                                  color={
                                    file.transcriptSentiment.sentiment === "positive"
                                      ? "green"
                                      : file.transcriptSentiment.sentiment ===
                                        "negative"
                                      ? "red"
                                      : "default"
                                  }
                                  className="ml-2"
                                >
                                  {file.transcriptSentiment.sentiment.toUpperCase()}
                                </Tag>
                              )}
                            </div>
                          }
                          className="mb-6 shadow-md"
                        >
                          <Paragraph className="text-base leading-relaxed mb-4">
                            {file.transcript}
                          </Paragraph>
                          {file.transcriptSentiment && (
                            <>
                              <Divider />
                              <Row gutter={[16, 16]}>
                                <Col xs={24} sm={8}>
                                  <div>
                                    <Text type="secondary" className="text-sm">
                                      Sentiment Score
                                    </Text>
                                    <div className="text-2xl font-bold">
                                      {file.transcriptSentiment.score}%
                                    </div>
                                  </div>
                                </Col>
                                <Col xs={24} sm={8}>
                                  <div>
                                    <Text type="secondary" className="text-sm">
                                      Positive Words
                                    </Text>
                                    <div className="text-xl font-bold text-green-600">
                                      {file.transcriptSentiment.positiveCount}
                                    </div>
                                  </div>
                                </Col>
                                <Col xs={24} sm={8}>
                                  <div>
                                    <Text type="secondary" className="text-sm">
                                      Negative Words
                                    </Text>
                                    <div className="text-xl font-bold text-red-600">
                                      {file.transcriptSentiment.negativeCount}
                                    </div>
                                  </div>
                                </Col>
                              </Row>
                            </>
                          )}
                        </Card>
                      )}

                      {/* Call Emotions */}
                      <Card
                        title={
                          <div className="flex items-center gap-2">
                            <FaChartLine className="text-blue-500" />
                            <span>Call Emotions Breakdown</span>
                          </div>
                        }
                        className="mb-6 shadow-md"
                      >
                        <Row gutter={[12, 12]}>
                          {aggregatedEmotions
                            .sort((a, b) => b.score - a.score)
                            .map((emotion) => (
                              <Col xs={24} sm={12} md={8} lg={6} key={emotion.name}>
                                <div
                                  className="p-4 rounded-lg border hover:shadow-md transition-all"
                                  style={{
                                    borderLeft: `4px solid ${getEmotionColor(
                                      emotion.name
                                    )}`,
                                    backgroundColor: "#ffffff",
                                  }}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <Text strong className="text-sm">
                                      {emotion.name}
                                    </Text>
                                    <Text className="text-lg font-bold text-gray-700">
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
                              </Col>
                            ))}
                        </Row>
                      </Card>
                    </>
                  );
                })()}
              </>
            )}
          </>
        )}

        {/* All Calls Overview (existing code) */}
        {viewMode === "all" && (
          <>
            {/* Business Insights Cards */}
            {businessInsights && (
              <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} lg={6}>
                  <Card className="shadow-md hover:shadow-lg transition-shadow">
                    <Statistic
                      title="Sentiment Score"
                      value={businessInsights.sentimentScore}
                      suffix="%"
                      prefix={
                        businessInsights.sentimentScore >= 70 ? (
                          <FaSmile className="text-green-500" />
                        ) : businessInsights.sentimentScore >= 50 ? (
                          <FaMeh className="text-yellow-500" />
                        ) : (
                          <FaFrown className="text-red-500" />
                        )
                      }
                      valueStyle={{
                        color:
                          businessInsights.sentimentScore >= 70
                            ? "#10B981"
                            : businessInsights.sentimentScore >= 50
                            ? "#F59E0B"
                            : "#EF4444",
                        fontSize: "32px",
                        fontWeight: "bold",
                      }}
                    />
                    <Progress
                      percent={businessInsights.sentimentScore}
                      strokeColor={
                        businessInsights.sentimentScore >= 70
                          ? "#10B981"
                          : businessInsights.sentimentScore >= 50
                          ? "#F59E0B"
                          : "#EF4444"
                      }
                      showInfo={false}
                      className="mt-2"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card className="shadow-md hover:shadow-lg transition-shadow">
                    <Statistic
                      title="Positive Emotions"
                      value={businessInsights.positiveScore}
                      suffix="%"
                      prefix={<FaArrowUp className="text-green-500" />}
                      valueStyle={{ color: "#10B981", fontSize: "28px" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card className="shadow-md hover:shadow-lg transition-shadow">
                    <Statistic
                      title="Negative Emotions"
                      value={businessInsights.negativeScore}
                      suffix="%"
                      prefix={<FaArrowDown className="text-red-500" />}
                      valueStyle={{ color: "#EF4444", fontSize: "28px" }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card className="shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <Text type="secondary" className="text-sm">
                          Risk Level
                        </Text>
                        <div className="mt-2">
                          <Tag
                            color={
                              businessInsights.riskLevel === "low"
                                ? "green"
                                : businessInsights.riskLevel === "medium"
                                ? "orange"
                                : "red"
                            }
                            className="text-base px-3 py-1"
                          >
                            {businessInsights.riskLevel.toUpperCase()}
                          </Tag>
                        </div>
                      </div>
                      {businessInsights.riskLevel === "high" && (
                        <FaExclamationTriangle className="text-3xl text-red-500" />
                      )}
                      {businessInsights.riskLevel === "medium" && (
                        <FaMeh className="text-3xl text-yellow-500" />
                      )}
                      {businessInsights.riskLevel === "low" && (
                        <FaCheckCircle className="text-3xl text-green-500" />
                      )}
                    </div>
                  </Card>
                </Col>
              </Row>
            )}

            {/* Recommendation Alert */}
            {businessInsights && (
              <Alert
                message="Business Recommendation"
                description={businessInsights.recommendation}
                type={
                  businessInsights.riskLevel === "low"
                    ? "success"
                    : businessInsights.riskLevel === "medium"
                    ? "warning"
                    : "error"
                }
                showIcon
                className="mb-6"
                closable
              />
            )}

            {/* Top Emotions */}
            {businessInsights && businessInsights.topEmotions.length > 0 && (
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <FaChartLine className="text-blue-500" />
                    <span>Top Detected Emotions</span>
                  </div>
                }
                className="mb-6 shadow-md"
              >
                <Row gutter={[12, 12]}>
                  {businessInsights.topEmotions.map((emotion, index) => (
                    <Col xs={24} sm={12} md={8} lg={4.8} key={emotion.name}>
                      <Card
                        size="small"
                        className="text-center hover:shadow-md transition-shadow"
                        style={{
                          borderLeft: `4px solid ${getEmotionColor(emotion.name)}`,
                        }}
                      >
                        <div className="text-2xl font-bold text-gray-800">
                          {Math.round(emotion.score * 100)}%
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {emotion.name}
                        </div>
                        <Progress
                          percent={Math.round(emotion.score * 100)}
                          strokeColor={getEmotionColor(emotion.name)}
                          showInfo={false}
                          size="small"
                          className="mt-2"
                        />
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            )}

            {/* Chart Tabs */}
            <Card
              className="shadow-lg"
              title={
                <div className="flex items-center gap-2">
                  <FaChartLine className="text-blue-500" />
                  <span>Visual Analytics</span>
                </div>
              }
              extra={
                <Space>
                  <Button
                    type={activeTab === "overview" ? "primary" : "default"}
                    onClick={() => setActiveTab("overview")}
                    size="small"
                  >
                    Overview
                  </Button>
                  <Button
                    type={activeTab === "distribution" ? "primary" : "default"}
          onClick={() => setActiveTab("distribution")}
                    size="small"
                  >
                    Distribution
                  </Button>
                  <Button
                    type={activeTab === "comparison" ? "primary" : "default"}
                    onClick={() => setActiveTab("comparison")}
                    size="small"
                  >
                    Comparison
                  </Button>
                </Space>
              }
            >
              <div style={{ minHeight: "400px" }}>
                {activeTab === "overview" && (
                  <Row gutter={[16, 16]}>
                    <Col xs={24} lg={12}>
                      <div style={{ height: "350px" }}>
                        <Title level={5} className="text-center mb-4">
          Emotion Distribution
                        </Title>
                        <Doughnut data={pieData} options={chartOptions} />
                      </div>
                    </Col>
                    <Col xs={24} lg={12}>
                      <div style={{ height: "350px" }}>
                        <Title level={5} className="text-center mb-4">
                          Top Emotions Intensity
                        </Title>
                        <Bar data={barData} options={barOptions} />
                      </div>
                    </Col>
                  </Row>
                )}
                {activeTab === "distribution" && (
                  <div style={{ height: "400px" }}>
                    <Pie data={pieData} options={chartOptions} />
                  </div>
                )}
                {activeTab === "comparison" && (
                  <div style={{ height: "400px" }}>
                    <Bar data={barData} options={barOptions} />
                  </div>
                )}
              </div>
            </Card>

            {/* Detailed Emotion List */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <FaUsers className="text-purple-500" />
                  <span>Complete Emotion Breakdown</span>
                </div>
              }
              className="mt-6 shadow-md"
            >
              <Row gutter={[12, 12]}>
                {sortedEmotions.map((emotion) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={emotion.name}>
                    <div
                      className="p-4 rounded-lg border hover:shadow-md transition-all"
                      style={{
                        borderLeft: `4px solid ${getEmotionColor(emotion.name)}`,
                        backgroundColor: "#ffffff",
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Text strong className="text-sm">
                          {emotion.name}
                        </Text>
                        <Text className="text-lg font-bold text-gray-700">
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
                  </Col>
                ))}
              </Row>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default EmotionChart;
