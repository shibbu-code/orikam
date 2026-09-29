import React from "react";
import {
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="footer">
      <div className="footer-main">
        {/* Brand */}
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="footer-logo-icon">O</div>

            <div>
              <div className="footer-brand-name">ORIKAM</div>
              <div className="footer-brand-subtitle">
                DENTAL SYSTEMS
              </div>
            </div>
          </div>

          <p>
            Your trusted platform for dental products,
            equipment, and healthcare supplies.
          </p>

          <div className="footer-socials">
  <button aria-label="Facebook">f</button>
  <button aria-label="Instagram">◎</button>
  <button aria-label="LinkedIn">in</button>
</div>
        </div>

        {/* Quick Links */}
        <div className="footer-column">
          <h3>Quick Links</h3>

          <button onClick={() => navigate("/")}>
            Home
          </button>

          <button onClick={() => navigate("/categories")}>
            Categories
          </button>

          <button onClick={() => navigate("/brands")}>
            Brands
          </button>

          <button onClick={() => navigate("/about")}>
            About Us
          </button>
        </div>

        {/* Customer */}
        <div className="footer-column">
          <h3>Customer</h3>

          <button onClick={() => navigate("/cart")}>
            Cart
          </button>

          <button onClick={() => navigate("/orders")}>
            My Orders
          </button>

          <button onClick={() => navigate("/profile")}>
            My Profile
          </button>

          <button onClick={() => navigate("/contact")}>
            Contact Us
          </button>
        </div>

        {/* Contact */}
        <div className="footer-column footer-contact">
          <h3>Contact Us</h3>

          <div className="footer-contact-item">
            <MapPin size={17} />
            <span>
              MIDC Andheri E,
              <br />
              Mumbai, Maharashtra
            </span>
          </div>

          <div className="footer-contact-item">
            <Phone size={17} />
            <span>+91 98765 43210</span>
          </div>

          <div className="footer-contact-item">
            <Mail size={17} />
            <span>support@orikam.com</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} ORIKAM Dental Systems.
          All rights reserved.
        </p>

        <div className="footer-legal">
          <button>Privacy Policy</button>
          <button>Terms & Conditions</button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;