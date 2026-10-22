const express = require("express");

const router = express.Router();

const { addBrand, getAllBrands,
    getBrandById, updateBrand, updateBrandStatus,
    deleteBrand
 } = require("../Controller/brandController");

router.post("/add", addBrand);
router.get("/", getAllBrands);
router.get("/:brandId", getBrandById);
router.put("/:brandId", updateBrand);
router.patch("/:brandId/status", updateBrandStatus);
router.delete("/:brandId", deleteBrand);

module.exports = router;