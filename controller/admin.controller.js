const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Admin = require("../model/adminSchema");
const { sendOTP } = require("../utils/otp.utils"); // Assuming sendOTP is in another module

const app = express();
app.use(express.json());

const adminPage = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: "Admin page accessable" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createAdmin = async (req, res) => {
  const { name, email, password, role } = req.body;
  const otpGenerate = crypto.randomInt(100000, 999999).toString();

  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otpExpires = Date.now() + 15 * 60 * 1000; // OTP expires in 15 minutes

    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword,
      role, // Save the role here
      otp: otpGenerate,
      otpExpires,
    });

 

    // Send OTP to admin's email
    await sendOTP(email, otpGenerate, otpExpires);
    await newAdmin.save();

    res
      .status(201)
      .json({
        message:
          "Admin created successfully. Please verify your email with the OTP sent.",
        newAdmin,
      });
  } catch (error) {
    res.status(500).json({ message: "Error creating new admin", error });
  }
};

const verifyOTPAdmin = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (admin.otp != otp) {
      console.log("otp", otp);
      console.log("user.otp", user.otp);
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    admin.isVerified = true;
    admin.otp = null;
    admin.otpExpires = null;
    await admin.save();

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

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Ensure admin is verified
    if (!admin.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email not verified" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, username: admin.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ success: true, message: "Logged in", token });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { createAdmin, loginAdmin, verifyOTPAdmin, adminPage };
