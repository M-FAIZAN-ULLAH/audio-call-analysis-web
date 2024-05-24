const User = require("../model/User"); // Importing the User model

// Controller function to handle user registration
const registerUser = async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res
      .status(201)
      .json({ message: "User successfully registered!", user: newUser });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Controller function to delete user by ID
const deleteUserById = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res
      .status(200)
      .json({ message: "User deleted successfully", user: deletedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller function to get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { registerUser, deleteUserById, getAllUsers };
