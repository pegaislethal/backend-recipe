const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../model/userSchema");
const Admin = require("../model/adminSchema");
const { sendOTP } = require("../utils/otp.utils");
const { log } = require("console");
const { StatusCodes } = require("http-status-codes");

const app = express();
app.use(express.json());

const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  const otpGenerate = crypto.randomInt(100000, 999999).toString();

  try {
    const user = await User.findOne({ email });
    if (user) {
      res.status(500).json({ message: "user already exist" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const otpExpires = Date.now() + 15 * 60 * 1000; // OTP expires in 15 minute

    const newUser = new User({
      name,
      email,
      role,
      password: hashedPassword,
      otp: otpGenerate,
      otpExpires,
    });

    await newUser.save();
    await sendOTP(email, otpGenerate, otpExpires);

    res.status(201).json({
      message:
        "User added successfully. Please verify your email with the OTP sent.",
      newUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating new user", error });
  }
};

// const verifyOTPUser = async (req, res) => {
//   const { email, otp, role } = req.body;

//   try {
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     if (user.otp != otp) {
//       console.log("otp", otp);
//       console.log("user.otp", user.otp);
//       return res.status(400).json({
//         success: false,
//         message: "Invalid or expired OTP",
//       });
//     }

//     user.isVerified = true;
//     user.otp = null;
//     user.otpExpires = null;
//     await user.save();

//     res.status(200).json({
//       success: true,
//       message: "OTP verified successfully",
//     });
//   } catch (error) {
//     console.error("Error verifying OTP:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

const verifyOTP = async (req, res) => {
  const { email, otp, role } = req.body;

  try {
    let user;
    if (role === "admin") {
      // Check for admin
      user = await Admin.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Admin not found",
        });
      }
    } else {
      // Check for regular user
      user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
    }

    // OTP verification logic
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Check if OTP has expired (if you're storing expiry times)
    if (user.otpExpires && Date.now() > user.otpExpires) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // Mark the user/admin as verified and clear OTP
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });
    }

    // Ensure user is verified
    if (!user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email not verified" });
    }

    // Create JWT token, including the role
    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.name, role: user.role }, // Include role
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ success: true, message: "Logged in", token });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const profileEdit = async (req, res) => {
  try {
    const id = req.params.id;

    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "No user found with this ID" });
    }

    const { name, email } = req.body;

    // Update the user's details
    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createUser, loginUser, verifyOTP, profileEdit };
