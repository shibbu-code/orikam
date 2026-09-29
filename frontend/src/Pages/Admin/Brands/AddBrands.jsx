import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { addBrand } from "../../../services/brandApi";

import "./AddBrands.css";

const AddBrand = () => {
  const navigate = useNavigate();

  const userRole = localStorage.getItem("userRole");

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    logo: "",
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

  const handleNameChange = (e) => {
    const name = e.target.value;

    setFormData((prev) => ({
      ...prev,
      name,
      slug: name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const response = await addBrand({
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        logo: formData.logo,
        isActive: formData.isActive,
      });

      alert(
        response.data.message ||
          "Brand added successfully"
      );

      navigate("/admin/brands");
    } catch (error) {
      console.error("Add brand error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to add brand"
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
    <div className="add-brand-page">

      <div className="add-brand-header">

        <div>
          <h1>Add Brand</h1>
          <p>
            Add a new brand to your platform.
          </p>
        </div>

        <button
          className="add-brand-back"
          onClick={() =>
            navigate("/admin/brands")
          }
        >
          Back to Brands
        </button>

      </div>

      <form
        className="add-brand-form"
        onSubmit={handleSubmit}
      >

        {/* Brand Information */}

        <div className="add-brand-section">

          <h2>Brand Information</h2>

          <div className="add-brand-group">

            <label>Brand Name</label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="e.g. Dentsply Sirona"
              required
            />

          </div>

          <div className="add-brand-group">

            <label>Slug</label>

            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="dentsply-sirona"
              required
            />

            <small>
              Used as the brand's URL-friendly identifier.
            </small>

          </div>

          <div className="add-brand-group">

            <label>Description</label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe this brand..."
              rows="5"
            />

          </div>

          <div className="add-brand-group">

            <label>Logo URL</label>

            <input
              type="text"
              name="logo"
              value={formData.logo}
              onChange={handleChange}
              placeholder="https://..."
            />

          </div>

        </div>

        {/* Status */}

        <div className="add-brand-section">

          <h2>Status</h2>

          <label className="brand-checkbox">

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
              Brand is active
            </span>

          </label>

        </div>

        {/* Actions */}

        <div className="add-brand-actions">

          <button
            type="button"
            className="brand-cancel-button"
            onClick={() =>
              navigate("/admin/brands")
            }
          >
            Cancel
          </button>

          <button
            type="submit"
            className="brand-save-button"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Add Brand"}
          </button>

        </div>

      </form>

    </div>
  );
};

export default AddBrand;