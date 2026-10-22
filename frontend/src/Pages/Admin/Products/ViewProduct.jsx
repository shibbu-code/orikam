import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
ArrowLeft,
Package,
Edit,
Tag,
Boxes,
Building2,
Layers3,
IndianRupee,
} from "lucide-react";

import "./ViewProduct.css";

const AdminProductDetails = () => {
const { productId } = useParams();
const navigate = useNavigate();

const [product, setProduct] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
const fetchProduct = async () => {
try {
setLoading(true);
setError("");


    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/products/${productId}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load product.");
    }

    const fetchedProduct = data.product || data;

    if (!fetchedProduct?._id) {
      throw new Error("Product details were not found.");
    }

    setProduct(fetchedProduct);
  } catch (err) {
    console.error("Fetch product details error:", err);
    setError(err.message || "Unable to load product details.");
  } finally {
    setLoading(false);
  }
};

fetchProduct();


}, [productId]);

if (loading) {
return ( <div className="admin-product-details-state">
Loading product details... </div>
);
}

if (error || !product) {
return ( <div className="admin-product-details-state"> <p>{error || "Product not found."}</p>

    <button onClick={() => navigate("/admin/products")}>
      <ArrowLeft size={16} />
      Back to Products
    </button>
  </div>
);


}

const image =
product.images?.[0] ||
product.logo ||
"";

const formatPrice = (price) =>
Number(price ?? 0).toLocaleString("en-IN");

return ( <div className="admin-product-details-page"> <div className="admin-product-details-header">
<button
className="product-details-back"
onClick={() => navigate("/admin/products")}
> <ArrowLeft size={18} />
Back to Products </button>


    <button
      className="product-details-edit"
      onClick={() =>
        navigate(`/admin/products/edit/${product._id}`)
      }
    >
      <Edit size={16} />
      Edit Product
    </button>
  </div>

  <div className="admin-product-details-title">
    <div>
      <span className="product-details-eyebrow">
        PRODUCT DETAILS
      </span>

      <h1>{product.name}</h1>

      <p>Product ID: {product._id}</p>
    </div>

    <span
      className={`product-details-status ${
        product.isActive ? "active" : "inactive"
      }`}
    >
      {product.isActive ? "Active" : "Inactive"}
    </span>
  </div>

  <div className="admin-product-details-grid">
    <section className="product-details-card product-details-image-card">
      <h2>Product Image</h2>

      <div className="product-details-image">
        {image ? (
          <img src={image} alt={product.name} />
        ) : (
          <Package size={64} />
        )}
      </div>

      {product.images?.length > 1 && (
        <div className="product-details-thumbnails">
          {product.images.map((imageUrl, index) => (
            <img
              key={`${imageUrl}-${index}`}
              src={imageUrl}
              alt={`${product.name} ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>

    <section className="product-details-card">
      <h2>Basic Information</h2>

      <div className="product-details-info-row">
        <span>
          <Tag size={16} />
          Product Name
        </span>
        <strong>{product.name || "—"}</strong>
      </div>

      <div className="product-details-info-row">
        <span>
          <Building2 size={16} />
          Brand
        </span>
        <strong>{product.brand?.name || "—"}</strong>
      </div>

      <div className="product-details-info-row">
        <span>
          <Layers3 size={16} />
          Category
        </span>
        <strong>{product.category?.name || "—"}</strong>
      </div>

      <div className="product-details-info-row">
        <span>
          <IndianRupee size={16} />
          Selling Price
        </span>
        <strong>₹{formatPrice(product.price)}</strong>
      </div>

      {product.b2bPrice !== undefined && (
        <div className="product-details-info-row">
          <span>
            <IndianRupee size={16} />
            B2B Price
          </span>
          <strong>₹{formatPrice(product.b2bPrice)}</strong>
        </div>
      )}

      <div className="product-details-info-row">
        <span>
          <Boxes size={16} />
          Recorded Stock
        </span>
        <strong>{product.stock ?? 0} units</strong>
      </div>

      {product.moq !== undefined && (
        <div className="product-details-info-row">
          <span>Minimum Order Quantity</span>
          <strong>{product.moq}</strong>
        </div>
      )}
    </section>

    <section className="product-details-card product-details-description-card">
      <h2>Description</h2>

      <p className="product-details-description">
        {product.description || "No description available."}
      </p>
    </section>

    {product.bulkPricing?.length > 0 && (
      <section className="product-details-card">
        <h2>Bulk Pricing</h2>

        <div className="product-details-bulk-table-wrapper">
          <table className="product-details-bulk-table">
            <thead>
              <tr>
                <th>Minimum Quantity</th>
                <th>Price per Unit</th>
              </tr>
            </thead>

            <tbody>
              {product.bulkPricing.map((tier, index) => (
                <tr key={index}>
                  <td>{tier.minQuantity} units</td>
                  <td>₹{formatPrice(tier.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    )}
  </div>
</div>


);
};

export default AdminProductDetails;
