const Product = require("../models/Product");

// Get all products for inventory management
const getInventory = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .populate("brand", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Inventory fetched successfully",
      products,
    });
  } catch (error) {
    console.error("Get inventory error:", error);

    res.status(500).json({
      message: "Failed to fetch inventory",
      error: error.message,
    });
  }
};

// Update product stock
const updateStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { stock } = req.body;

    if (stock === undefined || stock === null || stock === "") {
      return res.status(400).json({
        message: "Stock is required",
      });
    }

    const numericStock = Number(stock);

    if (Number.isNaN(numericStock) || numericStock < 0) {
      return res.status(400).json({
        message: "Stock must be a valid non-negative number",
      });
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      {
        stock: numericStock,
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("category", "name")
      .populate("brand", "name");

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Stock updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update stock error:", error);

    res.status(500).json({
      message: "Failed to update stock",
      error: error.message,
    });
  }
};

module.exports = {
  getInventory,
  updateStock,
};