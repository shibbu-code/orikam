import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCategories } from "../../services/categoryApi";
import CategoryCard from "./CategoryCard";
import "./CategorySection.css";

const CategorySection = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories(5);

        setCategories(response.data.categories || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="category-section">
      <div className="category-section-header">
        <div>
          <h2>Shop by Category</h2>
          <p>Explore our dental product categories</p>
        </div>

        <button
          className="category-view-all"
          onClick={() => navigate("/categories")}
        >
          View All
          <ArrowRight size={18} />
        </button>
      </div>

      {loading ? (
        <div className="category-loading">
          Loading categories...
        </div>
      ) : categories.length === 0 ? (
        <div className="category-empty">
          No categories available.
        </div>
      ) : (
        <div className="category-list">
          {categories.map((category) => (
            <CategoryCard
              key={category._id}
              category={category}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default CategorySection;