import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../../services/api";

import "./AddCategory.css";

const AddCategory = () => {
  const navigate = useNavigate();

  const userRole = localStorage.getItem("userRole");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    isActive: true,
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const response = await api.post("/categories", {
        name: formData.name,
        description: formData.description,
        image: formData.image,
        isActive: formData.isActive,
      });

      alert(
        response.data.message || "Category added successfully"
      );

      navigate("/admin/categories");
    } catch (error) {
      console.error("Add category error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to add category"
      );
    } finally {
      setSaving(false);
    }
  };

  if (userRole !== "admin") {
    return (
      <div className="admin-access-denied">
        <h2>Access Denied</h2>

        <button onClick={() => navigate("/")}>
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="add-category-page">

      <div className="add-category-header">
        <div>
          <h1>Add Category</h1>
          <p>Create a new product category.</p>
        </div>

        <button
          className="add-category-back"
          onClick={() => navigate("/admin/categories")}
        >
          Back to Categories
        </button>
      </div>

      <form
        className="add-category-form"
        onSubmit={handleSubmit}
      >

        <div className="add-category-section">

          <h2>Category Information</h2>

          <div className="add-category-group">
            <label>Category Name</label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Dental Handpieces"
              required
            />
          </div>

          <div className="add-category-group">
            <label>Description</label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe this category..."
              rows="5"
            />
          </div>

          <div className="add-category-group">
            <label>Image URL</label>

            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

        </div>

        <div className="add-category-section">

          <h2>Status</h2>

          <label className="category-checkbox">

            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isActive: e.target.checked,
                }))
              }
            />

            <span>Category is active</span>

          </label>

        </div>

        <div className="add-category-actions">

          <button
            type="button"
            className="category-cancel-button"
            onClick={() =>
              navigate("/admin/categories")
            }
          >
            Cancel
          </button>

          <button
            type="submit"
            className="category-save-button"
            disabled={saving}
          >
            {saving ? "Saving..." : "Add Category"}
          </button>

        </div>

      </form>

    </div>
  );
};

export default AddCategory;