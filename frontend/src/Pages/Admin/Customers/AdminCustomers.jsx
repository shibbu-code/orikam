import React, { useEffect, useMemo, useState } from "react";
import { Search, Eye, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../../../services/api";

import "./AdminCustomers.css";

const AdminCustomers = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");

    if (userRole !== "admin") {
      navigate("/");
      return;
    }

    fetchCustomers();
  }, [navigate]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const [customerResponse, orderResponse] =
        await Promise.all([
          api.get("/customers"),
          api.get("/orders"),
        ]);

      setCustomers(
        customerResponse.data.customers || []
      );

      setOrders(
        orderResponse.data.orders || []
      );
    } catch (error) {
      console.error("Fetch customers error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load customers"
      );
    } finally {
      setLoading(false);
    }
  };

  const getOrderCount = (customerId) => {
    return orders.filter(
      (order) =>
        order.user?._id === customerId ||
        order.user === customerId
    ).length;
  };

  const filteredCustomers = useMemo(() => {
    return [...customers]
      .filter((customer) => {
        const query = search.toLowerCase();

        return (
          customer.name
            ?.toLowerCase()
            .includes(query) ||
          customer.email
            ?.toLowerCase()
            .includes(query) ||
          customer.phone
            ?.toLowerCase()
            .includes(query)
        );
      })
      .sort((a, b) => {
        if (sortBy === "name-asc") {
          return a.name.localeCompare(b.name);
        }

        if (sortBy === "name-desc") {
          return b.name.localeCompare(a.name);
        }

        if (sortBy === "orders") {
          return (
            getOrderCount(b._id) -
            getOrderCount(a._id)
          );
        }

        if (sortBy === "oldest") {
          return (
            new Date(a.createdAt) -
            new Date(b.createdAt)
          );
        }

        return (
          new Date(b.createdAt) -
          new Date(a.createdAt)
        );
      });
  }, [customers, orders, search, sortBy]);

  if (loading) {
    return (
      <div className="admin-customers-page">
        <p>Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="admin-customers-page">
      {/* Header */}
      <div className="customers-header">
        <div>
          <h1>Customers</h1>
          <p>
            Manage and view all registered customers
          </p>
        </div>

        <div className="customer-total">
          <Users size={20} />
          <span>{customers.length} Customers</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="customers-toolbar">
        <div className="customer-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value)
          }
        >
          <option value="newest">
            Newest First
          </option>

          <option value="oldest">
            Oldest First
          </option>

          <option value="name-asc">
            Name A-Z
          </option>

          <option value="name-desc">
            Name Z-A
          </option>

          <option value="orders">
            Most Orders
          </option>
        </select>
      </div>

      {error && (
        <div className="customers-error">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="customers-table-wrapper">
        <table className="customers-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Orders</th>
              <th>Joined</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="empty-customers"
                >
                  No customers found
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr key={customer._id}>
                  <td>
                    <div className="customer-info">
                      <div className="customer-avatar">
                        {customer.name
                          ?.charAt(0)
                          ?.toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {customer.name}
                        </strong>
                      </div>
                    </div>
                  </td>

                  <td>{customer.email}</td>

                  <td>
                    {customer.phone || "—"}
                  </td>

                  <td>
                    <span className="order-count">
                      {getOrderCount(customer._id)}
                    </span>
                  </td>

                  <td>
                    {new Date(
                      customer.createdAt
                    ).toLocaleDateString()}
                  </td>

                  <td>
                    <button
                      className="view-customer-btn"
                      onClick={() =>
                        navigate(
                          `/admin/customers/${customer._id}`
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

export default AdminCustomers;