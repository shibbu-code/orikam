const mongoose = require("mongoose");

const warehouseInventorySchema = new mongoose.Schema(
{
warehouse: {
type: mongoose.Schema.Types.ObjectId,
ref: "Warehouse",
required: true,
},

product: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Product",
  required: true,
},

quantity: {
  type: Number,
  required: true,
  default: 0,
  min: 0,
},


},
{
timestamps: true,
}
);

// A product should have only one inventory record per warehouse.
warehouseInventorySchema.index(
{ warehouse: 1, product: 1 },
{ unique: true }
);

module.exports = mongoose.model(
"WarehouseInventory",
warehouseInventorySchema
);
