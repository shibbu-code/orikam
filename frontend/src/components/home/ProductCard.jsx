import React, { useEffect, useState } from "react";
import { ShoppingCart, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../../services/wishlistApi";

import "./ProductCard.css";

const ProductCard = ({ product, onAddToCart }) => {
  const navigate = useNavigate();

  const [isWishlisted, setIsWishlisted] = useState(false);

  const image =
    product.images?.[0] ||
    product.logo ||
    "";

  const userId = localStorage.getItem("userId");

  // Check whether this product is already in wishlist
  useEffect(() => {
    const checkWishlist = async () => {
      if (!userId || !product?._id) return;

      try {
        const response = await getWishlist(userId);

        const wishlistProducts =
          response.data.products || [];

        const exists = wishlistProducts.some(
          (item) => item._id === product._id
        );

        setIsWishlisted(exists);
      } catch (error) {
        console.error(
          "Failed to check wishlist:",
          error
        );
      }
    };

    checkWishlist();
  }, [userId, product?._id]);

  // Add product to wishlist
  const handleWishlist = async (e) => {
  e.stopPropagation();

  if (!userId) {
    navigate("/login");
    return;
  }

  try {
    if (isWishlisted) {
      await removeFromWishlist(userId, product._id);
      setIsWishlisted(false);
    } else {
      await addToWishlist(userId, product._id);
      setIsWishlisted(true);
    }
  } catch (error) {
    console.error("Failed to update wishlist:", error);
  }
};

  return (
    <div className="product-card">

      {/* Product Image */}
      <div
        className="product-image-wrapper"
        onClick={() =>
          navigate(`/products/${product._id}`)
        }
      >

        {/* Wishlist Button */}
        <button
          className={`product-wishlist-btn ${
            isWishlisted ? "active" : ""
          }`}
          onClick={handleWishlist}
          aria-label={
            isWishlisted
              ? "Already in wishlist"
              : "Add to wishlist"
          }
        >
          <Heart
            size={19}
            fill={
              isWishlisted
                ? "currentColor"
                : "none"
            }
          />
        </button>

        {/* Product Image */}
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="product-image"
          />
        ) : (
          <div className="product-image-placeholder">
            No Image
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="product-card-content">

        <p className="product-brand">
          {product.brand?.name || "ORIKAM"}
        </p>

        <h3
          className="product-name"
          onClick={() =>
            navigate(`/products/${product._id}`)
          }
        >
          {product.name}
        </h3>

        <div className="product-bottom">

          <span className="product-price">
            ₹{product.price}
          </span>

          <button
            className="product-cart-button"
            onClick={() =>
              onAddToCart(product._id)
            }
          >
            <ShoppingCart size={17} />
            Add
          </button>

        </div>
      </div>
    </div>
  );
};

export default ProductCard;