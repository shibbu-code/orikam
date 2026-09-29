const express = require("express");

const router = express.Router();

const {addToWishlist, getWishlist,removeFromWishlist} = require("../Controller/wishlistController");

router.post("/", addToWishlist);
router.get("/:userId", getWishlist);
router.delete("/", removeFromWishlist);

module.exports = router;