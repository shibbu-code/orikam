const express = require("express");

const router = express.Router();

const {
  getAllCustomers,
  getCustomerById,
  getCustomerOrders,
} = require("../Controller/customerController");


router.get("/", getAllCustomers);

router.get("/:customerId/orders", getCustomerOrders);

router.get("/:customerId", getCustomerById);


module.exports = router;