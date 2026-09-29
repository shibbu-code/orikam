import React, { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getCategories } from "../../../services/categoryApi";
import { getBrands } from "../../../services/brandApi";

import "./AddProduct.css";

const AddProduct = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

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

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const [categoryResponse, brandResponse] =
        await Promise.all([
          getCategories(),
          getBrands(),
        ]);

      setCategories(
        categoryResponse.data.categories || []
      );

      setBrands(
        brandResponse.data.brands || []
      );
    } catch (error) {
      console.error(
        "Failed to fetch categories/brands:",
        error
      );
    }
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

    if (
      !formData.name ||
      !formData.category ||
      !formData.brand ||
      !formData.price ||
      !formData.stock
    ) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:3000/api/products/add",
        {
          method: "POST",
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
            logo: formData.logo,

            images: formData.image
              ? [formData.image]
              : [],
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to create product"
        );
        return;
      }

      alert("Product created successfully");

      navigate("/admin/products");

    } catch (error) {
      console.error(
        "Create product error:",
        error
      );

      alert("Failed to create product");

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

  return (
    <div className="add-product-page">

      <div className="add-product-header">

        <button
          className="back-button"
          onClick={() =>
            navigate("/admin/products")
          }
        >
          <ArrowLeft size={18} />
          Products
        </button>

        <div>
          <h1>Add Product</h1>
          <p>
            Add a new product to your catalog.
          </p>
        </div>

      </div>

      <form
        className="add-product-form"
        onSubmit={handleSubmit}
      >

        {/* Basic Information */}

        <section className="form-section">

          <h2>Basic Information</h2>

          <div className="form-grid">

            <div className="form-field full-width">
              <label>
                Product Name *
              </label>

              <input
                type="text"
                name="name"
                placeholder="Enter product name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-field full-width">
              <label>
                Description
              </label>

              <textarea
                name="description"
                placeholder="Enter product description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
              />
            </div>

          </div>

        </section>

        {/* Classification */}

        <section className="form-section">

          <h2>Classification</h2>

          <div className="form-grid">

            <div className="form-field">
              <label>
                Category *
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">
                  Select Category
                </option>

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

            <div className="form-field">
              <label>
                Brand *
              </label>

              <select
                name="brand"
                value={formData.brand}
                onChange={handleChange}
              >
                <option value="">
                  Select Brand
                </option>

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

        </section>

        {/* Pricing & Inventory */}

        <section className="form-section">

          <h2>Pricing & Inventory</h2>

          <div className="form-grid">

            <div className="form-field">
              <label>
                Price *
              </label>

              <input
                type="number"
                name="price"
                min="0"
                placeholder="0"
                value={formData.price}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
  <label>B2B Price</label>

  <input
    type="number"
    min="0"
    value={formData.b2bPrice}
    onChange={(e) =>
      setFormData({
        ...formData,
        b2bPrice: e.target.value,
      })
    }
    placeholder="Enter B2B price"
  />
</div>

<div className="form-group">
  <label>Minimum Order Quantity (MOQ)</label>

  <input
    type="number"
    min="1"
    value={formData.moq}
    onChange={(e) =>
      setFormData({
        ...formData,
        moq: e.target.value,
      })
    }
  />
</div>

            <div className="form-field">
              <label>
                Stock *
              </label>

              <input
                type="number"
                name="stock"
                min="0"
                placeholder="0"
                value={formData.stock}
                onChange={handleChange}
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

        </section>

        {/* Images */}

        <section className="form-section">

          <h2>Product Images</h2>

          <div className="form-grid">

            <div className="form-field full-width">
              <label>
                Logo URL
              </label>

              <input
                type="text"
                name="logo"
                placeholder="https://..."
                value={formData.logo}
                onChange={handleChange}
              />
            </div>

            <div className="form-field full-width">
              <label>
                Product Image URL
              </label>

              <input
                type="text"
                name="image"
                placeholder="https://..."
                value={formData.image}
                onChange={handleChange}
              />
            </div>

          </div>

        </section>

        {/* Actions */}

        <div className="form-actions">

          <button
            type="button"
            className="cancel-button"
            onClick={() =>
              navigate("/admin/products")
            }
          >
            Cancel
          </button>

          <button
            type="submit"
            className="save-product-button"
            disabled={loading}
          >
            <Save size={18} />

            {loading
              ? "Creating..."
              : "Create Product"}
          </button>

        </div>

      </form>

    </div>
  );
};

export default AddProduct;