import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../../services/api";

import "./EditCategory.css";

const EditCategory = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams();

  const userRole = localStorage.getItem("userRole");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userRole !== "admin") return;

    fetchCategory();
  }, [categoryId, userRole]);

  const fetchCategory = async () => {
    try {
      const response = await api.get(
        `/categories/${categoryId}`
      );

      const category = response.data.category;

      setFormData({
        name: category.name || "",
        description: category.description || "",
        image: category.image || "",
        isActive: category.isActive ?? true,
      });
    } catch (error) {
      console.error("Failed to fetch category:", error);

      alert(
        error.response?.data?.message ||
          "Failed to load category"
      );

      navigate("/admin/categories");
    } finally {
      setLoading(false);
    }
  };

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

      const response = await api.put(
        `/categories/${categoryId}`,
        {
          name: formData.name,
          description: formData.description,
          image: formData.image,
          isActive: formData.isActive,
        }
      );

      alert(
        response.data.message ||
          "Category updated successfully"
      );

      navigate("/admin/categories");
    } catch (error) {
      console.error("Update category error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to update category"
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

  if (loading) {
    return (
      <div className="edit-category-loading">
        Loading category...
      </div>
    );
  }

  return (
    <div className="edit-category-page">

      <div className="edit-category-header">

        <div>
          <h1>Edit Category</h1>
          <p>
            Update category information and status.
          </p>
        </div>

        <button
          className="edit-category-back"
          onClick={() =>
            navigate("/admin/categories")
          }
        >
          Back to Categories
        </button>

      </div>

      <form
        className="edit-category-form"
        onSubmit={handleSubmit}
      >

        {/* Category Information */}

        <div className="edit-category-section">

          <h2>Category Information</h2>

          <div className="edit-category-group">

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

          <div className="edit-category-group">

            <label>Description</label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe this category..."
              rows="5"
            />

          </div>

          <div className="edit-category-group">

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

        {/* Status */}

        <div className="edit-category-section">

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

            <span>
              Category is active
            </span>

          </label>

        </div>

        {/* Actions */}

        <div className="edit-category-actions">

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
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>

        </div>

      </form>

    </div>
  );
};

export default EditCategory;