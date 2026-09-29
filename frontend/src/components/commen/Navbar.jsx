import React, { useEffect, useState } from "react";
import { ShoppingCart, User, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  const userId = localStorage.getItem("userId");

  // Fetch logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;

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

    fetchUser();
  }, [userId]);

  // Fetch cart
  useEffect(() => {
    const fetchCart = async () => {
      if (!userId) return;

      try {
        const response = await fetch(
          `http://localhost:3000/api/cart/${userId}`
        );

        const data = await response.json();

        if (response.ok) {
          const totalItems =
            data.cart?.items?.reduce(
              (total, item) => total + item.quantity,
              0
            ) || 0;

          setCartCount(totalItems);
        }
      } catch (error) {
        console.error("Failed to fetch cart:", error);
      }
    };

    fetchCart();
  }, [userId]);

  return (
    <header className="navbar">

      {/* Logo */}
      <div
        className="navbar-logo"
        onClick={() => navigate("/")}
      >
        <div className="navbar-logo-icon">O</div>

        <div>
          <div className="navbar-brand">ORIKAM</div>
          <div className="navbar-subtitle">DENTAL SYSTEMS</div>
        </div>
      </div>

      {/* Address */}
      

      {/* Right side */}
      <div className="navbar-actions">
         <button
  className="navbar-icon-btn"
  onClick={() => navigate("/wishlist")}
  title="Wishlist"
>
  <Heart size={21} />
</button>
        {/* Cart */}
        <button
          className="navbar-icon-button"
          onClick={() => navigate("/cart")}
        >
          <ShoppingCart size={22} />

          {cartCount > 0 && (
            <span className="cart-badge">
              {cartCount}
            </span>
          )}
        </button>

        {/* Profile */}
        <button
          className="navbar-profile"
          onClick={() => navigate("/profile")}
        >
          <div className="profile-icon">
            <User size={19} />
          </div>

          <div className="profile-info">
            <span className="profile-name">
              {user?.name || "Guest"}
            </span>

            <span className="profile-email">
              {user?.email || "Sign in"}
            </span>
          </div>
        </button>

      </div>

    </header>
  );
};

export default Navbar;