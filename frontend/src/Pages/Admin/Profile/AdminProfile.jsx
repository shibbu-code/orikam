import React, { useEffect, useState } from "react";
import { User, Mail, Phone, Shield, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../../../services/api";

import "./AdminProfile.css";

const AdminProfile = () => {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    const userId = localStorage.getItem("userId");

    if (userRole !== "admin" || !userId) {
      navigate("/");
      return;
    }

    fetchAdmin(userId);
  }, [navigate]);

  const fetchAdmin = async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);

      setAdmin(response.data.user);
    } catch (error) {
      console.error("Fetch admin profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("isLoggedIn");

    navigate("/login");
  };

  if (loading) {
    return (
      <div className="admin-profile-page">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="admin-profile-page">
        <p>Unable to load profile.</p>
      </div>
    );
  }

  return (
    <div className="admin-profile-page">
      <div className="admin-profile-header">
        <div>
          <h1>Admin Profile</h1>
          <p>Manage your administrator account</p>
        </div>

        <button
          className="admin-logout-btn"
          onClick={handleLogout}
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>

      <div className="admin-profile-card">
        <div className="admin-profile-avatar">
          {admin.name?.charAt(0)?.toUpperCase()}
        </div>

        <div className="admin-profile-main">
          <h2>{admin.name}</h2>

          <span className="admin-role-badge">
            <Shield size={14} />
            Administrator
          </span>
        </div>
      </div>

      <div className="admin-info-card">
        <div className="admin-card-title">
          <h2>Account Information</h2>
        </div>

        <div className="admin-info-grid">
          <div className="admin-info-item">
            <Mail size={18} />

            <div>
              <span>Email</span>
              <strong>{admin.email}</strong>
            </div>
          </div>

          <div className="admin-info-item">
            <Phone size={18} />

            <div>
              <span>Phone</span>
              <strong>
                {admin.phone || "Not provided"}
              </strong>
            </div>
          </div>

          <div className="admin-info-item">
            <User size={18} />

            <div>
              <span>Name</span>
              <strong>{admin.name}</strong>
            </div>
          </div>

          <div className="admin-info-item">
            <Shield size={18} />

            <div>
              <span>Account Role</span>
              <strong>Administrator</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-profile-actions">
        <button
          onClick={() =>
            navigate("/admin/profile/edit")
          }
        >
          Edit Profile
        </button>

        <button
          onClick={() =>
            navigate("/admin/profile/password")
          }
        >
          Change Password
        </button>
      </div>
    </div>
  );
};

export default AdminProfile;