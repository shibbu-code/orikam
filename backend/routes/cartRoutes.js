const express = require("express");

const router = express.Router();

const {
  addToCart, getCartByUser,
  updateCartItem, removeCartItem,
} = require("../Controller/cartController");

router.post("/add", addToCart);
router.get("/:userId", getCartByUser);
router.put("/update", updateCartItem);
router.delete("/remove", removeCartItem);

module.exports = router;