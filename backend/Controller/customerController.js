const User = require("../models/User");
const Order = require("../models/Order");

// Get all customers
const getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({
      role: "customer",
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Customers fetched successfully",
      customers,
    });
  } catch (error) {
    console.error("Get customers error:", error);

    res.status(500).json({
      message: "Failed to fetch customers",
      error: error.message,
    });
  }
};


// Get customer by ID
const getCustomerById = async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await User.findOne({
      _id: customerId,
      role: "customer",
    }).select("-password");

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.status(200).json({
      customer,
    });
  } catch (error) {
    console.error("Get customer error:", error);

    res.status(500).json({
      message: "Failed to fetch customer",
      error: error.message,
    });
  }
};


// Get customer's orders
const getCustomerOrders = async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await User.findOne({
      _id: customerId,
      role: "customer",
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    const orders = await Order.find({
      user: customerId,
    })
      .populate("items.product", "name logo images")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Customer orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.error(
      "Get customer orders error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch customer orders",
      error: error.message,
    });
  }
};


module.exports = {
  getAllCustomers,
  getCustomerById,
  getCustomerOrders,
};