import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getCustomerById,
  getCustomerOrders,
} from "../../../services/customerApi";

import "./AdminCustomerDetails.css";

const AdminCustomerDetails = () => {
  const navigate = useNavigate();
  const { customerId } = useParams();

  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");

    if (userRole !== "admin") {
      navigate("/");
      return;
    }

    fetchCustomer();
  }, [customerId, navigate]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      setError("");

      const [customerResponse, ordersResponse] =
        await Promise.all([
          getCustomerById(customerId),
          getCustomerOrders(customerId),
        ]);

      setCustomer(
        customerResponse.data.customer
      );

      setOrders(
        ordersResponse.data.orders || []
      );
    } catch (error) {
      console.error(
        "Fetch customer details error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load customer"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-customer-details">
        <p>Loading customer...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-customer-details">
        <button
          className="back-btn"
          onClick={() =>
            navigate("/admin/customers")
          }
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="customer-error">
          {error}
        </div>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  const totalSpent = orders.reduce(
    (sum, order) =>
      sum + Number(order.totalAmount || 0),
    0
  );

  return (
    <div className="admin-customer-details">
      {/* Header */}
      <div className="customer-details-header">
        <button
          className="back-btn"
          onClick={() =>
            navigate("/admin/customers")
          }
        >
          <ArrowLeft size={18} />
          Back to Customers
        </button>

        <h1>Customer Details</h1>
      </div>

      {/* Profile */}
      <div className="customer-profile-card">
        <div className="large-customer-avatar">
          {customer.name
            ?.charAt(0)
            ?.toUpperCase()}
        </div>

        <div className="customer-profile-info">
          <h2>{customer.name}</h2>

          <div className="customer-contact">
            <span>
              <Mail size={16} />
              {customer.email}
            </span>

            <span>
              <Phone size={16} />
              {customer.phone || "No phone number"}
            </span>

            <span>
              <Calendar size={16} />
              Joined{" "}
              {new Date(
                customer.createdAt
              ).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="customer-stats">
        <div className="customer-stat-card">
          <ShoppingBag size={22} />

          <div>
            <span>Total Orders</span>
            <strong>{orders.length}</strong>
          </div>
        </div>

        <div className="customer-stat-card">
          <ShoppingBag size={22} />

          <div>
            <span>Total Spent</span>
            <strong>
              ₹{totalSpent.toLocaleString("en-IN")}
            </strong>
          </div>
        </div>
      </div>

      {/* Orders */}
      <div className="customer-orders-card">
        <div className="customer-orders-header">
          <h2>Order History</h2>

          <span>
            {orders.length} Orders
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="no-orders">
            This customer has not placed any orders yet.
          </div>
        ) : (
          <div className="customer-orders-table-wrapper">
            <table className="customer-orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <strong>
                        #{order._id.slice(-8)}
                      </strong>
                    </td>

                    <td>
                      {order.items?.reduce(
                        (sum, item) =>
                          sum +
                          Number(item.quantity || 0),
                        0
                      )}
                    </td>

                    <td>
                      ₹
                      {Number(
                        order.totalAmount || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td>
                      <span
                        className={`payment-badge ${order.paymentStatus?.toLowerCase()}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`status-badge ${order.orderStatus?.toLowerCase()}`}
                      >
                        {order.orderStatus?.replace(
                          /_/g,
                          " "
                        )}
                      </span>
                    </td>

                    <td>
                      {new Date(
                        order.createdAt
                      ).toLocaleDateString()}
                    </td>

                    <td>
                      <button
                        className="view-order-btn"
                        onClick={() =>
                          navigate(
                            `/admin/orders/${order._id}`
                          )
                        }
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomerDetails;