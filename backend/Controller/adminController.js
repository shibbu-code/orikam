const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const getAdminDashboard = async (req, res) => {
  try {
   
    const totalProducts = await Product.countDocuments();

    const totalOrders = await Order.countDocuments();

    const totalCustomers = await User.countDocuments({
      role: "customer",
    });

    // Products with stock <= 10
    const lowStock = await Product.countDocuments({
      stock: { $lte: 10 },
      isActive: true,
    });

    // -----------------------------
    // RECENT ORDERS
    // -----------------------------

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email")
      .select(
        "_id user totalAmount orderStatus paymentStatus createdAt items"
      );

    // -----------------------------
    // LOW STOCK PRODUCTS
    // -----------------------------

    const lowStockProducts = await Product.find({
      stock: { $lte: 10 },
      isActive: true,
    })
      .sort({ stock: 1 })
      .limit(5)
      .populate("brand", "name")
      .populate("category", "name")
      .select("_id name brand category stock price images logo isActive"
      );
    res.status(200).json({
      message: "Admin dashboard data fetched successfully",

      stats: {
        totalProducts,
 totalOrders,
        totalCustomers, lowStock,
      },

      recentOrders,

      lowStockProducts,
    });
  } catch (error) {
          console.error("Admin dashboard error:", error);

    res.status(500).json({
  message: "Failed to fetch admin dashboard data", error: error.message,
    });
  }
};

module.exports = {
  getAdminDashboard,
};