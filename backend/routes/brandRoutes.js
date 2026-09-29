const express = require("express");

const router = express.Router();

const { addBrand, getAllBrands,
    getBrandById, updateBrand, updateBrandStatus
 } = require("../Controller/brandController");

router.post("/add", addBrand);
router.get("/", getAllBrands);
router.get("/:brandId", getBrandById);
router.put("/:brandId", updateBrand);
router.patch("/:brandId/status", updateBrandStatus);

module.exports = router;