import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Package,
  Tags,
  Award,
  Boxes,
  ShoppingCart,
  Users,
  RotateCcw,
  UserCircle,
  LogOut,
  AlertTriangle,
  Plus,
  RefreshCw,
  ArrowRight,
  IndianRupee,
} from "lucide-react";

import { getAdminDashboard } from "../../services/adminDashboardApi";

import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const userRole = localStorage.getItem("userRole");
  const userName = localStorage.getItem("userName");

  const [dashboard, setDashboard] = useState({
    stats: {
      totalProducts: 0,
      totalOrders: 0,
      totalCustomers: 0,
      lowStock: 0,
    },
    recentOrders: [],
    lowStockProducts: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // -----------------------------------
  // ACCESS CONTROL
  // -----------------------------------

  if (userRole !== "admin") {
    return (
      <div className="admin-access-denied">
        <div className="access-denied-card">
          <div className="access-denied-icon">
            <AlertTriangle size={30} />
          </div>

          <h2>Access Denied</h2>

          <p>
            You don't have permission to access the admin panel.
          </p>

          <button onClick={() => navigate("/")}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // -----------------------------------
  // FETCH DASHBOARD
  // -----------------------------------

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminDashboard();

      setDashboard({
        stats: response.data.stats || {
          totalProducts: 0,
          totalOrders: 0,
          totalCustomers: 0,
          lowStock: 0,
        },

        recentOrders: response.data.recentOrders || [],

        lowStockProducts:
          response.data.lowStockProducts || [],
      });
    } catch (error) {
      console.error("Dashboard fetch error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // -----------------------------------
  // LOGOUT
  // -----------------------------------

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("isLoggedIn");

    navigate("/login");
  };

  // -----------------------------------
  // HELPERS
  // -----------------------------------

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    return status?.toLowerCase().replaceAll("_", "-") || "";
  };

  const getStockClass = (stock) => {
    if (stock <= 3) return "critical";
    if (stock <= 10) return "low";
    return "good";
  };

  // -----------------------------------
  // MAIN UI
  // -----------------------------------

  return (
    <div className="admin-dashboard">

      {/* ================================
          SIDEBAR
      ================================= */}

      <aside className="admin-sidebar">

        <div className="admin-logo">
          <div className="admin-logo-icon">
            O
          </div>

          <div className="admin-logo-text">
            <strong>ORIKAM</strong>
            <span>ADMIN PANEL</span>
          </div>
        </div>

        <nav className="admin-nav">

          <button className="active">
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() =>
              navigate("/admin/products")
            }
          >
            <Package size={18} />
            <span>Products</span>
          </button>

          <button
            onClick={() =>
              navigate("/admin/categories")
            }
          >
            <Tags size={18} />
            <span>Categories</span>
          </button>

          <button
            onClick={() =>
              navigate("/admin/brands")
            }
          >
            <Award size={18} />
            <span>Brands</span>
          </button>

          <button
            onClick={() =>
              navigate("/admin/inventory")
            }
          >
            <Boxes size={18} />
            <span>Inventory</span>
          </button>

          <button
            onClick={() =>
              navigate("/admin/orders")
            }
          >
            <ShoppingCart size={18} />
            <span>Orders</span>
          </button>

          <button
            onClick={() =>
              navigate("/admin/customers")
            }
          >
            <Users size={18} />
            <span>Customers</span>
          </button>

          <button
            onClick={() =>
              navigate("/admin/returns")
            }
          >
            <RotateCcw size={18} />
            <span>Returns</span>
          </button>

          <button
            onClick={() =>
              navigate("/admin/profile")
            }
          >
            <UserCircle size={18} />
            <span>Profile</span>
          </button>

        </nav>

        <button
          className="admin-logout"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>

      </aside>

      {/* ================================
          MAIN
      ================================= */}

      <main className="admin-main">

        {/* HEADER */}

        <header className="admin-header">

          <div>
            <p className="admin-breadcrumb">
              Admin / Dashboard
            </p>

            <h1>Dashboard</h1>

            <p className="admin-header-description">
              Welcome back, {userName || "Admin"}.
              Here's what's happening with your store.
            </p>
          </div>

          <button
            className="refresh-button"
            onClick={fetchDashboard}
            disabled={loading}
          >
            <RefreshCw
              size={17}
              className={loading ? "spin" : ""}
            />

            Refresh
          </button>

        </header>

        {/* ERROR */}

        {error && (
          <div className="dashboard-error">
            <AlertTriangle size={18} />

            <span>{error}</span>

            <button onClick={fetchDashboard}>
              Try Again
            </button>
          </div>
        )}

        {/* ================================
            STATISTICS
        ================================= */}

        <section className="admin-stats">

          {/* PRODUCTS */}

          <div className="admin-stat-card">

            <div className="stat-card-top">

              <div className="stat-icon">
                <Package size={21} />
              </div>

            </div>

            <div className="stat-card-content">

              <span>Total Products</span>

              <strong>
                {loading
                  ? "..."
                  : dashboard.stats.totalProducts.toLocaleString(
                      "en-IN"
                    )}
              </strong>

            </div>

            <button
              className="stat-link"
              onClick={() =>
                navigate("/admin/products")
              }
            >
              Manage Products
              <ArrowRight size={14} />
            </button>

          </div>

          {/* ORDERS */}

          <div className="admin-stat-card">

            <div className="stat-card-top">

              <div className="stat-icon orders">
                <ShoppingCart size={21} />
              </div>

            </div>

            <div className="stat-card-content">

              <span>Total Orders</span>

              <strong>
                {loading
                  ? "..."
                  : dashboard.stats.totalOrders.toLocaleString(
                      "en-IN"
                    )}
              </strong>

            </div>

            <button
              className="stat-link"
              onClick={() =>
                navigate("/admin/orders")
              }
            >
              View Orders
              <ArrowRight size={14} />
            </button>

          </div>

          {/* CUSTOMERS */}

          <div className="admin-stat-card">

            <div className="stat-card-top">

              <div className="stat-icon customers">
                <Users size={21} />
              </div>

            </div>

            <div className="stat-card-content">

              <span>Total Customers</span>

              <strong>
                {loading
                  ? "..."
                  : dashboard.stats.totalCustomers.toLocaleString(
                      "en-IN"
                    )}
              </strong>

            </div>

            <button
              className="stat-link"
              onClick={() =>
                navigate("/admin/customers")
              }
            >
              View Customers
              <ArrowRight size={14} />
            </button>

          </div>

          {/* LOW STOCK */}

          <div className="admin-stat-card">

            <div className="stat-card-top">

              <div className="stat-icon warning">
                <AlertTriangle size={21} />
              </div>

            </div>

            <div className="stat-card-content">

              <span>Low Stock</span>

              <strong>
                {loading
                  ? "..."
                  : dashboard.stats.lowStock.toLocaleString(
                      "en-IN"
                    )}
              </strong>

            </div>

            <button
              className="stat-link warning-link"
              onClick={() =>
                navigate("/admin/inventory")
              }
            >
              Check Inventory
              <ArrowRight size={14} />
            </button>

          </div>

        </section>

        {/* ================================
            QUICK ACTIONS
        ================================= */}

        <section className="quick-actions-section">

          <div className="section-heading">
            <div>
              <h2>Quick Actions</h2>

              <p>
                Frequently used admin operations
              </p>
            </div>
          </div>

          <div className="quick-actions">

            <button
              onClick={() =>
                navigate("/admin/products/add")
              }
            >
              <div className="quick-action-icon">
                <Plus size={19} />
              </div>

              <div>
                <strong>Add Product</strong>
                <span>Create a new product</span>
              </div>
            </button>

            <button
              onClick={() =>
                navigate("/admin/inventory")
              }
            >
              <div className="quick-action-icon">
                <Boxes size={19} />
              </div>

              <div>
                <strong>Manage Inventory</strong>
                <span>Update stock levels</span>
              </div>
            </button>

            <button
              onClick={() =>
                navigate("/admin/orders")
              }
            >
              <div className="quick-action-icon">
                <ShoppingCart size={19} />
              </div>

              <div>
                <strong>Manage Orders</strong>
                <span>View customer orders</span>
              </div>
            </button>

            <button
              onClick={() =>
                navigate("/admin/brands/add")
              }
            >
              <div className="quick-action-icon">
                <Award size={19} />
              </div>

              <div>
                <strong>Add Brand</strong>
                <span>Create a new brand</span>
              </div>
            </button>

          </div>

        </section>

        {/* ================================
            DATA GRID
        ================================= */}

        <section className="admin-content-grid">

          {/* RECENT ORDERS */}

          <div className="admin-panel">

            <div className="panel-header">

              <div>
                <h2>Recent Orders</h2>

                <p>
                  Latest customer orders
                </p>
              </div>

              <button
                onClick={() =>
                  navigate("/admin/orders")
                }
              >
                View All
                <ArrowRight size={14} />
              </button>

            </div>

            {loading ? (
              <div className="admin-loading">
                Loading orders...
              </div>
            ) : dashboard.recentOrders.length === 0 ? (
              <div className="admin-empty">
                <ShoppingCart size={26} />

                <strong>No orders yet</strong>

                <span>
                  New customer orders will appear here.
                </span>
              </div>
            ) : (
              <div className="orders-list">

                {dashboard.recentOrders.map(
                  (order) => (
                    <div
                      className="order-row"
                      key={order._id}
                      onClick={() =>
                        navigate(
                          `/admin/orders/${order._id}`
                        )
                      }
                    >

                      <div className="order-main">

                        <strong>
                          #{order._id.slice(-6).toUpperCase()}
                        </strong>

                        <span>
                          {order.user?.name ||
                            "Unknown Customer"}
                        </span>

                      </div>

                      <div className="order-meta">

                        <strong>
                          {formatCurrency(
                            order.totalAmount
                          )}
                        </strong>

                        <span>
                          {formatDate(
                            order.createdAt
                          )}
                        </span>

                      </div>

                      <span
                        className={`order-status ${getStatusClass(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus
                          ?.replaceAll("_", " ")
                          ?.toLowerCase()
                          ?.replace(
                            /\b\w/g,
                            (char) =>
                              char.toUpperCase()
                          )}
                      </span>

                    </div>
                  )
                )}

              </div>
            )}

          </div>

          {/* LOW STOCK */}

          <div className="admin-panel">

            <div className="panel-header">

              <div>
                <h2>Low Stock Products</h2>

                <p>
                  Products that need attention
                </p>
              </div>

              <button
                onClick={() =>
                  navigate("/admin/inventory")
                }
              >
                View All
                <ArrowRight size={14} />
              </button>

            </div>

            {loading ? (
              <div className="admin-loading">
                Loading inventory...
              </div>
            ) : dashboard.lowStockProducts
                .length === 0 ? (
              <div className="admin-empty success">

                <Boxes size={26} />

                <strong>
                  Inventory looks good
                </strong>

                <span>
                  No products are currently low on stock.
                </span>

              </div>
            ) : (
              <div className="low-stock-list">

                {dashboard.lowStockProducts.map(
                  (product) => {

                    const image =
                      product.images?.[0] ||
                      product.logo ||
                      "";

                    return (
                      <div
                        className="stock-row"
                        key={product._id}
                        onClick={() =>
                          navigate(
                            `/admin/products/edit/${product._id}`
                          )
                        }
                      >

                        <div className="stock-product-image">

                          {image ? (
                            <img
                              src={image}
                              alt={product.name}
                            />
                          ) : (
                            <Package size={20} />
                          )}

                        </div>

                        <div className="stock-product-info">

                          <strong>
                            {product.name}
                          </strong>

                          <span>
                            {product.brand?.name ||
                              "No Brand"}
                          </span>

                        </div>

                        <div
                          className={`stock-value ${getStockClass(
                            product.stock
                          )}`}
                        >
                          <strong>
                            {product.stock}
                          </strong>

                          <span>
                            units
                          </span>
                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}

          </div>

        </section>

      </main>

    </div>
  );
};

export default AdminDashboard;