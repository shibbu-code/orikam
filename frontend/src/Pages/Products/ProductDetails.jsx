
import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ShoppingCart,
  Minus,
  Plus,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../../components/commen/Navbar";
import {
  getProductById,
  getSimilarProducts,
} from "../../services/productApi";

import {addRecentlyViewed} from "../../services/userApi";
import "./ProductDetails.css";

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const [similarProducts, setSimilarProducts] = useState([]);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);

        
        // Fetch current product
        const productResponse =
          await getProductById(productId);

        const fetchedProduct =
          productResponse.data.product;

        setProduct(fetchedProduct);

        // Set quantity according to MOQ
        setQuantity(fetchedProduct.moq || 1);

        // Fetch similar products
        const similarResponse =
          await getSimilarProducts(productId);

        setSimilarProducts(
          similarResponse.data.products || []
        );

        const userId = localStorage.getItem("userId");

if (userId) {
  try {
    await addRecentlyViewed(userId, productId);
  } catch (error) {
    console.error("Failed to update recently viewed:", error);
  }
}
      } catch (error) {
        console.error(
          "Failed to fetch product details:",
          error
        );

        setProduct(null);
        setSimilarProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  /*
   * Minimum quantity allowed
   */
  const moq = product?.moq || 1;

  /*
   * Find price applicable for current quantity
   */
  const getEffectivePrice = () => {
    if (!product) return 0;

    const tiers = [...(product.bulkPricing || [])]
      .filter(
        (tier) =>
          Number(tier.minQuantity) <= quantity &&
          Number(tier.price) >= 0
      )
      .sort(
        (a, b) =>
          Number(b.minQuantity) -
          Number(a.minQuantity)
      );

    if (tiers.length > 0) {
      return Number(tiers[0].price);
    }

    if (Number(product.b2bPrice) > 0) {
      return Number(product.b2bPrice);
    }

    return Number(product.price) || 0;
  };

  const effectivePrice = getEffectivePrice();

  /*
   * Quantity controls
   */
  const increaseQuantity = () => {
    setQuantity((prev) =>
      Math.min(
        product?.stock || prev,
        prev + 1
      )
    );
  };

  const decreaseQuantity = () => {
    setQuantity((prev) =>
      Math.max(moq, prev - 1)
    );
  };

  /*
   * Add product to cart
   */
  const handleAddToCart = async () => {
    if (!userId) {
      navigate("/login");
      return;
    }

    if (quantity < moq) {
      alert(`Minimum order quantity is ${moq}`);
      setQuantity(moq);
      return;
    }

    if (quantity > product.stock) {
      alert(
        `Only ${product.stock} units are available`
      );
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3000/api/cart/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            productId: product._id,
            quantity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to add product to cart"
        );
      }

      alert("Product added to cart");
    } catch (error) {
      console.error(
        "Add to cart failed:",
        error
      );

      alert(error.message);
    }
  };

  /*
   * Navigate to similar product
   */
  const handleSimilarProductClick = (
    similarProductId
  ) => {
    navigate(
      `/products/${similarProductId}`
    );
  };

  /*
   * Navigate to variant product
   */
  const handleVariantClick = (
    variantId
  ) => {
    navigate(
      `/products/${variantId}`
    );
  };

  /*
   * Format price
   */
  const formatPrice = (price) => {
    const numericPrice = Number(price);

    if (!numericPrice) {
      return "—";
    }

    return `₹${numericPrice.toLocaleString(
      "en-IN"
    )}`;
  };

  /*
   * Get display price for comparison
   *
   * B2B price is preferred.
   * Otherwise normal price is shown.
   */
  const getComparisonPrice = (item) => {
    if (Number(item?.b2bPrice) > 0) {
      return Number(item.b2bPrice);
    }

    return Number(item?.price) || 0;
  };

  /*
   * Get bulk pricing display
   */
  const getBulkPricingText = (item) => {
    if (
      !item?.bulkPricing ||
      item.bulkPricing.length === 0
    ) {
      return "No bulk pricing";
    }

    const sortedTiers = [
      ...item.bulkPricing,
    ].sort(
      (a, b) =>
        Number(a.minQuantity) -
        Number(b.minQuantity)
    );

    return sortedTiers
      .map(
        (tier) =>
          `${tier.minQuantity}+ : ${formatPrice(
            tier.price
          )}`
      )
      .join(" | ");
  };

  /*
   * Products shown in comparison:
   *
   * Current product first
   * Then its variants
   */
  const comparisonProducts = product
    ? [
        product,
        ...(product.variants || []),
      ]
    : [];

  if (loading) {
    return (
      <div className="product-details-page">
        <Navbar />

        <div className="product-details-loading">
          Loading product...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-details-page">
        <Navbar />

        <div className="product-not-found">
          <h2>Product not found</h2>

          <button
            onClick={() =>
              navigate("/products")
            }
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const image =
    product.images?.[0] ||
    product.logo ||
    "";

  return (
    <div className="product-details-page">
      <Navbar />

      <main className="product-details-container">

        {/* =====================================
            BACK BUTTON
        ===================================== */}

        <button
          className="back-button"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        {/* =====================================
            MAIN PRODUCT DETAILS
        ===================================== */}

        <div className="product-details">

          {/* Product Image */}
          <div className="product-details-image">
            {image ? (
              <img
                src={image}
                alt={product.name}
              />
            ) : (
              <div className="product-details-placeholder">
                No Image
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="product-details-info">

            {/* Brand */}
            <p className="details-brand">
              {product.brand?.name ||
                "ORIKAM"}
            </p>

            {/* Product Name */}
            <h1>{product.name}</h1>

            {/* Description */}
            <p className="details-description">
              {product.description ||
                "High-quality dental product designed for professional use."}
            </p>

            {/* Current Price */}
            <div className="details-price">
              ₹
              {effectivePrice.toLocaleString(
                "en-IN"
              )}

              <span className="price-unit">
                {" "}
                / unit
              </span>
            </div>

            {/* B2B Pricing */}
            {Number(product.b2bPrice) > 0 && (
              <div className="b2b-price-info">
                B2B pricing available
              </div>
            )}

            {/* MOQ */}
            {moq > 1 && (
              <div className="moq-info">
                Minimum order quantity:{" "}
                <strong>
                  {moq} units
                </strong>
              </div>
            )}

            {/* Bulk Pricing */}
            {product.bulkPricing?.length >
              0 && (
              <div className="bulk-pricing-display">

                <h3>Bulk Pricing</h3>

                <div className="bulk-pricing-list">
                  {[...product.bulkPricing]
                    .sort(
                      (a, b) =>
                        Number(
                          a.minQuantity
                        ) -
                        Number(
                          b.minQuantity
                        )
                    )
                    .map(
                      (
                        tier,
                        index
                      ) => (
                        <div
                          className="bulk-pricing-row"
                          key={index}
                        >
                          <span>
                            {
                              tier.minQuantity
                            }
                            + units
                          </span>

                          <strong>
                            ₹
                            {Number(
                              tier.price
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </strong>
                        </div>
                      )
                    )}
                </div>
              </div>
            )}

            {/* Stock */}
            <div className="details-stock">
              {product.stock > 0
                ? `${product.stock} units available`
                : "Out of stock"}
            </div>

            {/* Quantity + Cart */}
            {product.stock > 0 && (
              <>

                <div className="quantity-section">

                  <span>
                    Quantity
                  </span>

                  <div className="quantity-control">

                    <button
                      onClick={
                        decreaseQuantity
                      }
                      disabled={
                        quantity <= moq
                      }
                    >
                      <Minus size={16} />
                    </button>

                    <span>
                      {quantity}
                    </span>

                    <button
                      onClick={
                        increaseQuantity
                      }
                      disabled={
                        quantity >=
                        product.stock
                      }
                    >
                      <Plus size={16} />
                    </button>

                  </div>

                </div>

                {/* Pricing Summary */}
                <div className="quantity-price-summary">

                  <span>
                    {quantity} × ₹
                    {effectivePrice.toLocaleString(
                      "en-IN"
                    )}
                  </span>

                  <strong>
                    ₹
                    {(
                      quantity *
                      effectivePrice
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                </div>

                {/* Add To Cart */}
                <button
                  className="add-to-cart-button"
                  onClick={
                    handleAddToCart
                  }
                >
                  <ShoppingCart
                    size={19}
                  />

                  Add to Cart
                </button>

              </>
            )}
          </div>
        </div>

        {/* =====================================
            VARIANT COMPARISON
        ===================================== */}

        {product.variants?.length > 0 && (
          <section className="variant-comparison-section">

            {/* Header */}
            <div className="variant-comparison-header">

              <div>
                <h2>
                  Compare Variants
                </h2>

                <p>
                  Compare available variants
                  before choosing a product.
                </p>
              </div>

            </div>

            {/* Table */}
            <div className="variant-comparison-table-wrapper">

              <table className="variant-comparison-table">

                <thead>
                  <tr>

                    <th>
                      Feature
                    </th>

                    {comparisonProducts.map(
                      (item) => {

                        const itemImage =
                          item.images?.[0] ||
                          item.logo ||
                          "";

                        const isCurrent =
                          item._id ===
                          product._id;

                        return (
                          <th
                            key={item._id}
                            className={
                              isCurrent
                                ? "variant-current-column"
                                : ""
                            }
                          >

                            <div
                              className="variant-comparison-product"
                              onClick={() =>
                                !isCurrent &&
                                handleVariantClick(
                                  item._id
                                )
                              }
                              style={{
                                cursor:
                                  isCurrent
                                    ? "default"
                                    : "pointer",
                              }}
                            >

                              <div className="variant-comparison-product-image">

                                {itemImage ? (
                                  <img
                                    src={
                                      itemImage
                                    }
                                    alt={
                                      item.name
                                    }
                                  />
                                ) : (
                                  <span>
                                    No Image
                                  </span>
                                )}

                              </div>

                              <p className="variant-comparison-product-name">
                                {item.name}
                              </p>

                              {isCurrent && (
                                <span className="variant-current-badge">
                                  CURRENT
                                </span>
                              )}

                            </div>

                          </th>
                        );
                      }
                    )}

                  </tr>
                </thead>

                <tbody>

                  {/* Brand */}
                  <tr>
                    <td>
                      Brand
                    </td>

                    {comparisonProducts.map(
                      (item) => (
                        <td key={item._id}>
                          {item.brand?.name ||
                            "—"}
                        </td>
                      )
                    )}
                  </tr>

                  {/* Price */}
                  <tr>
                    <td>
                      B2B Price
                    </td>

                    {comparisonProducts.map(
                      (item) => (
                        <td
                          key={item._id}
                          className="variant-price"
                        >
                          {formatPrice(
                            getComparisonPrice(
                              item
                            )
                          )}
                        </td>
                      )
                    )}
                  </tr>

                  {/* Retail Price */}
                  <tr>
                    <td>
                      Retail Price
                    </td>

                    {comparisonProducts.map(
                      (item) => (
                        <td key={item._id}>
                          {formatPrice(
                            item.price
                          )}
                        </td>
                      )
                    )}
                  </tr>

                  {/* MOQ */}
                  <tr>
                    <td>
                      Minimum Order Quantity
                    </td>

                    {comparisonProducts.map(
                      (item) => (
                        <td key={item._id}>
                          {item.moq || 1} unit
                          {(item.moq || 1) >
                            1
                            ? "s"
                            : ""}
                        </td>
                      )
                    )}
                  </tr>

                  {/* Stock */}
                  <tr>
                    <td>
                      Availability
                    </td>

                    {comparisonProducts.map(
                      (item) => (
                        <td key={item._id}>

                          <span
                            className={
                              item.stock > 0
                                ? "variant-stock available"
                                : "variant-stock unavailable"
                            }
                          >
                            {item.stock > 0
                              ? `${item.stock} units available`
                              : "Out of Stock"}
                          </span>

                        </td>
                      )
                    )}
                  </tr>

                  {/* Rating */}
                  <tr>
                    <td>
                      Rating
                    </td>

                    {comparisonProducts.map(
                      (item) => (
                        <td key={item._id}>

                          <span className="variant-rating">
                            {item.rating
                              ? `${Number(
                                  item.rating
                                ).toFixed(
                                  1
                                )} / 5`
                              : "No rating"}
                          </span>

                        </td>
                      )
                    )}
                  </tr>

                  {/* Bulk Pricing */}
                  <tr>
                    <td>
                      Bulk Pricing
                    </td>

                    {comparisonProducts.map(
                      (item) => (
                        <td key={item._id}>
                          {getBulkPricingText(
                            item
                          )}
                        </td>
                      )
                    )}
                  </tr>

                </tbody>

              </table>

            </div>
          </section>
        )}

        {/* =====================================
            SIMILAR PRODUCTS
        ===================================== */}

        {similarProducts.length > 0 && (
          <section className="similar-products-section">

            {/* Header */}
            <div className="similar-products-header">

              <div>
                <h2>
                  Similar Products
                </h2>

                <p>
                  Explore other products
                  from the same category
                </p>
              </div>

              <button
                onClick={() =>
                  navigate(
                    `/products?category=${product.category?._id}`
                  )
                }
              >
                View All
              </button>

            </div>

            {/* Products */}
            <div className="similar-products-grid">

              {similarProducts.map(
                (item) => {

                  const itemImage =
                    item.images?.[0] ||
                    item.logo ||
                    "";

                  const itemPrice =
                    Number(
                      item.b2bPrice
                    ) > 0
                      ? Number(
                          item.b2bPrice
                        )
                      : Number(
                          item.price
                        ) || 0;

                  return (
                    <div
                      className="similar-product-card"
                      key={item._id}
                      onClick={() =>
                        handleSimilarProductClick(
                          item._id
                        )
                      }
                    >

                      {/* Image */}
                      <div className="similar-product-image">

                        {itemImage ? (
                          <img
                            src={itemImage}
                            alt={
                              item.name
                            }
                          />
                        ) : (
                          <div>
                            No Image
                          </div>
                        )}

                      </div>

                      {/* Product Information */}
                      <div className="similar-product-info">

                        <span className="similar-product-brand">
                          {item.brand
                            ?.name ||
                            "Brand"}
                        </span>

                        <h3>
                          {item.name}
                        </h3>

                        <strong>
                          ₹
                          {itemPrice.toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                        <span
                          className={
                            item.stock >
                            0
                              ? "similar-stock available"
                              : "similar-stock unavailable"
                          }
                        >
                          {item.stock >
                          0
                            ? "In Stock"
                            : "Out of Stock"}
                        </span>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </section>
        )}

      </main>
    </div>
  );
};

export default ProductDetails;

