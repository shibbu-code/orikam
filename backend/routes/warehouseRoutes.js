const express = require("express");
const router = express.Router();

const {
  createWarehouse,
  getWarehouses,
    getWarehouseInventory,
    addWarehouseStock,
    updateWarehouseStock,
} = require("../Controller/warehouseController");

router.post("/", createWarehouse);
router.get("/", getWarehouses);

router.get("/:warehouseId/inventory", getWarehouseInventory);
router.post("/:warehouseId/inventory", addWarehouseStock);
router.put("/:warehouseId/inventory/:productId", updateWarehouseStock);

module.exports = router;