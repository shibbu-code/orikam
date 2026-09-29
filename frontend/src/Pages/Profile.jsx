import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Package,
  LogOut,
  ShoppingBag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/commen/Navbar";

import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/users/${userId}`
      );

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
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

  if (!user) {
    return (
      <div className="profile-page">
        <Navbar />

        <div className="profile-loading">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Navbar />

      <main className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            <User size={32} />
          </div>

          <div>
            <h1>{user.name}</h1>
            <p>{user.email}</p>
          </div>
        </div>

        <div className="profile-layout">
          {/* ACCOUNT INFORMATION */}

          <section className="profile-card">
            <div className="profile-card-header">
              <h2>Account Information</h2>
            </div>

            <div className="profile-info-list">
              <div className="profile-info-item">
                <div className="profile-info-icon">
                  <User size={18} />
                </div>

                <div>
                  <span>Full Name</span>
                  <strong>{user.name}</strong>
                </div>
              </div>

              <div className="profile-info-item">
                <div className="profile-info-icon">
                  <Mail size={18} />
                </div>

                <div>
                  <span>Email</span>
                  <strong>{user.email}</strong>
                </div>
              </div>

              <div className="profile-info-item">
                <div className="profile-info-icon">
                  <Phone size={18} />
                </div>

                <div>
                  <span>Phone</span>
                  <strong>
                    {user.phone || "Not provided"}
                  </strong>
                </div>
              </div>
            </div>
          </section>

          {/* QUICK LINKS */}

          <section className="profile-card">
            <div className="profile-card-header">
              <h2>Quick Access</h2>
            </div>

            <div className="profile-links">
              <button
                onClick={() => navigate("/orders")}
              >
                <Package size={20} />

                <div>
                  <strong>My Orders</strong>
                  <span>
                    View and track your orders
                  </span>
                </div>
              </button>

              <button
                onClick={() => navigate("/products")}
              >
                <ShoppingBag size={20} />

                <div>
                  <strong>Continue Shopping</strong>
                  <span>
                    Browse dental products
                  </span>
                </div>
              </button>
            </div>
          </section>

          {/* LOGOUT */}

          <section className="profile-card logout-card">
            <button
              className="logout-button"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              Logout
            </button>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Profile;