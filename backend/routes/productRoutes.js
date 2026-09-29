const express = require("express");

const router = express.Router();

const { addProduct, getProductsByCategory 
    , getProductsByBrand , getHotSellingProducts,
    getAllProducts , getProductById, updateProduct,
    updateProductStatus, getSimilarProducts
} = require("../Controller/productController");

router.post("/add", addProduct);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/brand/:brandId", getProductsByBrand);
router.get("/hot-selling", getHotSellingProducts);
router.get("/:productId/similar", getSimilarProducts);
router.get("/", getAllProducts);
router.patch("/:productId/status", updateProductStatus);
router.put("/:productId", updateProduct); 
router.get("/:productId", getProductById);
 

module.exports = router;