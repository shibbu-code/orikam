import React from "react";
import "./BrandCard.css";

const BrandCard = ({ brand, onClick }) => {
  return (
    <div className="brand-card"
     onClick={onClick}
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
    }
  }}
    >
      <div className="brand-card-image">
        {brand.logo ? (
          <img
            src={brand.logo}
            alt={brand.name}
          />
        ) : (
          <span>{brand.name.charAt(0)}</span>
        )}
      </div>

      <h3>{brand.name}</h3>
    </div>
  );
};

export default BrandCard;