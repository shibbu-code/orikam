import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../services/api";
import "./AdminReturnDetails.css";

const AdminReturnDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("userRole");

    if (role !== "admin") {
      navigate("/login");
      return;
    }

    fetchReturnDetails();
  }, [orderId, navigate]);

  const fetchReturnDetails = async () => {
    try {
      setLoading(true);

      const response = await api.get(`/orders/${orderId}`);

      const fetchedOrder = response.data.order;

      setOrder(fetchedOrder);
      setSelectedStatus(fetchedOrder.returnStatus || "NONE");
    } catch (error) {
      console.error(
        "Fetch return details error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to fetch return details"
      );
    } finally {
      setLoading(false);
    }
  };

  const getNextStatuses = () => {
    if (!order) return [];

    const transitions = {
      REQUESTED: ["APPROVED", "REJECTED"],
      APPROVED: ["PICKED_UP"],
      PICKED_UP: ["RECEIVED"],
      RECEIVED: ["REFUNDED"],
      REFUNDED: [],
      REJECTED: [],
    };

    return transitions[order.returnStatus] || [];
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus) {
      return;
    }

    if (selectedStatus === order.returnStatus) {
      return;
    }

    try {
      setUpdating(true);

      const response = await api.patch(
        `/orders/${orderId}/return/status`,
        {
          status: selectedStatus,
        }
      );

      setOrder(response.data.order);

      alert(
        response.data.message ||
          "Return status updated successfully"
      );
    } catch (error) {
      console.error(
        "Update return status error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to update return status"
      );

      setSelectedStatus(order.returnStatus);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-return-details-page">
        <div className="return-details-loading">
          Loading return details...
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="admin-return-details-page">
        <div className="return-details-empty">
          Return details not found.
        </div>
      </div>
    );
  }

  const nextStatuses = getNextStatuses();

  return (
    <div className="admin-return-details-page">

      <div className="return-details-header">
        <div>
          <button
            className="back-return-btn"
            onClick={() =>
              navigate("/admin/returns")
            }
          >
            ← Back to Returns
          </button>

          <h1>Return Details</h1>

          <p>
            Order #{order._id}
          </p>
        </div>

        <span
          className={`return-detail-status ${
            order.returnStatus?.toLowerCase() || ""
          }`}
        >
          {(order.returnStatus || "NONE").replace(
            /_/g,
            " "
          )}
        </span>
      </div>

      <div className="return-details-grid">

        {/* Customer Information */}
        <div className="return-detail-card">
          <h2>Customer Information</h2>

          <div className="detail-row">
            <span>Name</span>
            <strong>
              {order.user?.name || "N/A"}
            </strong>
          </div>

          <div className="detail-row">
            <span>Email</span>
            <strong>
              {order.user?.email || "N/A"}
            </strong>
          </div>

          <div className="detail-row">
            <span>Phone</span>
            <strong>
              {order.user?.phone || "N/A"}
            </strong>
          </div>
        </div>

        {/* Return Information */}
        <div className="return-detail-card">
          <h2>Return Information</h2>

          <div className="detail-row">
            <span>Status</span>

            <strong>
              {(order.returnStatus || "NONE").replace(
                /_/g,
                " "
              )}
            </strong>
          </div>

          <div className="detail-row">
            <span>Requested On</span>

            <strong>
              {order.returnRequestedAt
                ? new Date(
                    order.returnRequestedAt
                  ).toLocaleDateString()
                : "N/A"}
            </strong>
          </div>

          <div className="return-reason-box">
            <span>Return Reason</span>

            <p>
              {order.returnReason ||
                "No reason provided"}
            </p>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="return-detail-card">
          <h2>Shipping Address</h2>

          <p>
            {order.shippingAddress?.name}
          </p>

          <p>
            {order.shippingAddress?.phone}
          </p>

          <p>
            {order.shippingAddress?.addressLine}
          </p>

          <p>
            {order.shippingAddress?.city},{" "}
            {order.shippingAddress?.state}
          </p>

          <p>
            {order.shippingAddress?.pincode}
          </p>
        </div>

        {/* Order Information */}
        <div className="return-detail-card">
          <h2>Order Information</h2>

          <div className="detail-row">
            <span>Order Status</span>
            <strong>
              {order.orderStatus?.replace(
                /_/g,
                " "
              )}
            </strong>
          </div>

          <div className="detail-row">
            <span>Payment Method</span>
            <strong>
              {order.paymentMethod}
            </strong>
          </div>

          <div className="detail-row">
            <span>Payment Status</span>
            <strong>
              {order.paymentStatus}
            </strong>
          </div>

          <div className="detail-row">
            <span>Total Amount</span>
            <strong>
              ₹{Number(
                order.totalAmount || 0
              ).toLocaleString()}
            </strong>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="return-detail-card products-card">
        <h2>Order Products</h2>

        <div className="return-products-list">
          {order.items?.map((item) => (
            <div
              className="return-product"
              key={item._id}
            >
              <div className="return-product-image">
                {item.product?.images?.[0] ? (
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                  />
                ) : (
                  <div>No Image</div>
                )}
              </div>

              <div className="return-product-info">
                <strong>
                  {item.product?.name ||
                    "Product"}
                </strong>

                <span>
                  Quantity: {item.quantity}
                </span>

                <span>
                  Price: ₹
                  {Number(
                    item.price || 0
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Management */}
      <div className="return-detail-card return-management-card">
        <h2>Manage Return</h2>

        {nextStatuses.length === 0 ? (
          <p className="return-completed-message">
            This return has reached its final status.
          </p>
        ) : (
          <>
            <div className="return-status-actions">

              <select
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(
                    e.target.value
                  )
                }
              >
                <option
                  value={order.returnStatus}
                >
                  Current:{" "}
                  {order.returnStatus.replace(
                    /_/g,
                    " "
                  )}
                </option>

                {nextStatuses.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status.replace(
                      /_/g,
                      " "
                    )}
                  </option>
                ))}
              </select>

              <button
                onClick={handleStatusUpdate}
                disabled={
                  updating ||
                  selectedStatus ===
                    order.returnStatus
                }
              >
                {updating
                  ? "Updating..."
                  : "Update Status"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Tracking History */}
      <div className="return-detail-card">
        <h2>Order Tracking History</h2>

        <div className="return-timeline">
          {order.trackingHistory?.map(
            (entry, index) => (
              <div
                className="return-timeline-item"
                key={index}
              >
                <div className="timeline-dot" />

                <div>
                  <strong>
                    {entry.status.replace(
                      /_/g,
                      " "
                    )}
                  </strong>

                  <p>
                    {entry.note ||
                      "No note"}
                  </p>

                  <span>
                    {entry.timestamp
                      ? new Date(
                          entry.timestamp
                        ).toLocaleString()
                      : ""}
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReturnDetails;