import React, { useEffect, useState } from "react";
import {
Search,
Plus,
Edit,
Trash2,
Package,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./AdminProducts.css";

const AdminProducts = () => {
const navigate = useNavigate();

const userRole = localStorage.getItem("userRole");

const [products, setProducts] = useState([]);
const [search, setSearch] = useState("");
const [loading, setLoading] = useState(true);

useEffect(() => {
if (userRole !== "admin") {
setLoading(false);
return;
}


fetchProducts();


}, [userRole]);

const fetchProducts = async () => {
try {
const response = await fetch(
`${import.meta.env.VITE_API_URL}/api/products`
);


  const data = await response.json();

  if (response.ok) {
    setProducts(data.products || []);
  }
} catch (error) {
  console.error("Failed to fetch products:", error);
} finally {
  setLoading(false);
}


};

const handleStatusChange = async (product) => {
try {
const response = await fetch(
`${import.meta.env.VITE_API_URL}/api/products/${product._id}/status`,
{
method: "PATCH",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({
isActive: !product.isActive,
}),
}
);

  const data = await response.json();

  if (!response.ok) {
    alert(data.message || "Failed to update status");
    return;
  }

  setProducts((prevProducts) =>
    prevProducts.map((item) =>
      item._id === product._id
        ? {
            ...item,
            isActive: data.product.isActive,
          }
        : item
    )
  );
} catch (error) {
  console.error("Status update error:", error);
  alert("Something went wrong");
}


};

const filteredProducts = products.filter((product) =>
product.name?.toLowerCase().includes(search.toLowerCase())
);

const openProduct = (productId) => {
navigate(`/admin/products/${productId}`);
};

const openEditProduct = (productId) => {
navigate(`/admin/products/edit/${productId}`);
};

if (userRole !== "admin") {
return ( <div className="admin-access-denied"> <h2>Access Denied</h2>
<button onClick={() => navigate("/")}>
Go Home </button> </div>
);
}

return ( <div className="admin-products-page"> <header className="admin-products-header"> <div> <h1>Products</h1> <p>Manage products available on your platform.</p> </div>

```
    <button
      className="add-product-button"
      onClick={() => navigate("/admin/products/add")}
    >
      <Plus size={18} />
      Add Product
    </button>
  </header>

  <div className="admin-products-toolbar">
    <div className="admin-product-search">
      <Search size={18} />

      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>

    <span className="admin-product-count">
      {filteredProducts.length} Products
    </span>
  </div>

  {loading ? (
    <div className="admin-products-loading">
      Loading products...
    </div>
  ) : filteredProducts.length === 0 ? (
    <div className="admin-products-empty">
      <Package size={40} />
      <h2>No products found</h2>
      <p>Try another search or add a new product.</p>
    </div>
  ) : (
    <div className="admin-products-table-wrapper">
      <table className="admin-products-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Brand</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredProducts.map((product) => {
            const image =
              product.images?.[0] ||
              product.logo ||
              "";

            return (
              <tr
                key={product._id}
                className="admin-product-row"
                onClick={() => openProduct(product._id)}
                title="View product details"
              >
                <td>
                  <div className="admin-product-info">
                    <div className="admin-product-image">
                      {image ? (
                        <img
                          src={image}
                          alt={product.name}
                        />
                      ) : (
                        <Package size={20} />
                      )}
                    </div>

                    <div>
                      <strong>{product.name}</strong>
                      <span>ID: {product._id.slice(-6)}</span>
                    </div>
                  </div>
                </td>

                <td>{product.brand?.name || "-"}</td>

                <td>{product.category?.name || "-"}</td>

                <td>
                  ₹{product.price?.toLocaleString("en-IN")}
                </td>

                <td>
                  <span
                    className={
                      product.stock <= 10
                        ? "stock-low"
                        : "stock-normal"
                    }
                  >
                    {product.stock ?? 0}
                  </span>
                </td>

                <td>
                  <button
                    className={
                      product.isActive
                        ? "product-status-button active"
                        : "product-status-button inactive"
                    }
                    onClick={(event) => {
                      event.stopPropagation();
                      handleStatusChange(product);
                    }}
                  >
                    {product.isActive ? "Active" : "Inactive"}
                  </button>
                </td>

                <td>
                  <div className="product-actions">
                    <button
                      type="button"
                      title="Edit product"
                      onClick={(event) => {
                        event.stopPropagation();
                        openEditProduct(product._id);
                      }}
                    >
                      <Edit size={17} />
                    </button>

                    <button
                      type="button"
                      title="Delete product"
                      className="delete-action"
                      onClick={(event) => {
                        event.stopPropagation();
                        alert("Delete API will be connected next.");
                      }}
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

export default AdminProducts;
