import React, { useState } from "react";
import {
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

const handleLogin = async (e) => {
e.preventDefault();
setError("");


if (!email.trim() || !password) {
  setError("Please enter email and password");
  return;
}

try {
  setLoading(true);

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/users/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    setError(data.message || "Login failed");
    return;
  }

  const user = data.user;

  if (!user?._id || !user?.role) {
    setError("Invalid login response. Please try again.");
    return;
  }

  // Save authenticated user information
  localStorage.setItem("userId", user._id);
  localStorage.setItem("userName", user.name || "");
  localStorage.setItem("userEmail", user.email || "");
  localStorage.setItem("userRole", user.role);
  localStorage.setItem("isLoggedIn", "true");

  // Redirect using the role returned by the backend
  if (user.role === "admin") {
    navigate("/admin", { replace: true });
  } else if (user.role === "customer") {
    navigate("/", { replace: true });
  } else {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("isLoggedIn");

    setError("Your account has an invalid role.");
  }
} catch (error) {
  console.error("Login error:", error);
  setError("Unable to connect to server");
} finally {
  setLoading(false);
}


};

return ( <div className="login-page"> <div className="login-container">
{/* Brand */} <div className="login-brand"> <div className="logo-box"> <Plus size={28} strokeWidth={3} /> </div>

      <div>
        <div className="brand-title">ORIKAM</div>
        <div className="brand-subtitle">
          DENTAL SYSTEMS
        </div>
      </div>
    </div>

    {/* Heading */}
    <div className="login-heading">
      <h1>Welcome back</h1>
      <p>Sign in to access your ORIKAM account</p>
    </div>

    {/* Login Form */}
    <form onSubmit={handleLogin}>
      {/* Email */}
      <div className="input-group">
        <label htmlFor="login-email">
          Email address
        </label>

        <div className="input-wrapper">
          <input
            id="login-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
      </div>

      {/* Password */}
      <div className="input-group">
        <label htmlFor="login-password">
          Password
        </label>

        <div className="input-wrapper">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <button
            type="button"
            className="password-toggle"
            onClick={() =>
              setShowPassword((previous) => !previous)
            }
            aria-label={
              showPassword ? "Hide password" : "Show password"
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

      {/* Error */}
      {error && (
        <div className="login-error" role="alert">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        className="login-button"
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>

    {/* Register */}
    <div className="login-footer">
      Don't have an account?{" "}
      <span onClick={() => navigate("/register")}>
        Create account
      </span>
    </div>
  </div>
</div>


);
};

export default Login;
