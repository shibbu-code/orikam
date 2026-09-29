import React, { useEffect, useState } from "react";
import { Heart, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/commen/Navbar";
import ProductCard from "../../components/home/ProductCard";
import { getWishlist } from "../../services/wishlistApi";

import "./Wishlist.css";

const Wishlist = () => {
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    fetchWishlist();
  }, [userId]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);

      const response = await getWishlist(userId);

      setWishlist(response.data.products || []);
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="wishlist-page">
          <div className="wishlist-loading">
            Loading wishlist...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="wishlist-page">

        <div className="wishlist-header">

          <button
            className="wishlist-back"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="wishlist-title">
            <Heart size={28} />
            <div>
              <h1>My Wishlist</h1>
              <p>
                {wishlist.length}{" "}
                {wishlist.length === 1 ? "product" : "products"} saved
              </p>
            </div>
          </div>

        </div>

        {wishlist.length === 0 ? (
          <div className="wishlist-empty">

            <div className="wishlist-empty-icon">
              <Heart size={42} />
            </div>

            <h2>Your wishlist is empty</h2>

            <p>
              Save products you like and easily find them here later.
            </p>

            <button
              onClick={() => navigate("/products")}
              className="wishlist-shop-btn"
            >
              Browse Products
            </button>

          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
              />
            ))}
          </div>
        )}

      </main>
    </>
  );
};

export default Wishlist;