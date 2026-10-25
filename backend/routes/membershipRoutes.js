const express = require("express");

const router = express.Router();

const {
  createMembershipPayment,
  verifyMembershipPayment
} = require("../Controller/paymentController");

const {
  getMembershipPlans,
  getMyMembership,
  purchaseMembership,
  getMyWallet,
  getCoinHistory,

  
} = require("../Controller/membershipController");

router.get("/plans", getMembershipPlans);

router.get("/my/:userId", getMyMembership);

// router.post("/purchase", purchaseMembership);

router.get("/wallet/:userId", getMyWallet);

router.get("/history/:userId", getCoinHistory);

router.post("/create-payment", createMembershipPayment)
router.post("/verify-payment", verifyMembershipPayment);
module.exports = router;