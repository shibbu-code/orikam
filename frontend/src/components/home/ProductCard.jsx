
import React, { useEffect, useState } from "react";
import { ShoppingCart, Heart, Coins, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../../services/wishlistApi";

import "./ProductCard.css";

const ProductCard = ({ product, onAddToCart }) => {
  const navigate = useNavigate();
  const [membershipTier, setMembershipTier] = useState("Silver");
  const [isWishlisted, setIsWishlisted] = useState(false);

  const [isAdding, setIsAdding] = useState(false);
const [isAdded, setIsAdded] = useState(false);

  const image =
    product.images?.[0] ||
    product.logo ||
    "";

  const userId = localStorage.getItem("userId");

  // Estimate coins using the product's B2B price.
  const productPrice =
    Number(product.b2bPrice) > 0
      ? Number(product.b2bPrice)
      : Number(product.price) || 0;

  const quantity = Math.max(1, Number(product.moq) || 1);

  const estimatedCoins = Math.floor(
    (productPrice * quantity) / 100
  );

  const estimatedCoinValue = estimatedCoins / 10;

  const handleAddToCart = async (e) => {
  e.stopPropagation();

  if (isAdding) return;

  setIsAdding(true);

  try {
    await onAddToCart(product._id, product.moq || 1);
    setIsAdded(true);

    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  } catch (error) {
    console.error("Failed to add product to cart:", error);
  } finally {
    setIsAdding(false);
  }
};
  // Check whether this product is already in wishlist.
  useEffect(() => {
    const checkWishlist = async () => {
      if (!userId || !product?._id) return;

      try {
        const response = await getWishlist(userId);
        const wishlistProducts = response.data.products || [];

        setIsWishlisted(
          wishlistProducts.some(
            (item) => item._id === product._id
          )
        );
      } catch (error) {
        console.error("Failed to check wishlist:", error);
      }
    };

    checkWishlist();
  }, [userId, product?._id]);

  // Add or remove product from wishlist.
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
  useEffect(() => {
  const fetchMembership = async () => {
    if (!userId) return;

    try {
      const response = await api.get(
        `/api/membership/my/${userId}`
      );

      const data = response.data;
      const tier =
        data.membership?.plan?.name ||
        data.membership?.name ||
        data.plan?.name ||
        data.planName;

      if (
        ["Silver", "Gold", "Platinum", "Diamond"].includes(tier)
      ) {
        setMembershipTier(tier);
      }
    } catch (error) {
      console.error("Failed to fetch membership tier:", error);
    }
  };

  fetchMembership();
}, [userId]);

  return (
    <div className="product-card">
      {/* Product Image */}
      <div
        className="product-image-wrapper"
        onClick={() => navigate(`/products/${product._id}`)}
      >
        <button
          className={`product-wishlist-btn ${
            isWishlisted ? "active" : ""
          }`}
          onClick={handleWishlist}
          aria-label={
            isWishlisted ? "Already in wishlist" : "Add to wishlist"
          }
        >
          <Heart
            size={19}
            fill={isWishlisted ? "currentColor" : "none"}
          />
        </button>

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
        {/* Product Rating */}

      </div>

      {/* Product Content */}
      <div className="product-card-content">
        <p className="product-brand">
          {product.brand?.name || "ORIKAM"}
        </p>

        <h3
          className="product-name"
          onClick={() => navigate(`/products/${product._id}`)}
        >
          {product.name}
        </h3>
        <div className="product-rating">
  <div className="product-rating-stars">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={15}
        fill={star <= Math.round(Number(product.rating) || 0) ? "#f59e0b" : "none"}
        color={
          star <= Math.round(Number(product.rating) || 0)
            ? "#f59e0b"
            : "#d1d5db"
        }
      />
    ))}
  </div>

  <span className="product-rating-value">
    {Number(product.rating) > 0
      ? Number(product.rating).toFixed(1)
      : "No ratings"}
  </span>
</div>

        {/* Estimated Coins */}
        <div className="product-coin-reward">
          <div className="product-coin-line">
            <span
  className={`product-coin-icon coin-${membershipTier.toLowerCase()}`}
  title={`${membershipTier} membership coins`}
>
  <Coins size={18} strokeWidth={2.2} />
</span>
            <span>
              Earn <strong>{estimatedCoins} coins</strong>
            </span>
          </div>

          <span className="product-coin-discount">
            Worth ₹{estimatedCoinValue.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        <div className="product-bottom">
          <span className="product-price">
            ₹{productPrice.toLocaleString("en-IN")}
          </span>

          <button
  className={`product-cart-button ${isAdded ? "product-cart-added" : ""}`}
  onClick={handleAddToCart}
  disabled={isAdding}
>
  <ShoppingCart size={17} />
  {isAdding ? "Adding..." : isAdded ? "Added ✓" : "Add"}
</button>
        </div>

       
      </div>
    </div>
  );
};

export default ProductCard;

