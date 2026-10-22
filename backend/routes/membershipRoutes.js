const express = require("express");

const router = express.Router();

const {
  getMembershipPlans,
  getMyMembership,
  purchaseMembership,
  getMyWallet,
  getCoinHistory,
} = require("../Controller/membershipController");

router.get("/plans", getMembershipPlans);

router.get("/my/:userId", getMyMembership);

router.post("/purchase", purchaseMembership);

router.get("/wallet/:userId", getMyWallet);

router.get("/history/:userId", getCoinHistory);

module.exports = router;