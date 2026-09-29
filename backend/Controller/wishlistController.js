const Wishlist = require("../models/Wishlist");

const addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        message: "userId and productId are required",
      });
    }

    let wishlist = await Wishlist.findOne({ user: userId });

    // Create wishlist if user doesn't have one
    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: userId,
        products: [productId],
      });

      return res.status(201).json({
        message: "Product added to wishlist",
        wishlist,
      });
    }

    // Prevent duplicate product
    if (wishlist.products.includes(productId)) {
      return res.status(400).json({
        message: "Product already exists in wishlist",
      });
    }

    wishlist.products.push(productId);
    await wishlist.save();

    res.status(200).json({
      message: "Product added to wishlist",
      wishlist,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add product to wishlist",
      error: error.message,
    });
  }
};

const getWishlist = async (req, res) => {
  try {
    const { userId } = req.params;

    const wishlist = await Wishlist.findOne({ user: userId }).populate(
      "products",
      "name description logo images price b2bPrice stock rating brand"
    );

    if (!wishlist) {
      return res.status(200).json({
        message: "Wishlist fetched successfully",
        products: [],
      });
    }

    res.status(200).json({
      message: "Wishlist fetched successfully",
      products: wishlist.products || [],
    });
  } catch (error) {
    console.error("Get wishlist error:", error);

    res.status(500).json({
      message: "Failed to fetch wishlist",
      error: error.message,
    });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        message: "userId and productId are required",
      });
    }

    const wishlist = await Wishlist.findOne({
      user: userId,
    });

    if (!wishlist) {
      return res.status(404).json({
        message: "Wishlist not found",
      });
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId.toString()
    );

    await wishlist.save();

    res.status(200).json({
      message: "Product removed from wishlist",
      products: wishlist.products,
    });
  } catch (error) {
    console.error("Remove wishlist error:", error);

    res.status(500).json({
      message: "Failed to remove product from wishlist",
      error: error.message,
    });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
};