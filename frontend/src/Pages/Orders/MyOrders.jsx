import React, { useEffect, useState } from "react";
import { Eye, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/commen/Navbar";
import { getOrdersByUser } from "../../services/orderApi";

import "./MyOrders.css";

const MyOrders = () => {
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    fetchOrders();
  }, [userId]);

  const fetchOrders = async () => {
    try {
      const response = await getOrdersByUser(userId);

      setOrders(response.data.orders || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    return `my-order-status status-${status.toLowerCase()}`;
  };

  if (loading) {
    return (
      <div className="my-orders-page">
        <Navbar />

        <div className="my-orders-loading">
          Loading your orders...
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders-page">
      <Navbar />

      <main className="my-orders-container">
        <div className="my-orders-header">
          <div>
            <h1>My Orders</h1>

            <p>
              View and track your previous orders.
            </p>
          </div>

          <span className="orders-count">
            {orders.length}{" "}
            {orders.length === 1 ? "Order" : "Orders"}
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="orders-empty">
            <Package size={45} />

            <h2>No orders yet</h2>

            <p>
              You haven't placed any orders yet.
            </p>

            <button
              onClick={() => navigate("/products")}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div
                className="my-order-card"
                key={order._id}
              >
                <div className="my-order-header">
                  <div>
                    <span>Order ID</span>

                    <strong>#{order._id}</strong>
                  </div>

                  <span
                    className={getStatusClass(
                      order.orderStatus
                    )}
                  >
                    {order.orderStatus.replaceAll(
                      "_",
                      " "
                    )}
                  </span>
                </div>

                <div className="my-order-info">
                  <div>
                    <span>Order Date</span>

                    <strong>
                      {new Date(
                        order.createdAt
                      ).toLocaleDateString("en-IN")}
                    </strong>
                  </div>

                  <div>
                    <span>Items</span>

                    <strong>
                      {order.items.length}
                    </strong>
                  </div>

                  <div>
                    <span>Total</span>

                    <strong>
                      ₹
                      {order.totalAmount.toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Payment</span>

                    <strong>
                      {order.paymentMethod ===
                      "ONLINE"
                        ? "Online"
                        : "COD"}
                    </strong>
                  </div>
                </div>

                <div className="my-order-products">
                  {order.items
                    .slice(0, 3)
                    .map((item) => (
                      <div
                        className="my-order-product"
                        key={item.product._id}
                      >
                        {item.product?.images?.[0] ? (
                          <img
                            src={
                              item.product.images[0]
                            }
                            alt={item.name}
                          />
                        ) : (
                          <div className="order-product-placeholder">
                            <Package size={18} />
                          </div>
                        )}
                      </div>
                    ))}

                  {order.items.length > 3 && (
                    <div className="more-products">
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>

                <div className="my-order-footer">
                  <span>
                    Placed on{" "}
                    {new Date(
                      order.createdAt
                    ).toLocaleDateString("en-IN")}
                  </span>

                  <button
                    onClick={() =>
                      navigate(
                        `/orders/${order._id}`
                      )
                    }
                  >
                    <Eye size={16} />
                    View Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyOrders;