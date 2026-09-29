const express = require("express");

const {
  getAdminDashboard,
} = require("../Controller/adminController");

const router = express.Router();

router.get("/", getAdminDashboard);

module.exports = router;