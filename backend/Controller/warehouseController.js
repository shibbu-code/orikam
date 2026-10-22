const Warehouse = require("../models/Warehouse");
const WarehouseInventory = require("../models/WarehouseInventory");
const Product = require("../models/Product");
const mongoose = require("mongoose");
// Create warehouse
exports.createWarehouse = async (req, res) => {
try {
const warehouse = await Warehouse.create(req.body);


res.status(201).json({
  success: true,
  warehouse,
});


} catch (error) {
res.status(400).json({
success: false,
message: error.message,
});
}
};

// Get all warehouses
exports.getWarehouses = async (req, res) => {
try {
const warehouses = await Warehouse.find().sort({ createdAt: -1 });

res.status(200).json({
  success: true,
  warehouses,
});


} catch (error) {
res.status(500).json({
success: false,
message: error.message,
});
}
};

// Get inventory for a specific warehouse
exports.getWarehouseInventory = async (req, res) => {
try {
const inventory = await WarehouseInventory.find({
warehouse: req.params.warehouseId,
})
.populate("product", "name price stock images")
.populate("warehouse", "name code")
.sort({ updatedAt: -1 });


res.status(200).json({
  success: true,
  inventory,
});


} catch (error) {
res.status(500).json({
success: false,
message: error.message,
});
}
};

// Add a product to warehouse inventory
exports.addWarehouseStock = async (req, res) => {
try {
const { productId, quantity } = req.body;
const { warehouseId } = req.params;


if (!productId || quantity === undefined || Number(quantity) < 0) {
  return res.status(400).json({
    success: false,
    message: "Valid productId and non-negative quantity are required.",
  });
}

const [warehouse, product] = await Promise.all([
  Warehouse.findById(warehouseId),
  Product.findById(productId),
]);

if (!warehouse) {
  return res.status(404).json({
    success: false,
    message: "Warehouse not found.",
  });
}

if (!product) {
  return res.status(404).json({
    success: false,
    message: "Product not found.",
  });
}

const inventory = await WarehouseInventory.findOneAndUpdate(
  { warehouse: warehouseId, product: productId },
  { $set: { quantity: Number(quantity) } },
  { new: true, upsert: true, runValidators: true }
)
  .populate("product", "name price stock images")
  .populate("warehouse", "name code");
const totalStock = await syncProductStock(productId);
res.status(200).json({
  success: true,
  message: "Warehouse stock saved successfully.",
  inventory,
    totalStock,
});


} catch (error) {
res.status(400).json({
success: false,
message: error.message,
});
}
};

// Update quantity for an existing warehouse product
exports.updateWarehouseStock = async (req, res) => {
try {
const { quantity } = req.body;
const { warehouseId, productId } = req.params;


if (quantity === undefined || !Number.isFinite(Number(quantity)) || Number(quantity) < 0) {
  return res.status(400).json({
    success: false,
    message: "A valid non-negative quantity is required.",
  });
}

const inventory = await WarehouseInventory.findOneAndUpdate(
  { warehouse: warehouseId, product: productId },
  { $set: { quantity: Number(quantity) } },
  { new: true, runValidators: true }
)
  .populate("product", "name price stock images")
  .populate("warehouse", "name code");
const totalStock = await syncProductStock(productId);
if (!inventory) {
  return res.status(404).json({
    success: false,
    message: "Product inventory not found in this warehouse.",
  });
}

res.status(200).json({
  success: true,
  message: "Warehouse stock updated successfully.",
  inventory,
    totalStock,
});


} catch (error) {
res.status(400).json({
success: false,
message: error.message,
});
}
};

// Synchronize product stock with the total quantity across all warehouses
const syncProductStock = async (productId) => {
  const result = await WarehouseInventory.aggregate([
    {
      $match: {
        product: new (require("mongoose").Types.ObjectId)(productId),
      },
    },
    {
      $group: {
        _id: "$product",
        totalQuantity: { $sum: "$quantity" },
      },
    },
  ]);

  const totalStock = result.length > 0 ? result[0].totalQuantity : 0;

  await Product.findByIdAndUpdate(productId, {
    stock: totalStock,
  });

  return totalStock;
};