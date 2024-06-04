// Import necessary packages
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./database/connectDB");
const CookieParser = require("cookie-parser");

// Importing Routes file
const analysisRoutes = require("./routes/analysisRoutes");
const userRoutes = require("./routes/userRoutes");
const bulkAnalysisRoutes=require("./routes/bulkAnalysisRoutes");

// Load environment variables from .env file
dotenv.config();

// Create an Express application
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(CookieParser());
app.use(cors({ origin: 'http://localhost:3000' }));

// Middleware to enable Cross-Origin Resource Sharing (CORS)
// app.use(cors());

const corsOption = {
  origin: ["http://127.0.0.1:8000"],
};
app.use(cors(corsOption));

// Connect to MongoDB
connectDB();

app.use("/api", userRoutes);
app.use("/api", analysisRoutes);
app.use("/api",bulkAnalysisRoutes)

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
