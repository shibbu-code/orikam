import React, { useEffect, useState } from "react";
import {
User,
Mail,
Phone,
Package,
LogOut,
ShoppingBag,
Clock,
CheckCircle,
ArrowRight,
ShieldCheck,
Crown,
CalendarDays,
LayoutDashboard,
RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/home/Footer";
import Navbar from "../components/commen/Navbar";
import "./Profile.css";

const Profile = () => {
const navigate = useNavigate();

const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

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
setLoading(true);
setError("");

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/users/${userId}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load your profile.");
  }

  setUser(data.user);
  
} catch (err) {
  console.error("Failed to fetch user:", err);
  setError(err.message || "Unable to load your profile.");
} finally {
  setLoading(false);
}


};

const handleLogout = () => {
[
"userId",
"userName",
"userEmail",
"userRole",
"isLoggedIn",
].forEach((key) => localStorage.removeItem(key));

navigate("/login");


};

if (loading) {
return ( <div className="profile-page"> <Navbar /> <div className="profile-message"> <RefreshCw size={24} className="profile-spin" /> <p>Loading your profile...</p> </div> </div>
);
}

if (error || !user) {
return ( <div className="profile-page"> <Navbar /> <div className="profile-message"> <User size={30} /> <h2>Unable to load profile</h2> <p>{error || "Your profile could not be found."}</p> <button className="profile-primary-btn" onClick={fetchUser}>
Try Again </button> </div> </div>
);
}

// Membership information
const membership = user.membership;

const isMembershipActive =
String(membership?.status || "").toLowerCase() === "active" &&
membership?.endDate &&
new Date(membership.endDate).getTime() > Date.now();

// The backend should populate membership.plan.
// It may then be an object containing the plan name instead of an ObjectId.
const plan = membership?.plan;

const rawTier =
typeof plan === "object" && plan !== null
? plan.tier || plan.name || plan.planName || plan.title
: membership?.tier ||
membership?.planName ||
membership?.membershipType;

const validTiers = ["Silver", "Gold", "Platinum", "Diamond"];

const matchingTier = validTiers.find(
(tier) => tier.toLowerCase() === String(rawTier || "").toLowerCase()
);

const membershipTier = isMembershipActive
? matchingTier || "Member"
: "Free";

const joinedDate = user.createdAt
? new Date(user.createdAt).toLocaleDateString("en-IN", {
month: "long",
year: "numeric",
})
: null;

const initials = (user.name || "U")
.trim()
.split(/\s+/)
.slice(0, 2)
.map((part) => part[0])
.join("")
.toUpperCase();

