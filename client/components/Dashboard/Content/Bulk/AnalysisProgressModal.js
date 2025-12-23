import React, { useState, useEffect } from "react";
import { Modal, Progress, Typography, Space, Card, Row, Col } from "antd";
import {
  FaWaveSquare,
  FaMicrophone,
  FaBrain,
  FaChartLine,
  FaCheckCircle,
  FaSpinner,
  FaCog,
} from "react-icons/fa";

const { Title, Text } = Typography;

const AnalysisProgressModal = ({ open, totalFiles, currentFile, fileName }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [pulseScale, setPulseScale] = useState(1);
  const [waveOffset, setWaveOffset] = useState(0);
  const [particleRotation, setParticleRotation] = useState(0);

  // Creative messages that change during processing
  const processingMessages = [
    {
      icon: <FaMicrophone className="text-blue-500" />,
      text: "Capturing audio frequencies...",
      color: "blue",
    },
    {
      icon: <FaBrain className="text-purple-500" />,
      text: "Analyzing emotional patterns...",
      color: "purple",
    },
    {
      icon: <FaChartLine className="text-green-500" />,
      text: "Processing sentiment data...",
      color: "green",
    },
    {
      icon: <FaWaveSquare className="text-orange-500" />,
      text: "Extracting prosody features...",
      color: "orange",
    },
    {
      icon: <FaCog className="text-indigo-500" />,
      text: "Generating insights...",
      color: "indigo",
    },
  ];

  // Calculate progress
  const progress = totalFiles > 0 ? ((currentFile / totalFiles) * 100).toFixed(1) : 0;
  const currentMessage = processingMessages[currentMessageIndex % processingMessages.length];

  // Rotate messages every 3 seconds
  useEffect(() => {
    if (!open) return;
    
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % processingMessages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [open]);

  // Rotate spinner continuously
  useEffect(() => {
    if (!open) return;
    
    const interval = setInterval(() => {
      setRotation((prev) => prev + 15);
    }, 100);

    return () => clearInterval(interval);
  }, [open]);

  // Pulse animation
  useEffect(() => {
    if (!open) return;
    
    const interval = setInterval(() => {
      setPulseScale((prev) => {
        if (prev >= 1.2) return 0.9;
        return prev + 0.02;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [open]);

  // Wave animation
  useEffect(() => {
    if (!open) return;
    
    const interval = setInterval(() => {
      setWaveOffset((prev) => (prev + 2) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, [open]);

  // Particle rotation
  useEffect(() => {
    if (!open) return;
    
    const interval = setInterval(() => {
      setParticleRotation((prev) => (prev + 5) % 360);
    }, 100);

    return () => clearInterval(interval);
  }, [open]);

  return (
    <Modal
      open={open}
      closable={false}
      footer={null}
      centered
      width={600}
      className="analysis-progress-modal"
      maskClosable={false}
    >
      <div className="p-6">
        {/* Header with enhanced animations */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-4">
            {/* Rotating background spinner */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: "transform 0.1s linear",
              }}
            >
              <FaSpinner className="text-6xl text-blue-500 opacity-20" />
            </div>
            {/* Pulsing particles around the main icon */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: `hsl(${(i * 45 + particleRotation) % 360}, 70%, 60%)`,
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-60px) rotate(${-i * 45}deg)`,
                  animation: 'pulse 2s ease-in-out infinite',
                  animationDelay: `${i * 0.2}s`,
                  opacity: 0.6,
                }}
              />
            ))}
            {/* Main icon with pulse */}
            <div className="relative">
              <div 
                className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
                style={{
                  transform: `scale(${pulseScale})`,
                  transition: "transform 0.05s ease-out",
                  boxShadow: `0 0 ${20 + Math.sin(Date.now() / 200) * 10}px rgba(59, 130, 246, 0.5)`,
                }}
              >
                <FaWaveSquare 
                  className="text-4xl text-white" 
                  style={{
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                />
              </div>
            </div>
            {/* Animated wave rings */}
            {[1, 2, 3].map((ring) => (
              <div
                key={ring}
                className="absolute inset-0 rounded-full border-2 border-blue-400"
                style={{
                  left: `${-ring * 10}px`,
                  top: `${-ring * 10}px`,
                  right: `${-ring * 10}px`,
                  bottom: `${-ring * 10}px`,
                  opacity: 0.3 - (ring * 0.1),
                  animation: `ripple ${2 + ring * 0.5}s ease-out infinite`,
                  animationDelay: `${ring * 0.3}s`,
                }}
              />
            ))}
          </div>
          <Title level={3} className="mb-2">
            Processing Audio Analysis
          </Title>
          <Text type="secondary" className="text-base">
            Please wait while we analyze your audio files...
          </Text>
        </div>

        {/* Progress Section */}
        <Card className="mb-6 shadow-sm border-0">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <Text strong className="text-base">
                Overall Progress
              </Text>
              <Text strong className="text-lg text-blue-600">
                {progress}%
              </Text>
            </div>
            <Progress
              percent={parseFloat(progress)}
              strokeColor={{
                "0%": "#3b82f6",
                "100%": "#8b5cf6",
              }}
              strokeWidth={12}
              showInfo={false}
              className="mb-2"
            />
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>File {currentFile} of {totalFiles}</span>
              <span>{totalFiles - currentFile} remaining</span>
            </div>
          </div>
        </Card>

        {/* Current File Info */}
        {fileName && (
          <Card className="mb-6 shadow-sm border-0 bg-blue-50">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500 rounded-lg">
                <FaMicrophone className="text-white text-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <Text strong className="block text-base mb-1">
                  Currently Processing
                </Text>
                <Text className="text-sm text-gray-600 truncate" title={fileName}>
                  {fileName}
                </Text>
              </div>
            </div>
          </Card>
        )}

        {/* Dynamic Message Section with enhanced animation */}
        <Card className="shadow-sm border-0 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-center gap-4 py-4">
            <div
              className="text-3xl transition-all duration-500 relative"
              style={{
                transform: `scale(${1 + Math.sin(Date.now() / 500) * 0.15}) rotate(${Math.sin(Date.now() / 300) * 10}deg)`,
                filter: `drop-shadow(0 0 ${5 + Math.sin(Date.now() / 400) * 3}px ${currentMessage.color === 'blue' ? 'rgba(59, 130, 246, 0.5)' : currentMessage.color === 'purple' ? 'rgba(147, 51, 234, 0.5)' : 'rgba(34, 197, 94, 0.5)'})`,
              }}
            >
              {currentMessage.icon}
              {/* Glowing effect */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${currentMessage.color === 'blue' ? 'rgba(59, 130, 246, 0.3)' : currentMessage.color === 'purple' ? 'rgba(147, 51, 234, 0.3)' : 'rgba(34, 197, 94, 0.3)'} 0%, transparent 70%)`,
                  transform: `scale(${1.5 + Math.sin(Date.now() / 400) * 0.3})`,
                  animation: 'pulse 2s ease-in-out infinite',
                }}
              />
            </div>
            <div className="flex-1">
              <Text 
                className="text-base font-medium text-gray-700"
                style={{
                  animation: 'fadeIn 0.5s ease-in',
                }}
              >
                {currentMessage.text}
              </Text>
            </div>
          </div>
        </Card>

        {/* Queue Status with animated dots */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
            <div className="flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                  style={{
                    animation: `bounce 1.4s ease-in-out infinite`,
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
            <Text type="secondary" className="text-sm">
              Files are being processed sequentially in queue
            </Text>
          </div>
        </div>

        {/* Fun Facts Section */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {currentFile}
                </div>
                <Text type="secondary" className="text-xs">
                  Files Processed
                </Text>
              </div>
            </Col>
            <Col span={8}>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {totalFiles - currentFile}
                </div>
                <Text type="secondary" className="text-xs">
                  In Queue
                </Text>
              </div>
            </Col>
            <Col span={8}>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {totalFiles}
                </div>
                <Text type="secondary" className="text-xs">
                  Total Files
                </Text>
              </div>
            </Col>
          </Row>
        </div>
      </div>
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0) scale(1); opacity: 0.7; }
          40% { transform: translateY(-8px) scale(1.2); opacity: 1; }
        }
      `}</style>
    </Modal>
  );
};

export default AnalysisProgressModal;

