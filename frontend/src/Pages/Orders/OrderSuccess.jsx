import React from "react";
import { CheckCircle, Package } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import Navbar from "../../components/commen/Navbar";

import "./OrderSuccess.css";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const order = location.state?.order;

  if (!order) {
    return (
      <div className="order-success-page">
        <Navbar />

        <main className="order-success-container">
          <h2>Order information not found</h2>

          <button onClick={() => navigate("/products")}>
            Continue Shopping
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="order-success-page">
      <Navbar />

      <main className="order-success-container">
        <div className="success-icon">
          <CheckCircle size={52} />
        </div>

        <h1>Order Placed Successfully!</h1>

        <p className="success-message">
          Thank you for your order. Your order has been
          successfully placed.
        </p>

        <div className="order-success-card">
          <div>
            <span>Order ID</span>
            <strong>#{order._id}</strong>
          </div>

          <div>
            <span>Order Status</span>
            <strong>{order.orderStatus}</strong>
          </div>

          <div>
            <span>Payment</span>
            <strong>
              {order.paymentMethod === "ONLINE"
                ? "Online Payment"
                : "Cash on Delivery"}
            </strong>
          </div>

          <div>
            <span>Total Amount</span>
            <strong>
              ₹{order.totalAmount.toLocaleString("en-IN")}
            </strong>
          </div>
        </div>

        <div className="success-actions">
          <button
            className="primary-button"
            onClick={() =>
              navigate(`/orders/${order._id}`)
            }
          >
            <Package size={18} />
            View Order
          </button>

          <button
            className="secondary-button"
            onClick={() => navigate("/products")}
          >
            Continue Shopping
          </button>
        </div>
      </main>
    </div>
  );
};

export default OrderSuccess;