return ( <div className="profile-page"> <Navbar />


  <main className="profile-container">
    {/* PAGE HEADING */}
    <div className="profile-page-heading">
      <div>
        <span className="profile-eyebrow">MY ACCOUNT</span>
        <h1>Account Dashboard</h1>
        <p>
          Manage your profile and keep track of your ORIKAM activity.
        </p>
      </div>

      <button
        className="profile-outline-btn"
        onClick={() => navigate("/products")}
      >
        <ShoppingBag size={17} />
        Explore Products
      </button>
    </div>

    {/* PROFILE HERO */}
    <section className="profile-hero">
      <div className="profile-hero-main">
        <div className="profile-avatar">{initials}</div>

        <div className="profile-hero-details">
          <span className="profile-welcome">WELCOME BACK</span>
          <h2>{user.name}</h2>

          <p>
            <Mail size={15} />
            {user.email}
          </p>

          <div className="profile-badges">
            
          </div>
        </div>
      </div>

      <div className="profile-hero-side">
        {joinedDate && (
          <div className="profile-joined">
            <CalendarDays size={17} />
            <div>
              <span>Customer since</span>
              <strong>{joinedDate}</strong>
            </div>
          </div>
        )}

        <button
          className="profile-membership-btn"
          onClick={() => navigate("/membership")}
        >
          {isMembershipActive
            ? "View Membership"
            : "Explore Membership"}
          <ArrowRight size={16} />
        </button>
      </div>
    </section>

    {/* QUICK STAT CARDS */}
    <section className="profile-stats">
      <button
        className="profile-stat-card"
        onClick={() => navigate("/orders")}
      >
        <div className="profile-stat-icon red">
          <Package size={21} />
        </div>

        <div className="profile-stat-content">
          <span>My Orders</span>
          <strong>View all</strong>
          <small>Review your purchases</small>
        </div>

        <ArrowRight className="profile-stat-arrow" size={17} />
      </button>

      <button
        className="profile-stat-card"
        onClick={() => navigate("/orders")}
      >
        <div className="profile-stat-icon orange">
          <Clock size={21} />
        </div>

        <div className="profile-stat-content">
          <span>Order Tracking</span>
          <strong>Track orders</strong>
          <small>Check delivery progress</small>
        </div>

        <ArrowRight className="profile-stat-arrow" size={17} />
      </button>

      <button
        className="profile-stat-card"
        onClick={() => navigate("/products")}
      >
        <div className="profile-stat-icon green">
          <CheckCircle size={21} />
        </div>

        <div className="profile-stat-content">
          <span>Shopping</span>
          <strong>Browse products</strong>
          <small>Discover more products</small>
        </div>

        <ArrowRight className="profile-stat-arrow" size={17} />
      </button>
    </section>

    {/* MAIN CONTENT */}
    <div className="profile-content-grid">
      {/* PERSONAL INFORMATION */}
      <section className="profile-card">
        <div className="profile-section-heading">
          <div className="profile-section-icon">
            <User size={19} />
          </div>

          <div>
            <h2>Personal Information</h2>
            <p>Your registered account details</p>
          </div>
        </div>

        <div className="profile-detail-list">
          <div className="profile-detail-item">
            <div className="profile-detail-icon">
              <User size={18} />
            </div>

            <div>
              <span>Full Name</span>
              <strong>{user.name || "Not provided"}</strong>
            </div>
          </div>

          <div className="profile-detail-item">
            <div className="profile-detail-icon">
              <Mail size={18} />
            </div>

            <div>
              <span>Email Address</span>
              <strong>{user.email || "Not provided"}</strong>
            </div>
          </div>

          <div className="profile-detail-item">
            <div className="profile-detail-icon">
              <Phone size={18} />
            </div>

            <div>
              <span>Phone Number</span>
              <strong>{user.phone || "Not provided"}</strong>
            </div>
          </div>

          <div className="profile-detail-item">
            <div className="profile-detail-icon">
              <Crown size={18} />
            </div>

            <div>
              <span>Membership Plan</span>
              <strong>{membershipTier}</strong>
            </div>
          </div>
        </div>

        <div className="profile-card-footer">
          <span>Keep your account information up to date.</span>
        </div>
      </section>

      {/* QUICK ACCESS */}
      <section className="profile-card">
        <div className="profile-section-heading">
          <div className="profile-section-icon">
            <LayoutDashboard size={19} />
          </div>

          <div>
            <h2>Quick Access</h2>
            <p>Everything you need in one place</p>
          </div>
        </div>

        <div className="profile-quick-links">
          <button onClick={() => navigate("/orders")}>
            <div className="profile-quick-icon">
              <Package size={19} />
            </div>

            <div>
              <strong>My Orders</strong>
              <span>View order history and status</span>
            </div>

            <ArrowRight size={17} />
          </button>

          <button onClick={() => navigate("/products")}>
            <div className="profile-quick-icon">
              <ShoppingBag size={19} />
            </div>

            <div>
              <strong>Continue Shopping</strong>
              <span>Browse our product catalogue</span>
            </div>

            <ArrowRight size={17} />
          </button>

          <button onClick={() => navigate("/membership")}>
            <div className="profile-quick-icon">
              <Crown size={19} />
            </div>

            <div>
              <strong>Membership & Rewards</strong>
              <span>Explore member benefits and plans</span>
            </div>

            <ArrowRight size={17} />
          </button>
        </div>
      </section>
    </div>

    {/* ACCOUNT SECURITY / LOGOUT */}
    <section className="profile-bottom-card">
      <div className="profile-bottom-icon">
        <ShieldCheck size={22} />
      </div>

      <div className="profile-bottom-text">
        <h3>Your account, your control</h3>
        <p>
          Always sign out when using a shared or public device.
        </p>
      </div>

      <button className="profile-logout-btn" onClick={handleLogout}>
        <LogOut size={17} />
        Logout
      </button>
    </section>
  </main>

  <Footer />
</div>


);
};

export default Profile;
