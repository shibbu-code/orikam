import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
ArrowLeft,
Edit,
Layers3,
Tag,
CalendarDays,
} from "lucide-react";

import "./ViewCategory.css";

const AdminCategoryDetails = () => {
const { categoryId } = useParams();
const navigate = useNavigate();

const [category, setCategory] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
const fetchCategory = async () => {
try {
setLoading(true);
setError("");


    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/categories/${categoryId}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to load category details."
      );
    }

    const fetchedCategory = data.category || data;

    if (!fetchedCategory?._id) {
      throw new Error("Category not found.");
    }

    setCategory(fetchedCategory);
  } catch (err) {
    console.error("Fetch category error:", err);
    setError(err.message || "Unable to load category.");
  } finally {
    setLoading(false);
  }
};

fetchCategory();


}, [categoryId]);

if (loading) {
return ( <div className="admin-category-details-state">
Loading category details... </div>
);
}

if (error || !category) {
return ( <div className="admin-category-details-state"> <p>{error || "Category not found."}</p>


    <button onClick={() => navigate("/admin/categories")}>
      <ArrowLeft size={16} />
      Back to Categories
    </button>
  </div>
);


}

return ( <div className="admin-category-details-page"> <div className="category-details-header">
<button
className="category-details-back"
onClick={() => navigate("/admin/categories")}
> <ArrowLeft size={18} />
Back to Categories </button>

```
    <button
      className="category-details-edit"
      onClick={() =>
        navigate(`/admin/categories/edit/${category._id}`)
      }
    >
      <Edit size={16} />
      Edit Category
    </button>
  </div>

  <div className="category-details-title">
    <div>
      <span className="category-details-eyebrow">
        CATEGORY DETAILS
      </span>

      <h1>{category.name}</h1>

      <p>Category ID: {category._id}</p>
    </div>

    <span
      className={`category-details-status ${
        category.isActive ? "active" : "inactive"
      }`}
    >
      {category.isActive ? "Active" : "Inactive"}
    </span>
  </div>

  <div className="category-details-grid">
    <section className="category-details-card category-image-card">
      <h2>Category Image</h2>

      <div className="category-details-image">
        {category.image ? (
          <img
            src={category.image}
            alt={category.name}
          />
        ) : (
          <Layers3 size={64} />
        )}
      </div>
    </section>

    <section className="category-details-card">
      <h2>Basic Information</h2>

      <div className="category-info-row">
        <span>
          <Tag size={16} />
          Category Name
        </span>
        <strong>{category.name || "—"}</strong>
      </div>

      <div className="category-info-row">
        <span>
          <Layers3 size={16} />
          Category ID
        </span>
        <strong>{category._id}</strong>
      </div>

      <div className="category-info-row">
        <span>
          <CalendarDays size={16} />
          Created
        </span>
        <strong>
          {category.createdAt
            ? new Date(category.createdAt).toLocaleDateString("en-IN")
            : "—"}
        </strong>
      </div>
    </section>

    <section className="category-details-card category-description-card">
      <h2>Description</h2>

      <p>
        {category.description || "No description available."}
      </p>
    </section>
  </div>
</div>


);
};

export default AdminCategoryDetails;
