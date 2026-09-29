const express = require("express");

const {
  createOrder,
  getOrdersByUser,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  requestReturn,
  getAllReturns,
  updateReturnStatus,
} = require("../Controller/orderController");

const router = express.Router();

router.post("/", createOrder);

router.get("/", getAllOrders);

router.get("/returns", getAllReturns);

router.get("/user/:userId", getOrdersByUser);

router.post("/:orderId/return", requestReturn);

router.patch("/:orderId/status", updateOrderStatus);

router.patch("/:orderId/return/status", updateReturnStatus);

router.get("/:orderId", getOrderById);

module.exports = router;