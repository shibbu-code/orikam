import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  X,
} from "lucide-react";
import Footer from "../../components/home/Footer"
import Navbar from "../../components/commen/Navbar";
import api from "../../services/api";
import { getCart } from "../../services/cartApi";
import { createOrder } from "../../services/orderApi";

import {
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultUserAddress,
} from "../../services/addressApi";

import "./Checkout.css";

const EMPTY_ADDRESS = {
  fullName: "",
  phone: "",
  addressLine: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  addressType: "Home",
  isDefault: false,
};

const Checkout = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState("");
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS);

  const [savingAddress, setSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [addressLoading, setAddressLoading] = useState(true);

  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [rewardPreview, setRewardPreview] = useState(null);
  const [rewardLoading, setRewardLoading] = useState(false);
  const [rewardError, setRewardError] = useState("");

  // --------------------------------------------------
  // FETCH CART AND ADDRESSES
  // --------------------------------------------------

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    fetchCart();
    fetchAddresses();

    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const fetchAddresses = async () => {
    setAddressLoading(true);
    setAddressError("");

    try {
      const response = await getUserAddresses(userId);
      const addresses = response.data.addresses || [];

      setSavedAddresses(addresses);

      setSelectedAddressId((currentId) => {
        if (addresses.some((item) => item._id === currentId)) {
          return currentId;
        }

        const defaultAddress = addresses.find(
          (item) => item.isDefault
        );

        return defaultAddress?._id || addresses[0]?._id || "";
      });

      if (addresses.length === 0) {
        setShowAddressForm(true);
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);

      setAddressError(
        error.response?.data?.message ||
          "Unable to load saved addresses. Please try again."
      );
    } finally {
      setAddressLoading(false);
    }
  };

  // --------------------------------------------------
  // ADDRESS FORM
  // --------------------------------------------------

  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    setAddressForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openAddAddressForm = () => {
    setEditingAddressId("");

    setAddressForm({
      ...EMPTY_ADDRESS,
      isDefault: savedAddresses.length === 0,
    });

    setAddressError("");
    setShowAddressForm(true);
  };

  const openEditAddressForm = (address) => {
    setEditingAddressId(address._id);

    setAddressForm({
      fullName: address.fullName || "",
      phone: address.phone || "",
      addressLine: address.addressLine || "",
      landmark: address.landmark || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      addressType: address.addressType || "Home",
      isDefault: Boolean(address.isDefault),
    });

    setAddressError("");
    setShowAddressForm(true);
  };

  const closeAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddressId("");
    setAddressForm(EMPTY_ADDRESS);
    setAddressError("");
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();

    setSavingAddress(true);
    setAddressError("");

    try {
      const payload = {
        ...addressForm,
        fullName: addressForm.fullName.trim(),
        phone: addressForm.phone.trim(),
        addressLine: addressForm.addressLine.trim(),
        landmark: addressForm.landmark.trim(),
        city: addressForm.city.trim(),
        state: addressForm.state.trim(),
        pincode: addressForm.pincode.trim(),
      };

      let response;

      if (editingAddressId) {
        response = await updateUserAddress(
          userId,
          editingAddressId,
          payload
        );
      } else {
        response = await addUserAddress(userId, payload);
      }

      const savedAddress = response.data.address;

      if (payload.isDefault && savedAddress?._id) {
        await setDefaultUserAddress(userId, savedAddress._id);
      }

      await fetchAddresses();
      closeAddressForm();
    } catch (error) {
      console.error("Failed to save address:", error);

      setAddressError(
        error.response?.data?.message ||
          "Unable to save address. Please try again."
      );
    } finally {
      setSavingAddress(false);
    }
  };

  const handleSelectAddress = (addressId) => {
    setSelectedAddressId(addressId);
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const response = await setDefaultUserAddress(
        userId,
        addressId
      );

      if (response.data.addresses) {
        setSavedAddresses(response.data.addresses);
      } else {
        await fetchAddresses();
      }
    } catch (error) {
      console.error("Failed to set default address:", error);

      alert(
        error.response?.data?.message ||
          "Unable to set the default address."
      );
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this address?"
      )
    ) {
      return;
    }

    try {
      const response = await deleteUserAddress(
        userId,
        addressId
      );

      const remainingAddresses = response.data.addresses;

      if (remainingAddresses) {
        setSavedAddresses(remainingAddresses);

        if (
          !remainingAddresses.some(
            (item) => item._id === selectedAddressId
          )
        ) {
          const defaultAddress = remainingAddresses.find(
            (item) => item.isDefault
          );

          setSelectedAddressId(
            defaultAddress?._id ||
              remainingAddresses[0]?._id ||
              ""
          );
        }

        if (remainingAddresses.length === 0) {
          setSelectedAddressId("");
          setShowAddressForm(true);
        }
      } else {
        await fetchAddresses();
      }
    } catch (error) {
      console.error("Failed to delete address:", error);

      alert(
        error.response?.data?.message ||
          "Unable to delete address."
      );
    }
  };

  // --------------------------------------------------
  // PRODUCT PRICING
  // --------------------------------------------------

  const getEffectivePrice = (product, quantity) => {
    if (!product) return 0;

    const applicableTiers = [...(product.bulkPricing || [])]
      .filter((tier) => Number(tier.minQuantity) <= quantity)
      .sort(
        (a, b) =>
          Number(b.minQuantity) - Number(a.minQuantity)
      );

    if (applicableTiers.length > 0) {
      return Number(applicableTiers[0].price) || 0;
    }

    if (Number(product.b2bPrice) > 0) {
      return Number(product.b2bPrice);
    }

    return Number(product.price) || 0;
  };

  const calculateSubtotal = () => {
    if (!cart?.items) return 0;

    return cart.items.reduce((total, item) => {
      const price = getEffectivePrice(
        item.product,
        item.quantity
      );

      return total + price * item.quantity;
    }, 0);
  };

  // --------------------------------------------------
  // REWARD PREVIEW
  // --------------------------------------------------

  const fetchRewardPreview = useCallback(async () => {
    if (!userId || !cart?.items?.length) return;

    try {
      setRewardLoading(true);
      setRewardError("");

      const response = await api.post("/api/orders/reward-preview", {
        userId,
      });

      setRewardPreview(response.data.preview || response.data);
    } catch (error) {
      console.error("Reward preview failed:", error);
      setRewardPreview(error.response?.data?.preview || null);
      setRewardError(
        error.response?.data?.message ||
          "Unable to calculate rewards."
      );
    } finally {
      setRewardLoading(false);
    }
  }, [userId, cart]);

  useEffect(() => {
    if (!cart?.items?.length) return;

    const timer = setTimeout(() => {
      fetchRewardPreview();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchRewardPreview, cart]);

  // --------------------------------------------------
  // PLACE ORDER
  // --------------------------------------------------

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!cart?.items?.length) {
      alert("Your cart is empty.");
      navigate("/products");
      return;
    }

    if (showAddressForm) {
      alert("Please save the address or cancel the address form.");
      return;
    }

    const selectedAddress = savedAddresses.find(
      (item) => item._id === selectedAddressId
    );

    if (!selectedAddress) {
      alert("Please select a delivery address.");
      return;
    }

    if (!rewardPreview) {
      alert("Please wait for the reward discount to load.");
      return;
    }

    try {
      setPlacingOrder(true);

      const shippingAddress = {
        name: selectedAddress.fullName,
        phone: selectedAddress.phone,
        addressLine: selectedAddress.addressLine,
        city: selectedAddress.city,
        state: selectedAddress.state,
        pincode: selectedAddress.pincode,
      };

      const orderData = {
        userId,
        shippingAddress,
        paymentMethod,
      };

      const response = await createOrder(orderData);
      const order = response.data.order;

      navigate("/order-success", {
        state: { order },
      });
    } catch (error) {
      console.error("Failed to place order:", error);

      alert(
        error.response?.data?.message ||
          "Failed to place order. Please try again."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  // --------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------

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

  const displayedCoinDiscount = Number(
    rewardPreview?.coinDiscount || 0
  );

  const estimatedShipping = subtotal >= 1000 ? 0 : 50;

  const estimatedTotal = Math.max(
    0,
    subtotal + estimatedShipping - displayedCoinDiscount
  );

  // --------------------------------------------------
  // EMPTY CART
  // --------------------------------------------------

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
              type="button"
              onClick={() => navigate("/products")}
            >
              Browse Products
            </button>
          </div>
        </main>
      </div>
    );
  }

  // --------------------------------------------------
  // MAIN CHECKOUT
  // --------------------------------------------------

  return (
    <div className="checkout-page">
      <Navbar />

      <main className="checkout-container">
        <button
          type="button"
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

        <div className="checkout-layout">
          {/* LEFT SIDE */}

          <div className="checkout-main">
            {/* DELIVERY ADDRESS */}

            <section className="checkout-section">
              <div className="section-heading">
                <span>1</span>

                <div>
                  <h2>Delivery Address</h2>
                  <p>
                    Choose a saved address or add a new one.
                  </p>
                </div>
              </div>

              {addressLoading ? (
                <p className="address-status">
                  Loading saved addresses...
                </p>
              ) : (
                <>
                  {addressError && !showAddressForm && (
                    <div className="address-error" role="alert">
                      {addressError}

                      <button
                        type="button"
                        onClick={fetchAddresses}
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {!showAddressForm && (
                    <>
                      {savedAddresses.length > 0 ? (
                        <div className="saved-address-list">
                          {savedAddresses.map((savedAddress) => {
                            const selected =
                              selectedAddressId ===
                              savedAddress._id;

                            return (
                              <article
                                key={savedAddress._id}
                                className={`saved-address-card ${
                                  selected ? "selected" : ""
                                }`}
                              >
                                <label className="saved-address-select">
                                  <input
                                    type="radio"
                                    name="savedAddress"
                                    value={savedAddress._id}
                                    checked={selected}
                                    onChange={() =>
                                      handleSelectAddress(
                                        savedAddress._id
                                      )
                                    }
                                  />

                                  <span className="address-type-icon">
                                    <MapPin size={19} />
                                  </span>

                                  <div className="saved-address-content">
                                    <div className="saved-address-title">
                                      <strong>
                                        {savedAddress.fullName}
                                      </strong>

                                      <span className="address-type-badge">
                                        {savedAddress.addressType ||
                                          "Home"}
                                      </span>

                                      {savedAddress.isDefault && (
                                        <span className="default-badge">
                                          Default
                                        </span>
                                      )}
                                    </div>

                                    <p>{savedAddress.phone}</p>

                                    <p>
                                      {savedAddress.addressLine}
                                      {savedAddress.landmark
                                        ? `, ${savedAddress.landmark}`
                                        : ""}
                                    </p>

                                    <p>
                                      {savedAddress.city},{" "}
                                      {savedAddress.state} -{" "}
                                      {savedAddress.pincode}
                                    </p>

                                    {selected && (
                                      <span className="selected-address-label">
                                        <CheckCircle2 size={15} />
                                        Selected for delivery
                                      </span>
                                    )}
                                  </div>
                                </label>

                                <div className="saved-address-actions">
                                  {!savedAddress.isDefault && (
                                    <button
                                      type="button"
                                      className="text-action"
                                      onClick={() =>
                                        handleSetDefaultAddress(
                                          savedAddress._id
                                        )
                                      }
                                    >
                                      Set default
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    className="icon-action"
                                    title="Edit address"
                                    aria-label="Edit address"
                                    onClick={() =>
                                      openEditAddressForm(
                                        savedAddress
                                      )
                                    }
                                  >
                                    <Pencil size={16} />
                                  </button>

                                  <button
                                    type="button"
                                    className="icon-action delete-action"
                                    title="Delete address"
                                    aria-label="Delete address"
                                    onClick={() =>
                                      handleDeleteAddress(
                                        savedAddress._id
                                      )
                                    }
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="no-saved-addresses">
                          <MapPin size={30} />
                          <h3>No saved addresses yet</h3>
                          <p>
                            Add a delivery address to continue.
                          </p>
                        </div>
                      )}

                      <button
                        type="button"
                        className="add-address-button"
                        onClick={openAddAddressForm}
                      >
                        <Plus size={18} />
                        Add a new address
                      </button>
                    </>
                  )}

                  {showAddressForm && (
                    <form
                      className="new-address-panel address-form"
                      onSubmit={handleSaveAddress}
                    >
                      <div className="address-form-heading">
                        <div>
                          <h3>
                            {editingAddressId
                              ? "Edit address"
                              : "Add a new address"}
                          </h3>

                          <p>
                            Enter the delivery details below.
                          </p>
                        </div>

                        {savedAddresses.length > 0 && (
                          <button
                            type="button"
                            className="close-address-form"
                            onClick={closeAddressForm}
                            aria-label="Close address form"
                          >
                            <X size={19} />
                          </button>
                        )}
                      </div>

                      {addressError && (
                        <div className="address-error" role="alert">
                          {addressError}
                        </div>
                      )}

                      <div className="address-type-options">
                        {["Home", "Office", "Other"].map((type) => (
                          <label
                            key={type}
                            className={`address-type-option ${
                              addressForm.addressType === type
                                ? "active"
                                : ""
                            }`}
                          >
                            <input
                              type="radio"
                              name="addressType"
                              value={type}
                              checked={
                                addressForm.addressType === type
                              }
                              onChange={handleAddressFormChange}
                            />
                            {type}
                          </label>
                        ))}
                      </div>

                      <div className="address-grid">
                        <div className="form-group">
                          <label htmlFor="fullName">
                            Full Name *
                          </label>

                          <input
                            id="fullName"
                            type="text"
                            name="fullName"
                            value={addressForm.fullName}
                            onChange={handleAddressFormChange}
                            placeholder="Enter full name"
                            autoComplete="name"
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="phone">
                            Phone Number *
                          </label>

                          <input
                            id="phone"
                            type="tel"
                            name="phone"
                            value={addressForm.phone}
                            onChange={handleAddressFormChange}
                            placeholder="Enter phone number"
                            autoComplete="tel"
                            required
                          />
                        </div>

                        <div className="form-group full-width">
                          <label htmlFor="addressLine">
                            House / Street / Area *
                          </label>

                          <textarea
                            id="addressLine"
                            name="addressLine"
                            value={addressForm.addressLine}
                            onChange={handleAddressFormChange}
                            placeholder="House no., street, area"
                            rows="3"
                            autoComplete="street-address"
                            required
                          />
                        </div>

                        <div className="form-group full-width">
                          <label htmlFor="landmark">
                            Landmark (optional)
                          </label>

                          <input
                            id="landmark"
                            type="text"
                            name="landmark"
                            value={addressForm.landmark}
                            onChange={handleAddressFormChange}
                            placeholder="Nearby landmark"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="city">City *</label>

                          <input
                            id="city"
                            type="text"
                            name="city"
                            value={addressForm.city}
                            onChange={handleAddressFormChange}
                            placeholder="City"
                            autoComplete="address-level2"
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="state">State *</label>

                          <input
                            id="state"
                            type="text"
                            name="state"
                            value={addressForm.state}
                            onChange={handleAddressFormChange}
                            placeholder="State"
                            autoComplete="address-level1"
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="pincode">
                            Pincode *
                          </label>

                          <input
                            id="pincode"
                            type="text"
                            name="pincode"
                            value={addressForm.pincode}
                            onChange={handleAddressFormChange}
                            placeholder="6-digit pincode"
                            inputMode="numeric"
                            autoComplete="postal-code"
                            maxLength={6}
                            pattern="[0-9]{6}"
                            title="Enter a valid 6-digit pincode"
                            required
                          />
                        </div>
                      </div>

                      <label className="default-address-checkbox">
                        <input
                          type="checkbox"
                          name="isDefault"
                          checked={addressForm.isDefault}
                          onChange={handleAddressFormChange}
                        />

                        Set as my default address
                      </label>

                      <div className="address-form-actions">
                        {savedAddresses.length > 0 && (
                          <button
                            type="button"
                            className="cancel-address-button"
                            onClick={closeAddressForm}
                            disabled={savingAddress}
                          >
                            Cancel
                          </button>
                        )}

                        <button
                          type="submit"
                          className="save-address-button"
                          disabled={savingAddress}
                        >
                          {savingAddress
                            ? "Saving..."
                            : editingAddressId
                            ? "Update address"
                            : "Save address"}
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </section>

            {/* PAYMENT METHOD */}

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
                    paymentMethod === "COD" ? "selected" : ""
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
                    paymentMethod === "ONLINE" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="ONLINE"
                    checked={paymentMethod === "ONLINE"}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value)
                    }
                  />

                  <div>
                    <strong>
                      Online Payment <small>Demo</small>
                    </strong>

                    <span>
                      Simulated successful payment.
                    </span>
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* RIGHT SIDE: ORDER SUMMARY */}

          <form
            className="checkout-summary place-order-form"
            onSubmit={handlePlaceOrder}
          >
            <h2>Order Summary</h2>

            <div className="checkout-products">
              {items.map((item, index) => {
                const product = item.product;

                if (!product) return null;

                const image =
                  product.images?.[0] || product.logo || "";

                const effectivePrice = getEffectivePrice(
                  product,
                  item.quantity
                );

                const itemTotal =
                  effectivePrice * item.quantity;

                return (
                  <div
                    className="checkout-product"
                    key={product._id || index}
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
                        {effectivePrice.toLocaleString("en-IN")}{" "}
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

            {/* ORIKAM REWARDS */}
            <div className="checkout-rewards">
              <div className="checkout-rewards-heading">
                <div>
                  <h3>ORIKAM Rewards</h3>
                  <p>Your eligible coins are applied automatically.</p>
                </div>
                <span className="reward-coin-icon">◈</span>
              </div>

              <p className="reward-conversion">
                10 coins = ₹1 discount · Up to 10% of subtotal
              </p>

              {rewardLoading && (
                <p className="reward-status">Calculating rewards...</p>
              )}

              {rewardError && (
                <p className="reward-error">{rewardError}</p>
              )}

              {rewardPreview && (
                <>
                  <div className="reward-balance">
                    Available {rewardPreview.membership || "Silver"} coins:{" "}
                    <strong>
                      {Number(rewardPreview.availableCoins || 0).toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <div className="reward-summary-row">
                    <span>Coins applied automatically</span>
                    <strong>
                      {Number(rewardPreview.coinsToRedeem || 0).toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <div className="reward-summary-row">
                    <span>Coin discount</span>
                    <strong>
                      -₹{displayedCoinDiscount.toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <div className="reward-summary-row">
                    <span>Estimated coins earned</span>
                    <strong>
                      +{Number(rewardPreview.estimatedCoinsEarned || 0).toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <div className="reward-membership">
                    {rewardPreview.membership || "Silver"} ·{" "}
                    {Number(rewardPreview.coinMultiplier || 1)}× coin multiplier
                  </div>
                </>
              )}
            </div>

            <div className="summary-row">
              <span>Coin Discount</span>
              <span>
                -₹{displayedCoinDiscount.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span>
                {estimatedShipping === 0
                  ? "Free"
                  : `₹${estimatedShipping.toLocaleString("en-IN")}`}
              </span>
            </div>

            <div className="summary-divider" />

            <div className="summary-total">
              <span>Total</span>

              <strong>
                ₹{estimatedTotal.toLocaleString("en-IN")}
              </strong>
            </div>

            <button
              type="submit"
              className="place-order-button"
              disabled={
                placingOrder ||
                rewardLoading ||
                addressLoading ||
                savedAddresses.length === 0 ||
                !selectedAddressId ||
                showAddressForm ||
                !rewardPreview ||
                Boolean(rewardError)
              }
            >
              {placingOrder
                ? "Placing Order..."
                : "Place Order"}
            </button>

            <p className="demo-payment-note">
              🔒 Demo checkout — no real payment will be processed.
            </p>
          </form>
        </div>
      </main>
      <Footer/>
    </div>
  );
};

export default Checkout;