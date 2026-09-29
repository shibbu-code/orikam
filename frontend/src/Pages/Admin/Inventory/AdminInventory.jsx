import React, { useEffect, useMemo, useState } from "react";
import { Search, Package, Edit2, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getInventory, updateInventoryStock } from "../../../services/inventoryApi";
import { getCategories } from "../../../services/categoryApi";
import { getBrands } from "../../../services/brandApi";

import "./AdminInventory.css";

const AdminInventory = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [editingId, setEditingId] = useState(null);
  const [stockValue, setStockValue] = useState("");

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");

    if (userRole !== "admin") {
      navigate("/");
      return;
    }

    fetchInventory();
  }, [navigate]);

  const fetchInventory = async () => {
    try {
      const [inventoryResponse, categoryResponse, brandResponse] =
        await Promise.all([
          getInventory(),
          getCategories(),
          getBrands(),
        ]);

      setProducts(inventoryResponse.data.products || []);
      setCategories(categoryResponse.data.categories || []);
      setBrands(brandResponse.data.brands || []);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return "out";
    if (stock <= 10) return "low";
    return "in";
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const searchText = search.toLowerCase();

        const matchesSearch =
          product.name?.toLowerCase().includes(searchText) ||
          product.brand?.name?.toLowerCase().includes(searchText) ||
          product.category?.name?.toLowerCase().includes(searchText);

        const matchesCategory =
          categoryFilter === "all" ||
          product.category?._id === categoryFilter;

        const matchesBrand =
          brandFilter === "all" ||
          product.brand?._id === brandFilter;

        const status = getStockStatus(product.stock);

        const matchesStock =
          stockFilter === "all" || status === stockFilter;

        return (
          matchesSearch &&
          matchesCategory &&
          matchesBrand &&
          matchesStock
        );
      })
      .sort((a, b) => {
        if (sortBy === "stock-high") {
          return b.stock - a.stock;
        }

        if (sortBy === "stock-low") {
          return a.stock - b.stock;
        }

        if (sortBy === "name-asc") {
          return a.name.localeCompare(b.name);
        }

        if (sortBy === "name-desc") {
          return b.name.localeCompare(a.name);
        }

        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [
    products,
    search,
    categoryFilter,
    brandFilter,
    stockFilter,
    sortBy,
  ]);

  const startEditing = (product) => {
    setEditingId(product._id);
    setStockValue(product.stock);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setStockValue("");
  };

  const saveStock = async (productId) => {
    try {
      const response = await updateInventoryStock(
        productId,
        Number(stockValue)
      );

      const updatedProduct = response.data.product;

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === productId
            ? updatedProduct
            : product
        )
      );

      cancelEditing();
    } catch (error) {
      console.error("Stock update error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to update stock"
      );
    }
  };

  return (
    <div className="admin-inventory-page">

      <div className="inventory-header">
        <div>
          <h1>Inventory</h1>
          <p>Manage product stock and availability.</p>
        </div>

        <div className="inventory-count">
          {filteredProducts.length} Products
        </div>
      </div>

      <div className="inventory-toolbar">

        <div className="inventory-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search product, brand or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All Categories</option>

          {categories.map((category) => (
            <option
              key={category._id}
              value={category._id}
            >
              {category.name}
            </option>
          ))}
        </select>

        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
        >
          <option value="all">All Brands</option>

          {brands.map((brand) => (
            <option
              key={brand._id}
              value={brand._id}
            >
              {brand.name}
            </option>
          ))}
        </select>

        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
        >
          <option value="all">All Stock</option>
          <option value="in">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
          <option value="stock-high">Stock High-Low</option>
          <option value="stock-low">Stock Low-High</option>
        </select>

      </div>

      <div className="inventory-table-container">

        <table className="inventory-table">

          <thead>
            <tr>
              <th>Product</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {filteredProducts.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="empty-inventory"
                >
                  <Package size={32} />
                  <span>No products found.</span>
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {

                const status = getStockStatus(product.stock);

                return (
                  <tr key={product._id}>

                    <td>
                      <div className="inventory-product">

                        {product.logo ||
                        product.images?.[0] ? (
                          <img
                            src={
                              product.logo ||
                              product.images?.[0]
                            }
                            alt={product.name}
                          />
                        ) : (
                          <div className="product-placeholder">
                            <Package size={18} />
                          </div>
                        )}

                        <span>{product.name}</span>

                      </div>
                    </td>

                    <td>
                      {product.brand?.name || "—"}
                    </td>

                    <td>
                      {product.category?.name || "—"}
                    </td>

                    <td>

                      {editingId === product._id ? (
                        <div className="stock-edit">

                          <input
                            type="number"
                            min="0"
                            value={stockValue}
                            onChange={(e) =>
                              setStockValue(e.target.value)
                            }
                          />

                          <button
                            className="save-stock"
                            onClick={() =>
                              saveStock(product._id)
                            }
                          >
                            <Check size={16} />
                          </button>

                          <button
                            className="cancel-stock"
                            onClick={cancelEditing}
                          >
                            <X size={16} />
                          </button>

                        </div>
                      ) : (
                        <strong>{product.stock}</strong>
                      )}

                    </td>

                    <td>

                      <span
                        className={`stock-badge ${status}`}
                      >
                        {status === "in" && "In Stock"}
                        {status === "low" && "Low Stock"}
                        {status === "out" && "Out of Stock"}
                      </span>

                    </td>

                    <td>

                      {editingId !== product._id && (
                        <button
                          className="update-stock-btn"
                          onClick={() =>
                            startEditing(product)
                          }
                        >
                          <Edit2 size={15} />
                          Update
                        </button>
                      )}

                    </td>

                  </tr>
                );
              })
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default AdminInventory;