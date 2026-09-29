import React, { useEffect, useMemo, useState } from "react";
import { Search, Eye, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../../../services/api";

import "./AdminOrders.css";

const AdminOrders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");

    if (userRole !== "admin") {
      navigate("/");
      return;
    }

    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders");

      setOrders(response.data.orders || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  const formatStatus = (status) => {
    return status
      ?.replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "PLACED":
        return "placed";

      case "CONFIRMED":
        return "confirmed";

      case "PROCESSING":
        return "processing";

      case "SHIPPED":
        return "shipped";

      case "OUT_FOR_DELIVERY":
        return "out-for-delivery";

      case "DELIVERED":
        return "delivered";

      case "CANCELLED":
        return "cancelled";

      default:
        return "";
    }
  };

  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const searchText = search.toLowerCase();

        const orderId =
          order._id?.toLowerCase() || "";

        const customerName =
          order.user?.name?.toLowerCase() || "";

        const customerEmail =
          order.user?.email?.toLowerCase() || "";

        const matchesSearch =
          orderId.includes(searchText) ||
          customerName.includes(searchText) ||
          customerEmail.includes(searchText);

        const matchesStatus =
          statusFilter === "all" ||
          order.orderStatus === statusFilter;

        const matchesPayment =
          paymentFilter === "all" ||
          order.paymentStatus === paymentFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesPayment
        );
      })
      .sort((a, b) => {
        if (sortBy === "oldest") {
          return (
            new Date(a.createdAt) -
            new Date(b.createdAt)
          );
        }

        if (sortBy === "amount-high") {
          return b.totalAmount - a.totalAmount;
        }

        if (sortBy === "amount-low") {
          return a.totalAmount - b.totalAmount;
        }

        return (
          new Date(b.createdAt) -
          new Date(a.createdAt)
        );
      });
  }, [
    orders,
    search,
    statusFilter,
    paymentFilter,
    sortBy,
  ]);

  return (
    <div className="admin-orders-page">

      {/* Header */}

      <div className="orders-header">

        <div>
          <h1>Orders</h1>

          <p>
            Manage customer orders and fulfillment.
          </p>
        </div>

        <div className="orders-count">
          {filteredOrders.length} Orders
        </div>

      </div>

      {/* Toolbar */}

      <div className="orders-toolbar">

        <div className="orders-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search order, customer or email..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="all">
            All Order Status
          </option>

          <option value="PLACED">Placed</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="OUT_FOR_DELIVERY">
            Out For Delivery
          </option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <select
          value={paymentFilter}
          onChange={(e) =>
            setPaymentFilter(e.target.value)
          }
        >
          <option value="all">
            All Payment Status
          </option>

          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value)
          }
        >
          <option value="newest">
            Newest
          </option>

          <option value="oldest">
            Oldest
          </option>

          <option value="amount-high">
            Amount High-Low
          </option>

          <option value="amount-low">
            Amount Low-High
          </option>
        </select>

      </div>

      {/* Orders Table */}

      <div className="orders-table-container">

        <table className="orders-table">

          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {filteredOrders.length === 0 ? (

              <tr>
                <td
                  colSpan="7"
                  className="empty-orders"
                >
                  <Package size={34} />

                  <span>
                    No orders found.
                  </span>
                </td>
              </tr>

            ) : (

              filteredOrders.map((order) => (

                <tr key={order._id}>

                  {/* Order */}

                  <td>
                    <div className="order-id">

                      <strong>
                        #{order._id.slice(-8).toUpperCase()}
                      </strong>

                      <span>
                        {order.items?.length || 0} item
                        {order.items?.length !== 1
                          ? "s"
                          : ""}
                      </span>

                    </div>
                  </td>

                  {/* Customer */}

                  <td>
                    <div className="customer-info">

                      <strong>
                        {order.user?.name || "Unknown"}
                      </strong>

                      <span>
                        {order.user?.email || "—"}
                      </span>

                    </div>
                  </td>

                  {/* Amount */}

                  <td>
                    <strong>
                      ₹
                      {Number(
                        order.totalAmount || 0
                      ).toLocaleString("en-IN")}
                    </strong>
                  </td>

                  {/* Payment */}

                  <td>

                    <div className="payment-info">

                      <strong>
                        {order.paymentMethod}
                      </strong>

                      <span
                        className={`payment-status ${order.paymentStatus?.toLowerCase()}`}
                      >
                        {order.paymentStatus}
                      </span>

                    </div>

                  </td>

                  {/* Status */}

                  <td>

                    <span
                      className={`order-status ${getStatusClass(
                        order.orderStatus
                      )}`}
                    >
                      {formatStatus(
                        order.orderStatus
                      )}
                    </span>

                  </td>

                  {/* Date */}

                  <td>

                    {new Date(
                      order.createdAt
                    ).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}

                  </td>

                  {/* Action */}

                  <td>

                    <button
                      className="view-order-btn"
                      onClick={() =>
                        navigate(
                          `/admin/orders/${order._id}`
                        )
                      }
                    >
                      <Eye size={16} />
                      View
                    </button>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default AdminOrders;