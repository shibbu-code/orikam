import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Package,
  Truck,
  MapPin,
} from "lucide-react";

import Navbar from "../../components/commen/Navbar";
import { getOrderById } from "../../services/orderApi";
import api from "../../services/api";

import "./OrderDetails.css";

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReturnForm, setShowReturnForm] = useState(false);
const [returnReason, setReturnReason] = useState("");
const [returnLoading, setReturnLoading] = useState(false);

const handleReturnRequest = async () => {
  if (!returnReason.trim()) {
    alert("Please enter a return reason");
    return;
  }

  try {
    setReturnLoading(true);

    const response = await api.post(
      `/orders/${orderId}/return`,
      {
        reason: returnReason,
      }
    );

    alert(
      response.data.message ||
        "Return request submitted successfully"
    );

    setShowReturnForm(false);
    setReturnReason("");

    // Refresh order details
    const updatedResponse = await api.get(
      `/orders/${orderId}`
    );

    setOrder(updatedResponse.data.order);
  } catch (error) {
    console.error("Return request error:", error);

    alert(
      error.response?.data?.message ||
        "Failed to submit return request"
    );
  } finally {
    setReturnLoading(false);
  }
};

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await getOrderById(orderId);
      setOrder(response.data.order);
    } catch (error) {
      console.error("Failed to fetch order:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="order-details-page">
        <Navbar />

        <div className="order-details-loading">
          Loading order...
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-details-page">
        <Navbar />

        <div className="order-not-found">
          <h2>Order not found</h2>

          <button onClick={() => navigate("/products")}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "PLACED":
        return <CheckCircle size={18} />;

      case "CONFIRMED":
        return <CheckCircle size={18} />;

      case "PROCESSING":
        return <Package size={18} />;

      case "SHIPPED":
      case "OUT_FOR_DELIVERY":
        return <Truck size={18} />;

      case "DELIVERED":
        return <CheckCircle size={18} />;

      default:
        return <Clock size={18} />;
    }
  };

  return (
    <div className="order-details-page">
      <Navbar />

      <main className="order-details-container">
        <button
          className="order-back"
          onClick={() => navigate("/products")}
        >
          <ArrowLeft size={18} />
          Continue Shopping
        </button>

        <div className="order-details-header">
          <div>
            <h1>Order Details</h1>

            <p>
              Order ID: <strong>#{order._id}</strong>
            </p>
          </div>

          <span
            className={`order-status status-${order.orderStatus.toLowerCase()}`}
          >
            {order.orderStatus.replaceAll("_", " ")}
          </span>
        </div>

        <div className="order-details-layout">
          {/* MAIN CONTENT */}

          <div className="order-details-main">
            {/* TRACKING */}

            <section className="order-card">
              <h2>Order Tracking</h2>

              <div className="tracking-timeline">
                {order.trackingHistory?.map(
                  (history, index) => (
                    <div
                      className="tracking-item"
                      key={index}
                    >
                      <div className="tracking-icon">
                        {getStatusIcon(history.status)}
                      </div>

                      <div className="tracking-content">
                        <strong>
                          {history.status.replaceAll(
                            "_",
                            " "
                          )}
                        </strong>

                        {history.note && (
                          <p>{history.note}</p>
                        )}

                        <span>
                          {new Date(
                            history.timestamp
                          ).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>

            {/* PRODUCTS */}

            <section className="order-card">
              <h2>Items Ordered</h2>

              <div className="ordered-products">
                {order.items.map((item) => {
                  const product = item.product;

                  const image =
                    product?.images?.[0] ||
                    product?.logo ||
                    "";

                  return (
                    <div
                      className="ordered-product"
                      key={item.product._id}
                    >
                      <div className="ordered-product-image">
                        {image ? (
                          <img
                            src={image}
                            alt={item.name}
                          />
                        ) : (
                          <span>No Image</span>
                        )}
                      </div>

                      <div className="ordered-product-info">
                        <h3>{item.name}</h3>

                        <p>
                          ₹
                          {item.price.toLocaleString(
                            "en-IN"
                          )}{" "}
                          × {item.quantity}
                        </p>
                      </div>

                      <strong>
                        ₹
                        {(
                          item.price * item.quantity
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ADDRESS */}

            <section className="order-card">
              <div className="order-card-title">
                <MapPin size={19} />

                <h2>Delivery Address</h2>
              </div>

              <div className="delivery-address">
                <strong>
                  {order.shippingAddress.name}
                </strong>

                <p>
                  {order.shippingAddress.addressLine}
                </p>

                <p>
                  {order.shippingAddress.city},{" "}
                  {order.shippingAddress.state} -{" "}
                  {order.shippingAddress.pincode}
                </p>

                <p>
                  Phone: {order.shippingAddress.phone}
                </p>
              </div>
            </section>
          </div>

          {/* SUMMARY */}

          <aside className="order-summary-card">
            <h2>Order Summary</h2>

            <div className="order-summary-row">
              <span>Subtotal</span>

              <span>
                ₹
                {order.subtotal.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="order-summary-row">
              <span>Discount</span>

              <span>
                - ₹
                {order.discount.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="order-summary-row">
              <span>Shipping</span>

              <span>
                {order.shippingCharge === 0
                  ? "Free"
                  : `₹${order.shippingCharge.toLocaleString(
                      "en-IN"
                    )}`}
              </span>
            </div>

            <div className="order-summary-divider" />

            <div className="order-summary-total">
              <span>Total</span>

              <strong>
                ₹
                {order.totalAmount.toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="payment-info">
              <span>Payment Method</span>

              <strong>
                {order.paymentMethod === "ONLINE"
                  ? "Online Payment"
                  : "Cash on Delivery"}
              </strong>

              <small>
                Payment Status: {order.paymentStatus}
              </small>
            </div>
          </aside>

          {order.orderStatus === "DELIVERED" &&
  (!order.returnStatus ||
    order.returnStatus === "NONE") && (
    <div className="return-section">
      <div className="return-section-content">
        <div>
          <h3>Need to return this order?</h3>
          <p>
            You can request a return for this delivered
            order.
          </p>
        </div>

        <button
          className="return-order-btn"
          onClick={() => setShowReturnForm(true)}
        >
          Return Order
        </button>
      </div>
    </div>
  )}
  {showReturnForm && (
  <div className="return-form-card">
    <h3>Request Return</h3>

    <p className="return-form-description">
      Please tell us why you want to return this order.
    </p>

    <label htmlFor="returnReason">
      Return Reason
    </label>

    <textarea
      id="returnReason"
      value={returnReason}
      onChange={(e) =>
        setReturnReason(e.target.value)
      }
      placeholder="Example: Product received damaged"
      rows="4"
    />

    <div className="return-form-actions">
      <button
        className="return-cancel-btn"
        onClick={() => {
          setShowReturnForm(false);
          setReturnReason("");
        }}
        disabled={returnLoading}
      >
        Cancel
      </button>

      <button
        className="return-submit-btn"
        onClick={handleReturnRequest}
        disabled={returnLoading}
      >
        {returnLoading
          ? "Submitting..."
          : "Submit Return Request"}
      </button>
    </div>
  </div>
)}
{order.returnStatus &&
  order.returnStatus !== "NONE" && (
    <div className="return-status-card">
      <div className="return-status-header">
        <h3>Return Request</h3>

        <span
          className={`customer-return-status ${order.returnStatus.toLowerCase()}`}
        >
          {order.returnStatus.replace(/_/g, " ")}
        </span>
      </div>

      {order.returnReason && (
        <div className="return-reason-display">
          <strong>Reason</strong>
          <p>{order.returnReason}</p>
        </div>
      )}

      {order.returnRequestedAt && (
        <p className="return-request-date">
          Requested on{" "}
          {new Date(
            order.returnRequestedAt
          ).toLocaleDateString()}
        </p>
      )}
    </div>
  )}

        </div>
      </main>
    </div>
  );
};

export default OrderDetails;