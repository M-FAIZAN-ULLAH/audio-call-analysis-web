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
// const registerUser = async (req, res) => {
//   try {
//     // Generate a random 8-digit password
//     const plainPassword = generatePassword();

//     console.log(req.body.email, req.body.username);

//     // Send the email with the generated password
//     await sendAccountUpdateEmail(
//       req.body.email,
//       "Account Registration",
//       plainPassword
//     );

//     // Hash the generated password
//     const hashedPassword = await bcrypt.hash(plainPassword, 10);

//     // Create a new user with the hashed password
//     const newUser = await User.create({
//       ...req.body,
//       password: hashedPassword,
//     });

//     res.status(201).json({
//       message: "Email has been sent. Please verify your account.",
//       user: newUser,
//     });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };
const registerUser = async (req, res) => {
  try {
    console.log(`[API] POST /api/register - User Registration - Email: ${req.body.email}, Username: ${req.body.username}`);
    
    // Generate a random 8-digit password
    const plainPassword = generatePassword();

    // Check for existing email before creating user
    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Send the email with the generated password (unchanged)
    await sendAccountUpdateEmail(
      req.body.email,
      "Account Registration",
      plainPassword
    );

    // Hash the generated password (unchanged)
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Create a new user with the hashed password (unchanged)
    const newUser = await User.create({
      ...req.body,
      password: hashedPassword,
    });

    console.log(`[API] POST /api/register - Success - User ID: ${newUser._id}`);
    res.status(200).json({
      message: "Email has been sent. Please verify your account.",
      user: newUser,
    });
  } catch (error) {
    console.error(`[API] POST /api/register - Error: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

// Controller function to delete user by ID
const deleteUserById = async (req, res) => {
  try {
    console.log(`[API] DELETE /api/users/:id - Delete User - User ID: ${req.params.id}`);
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      console.log(`[API] DELETE /api/users/:id - Not Found - User ID: ${req.params.id}`);
      return res.status(404).json({ message: "User not found" });
    }
    console.log(`[API] DELETE /api/users/:id - Success - User ID: ${req.params.id}`);
    res
      .status(200)
      .json({ message: "User deleted successfully", user: deletedUser });
  } catch (error) {
    console.error(`[API] DELETE /api/users/:id - Error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Controller function to get all users
const getAllUsers = async (req, res) => {
  try {
    console.log(`[API] GET /api/users - Get All Users`);
    const users = await User.find();
    console.log(`[API] GET /api/users - Success - Found ${users.length} users`);
    res.status(200).json(users);
  } catch (error) {
    console.error(`[API] GET /api/users - Error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res, next) => {
  try {
    console.log(`[API] POST /api/login - User Login - Email: ${req.body.email}`);
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
    console.log(`[API] POST /api/login - Success - User ID: ${user._id}`);
    res
      .cookie("accessToken", token, {
        httpOnly: true,
      })
      .status(200)
      .send(info);
  } catch (error) {
    console.error(`[API] POST /api/login - Error: ${error.message}`);
    next(error);
  }
};

const logout = async (req, res) => {
  console.log(`[API] POST /api/logout - User Logout`);
  res
    .clearCookie("accessToken", {
      sameSite: "none",
      secure: true,
    })
    .status(200)
    .send("User has been logged out!");
  console.log(`[API] POST /api/logout - Success`);
};

// Controller function to update user password by ID
const updatePassword = async (req, res) => {
  try {
    console.log(`[API] PUT /api/users/:id/update-password - Update Password - User ID: ${req.params.id}`);
    const { id } = req.params;
    const { newPassword } = req.body;

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user with the hashed new password
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      console.log(`[API] PUT /api/users/:id/update-password - Not Found - User ID: ${id}`);
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`[API] PUT /api/users/:id/update-password - Success - User ID: ${id}`);
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(`[API] PUT /api/users/:id/update-password - Error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerUser,
  deleteUserById,
  getAllUsers,
  login,
  logout,
  updatePassword,
};
