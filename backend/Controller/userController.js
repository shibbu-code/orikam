const User = require("../models/User");
const Product = require("../models/Product");

const createCustomer = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // Check if customer already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Customer with this email already exists",
      });
    }

    // Create customer
    const customer = await User.create({
      name,
      email,
      password,
      phone,
      role: "customer",
    });

    res.status(201).json({
      message: "Customer created successfully",
      customer,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create customer",
      error: error.message,
    });
  }
};
const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User details fetched successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch user details",
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        message: "Email, password and role are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    // Verify selected role
    if (user.role !== role) {
      return res.status(403).json({
        message: `This account is registered as ${user.role}`,
      });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    // Create customer
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: "customer",
    });

    // Remove password from response
    const userData = user.toObject();
    delete userData.password;

    res.status(201).json({
      message: "Registration successful",
      user: userData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    const existingUser = await User.findOne({
      email,
      _id: { $ne: userId },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email is already in use",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || "",
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

const addRecentlyViewed = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        message: "userId and productId are required",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Remove product if it already exists
    user.recentlyViewed = user.recentlyViewed.filter(
      (id) => id.toString() !== productId.toString()
    );

    // Add latest viewed product at the beginning
    user.recentlyViewed.unshift(productId);

    // Keep only latest 5
    user.recentlyViewed = user.recentlyViewed.slice(0, 5);

    await user.save();

    res.status(200).json({
      message: "Recently viewed updated successfully",
      recentlyViewed: user.recentlyViewed,
    });
  } catch (error) {
    console.error("Add recently viewed error:", error);

    res.status(500).json({
      message: "Failed to update recently viewed",
      error: error.message,
    });
  }
};

const getRecentlyViewed = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select("recentlyViewed")
      .populate(
        "recentlyViewed",
        "name logo images price b2bPrice stock rating brand"
      );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Recently viewed products fetched successfully",
      products: user.recentlyViewed || [],
    });
  } catch (error) {
    console.error("Get recently viewed error:", error);

    res.status(500).json({
      message: "Failed to fetch recently viewed products",
      error: error.message,
    });
  }
};

module.exports = {
  createCustomer,
  getUserDetails,
  loginUser,
  registerUser,
  updateUserProfile,
  addRecentlyViewed,
  getRecentlyViewed,
};