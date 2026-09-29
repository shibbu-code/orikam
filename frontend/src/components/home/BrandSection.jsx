import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBrands } from "../../services/brandApi";
import BrandCard from "./BrandCard";
import "./BrandSection.css";

const BrandSection = () => {
  const navigate = useNavigate();

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await getBrands();

        setBrands(response.data.brands.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch brands:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  return (
    <section className="brand-section">

      <div className="brand-section-header">

        <div>
          <h2>Featured Brands</h2>
          <p>Explore products from trusted brands</p>
        </div>

        <button
          onClick={() => navigate("/brands")}
          className="view-all-button"
        >
          View All
        </button>

      </div>

      {loading ? (
        <div className="brand-loading">
          Loading brands...
        </div>
      ) : (
        <div className="brand-list">
          {brands.map((brand) => (
            <BrandCard
              key={brand._id}
              brand={brand}
            />
          ))}
        </div>
      )}

    </section>
  );
};

export default BrandSection;