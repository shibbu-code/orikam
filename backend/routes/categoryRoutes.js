const express = require("express");

const router = express.Router();

const { addCategory, getAllCategories,
    updateCategory, updateCategoryStatus,
    getCategoryById, deleteCategory
 } = require("../Controller/categoryController");

router.post("/add", addCategory);
router.get("/", getAllCategories);
router.get("/:categoryId", getCategoryById);
router.put("/:categoryId", updateCategory);
router.patch("/:categoryId/status", updateCategoryStatus);
router.delete("/:categoryId", deleteCategory);

module.exports = router;