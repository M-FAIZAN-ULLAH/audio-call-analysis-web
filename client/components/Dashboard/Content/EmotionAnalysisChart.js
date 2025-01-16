// import React from "react";
// import { Pie, Bar } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   ArcElement,
//   Tooltip,
//   Legend,
//   CategoryScale,
//   LinearScale,
//   BarElement,
// } from "chart.js";

// ChartJS.register(
//   ArcElement,
//   Tooltip,
//   Legend,
//   CategoryScale,
//   LinearScale,
//   BarElement
// );

// const EmotionChart = ({ analysisResults }) => {
//   // Parse JSON string to JavaScript object
//   const results = JSON.parse(analysisResults);

//   // Extract emotion scores from results
//   const emotions = results
//     .map(
//       (item) =>
//         item.result[0].results.predictions[0].models.prosody
//           .grouped_predictions[0].predictions[0].emotions
//     )
//     .flat();

//   // Prepare data for Pie chart
//   const pieData = {
//     labels: emotions.map((emotion) => emotion.name),
//     datasets: [
//       {
//         data: emotions.map((emotion) => emotion.score),
//         backgroundColor: [
//           "#FF6384",
//           "#36A2EB",
//           "#FFCE56",
//           "#4BC0C0",
//           "#9966FF",
//           "#FF9F40",
//           "#F97C20",
//           "#49D306",
//         ],
//         hoverOffset: 4,
//       },
//     ],
//   };

//   // Prepare data for Bar chart
//   const barData = {
//     labels: emotions.map((emotion) => emotion.name),
//     datasets: [
//       {
//         label: "Emotion Scores",
//         data: emotions.map((emotion) => emotion.score),
//         backgroundColor: "#36A2EB",
//         borderColor: "#0A6BFF",
//         borderWidth: 1,
//       },
//     ],
//   };

//   // Options for the bar chart
//   const barOptions = {
//     scales: {
//       x: {
//         beginAtZero: true,
//       },
//     },
//   };

//   return (
//     <div>
//       <h2>Emotion Pie Chart</h2>
//       <Pie data={pieData} />
//       <h2>Emotion Bar Chart</h2>
//       <Bar data={barData} options={barOptions} />
//     </div>
//   );
// };

// export default EmotionChart;

import React, { useState } from "react";
import { Pie, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement
);

const EmotionChart = ({ analysisResults }) => {
  const [activeTab, setActiveTab] = useState("distribution");

  // Parse JSON string to JavaScript object
  const results = JSON.parse(analysisResults);

  // Extract emotion scores from results
  const emotions = results
    .map(
      (item) =>
        item.result[0].results.predictions[0].models.prosody
          .grouped_predictions[0].predictions[0].emotions
    )
    .flat();

  // Common labels and data
  const labels = emotions.map((emotion) => emotion.name);
  const scores = emotions.map((emotion) => emotion.score);

  // Pie Chart Data
  const pieData = {
    labels,
    datasets: [
      {
        data: scores,
        backgroundColor: [
          "#4E79A7",
          "#F28E2B",
          "#E15759",
          "#76B7B2",
          "#59A14F",
          "#EDC948",
          "#B07AA1",
          "#FF9DA7",
        ],
        hoverOffset: 6,
      },
    ],
  };

  // Bar Chart Data
  const barData = {
    labels,
    datasets: [
      {
        label: "Emotion Scores",
        data: scores,
        backgroundColor: "#36A2EB",
        borderColor: "#0A6BFF",
        borderWidth: 2,
      },
    ],
  };

  // Line Chart Data
  const lineData = {
    labels,
    datasets: [
      {
        label: "Emotion Trends",
        data: scores,
        fill: false,
        borderColor: "#FF6384",
        tension: 0.2,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "#FFFFFF",
        },
      },
      tooltip: {
        bodyFont: { size: 14 },
        backgroundColor: "#333333",
        titleFont: { size: 16 },
        titleColor: "#FFFFFF",
      },
    },
    scales: {
      x: {
        ticks: { color: "#FFFFFF" },
        grid: { color: "rgba(255, 255, 255, 0.2)" },
      },
      y: {
        ticks: { color: "#FFFFFF" },
        grid: { color: "rgba(255, 255, 255, 0.2)" },
      },
    },
  };

  // Tabs and Chart rendering logic
  const renderChart = () => {
    switch (activeTab) {
      case "distribution":
        return <Pie data={pieData} options={options} />;
      case "scores":
        return <Bar data={barData} options={options} />;
      case "trends":
        return <Line data={lineData} options={options} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-black min-h-screen flex flex-col items-center p-6">
      <h1 className="text-white text-3xl font-bold mb-8">
        Emotion Analysis Charts
      </h1>
      <div className="flex space-x-6 mb-8">
        <button
          onClick={() => setActiveTab("distribution")}
          className={`py-2 px-4 rounded ${
            activeTab === "distribution"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300"
          }`}
        >
          Emotion Distribution
        </button>
        <button
          onClick={() => setActiveTab("scores")}
          className={`py-2 px-4 rounded ${
            activeTab === "scores"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300"
          }`}
        >
          Emotion Scores
        </button>
        <button
          onClick={() => setActiveTab("trends")}
          className={`py-2 px-4 rounded ${
            activeTab === "trends"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300"
          }`}
        >
          Emotion Trends
        </button>
      </div>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-4xl">
        {renderChart()}
      </div>
    </div>
  );
};

export default EmotionChart;
