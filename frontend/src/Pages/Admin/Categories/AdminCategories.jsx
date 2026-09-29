import React, { useEffect, useState } from "react";
import { Plus, Search, Edit, Trash2, Folder } from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../../../services/api";
import { getCategories } from "../../../services/categoryApi";

import "./AdminCategories.css";

const AdminCategories = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");

  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    if (userRole !== "admin") return;
    fetchCategories();
  }, [userRole]);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  // Activate / Deactivate category
  const handleStatusChange = async (category) => {
    try {
      const response = await api.patch(
        `/categories/${category._id}/status`,
        {
          isActive: !category.isActive,
        }
      );

      setCategories((prevCategories) =>
        prevCategories.map((item) =>
          item._id === category._id
            ? {
                ...item,
                isActive: response.data.category.isActive,
              }
            : item
        )
      );
    } catch (error) {
      console.error("Category status update error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to update category status"
      );
    }
  };

  const filteredCategories = categories
  .filter((category) => {
    const matchesSearch = category.name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && category.isActive) ||
      (statusFilter === "inactive" && !category.isActive);

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
    <div className="admin-categories-page">

      <header className="admin-categories-header">
        <div>
          <h1>Categories</h1>
          <p>Manage product categories on your platform.</p>
        </div>

        <button
          className="add-category-button"
          onClick={() =>
            navigate("/admin/categories/add")
          }
        >
          <Plus size={18} />
          Add Category
        </button>
      </header>

      <div className="admin-categories-toolbar">

  <div className="admin-category-search">
    <Search size={18} />

    <input
      type="text"
      placeholder="Search categories..."
      value={search}
      onChange={(e) =>
        setSearch(e.target.value)
      }
    />
  </div>

  <div className="admin-category-filters">

    <select
      value={statusFilter}
      onChange={(e) =>
        setStatusFilter(e.target.value)
      }
    >
      <option value="all">All Status</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </select>

    <select
      value={sortBy}
      onChange={(e) =>
        setSortBy(e.target.value)
      }
    >
      <option value="newest">Newest</option>
      <option value="oldest">Oldest</option>
      <option value="name-asc">Name A–Z</option>
      <option value="name-desc">Name Z–A</option>
    </select>

    <span className="admin-category-count">
      {filteredCategories.length} Categories
    </span>

  </div>

</div>

      {loading ? (
        <div className="admin-categories-loading">
          Loading categories...
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="admin-categories-empty">
          <Folder size={40} />

          <h2>No categories found</h2>

          <p>
            Try another search or add a new category.
          </p>
        </div>
      ) : (
        <div className="admin-categories-table-wrapper">

          <table className="admin-categories-table">

            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredCategories.map((category) => {

                const image = category.image || "";

                return (
                  <tr key={category._id}>

                    {/* Category */}
                    <td>
                      <div className="admin-category-info">

                        <div className="admin-category-image">
                          {image ? (
                            <img
                              src={image}
                              alt={category.name}
                            />
                          ) : (
                            <Folder size={20} />
                          )}
                        </div>

                        <div>
                          <strong>
                            {category.name}
                          </strong>

                          <span>
                            ID: {category._id.slice(-6)}
                          </span>
                        </div>

                      </div>
                    </td>

                    {/* Description */}
                    <td>
                      {category.description || "-"}
                    </td>

                    {/* Status */}
                    <td>
                      <button
                        className={
                          category.isActive
                            ? "category-status-button active"
                            : "category-status-button inactive"
                        }
                        onClick={() =>
                          handleStatusChange(category)
                        }
                      >
                        {category.isActive
                          ? "Active"
                          : "Inactive"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="category-actions">

                        <button
                          title="Edit"
                          onClick={() =>
                            navigate(
                              `/admin/categories/edit/${category._id}`
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

export default AdminCategories;