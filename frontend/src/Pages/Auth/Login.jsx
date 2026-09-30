import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState("customer");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "https://orikam-2.onrender.com/api/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            role,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      const user = data.user;

      // Store user information
      localStorage.setItem("userId", user._id);
      localStorage.setItem("userName", user.name);
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("isLoggedIn", "true");

      // Redirect according to actual account role
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }

    } catch (error) {
      console.error("Login error:", error);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-container">

        {/* Brand */}
        <div className="login-brand">
          <div className="logo-box">
            <Plus size={28} strokeWidth={3} />
          </div>

          <div>
            <div className="brand-title">
              ORIKAM
            </div>

            <div className="brand-subtitle">
              DENTAL SYSTEMS
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="login-heading">
          <h1>Welcome back</h1>

          <p>
            Sign in to access your ORIKAM account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin}>

          {/* Email */}
          <div className="input-group">
            <label>Email address</label>

            <div className="input-wrapper">
              <Mail size={18} />

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />
            </div>
          </div>

          {/* Password */}
          <div className="input-group">
            <label>Password</label>

            <div className="input-wrapper">
              <Lock size={18} />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Role */}
          <div className="role-selection">

            <button
              type="button"
              className={
                role === "customer"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setRole("customer")
              }
            >
              Customer
            </button>

            <button
              type="button"
              className={
                role === "admin"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setRole("admin")
              }
            >
              Admin
            </button>

          </div>

          {/* Error */}
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          {/* Login */}
          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>

        </form>

        {/* Register */}
        <div className="login-footer">
          Don't have an account?{" "}

          <span
            onClick={() =>
              navigate("/register")
            }
          >
            Create account
          </span>
        </div>

      </div>
    </div>
  );
};

export default Login;