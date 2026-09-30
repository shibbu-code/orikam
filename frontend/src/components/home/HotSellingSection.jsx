import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getHotSellingProducts } from "../../services/productApi";
import ProductCard from "./ProductCard";

import "./HotSellingSection.css";

const HotSellingSection = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getHotSellingProducts();

        setProducts(response.data.products || []);
      } catch (error) {
        console.error(
          "Failed to fetch hot selling products:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (productId) => {
    if (!userId) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        "https://orikam-2.onrender.com/api/cart/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            productId,
            quantity: 1,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to add product to cart"
        );
      }

      alert("Product added to cart");
    } catch (error) {
      console.error("Add to cart failed:", error);
      alert(error.message);
    }
  };

  return (
    <section className="hot-selling-section">
      <div className="hot-selling-header">
        <div>
          <h2>Hot Selling Products</h2>
          <p>Popular dental products chosen by our customers</p>
        </div>

        <button
          className="hot-selling-view-all"
          onClick={() => navigate("/products")}
        >
          View All
          <ArrowRight size={18} />
        </button>
      </div>

      {loading ? (
        <div className="hot-selling-loading">
          Loading products...
        </div>
      ) : products.length === 0 ? (
        <div className="hot-selling-empty">
          No products available.
        </div>
      ) : (
        <div className="hot-selling-list">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HotSellingSection;