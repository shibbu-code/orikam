import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getBrandById,
  updateBrand,
} from "../../../services/brandApi";

import "./EditBrands.css";

const EditBrand = () => {
  const navigate = useNavigate();
  const { brandId } = useParams();

  const userRole = localStorage.getItem("userRole");

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    logo: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userRole !== "admin") return;

    fetchBrand();
  }, [brandId, userRole]);

  const fetchBrand = async () => {
    try {
      const response = await getBrandById(brandId);

      const brand = response.data.brand;

      setFormData({
        name: brand.name || "",
        slug: brand.slug || "",
        description: brand.description || "",
        logo: brand.logo || "",
        isActive: brand.isActive ?? true,
      });
    } catch (error) {
      console.error("Failed to fetch brand:", error);

      alert(
        error.response?.data?.message ||
          "Failed to load brand"
      );

      navigate("/admin/brands");
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

      const response = await updateBrand(brandId, {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        logo: formData.logo,
        isActive: formData.isActive,
      });

      alert(
        response.data.message ||
          "Brand updated successfully"
      );

      navigate("/admin/brands");
    } catch (error) {
      console.error("Update brand error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to update brand"
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
      <div className="edit-brand-loading">
        Loading brand...
      </div>
    );
  }

  return (
    <div className="edit-brand-page">

      <div className="edit-brand-header">

        <div>
          <h1>Edit Brand</h1>
          <p>
            Update brand information and status.
          </p>
        </div>

        <button
          className="edit-brand-back"
          onClick={() =>
            navigate("/admin/brands")
          }
        >
          Back to Brands
        </button>

      </div>

      <form
        className="edit-brand-form"
        onSubmit={handleSubmit}
      >

        <div className="edit-brand-section">

          <h2>Brand Information</h2>

          <div className="edit-brand-group">

            <label>Brand Name</label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleNameChange}
              required
            />

          </div>

          <div className="edit-brand-group">

            <label>Slug</label>

            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
            />

            <small>
              URL-friendly identifier for the brand.
            </small>

          </div>

          <div className="edit-brand-group">

            <label>Description</label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
            />

          </div>

          <div className="edit-brand-group">

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

        <div className="edit-brand-section">

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

            <span>Brand is active</span>

          </label>

        </div>

        <div className="edit-brand-actions">

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
              : "Save Changes"}
          </button>

        </div>

      </form>

    </div>
  );
};

export default EditBrand;