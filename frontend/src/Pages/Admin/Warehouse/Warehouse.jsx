import { useEffect, useState } from "react";
import "./Warehouse.css";
const API = `${import.meta.env.VITE_API_URL}/api/warehouses`;
const PRODUCT_API = `${import.meta.env.VITE_API_URL}/api/products`;

export default function Warehouses() {
const [warehouses, setWarehouses] = useState([]);
const [products, setProducts] = useState([]);
const [selectedWarehouse, setSelectedWarehouse] = useState(null);
const [inventory, setInventory] = useState([]);
const [showForm, setShowForm] = useState(false);
const [showStockForm, setShowStockForm] = useState(false);
const [loading, setLoading] = useState(true);
const [stockLoading, setStockLoading] = useState(false);
const [error, setError] = useState("");
const [message, setMessage] = useState("");
const [editingProduct, setEditingProduct] = useState(null);

const emptyWarehouseForm = {
name: "",
code: "",
street: "",
city: "",
state: "",
pincode: "",
contactPerson: "",
phone: "",
};

const [form, setForm] = useState(emptyWarehouseForm);
const [stockForm, setStockForm] = useState({
productId: "",
quantity: "",
});

const fetchWarehouses = async () => {
try {
setLoading(true);
const response = await fetch(API);
const data = await response.json();


  if (!response.ok) {
    throw new Error(data.message || "Failed to load warehouses");
  }

  setWarehouses(data.warehouses || []);
  setError("");
} catch (err) {
  setError(err.message);
} finally {
  setLoading(false);
}


};

useEffect(() => {
fetchWarehouses();
}, []);

const fetchProducts = async () => {
try {
const response = await fetch(PRODUCT_API);
const data = await response.json();


if (!response.ok) {
  throw new Error(data.message || "Failed to load products");
}

const list = Array.isArray(data)
  ? data
  : data.products || data.data || data.allProducts || [];

setProducts(list);


} catch (err) {
setError(err.message);
}
};


const fetchInventory = async (warehouse) => {
try {
setSelectedWarehouse(warehouse);
setStockLoading(true);
setError("");
setMessage("");


  const response = await fetch(
    `${API}/${warehouse._id}/inventory`
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load warehouse stock");
  }

  setInventory(data.inventory || []);
  await fetchProducts();
} catch (err) {
  setError(err.message);
} finally {
  setStockLoading(false);
}


};

const handleChange = (e) => {
setForm({ ...form, [e.target.name]: e.target.value });
};

const handleSubmit = async (e) => {
e.preventDefault();
setError("");
setMessage("");


try {
  const response = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: form.name,
      code: form.code,
      address: {
        street: form.street,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        country: "India",
      },
      contactPerson: form.contactPerson,
      phone: form.phone,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create warehouse");
  }

  setForm(emptyWarehouseForm);
  setShowForm(false);
  setMessage("Warehouse created successfully.");
  await fetchWarehouses();
} catch (err) {
  setError(err.message);
}


};

