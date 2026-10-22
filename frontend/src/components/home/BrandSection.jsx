import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBrands } from "../../services/brandApi";
import { ArrowRight } from "lucide-react";
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

        setBrands(response.data.brands.slice(0, 6));
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
          className="category-view-all"
          onClick={() => navigate("/brands")}
        >
          View All
          <ArrowRight size={18} />
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
               onClick={() => navigate(`/products?brand=${brand._id}`)}
            />
          ))}
        </div>
      )}

    </section>
  );
};

export default BrandSection;