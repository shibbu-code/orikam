import React, { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../../../services/api";

import "./EditAdminProfile.css";

const EditAdminProfile = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    const userId = localStorage.getItem("userId");

    if (userRole !== "admin" || !userId) {
      navigate("/");
      return;
    }

    fetchProfile(userId);
  }, [navigate]);

  const fetchProfile = async (userId) => {
    try {
      const response = await api.get(
        `/users/${userId}`
      );

      const user = response.data.user;

      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    } catch (error) {
      console.error("Fetch profile error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load profile"
      );
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
      setError("");
      setSuccess("");

      const userId =
        localStorage.getItem("userId");

      const response = await api.put(
        `/users/${userId}/profile`,
        formData
      );

      const updatedUser = response.data.user;

      // Keep localStorage in sync
      localStorage.setItem(
        "userName",
        updatedUser.name
      );

      localStorage.setItem(
        "userEmail",
        updatedUser.email
      );

      setSuccess(
        "Profile updated successfully."
      );

      setTimeout(() => {
        navigate("/admin/profile");
      }, 800);
    } catch (error) {
      console.error(
        "Update profile error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-admin-profile">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="edit-admin-profile">
      <div className="edit-profile-header">
        <button
          className="edit-back-btn"
          onClick={() =>
            navigate("/admin/profile")
          }
        >
          <ArrowLeft size={18} />
          Back to Profile
        </button>

        <div>
          <h1>Edit Profile</h1>
          <p>
            Update your administrator account
            information
          </p>
        </div>
      </div>

      <form
        className="edit-profile-card"
        onSubmit={handleSubmit}
      >
        <div className="form-group">
          <label>Full Name</label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            required
          />
        </div>

        <div className="form-group">
          <label>Email Address</label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="form-group">
          <label>Phone Number</label>

          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
          />
        </div>

        {error && (
          <div className="edit-profile-error">
            {error}
          </div>
        )}

        {success && (
          <div className="edit-profile-success">
            {success}
          </div>
        )}

        <div className="edit-profile-actions">
          <button
            type="button"
            className="cancel-profile-btn"
            onClick={() =>
              navigate("/admin/profile")
            }
          >
            Cancel
          </button>

          <button
            type="submit"
            className="save-profile-btn"
            disabled={saving}
          >
            <Save size={17} />

            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditAdminProfile;