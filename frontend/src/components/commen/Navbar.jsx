import React, { useEffect, useState, useRef } from "react";
import {
ShoppingCart,
User,
Heart,
Search,
X,
ChevronDown,
Coins,
Crown,
Package,
LogOut,
CircleUserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import api from "../../services/api";

const Navbar = () => {
const navigate = useNavigate();

const [profileOpen, setProfileOpen] = useState(false);
const [membershipTier, setMembershipTier] = useState("Free");
const [totalCoins, setTotalCoins] = useState(0);

const profileRef = useRef(null);

const [search, setSearch] = useState("");
const [user, setUser] = useState(null);
const [cartCount, setCartCount] = useState(0);

const userId = localStorage.getItem("userId");


useEffect(() => {
  if (!userId) {
    // 1. Logged-out user
    setMembershipTier("Guest");
    setTotalCoins(0);
    return;
  }

  const fetchMembershipInfo = async () => {
    try {
      const [membershipResponse, walletResponse] = await Promise.all([
        api.get(`/api/membership/my/${userId}`),
        api.get(`/api/membership/wallet/${userId}`),
      ]);

      const membership =
        membershipResponse.data?.membership ||
        membershipResponse.data?.data?.membership ||
        membershipResponse.data?.data ||
        null;

      const wallet =
        walletResponse.data?.wallet ||
        walletResponse.data?.data?.wallet ||
        walletResponse.data?.data ||
        null;

      const isActive =
        membership?.status === "active" &&
        membership?.endDate &&
        new Date(membership.endDate) > new Date();

      // 2. No membership → Free
      // 3. Active membership → Actual tier
      if (isActive) {
        const plan = membership.plan;

        const tier =
          typeof plan === "object"
            ? plan?.name || plan?.tier
            : typeof plan === "string"
            ? plan
            : null;

        setMembershipTier(tier || "Free");
      } else {
        setMembershipTier("Free");
      }

      setTotalCoins(Math.max(0, Number(wallet?.balance) || 0));
    } catch (error) {
      // 4. Membership request fails → Free
      console.error("Failed to fetch membership information:", error);
      setMembershipTier("Free");
      setTotalCoins(0);
    }
  };

  fetchMembershipInfo();
}, [userId]);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      profileRef.current &&
      !profileRef.current.contains(event.target)
    ) {
      setProfileOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

const handleLogout = () => {
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userRole");
  localStorage.removeItem("isLoggedIn");

  setUser(null);
  setProfileOpen(false);

  navigate("/login");
};
// Fetch logged-in user
useEffect(() => {
const fetchUser = async () => {
if (!userId) {
setUser(null);
return;
}


  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/users/${userId}`
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
if (!userId) {
setCartCount(0);
return;
}


  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/cart/${userId}`
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

// Search products and brands
const handleSearch = (e) => {
e.preventDefault();


const query = search.trim();

if (!query) return;

navigate(`/products?search=${encodeURIComponent(query)}`);


};

const clearSearch = () => {
setSearch("");
};

return ( <header className="navbar">
{/* Logo */}
<div
className="navbar-logo"
onClick={() => navigate("/")}
> <div className="navbar-logo-icon">O</div>


    <div>
      <div className="navbar-brand">ORIKAM</div>
      <div className="navbar-subtitle">DENTAL SYSTEMS</div>
    </div>
  </div>

  {/* Universal Search */}
  <form
    className="navbar-search"
    onSubmit={handleSearch}
    role="search"
  >
    <Search size={20} className="navbar-search-icon" />

    <input
      type="search"
      placeholder="Search products and brands..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      aria-label="Search products and brands"
    />

    {search && (
      <button
        type="button"
        className="navbar-search-clear"
        onClick={clearSearch}
        aria-label="Clear search"
      >
        <X size={17} />
      </button>
    )}

    <button type="submit" className="navbar-search-submit">
      Search
    </button>
  </form>

  {/* Right side */}
  <div className="navbar-actions">
    <button
      className="navbar-membership-button"
      onClick={() => navigate("/membership")}
    >
      Membership
    </button>

    <button
      className="navbar-icon-button"
      onClick={() => navigate("/wishlist")}
      title="Wishlist"
    >
      <Heart size={21} />
    </button>

    {/* Cart */}
    <button
      className="navbar-icon-button"
      onClick={() => navigate("/cart")}
      title="Cart"
    >
      <ShoppingCart size={22} />

      {cartCount > 0 && (
        <span className="cart-badge">{cartCount}</span>
      )}
    </button>

    {/* Profile */}
    {/* Profile Dropdown */}
{/* Profile Dropdown */}

<div className="navbar-profile-dropdown" ref={profileRef}>
  <button
    type="button"
    className="navbar-profile"
    onClick={() => setProfileOpen((previous) => !previous)}
    aria-expanded={profileOpen}
    aria-label="Open profile menu"
  >
    <div className="profile-icon">
      <User size={19} />
    </div>


<div className="profile-info">
  <span className="profile-name">
    {user?.name || "Guest"}
  </span>

  <span className="profile-email">
    {user?.email || "Sign in to your account"}
  </span>
</div>

<ChevronDown
  size={16}
  className={`profile-chevron ${
    profileOpen ? "profile-chevron-open" : ""
  }`}
/>


  </button>

{profileOpen && ( <div className="profile-dropdown-menu">
{!userId ? (
/* Logged-out user */
<> <div className="profile-dropdown-summary"> <div className="profile-membership-icon"> <User size={20} /> </div>


        <div className="profile-membership-info">
          <span>Welcome to ORIKAM</span>
          <strong>Sign in to your account</strong>
        </div>
      </div>

      <div className="profile-dropdown-divider" />

      <button
        type="button"
        className="profile-dropdown-item"
        onClick={() => {
          setProfileOpen(false);
          navigate("/login");
        }}
      >
        <LogOut size={17} />
        <span>Login / Sign Up</span>
      </button>
    </>
  ) : (
    /* Logged-in user */
    <>
      <div className="profile-dropdown-summary">
        <div className="profile-membership-icon">
          <Crown size={20} />
        </div>

        <div className="profile-membership-info">
          <span>Membership</span>
          <strong>{membershipTier}</strong>
        </div>

        <div className="profile-coins-info">
          <Coins size={15} />
          <strong>{totalCoins.toLocaleString("en-IN")}</strong>
        </div>
      </div>

      <div className="profile-dropdown-divider" />

      <button
        type="button"
        className="profile-dropdown-item"
        onClick={() => {
          setProfileOpen(false);
          navigate("/membership");
        }}
      >
        <Crown size={17} />
        <span>Membership & Rewards</span>
      </button>

      <button
        type="button"
        className="profile-dropdown-item"
        onClick={() => {
          setProfileOpen(false);
          navigate("/profile");
        }}
      >
        <CircleUserRound size={17} />
        <span>My Profile</span>
      </button>

      <button
        type="button"
        className="profile-dropdown-item"
        onClick={() => {
          setProfileOpen(false);
          navigate("/orders");
        }}
      >
        <Package size={17} />
        <span>My Orders</span>
      </button>

      <button
        type="button"
        className="profile-dropdown-item"
        onClick={() => {
          setProfileOpen(false);
          navigate("/wishlist");
        }}
      >
        <Heart size={17} />
        <span>Wishlist</span>
      </button>

      <div className="profile-dropdown-divider" />

      <button
        type="button"
        className="profile-dropdown-item profile-logout"
        onClick={handleLogout}
      >
        <LogOut size={17} />
        <span>Logout</span>
      </button>
    </>
  )}
</div>


)}

</div>

  </div>
</header>


);
};

export default Navbar;
