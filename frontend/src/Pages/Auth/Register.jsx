import React, { useState } from "react";
import { Eye, EyeOff, Gift } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Register.css";

const Register = () => {
const navigate = useNavigate();
const [searchParams] = useSearchParams();

const referralFromUrl = searchParams.get("ref") || "";

const [formData, setFormData] = useState({
name: "",
email: "",
password: "",
phone: "",
referralCode: referralFromUrl.trim().toUpperCase(),
});

const [showPassword, setShowPassword] = useState(false);
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

const handleChange = (e) => {
const { name, value } = e.target;


setFormData((previous) => ({
  ...previous,
  [name]: name === "referralCode" ? value.toUpperCase() : value,
}));
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/users/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          referralCode: formData.referralCode.trim().toUpperCase(),
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    const user = data.user;
    localStorage.setItem("userId", user._id);
    localStorage.setItem("userName", user.name);
    localStorage.setItem("userEmail", user.email);
    localStorage.setItem("userRole", user.role);
    localStorage.setItem("isLoggedIn", "true");
    navigate("/");
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="register-page">
      <div className="register-container">

        <div className="register-brand">
          <div className="logo-box">O</div>

          <div>
            <div className="brand-title">ORIKAM</div>
            <div className="brand-subtitle">DENTAL SYSTEMS</div>
          </div>
        </div>

        <div className="register-heading">
          <h1>Create account</h1>
          <p>Register to start shopping with ORIKAM</p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="input-group">
            <label>Name</label>

            <div className="input-wrapper">
             

              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Email</label>

            <div className="input-wrapper">
              

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Phone</label>

            <div className="input-wrapper">
              
              <input
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

<div className="input-group">
  <label htmlFor="referralCode">
    Referral Code <span className="optional-label">(Optional)</span>
  </label>

  <div className="input-wrapper referral-input-wrapper">
    <Gift size={18} className="referral-icon" />

    <input
      type="text"
      id="referralCode"
      name="referralCode"
      placeholder="Enter referral code"
      value={formData.referralCode}
      onChange={handleChange}
      autoComplete="off"
    />
  </div>

  <small className="input-hint">
    Have a referral code? Enter it to join ORIKAM.
  </small>
</div>


          <div className="input-group">
            <label>Password</label>

            <div className="input-wrapper">
             

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {error && <div className="register-error">{error}</div>}

          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="register-footer">
          Already have account{" "}
          <span onClick={() => navigate("/login")}>
            Sign in
          </span>
        </div>

      </div>
    </div>
  );
};

export default Register;
