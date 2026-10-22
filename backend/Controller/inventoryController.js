const Product = require("../models/Product");
const Warehouse = require("../models/Warehouse");
const WarehouseInventory = require("../models/WarehouseInventory");

// Get all products for inventory management
const getInventory = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .populate("brand", "name")
      .sort({ createdAt: -1 })
      .lean();

    // Calculate total stock from all warehouses
    const stockTotals = await WarehouseInventory.aggregate([
      {
        $group: {
          _id: "$product",
          totalStock: { $sum: "$quantity" },
        },
      },
    ]);

    const stockMap = new Map(
      stockTotals.map((item) => [
        item._id.toString(),
        item.totalStock,
      ])
    );

    // Display warehouse stock as the source of truth
    const inventoryProducts = products.map((product) => ({
      ...product,
      stock: stockMap.get(product._id.toString()) ?? 0,
    }));

    res.status(200).json({
      message: "Inventory fetched successfully",
      products: inventoryProducts,
    });
  } catch (error) {
    console.error("Get inventory error:", error);

    res.status(500).json({
      message: "Failed to fetch inventory",
      error: error.message,
    });
  }
};

// Direct stock updates are disabled.
// Stock must be updated through warehouse management.
const updateStock = async (req, res) => {
  return res.status(400).json({
    message:
      "Direct stock updates are disabled. Update product quantities through Warehouse Management.",
  });
};

module.exports = {
  getInventory,
  updateStock,
};