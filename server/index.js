// Import necessary packages
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./database/connectDB");
const userRoutes = require("./routes/userRoutes");

// Load environment variables from .env file
dotenv.config();

// Create an Express application
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware to enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Connect to MongoDB
connectDB();

app.use("/api", userRoutes);

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
