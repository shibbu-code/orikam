const Product = require("../models/Product");

const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      subCategory,
      brand,
      variants,
      logo,
      images,
      price,
      stock,
    } = req.body;

    // Required fields
    if (!name || !description || !category || !brand || price === undefined) {
      return res.status(400).json({
        message: "Name, description, category, brand and price are required",
      });
    }

    const product = await Product.create({
      name,
      description,
      category,
      subCategory: subCategory || null,
      brand,
      variants: variants || [],
      logo: logo || "",
      images: images || [],
      price,
      stock: stock || 0,
    });

    res.status(201).json({
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add product",
      error: error.message,
    });
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const products = await Product.find({
      category: categoryId,
    })
      .populate("brand")
      .populate("category");

    res.status(200).json({
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

const getProductsByBrand = async (req, res) => {
  try {
    const { brandId } = req.params;

    const products = await Product.find({
      brand: brandId,
    }).populate("brand");

    res.status(200).json({
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

const getHotSellingProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ salesCount: -1 })
      .limit(5);

    res.status(200).json({
      message: "Hot selling products fetched successfully",
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch hot selling products",
      error: error.message,
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      sort,
    } = req.query;

    const filter = {
      isActive: true,
    };

    // Search by product name
    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Brand filter
    if (brand) {
      filter.brand = brand;
    }

    // Price filter
    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    // Sorting
    let sortOption = {
      createdAt: -1,
    };

    if (sort === "price_asc") {
      sortOption = { price: 1 };
    }

    if (sort === "price_desc") {
      sortOption = { price: -1 };
    }

    if (sort === "rating") {
      sortOption = { rating: -1 };
    }

    if (sort === "popular") {
      sortOption = { salesCount: -1 };
    }

    const products = await Product.find(filter)
      .populate("category", "name")
      .populate("brand", "name")
      .sort(sortOption);

    res.status(200).json({
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId)
      .populate("category", "name")
      .populate("brand", "name")
      .populate(
        "variants",
        "name description logo images price b2bPrice moq bulkPricing stock category brand"
      );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    console.error(
      "Get product by ID error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("category", "name")
      .populate("brand", "name");

    if (!updatedProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Update product error:", error);

    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};

const updateProductStatus = async (req, res) => {
  try {
    const { productId } = req.params;
    const { isActive } = req.body;

    const product = await Product.findByIdAndUpdate(
      productId,
      { isActive },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: `Product ${
        isActive ? "activated" : "deactivated"
      } successfully`,
      product,
    });
  } catch (error) {
    console.error("Update product status error:", error);

    res.status(500).json({
      message: "Failed to update product status",
      error: error.message,
    });
  }
};

const getSimilarProducts = async (req, res) => {
  try {
    const { productId } = req.params;

    const currentProduct = await Product.findById(productId);

    if (!currentProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const similarProducts = await Product.find({
      _id: { $ne: productId },
      category: currentProduct.category,
      subCategory: currentProduct.subCategory,
      isActive: true,
    })
      .populate("category", "name")
      .populate("brand", "name")
      .limit(6)
      .sort({ salesCount: -1 });

    res.status(200).json({
      message: "Similar products fetched successfully",
      products: similarProducts,
    });
  } catch (error) {
    console.error("Get similar products error:", error);

    res.status(500).json({
      message: "Failed to fetch similar products",
      error: error.message,
    });
  }
};

module.exports = {
  addProduct,
    getProductsByCategory,
    getProductsByBrand,
    getHotSellingProducts,
    getAllProducts,
    getProductById,
    updateProduct,
    updateProductStatus,
    getSimilarProducts
};