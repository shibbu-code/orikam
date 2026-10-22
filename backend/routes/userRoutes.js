const express = require("express");

const router = express.Router();

const { createCustomer, getUserDetails
    , loginUser , registerUser, updateUserProfile,
    addRecentlyViewed,getRecentlyViewed,
    getUserAddresses,addUserAddress,updateUserAddress,
    deleteUserAddress,setDefaultUserAddress,
 } = require("../Controller/userController");

router.post("/customer", createCustomer);
router.get("/:userId", getUserDetails);
router.post("/login", loginUser);
router.post("/register", registerUser);
router.put("/:userId/profile", updateUserProfile);
router.post("/recently-viewed", addRecentlyViewed);
router.get("/:userId/recently-viewed", getRecentlyViewed);

router.get("/:userId/addresses", getUserAddresses);
router.post("/:userId/addresses", addUserAddress);
router.put(":userId/addresses/",updateUserAddress);
router.delete("/:userId/addresses/",deleteUserAddress);
router.patch("/:userId/addresses/default",setDefaultUserAddress);
module.exports = router;