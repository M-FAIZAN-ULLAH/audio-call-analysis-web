const User = require("../model/User"); // Importing the User model
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { CreateError } = require("../middleware/createError");
const { sendAccountUpdateEmail } = require("../utilis/emailService");

// Function to generate a random 8-digit password
const generatePassword = () => {
  const chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
};

// Controller function to handle user registration
const registerUser = async (req, res) => {
  try {
    // Generate a random 8-digit password
    const plainPassword = generatePassword();

    console.log(req.body.email, req.body.username);

    // Send the email with the generated password
    await sendAccountUpdateEmail(
      req.body.email,
      "Account Registration",
      plainPassword
    );

    // Hash the generated password
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Create a new user with the hashed password
    const newUser = await User.create({
      ...req.body,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Email has been sent. Please verify your account.",
      user: newUser,
    });
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

const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) return next(CreateError(404, "user not found"));

    const isCorrect = bcrypt.compareSync(req.body.password, user.password);
    if (!isCorrect) return next(400, "wrong password or username!");

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_KEY
    );

    const { password, ...info } = user._doc;
    res
      .cookie("accessToken", token, {
        httpOnly: true,
      })
      .status(200)
      .send(info);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  res
    .clearCookie("accessToken", {
      sameSite: "none",
      secure: true,
    })
    .status(200)
    .send("User has been logged out!");
};

module.exports = { registerUser, deleteUserById, getAllUsers, login, logout };
