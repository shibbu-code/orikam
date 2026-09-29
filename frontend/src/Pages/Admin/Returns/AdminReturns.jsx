import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import "./AdminReturns.css";

const AdminReturns = () => {
  const navigate = useNavigate();

  const [returns, setReturns] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");

    if (userRole !== "admin") {
      navigate("/login");
      return;
    }

    fetchReturns();
  }, [navigate]);

  const fetchReturns = async () => {
    try {
      setLoading(true);

      const response = await api.get("/orders/returns");

      setReturns(response.data.returns || []);
    } catch (error) {
      console.error("Failed to fetch returns:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReturns = returns
    .filter((item) => {
      const customerName = item.user?.name || "";
      const customerEmail = item.user?.email || "";
      const orderId = item._id || "";
      const reason = item.returnReason || "";

      const searchText = search.toLowerCase();

      const matchesSearch =
        customerName.toLowerCase().includes(searchText) ||
        customerEmail.toLowerCase().includes(searchText) ||
        orderId.toLowerCase().includes(searchText) ||
        reason.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "ALL" ||
        item.returnStatus === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "oldest") {
        return (
          new Date(a.returnRequestedAt) -
          new Date(b.returnRequestedAt)
        );
      }

      if (sortBy === "status") {
        return a.returnStatus.localeCompare(
          b.returnStatus
        );
      }

      return (
        new Date(b.returnRequestedAt) -
        new Date(a.returnRequestedAt)
      );
    });

  const getStatusClass = (status) => {
  if (!status) {
    return "return-status";
  }

  return `return-status ${status.toLowerCase()}`;
};

  return (
    <div className="admin-returns-page">
      <div className="admin-returns-header">
         <button
      className="back-dashboard-btn"
      onClick={() => navigate("/admin")}
    >
      ← Back to Dashboard
    </button>
        <div>
          <h1>Returns</h1>
          <p>
            Manage customer return requests and
            refunds.
          </p>
        </div>

        <div className="returns-count">
          {returns.length} Returns
        </div>
      </div>

      <div className="returns-toolbar">
        <input
          type="text"
          placeholder="Search order, customer or reason..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="ALL">All Status</option>
          <option value="REQUESTED">
            Requested
          </option>
          <option value="APPROVED">
            Approved
          </option>
          <option value="PICKED_UP">
            Picked Up
          </option>
          <option value="RECEIVED">
            Received
          </option>
          <option value="REFUNDED">
            Refunded
          </option>
          <option value="REJECTED">
            Rejected
          </option>
        </select>

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
          <option value="status">
            Status
          </option>
        </select>
      </div>

      <div className="returns-table-wrapper">
        {loading ? (
          <div className="returns-loading">
            Loading returns...
          </div>
        ) : filteredReturns.length === 0 ? (
          <div className="returns-empty">
            No return requests found.
          </div>
        ) : (
          <table className="returns-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Reason</th>
                <th>Requested</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredReturns.map((item) => (
                <tr key={item._id}>
                  <td>
                    <strong>
                      #{item._id.slice(-8)}
                    </strong>
                  </td>

                  <td>
                    <div className="return-customer">
                      <strong>
                        {item.user?.name ||
                          "Unknown Customer"}
                      </strong>

                      <span>
                        {item.user?.email || "-"}
                      </span>
                    </div>
                  </td>

                  <td>
                    <div className="return-reason">
                      {item.returnReason || "-"}
                    </div>
                  </td>

                  <td>
                    {item.returnRequestedAt
                      ? new Date(
                          item.returnRequestedAt
                        ).toLocaleDateString(
                          "en-IN"
                        )
                      : "-"}
                  </td>

                  <td>
                    <span
                      className={getStatusClass(
                        item.returnStatus
                      )}
                    >
                      {(item.returnStatus || "REQUESTED").replace(
                        /_/g,
                        " "
                      )}
                    </span>
                  </td>

                  <td>
                    <button
                      className="view-return-btn"
                      onClick={() =>
                        navigate(
                          `/admin/returns/${item._id}`
                        )
                      }
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminReturns;