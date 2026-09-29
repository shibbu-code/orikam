import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getCategories } from "../../../services/categoryApi";
import { getBrands } from "../../../services/brandApi";

import "./EditProduct.css";

const EditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const userRole = localStorage.getItem("userRole");

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    brand: "",
    price: "",

    stock: "",
    logo: "",
    image: "",
    b2bPrice: "",
    moq: 1,
    bulkPricing: [],
  });

  useEffect(() => {
    if (userRole !== "admin") return;

    fetchData();
  }, [productId, userRole]);

  const fetchData = async () => {
    try {
      const [productResponse, categoryResponse, brandResponse] =
        await Promise.all([
          fetch(`http://localhost:3000/api/products/${productId}`),
          getCategories(),
          getBrands(),
        ]);

      const productData = await productResponse.json();

      if (!productResponse.ok) {
        alert(productData.message || "Failed to fetch product");
        navigate("/admin/products");
        return;
      }

      const product = productData.product;

      setFormData({
        name: product.name || "",
        description: product.description || "",
        category: product.category?._id || product.category || "",
        brand: product.brand?._id || product.brand || "",
        price: product.price || "",
        stock: product.stock || "",
        logo: product.logo || "",
        image: product.images?.[0] || "",
        b2bPrice: product.b2bPrice || "",
        moq: product.moq || 1,
        bulkPricing: product.bulkPricing || [],
      });

      setCategories(categoryResponse.data.categories || []);
      setBrands(brandResponse.data.brands || []);
    } catch (error) {
      console.error("Failed to fetch edit data:", error);
      alert("Failed to load product");
    } finally {
      setLoading(false);
    }
  };
  const addPricingTier = () => {
  setFormData((prev) => ({
    ...prev,
    bulkPricing: [
      ...prev.bulkPricing,
      {
        minQuantity: "",
        price: "",
      },
    ],
  }));
};

const updatePricingTier = (index, field, value) => {
  setFormData((prev) => {
    const updatedPricing = [...prev.bulkPricing];

    updatedPricing[index] = {
      ...updatedPricing[index],
      [field]: value,
    };

    return {
      ...prev,
      bulkPricing: updatedPricing,
    };
  });
};

const removePricingTier = (index) => {
  setFormData((prev) => ({
    ...prev,
    bulkPricing: prev.bulkPricing.filter(
      (_, i) => i !== index
    ),
  }));
};

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const response = await fetch(
        `http://localhost:3000/api/products/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            category: formData.category,
            brand: formData.brand,
            price: Number(formData.price),
            stock: Number(formData.stock),
            logo: formData.logo,
            images: formData.image ? [formData.image] : [],
            b2bPrice: Number(formData.b2bPrice || 0),
            moq: Number(formData.moq || 1),
            bulkPricing: formData.bulkPricing
  .filter(
    (tier) =>
      tier.minQuantity !== "" &&
      tier.price !== ""
  )
  .map((tier) => ({
    minQuantity: Number(tier.minQuantity),
    price: Number(tier.price),
  })),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to update product");
        return;
      }

      alert("Product updated successfully");

      navigate("/admin/products");
    } catch (error) {
      console.error("Update product error:", error);
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

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

  if (loading) {
    return (
      <div className="edit-product-loading">
        Loading product...
      </div>
    );
  }
  

  return (
    <div className="edit-product-page">
      <div className="edit-product-header">
        <div>
          <h1>Edit Product</h1>
          <p>Update product information and inventory.</p>
        </div>

        <button
          className="edit-product-back"
          onClick={() => navigate("/admin/products")}
        >
          Back to Products
        </button>
      </div>

      <form
        className="edit-product-form"
        onSubmit={handleSubmit}
      >
        <div className="edit-form-section">
          <h2>Basic Information</h2>

          <div className="edit-form-grid">
            <div className="edit-form-group full-width">
              <label>Product Name</label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="edit-form-group full-width">
              <label>Description</label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
              />
            </div>
          </div>
        </div>

        <div className="edit-form-section">
          <h2>Product Classification</h2>

          <div className="edit-form-grid">
            <div className="edit-form-group">
              <label>Category</label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>

                {categories.map((category) => (
                  <option
                    key={category._id}
                    value={category._id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="edit-form-group">
              <label>Brand</label>

              <select
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
              >
                <option value="">Select Brand</option>

                {brands.map((brand) => (
                  <option
                    key={brand._id}
                    value={brand._id}
                  >
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="edit-form-section">
          <h2>Pricing & Inventory</h2>

          <div className="edit-form-grid">
            <div className="edit-form-group">
              <label>Price</label>

              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
            <div className="edit-form-group">
              <label>B2B Price</label>
              <input
                type="number"
                name="b2bPrice" 
                value={formData.b2bPrice}
                onChange={handleChange}
                min="0" 
              />
            </div>
            

            <div className="edit-form-group">
              <label>Stock</label>

              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
          </div>
          <div className="bulk-pricing-section">
  <div className="bulk-pricing-header">
    <div>
      <h3>Bulk Pricing</h3>
      <p>
        Set different prices based on quantity.
      </p>
    </div>

    <button
      type="button"
      className="add-tier-btn"
      onClick={addPricingTier}
    >
      + Add Pricing Tier
    </button>
  </div>

  {formData.bulkPricing.length === 0 ? (
    <div className="no-pricing-tiers">
      No bulk pricing tiers added.
    </div>
  ) : (
    <div className="pricing-tiers">
      {formData.bulkPricing.map(
        (tier, index) => (
          <div
            className="pricing-tier"
            key={index}
          >
            <div className="form-group">
              <label>Minimum Quantity</label>

              <input
                type="number"
                min="1"
                value={tier.minQuantity}
                onChange={(e) =>
                  updatePricingTier(
                    index,
                    "minQuantity",
                    e.target.value
                  )
                }
                placeholder="e.g. 10"
              />
            </div>

            <div className="form-group">
              <label>Price per Unit</label>

              <input
                type="number"
                min="0"
                value={tier.price}
                onChange={(e) =>
                  updatePricingTier(
                    index,
                    "price",
                    e.target.value
                  )
                }
                placeholder="e.g. 74000"
              />
            </div>

            <button
              type="button"
              className="remove-tier-btn"
              onClick={() =>
                removePricingTier(index)
              }
            >
              Remove
            </button>
          </div>
        )
      )}
    </div>
  )}
</div>
        </div>

        <div className="edit-form-section">
          <h2>Images</h2>

          <div className="edit-form-grid">
            <div className="edit-form-group">
              <label>Logo URL</label>

              <input
                type="text"
                name="logo"
                value={formData.logo}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

            <div className="edit-form-group">
              <label>Product Image URL</label>

              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        <div className="edit-product-actions">
          <button
            type="button"
            className="edit-cancel-button"
            onClick={() => navigate("/admin/products")}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="edit-save-button"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;