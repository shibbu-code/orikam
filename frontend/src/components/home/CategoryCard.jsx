import React from "react";
import "./CategoryCard.css";

const CategoryCard = ({ category }) => {
  return (
    <div className="category-card">
      <div className="category-image-wrapper">
        {category.image ? (
          <img
            src={category.image}
            alt={category.name}
            className="category-image"
          />
        ) : (
          <div className="category-image-placeholder">
            {category.name.charAt(0)}
          </div>
        )}
      </div>

      <h3>{category.name}</h3>
    </div>
  );
};

export default CategoryCard;