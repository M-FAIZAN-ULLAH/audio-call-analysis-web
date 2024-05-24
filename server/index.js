// Import necessary packages
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

// Create an Express application
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware to enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Define a route
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Define a route with environment variable
app.get("/secret", (req, res) => {
  const secretMessage =
    process.env.SECRET_MESSAGE || "No secret message defined";
  res.send(secretMessage);
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
