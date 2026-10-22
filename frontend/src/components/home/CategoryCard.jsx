import React from "react";
import "./CategoryCard.css";
import { useNavigate } from "react-router-dom";

const CategoryCard = ({ category }) => {
  const navigate = useNavigate();
return ( <div className="category-card"
  onClick={() => navigate(`/products?category=${category._id}`)}
  >
{category.image ? ( <img
       src={category.image}
       alt={category.name}
       className="category-image"
     />
) : ( <div className="category-image-placeholder">
{category.name.charAt(0)} </div>
)}


  <div className="category-overlay">
    <h3>{category.name}</h3>
    {category.description && <p>{category.description}</p>}
  </div>
</div>

);
};

export default CategoryCard;
