import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Tag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getBrands,
  updateBrandStatus,
} from "../../../services/brandApi";

import "./AdminBrands.css";

const AdminBrands = () => {
  const navigate = useNavigate();

  const userRole = localStorage.getItem("userRole");

  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userRole !== "admin") return;

    fetchBrands();
  }, [userRole]);

  const fetchBrands = async () => {
    try {
      const response = await getBrands();

      setBrands(response.data.brands || []);
    } catch (error) {
      console.error(
        "Failed to fetch brands:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (brand) => {
    try {
      const response = await updateBrandStatus(
        brand._id,
        !brand.isActive
      );

      setBrands((prevBrands) =>
        prevBrands.map((item) =>
          item._id === brand._id
            ? {
                ...item,
                isActive:
                  response.data.brand.isActive,
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        "Brand status update error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to update brand status"
      );
    }
  };

  const filteredBrands = brands
    .filter((brand) => {
      const matchesSearch = brand.name
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          brand.isActive) ||
        (statusFilter === "inactive" &&
          !brand.isActive);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "name-asc") {
        return a.name.localeCompare(b.name);
      }

      if (sortBy === "name-desc") {
        return b.name.localeCompare(a.name);
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

  if (userRole !== "admin") {
    return (
      <div className="admin-access-denied">
        <h2>Access Denied</h2>

        <button onClick={() => navigate("/")}>
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="admin-brands-page">

      <header className="admin-brands-header">

        <div>
          <h1>Brands</h1>
          <p>
            Manage brands available on your platform.
          </p>
        </div>

        <button
          className="add-brand-button"
          onClick={() =>
            navigate("/admin/brands/add")
          }
        >
          <Plus size={18} />
          Add Brand
        </button>

      </header>

      <div className="admin-brands-toolbar">

        <div className="admin-brand-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search brands..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <div className="admin-brand-filters">

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="all">
              All Status
            </option>

            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>
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

            <option value="name-asc">
              Name A–Z
            </option>

            <option value="name-desc">
              Name Z–A
            </option>
          </select>

          <span className="admin-brand-count">
            {filteredBrands.length} Brands
          </span>

        </div>

      </div>

      {loading ? (
        <div className="admin-brands-loading">
          Loading brands...
        </div>
      ) : filteredBrands.length === 0 ? (
        <div className="admin-brands-empty">

          <Tag size={40} />

          <h2>No brands found</h2>

          <p>
            Try another search or add a new brand.
          </p>

        </div>
      ) : (

        <div className="admin-brands-table-wrapper">

          <table className="admin-brands-table">

            <thead>
              <tr>
                <th>Brand</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredBrands.map((brand) => {

                return (
                  <tr key={brand._id}>

                    <td>

                      <div className="admin-brand-info">

                        <div className="admin-brand-image">

                          {brand.logo ? (
                            <img
                              src={brand.logo}
                              alt={brand.name}
                            />
                          ) : (
                            <Tag size={20} />
                          )}

                        </div>

                        <div>

                          <strong>
                            {brand.name}
                          </strong>

                          <span>
                            ID:{" "}
                            {brand._id.slice(-6)}
                          </span>

                        </div>

                      </div>

                    </td>

                    <td>
                      {brand.description || "-"}
                    </td>

                    <td>

                      <button
                        className={
                          brand.isActive
                            ? "brand-status-button active"
                            : "brand-status-button inactive"
                        }
                        onClick={() =>
                          handleStatusChange(brand)
                        }
                      >
                        {brand.isActive
                          ? "Active"
                          : "Inactive"}
                      </button>

                    </td>

                    <td>

                      <div className="brand-actions">

                        <button
                          title="Edit"
                          onClick={() =>
                            navigate(
                              `/admin/brands/edit/${brand._id}`
                            )
                          }
                        >
                          <Edit size={17} />
                        </button>

                        <button
                          title="Delete"
                          className="delete-action"
                          onClick={() =>
                            alert(
                              "Delete API will be connected later."
                            )
                          }
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>

                    </td>

                  </tr>
                );

              })}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
};

export default AdminBrands;