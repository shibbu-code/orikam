const Category = require("../models/Category");
const Product = require("../models/Product");

const addCategory = async (req, res) => {
  try {
    const {
      name,
      description,
      image,
      parentCategory,
      isActive,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    // Check duplicate category under same parent
    const existingCategory = await Category.findOne({
      name,
      parentCategory: parentCategory || null,
    });

    if (existingCategory) {
      return res.status(400).json({
        message: "Category already exists",
      });
    }

    const category = await Category.create({
      name,
      description,
      image,
      parentCategory: parentCategory || null,
      isActive: isActive ?? true,
    });

    res.status(201).json({
      message: "Category added successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add category",
      error: error.message,
    });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) ;

const categories = await Category.find().limit(limit);

    return res.status(200).json({
      message: "Categories fetched successfully",
      categories,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedCategory) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.status(200).json({
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Update category error:", error);

    res.status(500).json({
      message: "Failed to update category",
      error: error.message,
    });
  }
};

const updateCategoryStatus = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { isActive } = req.body;

    const category = await Category.findByIdAndUpdate(
      categoryId,
      { isActive },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.status(200).json({
      message: `Category ${
        isActive ? "activated" : "deactivated"
      } successfully`,
      category,
    });
  } catch (error) {
    console.error("Update category status error:", error);

    res.status(500).json({
      message: "Failed to update category status",
      error: error.message,
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.status(200).json({
      category,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch category",
      error: error.message,
    });
  }
};

const deleteCategory = async (req, res) => {
try {
const { categoryId } = req.params;


const category = await Category.findById(categoryId);

if (!category) {
  return res.status(404).json({
    message: "Category not found",
  });
}

// Prevent deletion if products use this category
const productExists = await Product.exists({
  $or: [
    { category: categoryId },
    { subCategory: categoryId },
  ],
});

if (productExists) {
  return res.status(400).json({
    message:
      "Cannot delete this category because products are using it. Reassign those products first.",
  });
}

// Prevent deletion if other categories use it as a parent
const childCategoryExists = await Category.exists({
  parentCategory: categoryId,
});

if (childCategoryExists) {
  return res.status(400).json({
    message:
      "Cannot delete this category because it has subcategories. Delete or reassign them first.",
  });
}

await Category.findByIdAndDelete(categoryId);

return res.status(200).json({
  message: "Category deleted successfully",
  categoryId,
});


} catch (error) {
console.error("Delete category error:", error);


return res.status(500).json({
  message: "Failed to delete category",
  error: error.message,
});


}
};

   
module.exports = {
  addCategory,
  getAllCategories,
  updateCategory,
  updateCategoryStatus,
  getCategoryById,
  deleteCategory,
};