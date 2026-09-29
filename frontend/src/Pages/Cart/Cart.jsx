
import React, { useEffect, useState } from "react";
import { Minus, Plus, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {getRecentlyViewed} from "../../services/userApi";
import ProductCard from "../../components/home/ProductCard";

import Navbar from "../../components/commen/Navbar";

import {
  getCart,
  updateCartItem,
  removeCartItem,
} from "../../services/cartApi";

import "./Cart.css";

const Cart = () => {
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    fetchCart();
     fetchRecentlyViewed();
  }, [userId]);

  const fetchCart = async () => {
    try {
      const response = await getCart(userId);

      setCart(response.data.cart);
    } catch (error) {
      if (error.response?.status === 404) {
        setCart({ items: [] });
      } else {
        console.error("Failed to fetch cart:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentlyViewed = async () => {
  try {
    const response = await getRecentlyViewed(userId);

    setRecentlyViewed(response.data.products || []);
  } catch (error) {
    console.error(
      "Failed to fetch recently viewed:",
      error
    );
  }
};

  const changeQuantity = async (product, quantity) => {
    const moq = product?.moq || 1;

    if (quantity < moq) {
      return;
    }

    if (quantity > product.stock) {
      alert(`Only ${product.stock} units are available`);
      return;
    }

    try {
      const response = await updateCartItem(
        userId,
        product._id,
        quantity
      );

      setCart(response.data.cart);
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  const removeItem = async (productId) => {
    try {
      const response = await removeCartItem(
        userId,
        productId
      );

      setCart(response.data.cart);
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  /*
   * Calculate the effective price for a product
   * based on the quantity currently in the cart.
   */
  const getEffectivePrice = (product, quantity) => {
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

    /*
     * Largest applicable bulk tier wins.
     */
    if (tiers.length > 0) {
      return Number(tiers[0].price);
    }

    /*
     * If no bulk tier applies,
     * use B2B price when configured.
     */
    if (Number(product.b2bPrice) > 0) {
      return Number(product.b2bPrice);
    }

    return Number(product.price) || 0;
  };

  const calculateTotal = () => {
    if (!cart?.items) return 0;

    return cart.items.reduce((total, item) => {
      const product = item.product;

      const effectivePrice = getEffectivePrice(
        product,
        item.quantity
      );

      return total + effectivePrice * item.quantity;
    }, 0);
  };

  if (loading) {
    return (
      <div className="cart-page">
        <Navbar />

        <div className="cart-loading">
          Loading cart...
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  const total = calculateTotal();

  return (
    <div className="cart-page">
      <Navbar />

      <main className="cart-container">

        <button
          className="cart-back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Continue Shopping
        </button>

        <div className="cart-header">
          <h1>Your Cart</h1>
          <span>{items.length} items</span>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <h2>Your cart is empty</h2>

            <p>
              Add some dental products to get started.
            </p>

            <button
              onClick={() => navigate("/products")}
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="cart-layout">

            {/* Items */}

            <div className="cart-items">

              {items.map((item) => {
                const product = item.product;

                const image =
                  product?.images?.[0] ||
                  product?.logo ||
                  "";

                const effectivePrice =
                  getEffectivePrice(
                    product,
                    item.quantity
                  );

                const moq = product?.moq || 1;

                const itemTotal =
                  effectivePrice * item.quantity;

                return (
                  <div
                    className="cart-item"
                    key={product._id}
                  >

                    <div className="cart-item-image">
                      {image ? (
                        <img
                          src={image}
                          alt={product.name}
                        />
                      ) : (
                        <span>No Image</span>
                      )}
                    </div>

                    <div className="cart-item-info">

                      <p className="cart-item-brand">
                        {product.brand?.name ||
                          "ORIKAM"}
                      </p>

                      <h3>{product.name}</h3>

                      {/* Effective Price */}
                      <p className="cart-item-price">
                        ₹
                        {effectivePrice.toLocaleString(
                          "en-IN"
                        )}
                        <span>
                          {" "}
                          / unit
                        </span>
                      </p>

                      {/* Bulk price indicator */}
                      {product.bulkPricing?.length >
                        0 && (
                        <p className="cart-bulk-price">
                          Bulk price applied
                        </p>
                      )}

                      {/* MOQ */}
                      {moq > 1 && (
                        <p className="cart-moq">
                          MOQ: {moq} units
                        </p>
                      )}

                      <div className="cart-item-actions">

                        <div className="cart-quantity">

                          <button
                            onClick={() =>
                              changeQuantity(
                                product,
                                item.quantity - 1
                              )
                            }
                            disabled={
                              item.quantity <= moq
                            }
                          >
                            <Minus size={15} />
                          </button>

                          <span>
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              changeQuantity(
                                product,
                                item.quantity + 1
                              )
                            }
                            disabled={
                              item.quantity >=
                              product.stock
                            }
                          >
                            <Plus size={15} />
                          </button>

                        </div>

                        <button
                          className="remove-item"
                          onClick={() =>
                            removeItem(product._id)
                          }
                        >
                          <Trash2 size={16} />
                          Remove
                        </button>

                      </div>
                    </div>

                    <div className="cart-item-total">
                      ₹
                      {itemTotal.toLocaleString(
                        "en-IN"
                      )}
                    </div>

                  </div>
                );
              })}

            </div>

            {/* Summary */}

            <div className="cart-summary">

              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>Subtotal</span>

                <span>
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="summary-row">
                <span>Delivery</span>

                <span>
                  Calculated at checkout
                </span>
              </div>

              <div className="summary-divider" />

              <div className="summary-total">
                <span>Total</span>

                <span>
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>

              <button
                className="checkout-button"
                onClick={() =>
                  navigate("/checkout")
                }
              >
                Proceed to Checkout
              </button>

            </div>

          </div>
          

        )}
{recentlyViewed.length > 0 && (
  <section className="recently-viewed-section">
    <div className="recently-viewed-header">
      <div>
        <span className="recently-viewed-label">
          YOUR ACTIVITY
        </span>

        <h2>Recently Viewed</h2>

        <p>
          Products you recently explored
        </p>
      </div>

      <button
        className="recently-viewed-browse"
        onClick={() => navigate("/products")}
      >
        Browse All →
      </button>
    </div>

    <div className="recently-viewed-list">
      {recentlyViewed.slice(0, 5).map((product) => (
        <div
          className="recently-viewed-card"
          key={product._id}
        >
          <ProductCard
            product={product}
            onAddToCart={() => {}}
          />
        </div>
      ))}
    </div>
  </section>
)}

      </main>
    </div>
  );
};

export default Cart;

