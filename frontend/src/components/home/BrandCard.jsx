import React from "react";
import "./BrandCard.css";

const BrandCard = ({ brand }) => {
  return (
    <div className="brand-card">
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