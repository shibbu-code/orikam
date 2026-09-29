const express = require("express");
const router = express.Router();

const {
  getInventory,
  updateStock,
} = require("../Controller/inventoryController");

router.get("/", getInventory);

router.patch("/:productId/stock", updateStock);

module.exports = router;