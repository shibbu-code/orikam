import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Clock,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../../services/api";

import "./AdminOrderDetails.css";

const AdminOrderDetails = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");

    if (userRole !== "admin") {
      navigate("/");
      return;
    }

    fetchOrder();
  }, [orderId, navigate]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${orderId}`);

      const fetchedOrder = response.data.order;

      setOrder(fetchedOrder);
      setNewStatus(fetchedOrder.orderStatus);
    } catch (error) {
      console.error("Failed to fetch order:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async () => {
    if (!newStatus) return;

    try {
      setUpdating(true);

      const response = await api.patch(
        `/orders/${orderId}/status`,
        {
          status: newStatus,
          note: statusNote,
        }
      );

      setOrder(response.data.order);
      setStatusNote("");

      alert("Order status updated successfully");
    } catch (error) {
      console.error("Status update error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to update order status"
      );
    } finally {
      setUpdating(false);
    }
  };

  const formatStatus = (status) => {
    return status
      ?.replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getStatusClass = (status) => {
    return status
      ?.toLowerCase()
      .replaceAll("_", "-");
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="admin-order-loading">
        Loading order...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="admin-order-error">
        <Package size={40} />
        <h2>Order not found</h2>

        <button onClick={() => navigate("/admin/orders")}>
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="admin-order-details-page">

      {/* Header */}

      <div className="order-details-header">

        <button
          className="back-orders-btn"
          onClick={() => navigate("/admin/orders")}
        >
          <ArrowLeft size={18} />
          Back to Orders
        </button>

        <div className="order-heading">

          <div>
            <h1>
              Order #
              {order._id.slice(-8).toUpperCase()}
            </h1>

            <p>
              Placed on{" "}
              {formatDate(order.createdAt)}
            </p>
          </div>

          <span
            className={`order-status-large ${getStatusClass(
              order.orderStatus
            )}`}
          >
            {formatStatus(order.orderStatus)}
          </span>

        </div>

      </div>

      <div className="order-details-grid">

        {/* LEFT */}

        <div className="order-main">

          {/* Products */}

          <section className="order-card">

            <div className="card-heading">
              <Package size={19} />
              <h2>Products</h2>
            </div>

            <div className="order-products">

              {order.items?.map((item) => {

                const product = item.product;

                const image =
                  product?.logo ||
                  product?.images?.[0];

                return (
                  <div
                    className="order-product"
                    key={item._id}
                  >

                    {image ? (
                      <img
                        src={image}
                        alt={product?.name}
                      />
                    ) : (
                      <div className="order-product-placeholder">
                        <Package size={20} />
                      </div>
                    )}

                    <div className="order-product-info">

                      <strong>
                        {product?.name ||
                          "Product"}
                      </strong>

                      <span>
                        Quantity: {item.quantity}
                      </span>

                    </div>

                    <strong>
                      ₹
                      {Number(
                        item.price * item.quantity
                      ).toLocaleString("en-IN")}
                    </strong>

                  </div>
                );
              })}

            </div>

            <div className="order-summary">

              <div>
                <span>Subtotal</span>
                <strong>
                  ₹
                  {Number(
                    order.subtotal || 0
                  ).toLocaleString("en-IN")}
                </strong>
              </div>

              <div>
                <span>Discount</span>
                <strong>
                  - ₹
                  {Number(
                    order.discount || 0
                  ).toLocaleString("en-IN")}
                </strong>
              </div>

              <div>
                <span>Shipping</span>
                <strong>
                  ₹
                  {Number(
                    order.shippingCharge || 0
                  ).toLocaleString("en-IN")}
                </strong>
              </div>

              <div className="order-total">
                <span>Total</span>
                <strong>
                  ₹
                  {Number(
                    order.totalAmount || 0
                  ).toLocaleString("en-IN")}
                </strong>
              </div>

            </div>

          </section>

          {/* Status Management */}

          <section className="order-card">

            <div className="card-heading">
              <Clock size={19} />
              <h2>Update Order Status</h2>
            </div>

            <div className="status-update-form">

              <div className="status-field">

                <label>
                  Order Status
                </label>

                <select
                  value={newStatus}
                  onChange={(e) =>
                    setNewStatus(e.target.value)
                  }
                >
                  <option value="PLACED">
                    Placed
                  </option>

                  <option value="CONFIRMED">
                    Confirmed
                  </option>

                  <option value="PROCESSING">
                    Processing
                  </option>

                  <option value="SHIPPED">
                    Shipped
                  </option>

                  <option value="OUT_FOR_DELIVERY">
                    Out For Delivery
                  </option>

                  <option value="DELIVERED">
                    Delivered
                  </option>

                  <option value="CANCELLED">
                    Cancelled
                  </option>
                </select>

              </div>

              <div className="status-field">

                <label>
                  Note
                </label>

                <textarea
                  placeholder="Optional tracking note..."
                  value={statusNote}
                  onChange={(e) =>
                    setStatusNote(e.target.value)
                  }
                />

              </div>

              <button
                className="update-status-btn"
                onClick={updateStatus}
                disabled={updating}
              >
                {updating
                  ? "Updating..."
                  : "Update Status"}
              </button>

            </div>

          </section>

          {/* Tracking History */}

          <section className="order-card">

            <div className="card-heading">
              <Clock size={19} />
              <h2>Tracking History</h2>
            </div>

            <div className="tracking-history">

              {order.trackingHistory
                ?.slice()
                .reverse()
                .map((history, index) => (

                  <div
                    className="tracking-item"
                    key={index}
                  >

                    <div className="tracking-dot" />

                    <div className="tracking-content">

                      <strong>
                        {formatStatus(
                          history.status
                        )}
                      </strong>

                      <p>
                        {history.note ||
                          "No additional note"}
                      </p>

                      <span>
                        {formatDate(
                          history.timestamp
                        )}
                      </span>

                    </div>

                  </div>

                ))}

            </div>

          </section>

        </div>

        {/* RIGHT */}

        <div className="order-sidebar">

          {/* Customer */}

          <section className="order-card">

            <div className="card-heading">
              <User size={19} />
              <h2>Customer</h2>
            </div>

            <div className="customer-details">

              <strong>
                {order.user?.name ||
                  "Unknown Customer"}
              </strong>

              <span>
                {order.user?.email || "—"}
              </span>

              <span>
                {order.user?.phone || "—"}
              </span>

            </div>

          </section>

          {/* Shipping */}

          <section className="order-card">

            <div className="card-heading">
              <MapPin size={19} />
              <h2>Shipping Address</h2>
            </div>

            <div className="shipping-address">

              {order.shippingAddress ? (
                <>
                  <strong>
                    {order.shippingAddress.name}
                  </strong>

                  <span>
                    {order.shippingAddress.address}
                  </span>

                  <span>
                    {order.shippingAddress.city},{" "}
                    {order.shippingAddress.state}
                  </span>

                  <span>
                    PIN:{" "}
                    {order.shippingAddress.pincode}
                  </span>

                  <span>
                    Phone:{" "}
                    {order.shippingAddress.phone}
                  </span>
                </>
              ) : (
                <span>
                  Shipping address unavailable
                </span>
              )}

            </div>

          </section>

          {/* Payment */}

          <section className="order-card">

            <div className="card-heading">
              <CreditCard size={19} />
              <h2>Payment</h2>
            </div>

            <div className="payment-details">

              <div>
                <span>Method</span>
                <strong>
                  {order.paymentMethod}
                </strong>
              </div>

              <div>
                <span>Status</span>
                <strong
                  className={`payment-${order.paymentStatus?.toLowerCase()}`}
                >
                  {order.paymentStatus}
                </strong>
              </div>

            </div>

          </section>

        </div>

      </div>

    </div>
  );
};

export default AdminOrderDetails;