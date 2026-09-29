import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import Navbar from "../../components/commen/Navbar";

import { getCart } from "../../services/cartApi";
import { createOrder } from "../../services/orderApi";

import "./Checkout.css";

const Checkout = () => {
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    fetchCart();
  }, [userId]);

  const fetchCart = async () => {
    try {
      const response = await getCart(userId);
      setCart(response.data.cart);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;

    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const getEffectivePrice = (product, quantity) => {
  if (!product) return 0;

  const applicableTiers = [
    ...(product.bulkPricing || []),
  ]
    .filter(
      (tier) =>
        Number(tier.minQuantity) <= quantity
    )
    .sort(
      (a, b) =>
        Number(b.minQuantity) -
        Number(a.minQuantity)
    );

  if (applicableTiers.length > 0) {
    return Number(applicableTiers[0].price);
  }

  if (Number(product.b2bPrice) > 0) {
    return Number(product.b2bPrice);
  }

  return Number(product.price) || 0;
};

  const calculateSubtotal = () => {
  if (!cart?.items) return 0;

  return cart.items.reduce((total, item) => {
    const effectivePrice = getEffectivePrice(
      item.product,
      item.quantity
    );

    return (
      total +
      effectivePrice * item.quantity
    );
  }, 0);
};

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!cart?.items?.length) {
      alert("Your cart is empty");
      navigate("/products");
      return;
    }

    try {
      setPlacingOrder(true);

      

      const orderData = {
        userId,
        shippingAddress: address,
        paymentMethod,
        discount: 0,
        shippingCharge: 0,
      };

      const response = await createOrder(orderData);

      const order = response.data.order;

      navigate("/order-success", {
  state: {
    order,
  },
});
    } catch (error) {
      console.error("Failed to place order:", error);

      alert(
        error.response?.data?.message ||
          "Failed to place order"
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="checkout-page">
        <Navbar />

        <div className="checkout-loading">
          Loading checkout...
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = calculateSubtotal();

  if (items.length === 0) {
    return (
      <div className="checkout-page">
        <Navbar />

        <main className="checkout-container">
          <div className="checkout-empty">
            <h2>Your cart is empty</h2>

            <p>
              Add products before proceeding to checkout.
            </p>

            <button
              onClick={() => navigate("/products")}
            >
              Browse Products
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Navbar />

      <main className="checkout-container">
        <button
          className="checkout-back"
          onClick={() => navigate("/cart")}
        >
          <ArrowLeft size={18} />
          Back to Cart
        </button>

        <div className="checkout-header">
          <h1>Checkout</h1>
          <p>Complete your order</p>
        </div>

        <form
          className="checkout-layout"
          onSubmit={handlePlaceOrder}
        >
          {/* LEFT SIDE */}

          <div className="checkout-main">
            {/* ADDRESS */}

            <section className="checkout-section">
              <div className="section-heading">
                <span>1</span>

                <div>
                  <h2>Delivery Address</h2>
                  <p>
                    Enter the address where your order
                    should be delivered.
                  </p>
                </div>
              </div>

              <div className="address-grid">
                <div className="form-group">
                  <label>Full Name</label>

                  <input
                    type="text"
                    name="name"
                    value={address.name}
                    onChange={handleAddressChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>

                  <input
                    type="tel"
                    name="phone"
                    value={address.phone}
                    onChange={handleAddressChange}
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Address</label>

                  <textarea
                    name="addressLine"
                    value={address.addressLine}
                    onChange={handleAddressChange}
                    placeholder="House no., street, area"
                    rows="3"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>City</label>

                  <input
                    type="text"
                    name="city"
                    value={address.city}
                    onChange={handleAddressChange}
                    placeholder="City"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>State</label>

                  <input
                    type="text"
                    name="state"
                    value={address.state}
                    onChange={handleAddressChange}
                    placeholder="State"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Pincode</label>

                  <input
                    type="text"
                    name="pincode"
                    value={address.pincode}
                    onChange={handleAddressChange}
                    placeholder="Pincode"
                    required
                  />
                </div>
              </div>
            </section>

            {/* PAYMENT */}

            <section className="checkout-section">
              <div className="section-heading">
                <span>2</span>

                <div>
                  <h2>Payment Method</h2>
                  <p>
                    Select a payment method for this demo.
                  </p>
                </div>
              </div>

              <div className="payment-options">
                <label
                  className={`payment-option ${
                    paymentMethod === "COD"
                      ? "selected"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value)
                    }
                  />

                  <div>
                    <strong>Cash on Delivery</strong>

                    <span>
                      Pay when your order is delivered.
                    </span>
                  </div>
                </label>

                <label
                  className={`payment-option ${
                    paymentMethod === "ONLINE"
                      ? "selected"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="ONLINE"
                    checked={
                      paymentMethod === "ONLINE"
                    }
                    onChange={(e) =>
                      setPaymentMethod(e.target.value)
                    }
                  />

                  <div>
                    <strong>
                      Online Payment
                      <small> Demo</small>
                    </strong>

                    <span>
                      Simulated successful payment.
                    </span>
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* RIGHT SIDE */}

          <aside className="checkout-summary">
            <h2>Order Summary</h2>

            <div className="checkout-products">
              {items.map((item) => {
                const product = item.product;

                const image =
                  product?.images?.[0] ||
                  product?.logo ||
                  "";
                  const effectivePrice = getEffectivePrice(
  product,
  item.quantity
);

const itemTotal =
  effectivePrice * item.quantity;

                return (
                  <div
                    className="checkout-product"
                    key={product._id}
                  >
                    <div className="checkout-product-image">
                      {image ? (
                        <img
                          src={image}
                          alt={product.name}
                        />
                      ) : (
                        <span>No Image</span>
                      )}
                    </div>

                    <div className="checkout-product-info">
                      <h3>{product.name}</h3>

                      <p>
  ₹
  {effectivePrice.toLocaleString(
    "en-IN"
  )}{" "}
  / unit × {item.quantity}
</p>
                    </div>

                    <strong>
  ₹{itemTotal.toLocaleString("en-IN")}
</strong>
                  </div>
                );
              })}
            </div>

            <div className="summary-divider" />

            <div className="summary-row">
              <span>Subtotal</span>

              <span>
                ₹{subtotal.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="summary-row">
              <span>Discount</span>

              <span>₹0</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>

              <span>Free</span>
            </div>

            <div className="summary-divider" />

            <div className="summary-total">
              <span>Total</span>

              <strong>
                ₹{subtotal.toLocaleString("en-IN")}
              </strong>
            </div>

            <button
              type="submit"
              className="place-order-button"
              disabled={placingOrder}
            >
              {placingOrder
                ? "Placing Order..."
                : "Place Order"}
            </button>

            <p className="demo-payment-note">
              🔒 Demo checkout — no real payment will
              be processed.
            </p>
          </aside>
        </form>
      </main>
    </div>
  );
};

export default Checkout;