const handleStockSubmit = async (e) => {
e.preventDefault();
if (!selectedWarehouse) return;


setError("");
setMessage("");

try {
  const isEditing = Boolean(editingProduct);

  const url = isEditing
    ? `${API}/${selectedWarehouse._id}/inventory/${editingProduct}`
    : `${API}/${selectedWarehouse._id}/inventory`;

  const response = await fetch(url, {
    method: isEditing ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productId: stockForm.productId,
      quantity: Number(stockForm.quantity),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to save stock");
  }

  setStockForm({ productId: "", quantity: "" });
  setEditingProduct(null);
  setShowStockForm(false);
  setMessage("Warehouse stock saved successfully.");

  await fetchInventory(selectedWarehouse);
} catch (err) {
  setError(err.message);
}


};

const startEditStock = (item) => {
setEditingProduct(item.product?._id);
setStockForm({
productId: item.product?._id || "",
quantity: String(item.quantity),
});
setShowStockForm(true);
setError("");
setMessage("");
};

const startAddStock = () => {
setEditingProduct(null);
setStockForm({ productId: "", quantity: "" });
setShowStockForm(true);
setError("");
setMessage("");
};

return (

  <div className="warehouse-page">
    <div className="warehouse-header">
      <div>
        <h1>Warehouses</h1>
        <p>Manage storage locations and product stock.</p>
      </div>


  <button
    onClick={() => setShowForm(!showForm)}
    className="warehouse-btn warehouse-btn-primary"
  >
    {showForm ? "Cancel" : "+ Add Warehouse"}
  </button>
</div>

{error && (
  <div className="warehouse-alert warehouse-alert-error">{error}</div>
)}

{message && (
  <div className="warehouse-alert warehouse-alert-success">{message}</div>
)}

{showForm && (
  <form onSubmit={handleSubmit} className="warehouse-form">
    {[
      ["name", "Warehouse Name"],
      ["code", "Warehouse Code"],
      ["street", "Street Address"],
      ["city", "City"],
      ["state", "State"],
      ["pincode", "Pincode"],
      ["contactPerson", "Contact Person"],
      ["phone", "Phone Number"],
    ].map(([name, label]) => (
      <input
        key={name}
        name={name}
        value={form[name]}
        onChange={handleChange}
        placeholder={label}
        required={["name", "code", "city"].includes(name)}
        className="warehouse-input"
      />
    ))}

    <button
      type="submit"
      className="warehouse-btn warehouse-btn-primary warehouse-form-submit"
    >
      Save Warehouse
    </button>
  </form>
)}

{loading ? (
  <p className="warehouse-loading">Loading warehouses...</p>
) : warehouses.length === 0 ? (
  <div className="warehouse-empty">
    No warehouses found. Add your first warehouse.
  </div>
) : (
  <div className="warehouse-table-card">
    <div className="warehouse-table-wrapper">
      <table className="warehouse-table">
        <thead>
          <tr>
            <th>Warehouse</th>
            <th>Code</th>
            <th>Location</th>
            <th>Contact</th>
            
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {warehouses.map((warehouse) => (
            <tr key={warehouse._id}>
              <td className="warehouse-name">{warehouse.name}</td>
              <td>{warehouse.code}</td>
              <td>
                {[warehouse.address?.city, warehouse.address?.state]
                  .filter(Boolean)
                  .join(", ")}
              </td>
              <td>
                <div className="warehouse-contact">
                  <span>{warehouse.contactPerson || "—"}</span>
                  <small>{warehouse.phone || ""}</small>
                </div>
              </td>
              
              <td>
                <button
                  onClick={() => fetchInventory(warehouse)}
                  className="warehouse-btn warehouse-btn-secondary"
                >
                  View Stock
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}

{selectedWarehouse && (
  <section className="warehouse-stock-section">
    <div className="warehouse-stock-header">
      <div>
        <h2>{selectedWarehouse.name} — Stock</h2>
        <p>Warehouse code: {selectedWarehouse.code}</p>
      </div>

      <button
        onClick={startAddStock}
        className="warehouse-btn warehouse-btn-primary"
      >
        + Add Product Stock
      </button>
    </div>

    {showStockForm && (
      <form onSubmit={handleStockSubmit} className="warehouse-stock-form">
        <div className="warehouse-stock-form-grid">
          <select
            value={stockForm.productId}
            onChange={(e) =>
              setStockForm({ ...stockForm, productId: e.target.value })
            }
            disabled={Boolean(editingProduct)}
            required
            className="warehouse-select"
          >
            <option value="">Select product</option>
            {products.map((product) => (
              <option key={product._id} value={product._id}>
                {product.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="0"
            step="1"
            required
            placeholder="Quantity"
            value={stockForm.quantity}
            onChange={(e) =>
              setStockForm({ ...stockForm, quantity: e.target.value })
            }
            className="warehouse-input"
          />

          <div className="warehouse-stock-actions">
            <button
              type="submit"
              className="warehouse-btn warehouse-btn-primary"
            >
              {editingProduct ? "Update Stock" : "Save Stock"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowStockForm(false);
                setEditingProduct(null);
              }}
              className="warehouse-btn warehouse-btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    )}

    {stockLoading ? (
      <p className="warehouse-loading">Loading stock...</p>
    ) : inventory.length === 0 ? (
      <div className="warehouse-empty">
        No products assigned to this warehouse yet.
      </div>
    ) : (
      <div className="warehouse-table-card">
        <div className="warehouse-table-wrapper">
          <table className="warehouse-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Warehouse Quantity</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {inventory.map((item) => (
                <tr key={item._id}>
                  <td className="warehouse-name">
                    {item.product?.name || "Product unavailable"}
                  </td>
                  <td>
                    {item.product?.price != null
                      ? `₹${item.product.price}`
                      : "—"}
                  </td>
                  <td className="warehouse-quantity">{item.quantity}</td>
                  <td>
                    {item.product?._id && (
                      <button
                        onClick={() => startEditStock(item)}
                        className="warehouse-btn warehouse-btn-secondary"
                      >
                        Edit Quantity
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </section>
)}


  </div>
);

}
