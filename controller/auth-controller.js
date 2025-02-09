import { User } from "../models/user-model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Organization } from "../models/organization-model.js";

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide all required fields" 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid email format" 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: "Email already registered" 
      });
    }

    const user = new User({
      name,
      email,
      password,
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error) {
    console.error("Error in register:", error);
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture,
        },
      },
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving users",
      error: error.message,
    });
  }
};

const getRemainingUsersInOrganization = async (req, res) => {
  try {
    const { orgId } = await req.params;

    const organization = await Organization.findById(orgId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    const existingMemberIds = organization.members.map(member => 
      member.user.toString()
    );

    const remainingUsers = await User.find({
      _id: { $nin: existingMemberIds }
    }, "-password");

    res.json({
      success: true,
      message: "Remaining users retrieved successfully",
      data: remainingUsers,
    });
  } catch (error) {
    console.error("Error in getRemainingUsersInOrganization:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving remaining users",
      error: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, email, description, profilePicture } = req.body;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // If email is being updated, check if it's already taken
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already in use"
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format"
        });
      }
    }

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (description) user.description = description;
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: userResponse
    });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message
    });
  }
};

export { register, login, getAllUsers, getRemainingUsersInOrganization, updateProfile };
