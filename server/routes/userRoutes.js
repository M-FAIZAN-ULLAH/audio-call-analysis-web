const express = require("express");
const router = express.Router();
const {
  registerUser,
  deleteUserById,
  getAllUsers,
  login,
  logout,
} = require("../controller/userController");

// Route to register a new user
router.post("/register", registerUser);

// Route to login
router.post("/login", login);

// Route to Logout
router.post("/logout", logout);

// Route to delete a user by ID
router.delete("/users/:id", deleteUserById);

// Route to get all users
router.get("/users", getAllUsers);

module.exports = router;
