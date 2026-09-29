const express = require("express");

const router = express.Router();

const { createCustomer, getUserDetails
    , loginUser , registerUser, updateUserProfile,
    addRecentlyViewed,getRecentlyViewed
 } = require("../Controller/userController");

router.post("/customer", createCustomer);
router.get("/:userId", getUserDetails);
router.post("/login", loginUser);
router.post("/register", registerUser);
router.put("/:userId/profile", updateUserProfile);
router.post("/recently-viewed", addRecentlyViewed);
router.get("/:userId/recently-viewed", getRecentlyViewed);
module.exports = router;