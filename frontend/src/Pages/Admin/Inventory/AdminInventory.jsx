import React, { useEffect, useMemo, useState } from "react";
import { Search, Package, Warehouse } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getInventory } from "../../../services/inventoryApi";
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
const quantity = Number(stock ?? 0);


if (quantity === 0) return "out";
if (quantity <= 10) return "low";

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
      return Number(b.stock ?? 0) - Number(a.stock ?? 0);
    }

    if (sortBy === "stock-low") {
      return Number(a.stock ?? 0) - Number(b.stock ?? 0);
    }

    if (sortBy === "name-asc") {
      return (a.name || "").localeCompare(b.name || "");
    }

    if (sortBy === "name-desc") {
      return (b.name || "").localeCompare(a.name || "");
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

const openWarehouseManagement = () => {
navigate("/admin/warehouses");
};

return ( <div className="admin-inventory-page"> <div className="inventory-header"> <div> <h1>Inventory</h1> <p>View product availability across all warehouses.</p> </div>

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
        <option key={category._id} value={category._id}>
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
        <option key={brand._id} value={brand._id}>
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
          <th>Total Stock</th>
          <th>Status</th>
          <th>Manage</th>
        </tr>
      </thead>

      <tbody>
        {filteredProducts.length === 0 ? (
          <tr>
            <td colSpan="6" className="empty-inventory">
              <Package size={32} />
              <span>No products found.</span>
            </td>
          </tr>
        ) : (
          filteredProducts.map((product) => {
            const stock = Number(product.stock ?? 0);
            const status = getStockStatus(stock);

            return (
              <tr key={product._id}>
                <td>
                  <div className="inventory-product">
                    {product.logo || product.images?.[0] ? (
                      <img
                        src={product.logo || product.images?.[0]}
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

                <td>{product.brand?.name || "—"}</td>

                <td>{product.category?.name || "—"}</td>

                <td>
                  <strong>{stock}</strong>
                </td>

                <td>
                  <span className={`stock-badge ${status}`}>
                    {status === "in" && "In Stock"}
                    {status === "low" && "Low Stock"}
                    {status === "out" && "Out of Stock"}
                  </span>
                </td>

                <td>
                  <button
                    type="button"
                    className="update-stock-btn"
                    onClick={openWarehouseManagement}
                  >
                    <Warehouse size={15} />
                    Manage Stock
                  </button>
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
