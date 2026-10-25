const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");
const CoinWallet = require("../models/CoinWallet");
const CoinTransaction = require("../models/CoinTransaction");
const mongoose = require("mongoose");
const Membership = require("../models/Membership");
const { rewardPurchase } = require("../utils/coinRewards");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/Payment");
require("dotenv").config();
const COIN_BUCKETS = [
  "legacyBalance",
  "Silver",
  "Gold",
  "Platinum",
  "Diamond",
];
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const getWalletBalances = (wallet) => ({
  legacyBalance: Number(wallet?.legacyBalance || 0),
  Silver: Number(wallet?.tierBalances?.Silver || 0),
  Gold: Number(wallet?.tierBalances?.Gold || 0),
  Platinum: Number(wallet?.tierBalances?.Platinum || 0),
  Diamond: Number(wallet?.tierBalances?.Diamond || 0),
});

// Preserve compatibility with the existing frontend's coinsToRedeem.
// New frontend requests can specify each bucket independently.
const getCoinSelection = (body, balances) => {
  const fields = {
    legacyBalance: "legacyCoinsToRedeem",
    Silver: "silverCoinsToRedeem",
    Gold: "goldCoinsToRedeem",
    Platinum: "platinumCoinsToRedeem",
    Diamond: "diamondCoinsToRedeem",
  };

  const hasExplicitSelection = Object.values(fields).some(
    (field) => body[field] !== undefined
  );

  const selection = {
    legacyBalance: 0,
    Silver: 0,
    Gold: 0,
    Platinum: 0,
    Diamond: 0,
  };

  if (hasExplicitSelection) {
    for (const [bucket, field] of Object.entries(fields)) {
      const amount = Number(body[field] ?? 0);

      if (!Number.isInteger(amount) || amount < 0) {
        throw new Error(`${field} must be a non-negative integer`);
      }

      selection[bucket] = amount;
    }
  } else {
    // Backward compatibility: allocate the old total selection
    // across available balances, without exceeding any bucket.
    const requested = Number(body.coinsToRedeem ?? 0);

    if (!Number.isInteger(requested) || requested < 0) {
      throw new Error(
        "Coins to redeem must be a non-negative integer"
      );
    }

    let remaining = requested;

    for (const bucket of COIN_BUCKETS) {
      const available = balances[bucket] || 0;
      const amount = Math.min(remaining, available);

      selection[bucket] = amount;
      remaining -= amount;
    }

    if (remaining > 0) {
      throw new Error("Insufficient coin balance");
    }
  }

  return selection;
};

const getTotalSelectedCoins = (selection) =>
  Object.values(selection).reduce(
    (total, amount) => total + amount,
    0
  );

const getCoinBalanceConditions = (selection) => {
  const conditions = {
    balance: { $gte: getTotalSelectedCoins(selection) },
  };

  if (selection.legacyBalance > 0) {
    conditions.legacyBalance = {
      $gte: selection.legacyBalance,
    };
  }

  for (const tier of ["Silver", "Gold", "Platinum", "Diamond"]) {
    if (selection[tier] > 0) {
      conditions[`tierBalances.${tier}`] = {
        $gte: selection[tier],
      };
    }
  }

  return conditions;
};

const getCoinDeduction = (selection) => {
  const deduction = {
    balance: -getTotalSelectedCoins(selection),
    totalRedeemed: getTotalSelectedCoins(selection),
  };

  if (selection.legacyBalance > 0) {
    deduction.legacyBalance = -selection.legacyBalance;
  }

  for (const tier of ["Silver", "Gold", "Platinum", "Diamond"]) {
    if (selection[tier] > 0) {
      deduction[`tierBalances.${tier}`] = -selection[tier];
    }
  }

  return deduction;
};

const createOrder = async (req, res) => {
  let order;
  let coinsDeducted = false;
  let requestedCoins = 0;
  let currentTier = "Silver";

  const decrementedStock = [];

  try {
    const userId = req.user?._id || req.body.userId;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Valid user ID is required",
      });
    }

    const { shippingAddress, paymentMethod, notes } = req.body;

    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Shipping address and payment method are required",
      });
    }

    if (!["COD", "ONLINE"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    // Get cart
    const cart = await Cart.findOne({ user: userId }).populate(
      "items.product"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // Validate products and calculate subtotal
    let subtotal = 0;
    const items = [];

    for (const cartItem of cart.items) {
      const product = cartItem.product;

      if (!product) {
        throw new Error("A product in your cart no longer exists");
      }

      const quantity = Number(cartItem.quantity);
      const moq = Number(product.moq) || 1;
      const stock = Number(product.stock);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error(`Invalid quantity for ${product.name}`);
      }

      if (quantity < moq) {
        throw new Error(
          `Minimum order quantity for ${product.name} is ${moq}`
        );
      }

      if (!Number.isFinite(stock) || quantity > stock) {
        throw new Error(
          `Insufficient stock for ${product.name}. Available: ${product.stock}`
        );
      }

      // Apply the best eligible bulk price.
      const bulkTiers = (product.bulkPricing || [])
        .filter(
          (tier) =>
            Number(tier.minQuantity) <= quantity &&
            Number.isFinite(Number(tier.price)) &&
            Number(tier.price) >= 0
        )
        .sort(
          (a, b) =>
            Number(b.minQuantity) - Number(a.minQuantity)
        );

      let price;

      if (bulkTiers.length > 0) {
        price = Number(bulkTiers[0].price);
      } else if (
        product.b2bPrice !== undefined &&
        product.b2bPrice !== null &&
        Number.isFinite(Number(product.b2bPrice))
      ) {
        price = Number(product.b2bPrice);
      } else {
        price = Number(product.price);
      }

      if (!Number.isFinite(price) || price < 0) {
        throw new Error(`Invalid price for ${product.name}`);
      }

      subtotal += price * quantity;

      items.push({
        product: product._id,
        quantity,
        price,
      });
    }

    if (!Number.isFinite(subtotal)) {
      throw new Error("Invalid order subtotal");
    }

    // Get user and determine current membership tier.
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const membershipActive =
      user.membership?.status === "active" &&
      user.membership?.endDate &&
      new Date(user.membership.endDate) > new Date() &&
      user.membership?.plan;

    if (membershipActive) {
      const membership = await Membership.findById(
        user.membership.plan
      );

      if (membership?.isActive) {
        const matchedTier = [
          "Silver",
          "Gold",
          "Platinum",
          "Diamond",
        ].find(
          (tier) =>
            tier.toLowerCase() === membership.name?.toLowerCase()
        );

        if (matchedTier) {
          currentTier = matchedTier;
        }
      }
    }

    // Get or create coin wallet.
    let wallet = await CoinWallet.findOne({ user: userId });

    if (!wallet) {
      wallet = await CoinWallet.create({
        user: userId,
        balance: 0,
        legacyBalance: 0,
        tierBalances: {
          Silver: 0,
          Gold: 0,
          Platinum: 0,
          Diamond: 0,
        },
      });
    }

    // Automatically redeem coins from the current tier only.
    const availableCoins = Math.max(
      0,
      Number(wallet.tierBalances?.[currentTier]) || 0
    );

    // 10 coins = ₹1; maximum discount = 10% of subtotal.
    const maxCoinsAllowed = Math.floor(subtotal * 0.1 * 10);

    requestedCoins = Math.min(
      availableCoins,
      maxCoinsAllowed
    );

    const coinDiscount = Number(
      (requestedCoins / 10).toFixed(2)
    );

    // Shipping calculation.
    const shippingCharge = subtotal >= 1000 ? 0 : 50;

    const totalAmount = Number(
      Math.max(
        0,
        subtotal + shippingCharge - coinDiscount
      ).toFixed(2)
    );

    if (
      !Number.isFinite(coinDiscount) ||
      !Number.isFinite(totalAmount)
    ) {
      throw new Error("Invalid order total calculation");
    }

    // Create order.
    order = await Order.create({
      user: userId,
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      discount: coinDiscount,
      shippingCharge,
      totalAmount,
      orderStatus: "PLACED",
      trackingHistory: [
        {
          status: "PLACED",
          note: "Order placed successfully",
          timestamp: new Date(),
        },
      ],
    });

    // Deduct coins atomically from the current membership tier.
    if (requestedCoins > 0) {
      const updatedWallet = await CoinWallet.findOneAndUpdate(
        {
          user: userId,
          balance: { $gte: requestedCoins },
          [`tierBalances.${currentTier}`]: {
            $gte: requestedCoins,
          },
        },
        {
          $inc: {
            balance: -requestedCoins,
            [`tierBalances.${currentTier}`]: -requestedCoins,
            totalRedeemed: requestedCoins,
          },
        },
        { new: true }
      );

      if (!updatedWallet) {
        throw new Error(
          "Your coin balance changed. Please try again."
        );
      }

      coinsDeducted = true;

      await CoinTransaction.create({
        user: userId,
        type: "redemption",
        coins: requestedCoins,
        direction: "debit",
        order: order._id,
        membershipTier: currentTier,
        description: `${requestedCoins} ${currentTier} coins automatically redeemed`,
        status: "completed",
      });
    }

    // Reduce stock atomically.
    for (const item of items) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.product,
          stock: { $gte: item.quantity },
        },
        {
          $inc: {
            stock: -item.quantity,
          },
        },
        { new: true }
      );

      if (!updatedProduct) {
        throw new Error(
          `Insufficient stock for product ${item.product}`
        );
      }

      decrementedStock.push(item);
    }

    // Prepare response before clearing the cart.
    const populatedOrder = await Order.findById(order._id)
      .populate("items.product")
      .populate("user", "name email");

    // Clear cart after successful order processing.
    cart.items = [];
    await cart.save();

    const updatedWallet = await CoinWallet.findOne({
      user: userId,
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: populatedOrder,
      availableCoins: Math.max(
        0,
        Number(updatedWallet?.tierBalances?.[currentTier]) || 0
      ),
      membershipTier: currentTier,
      coinsRedeemed: requestedCoins,
      coinDiscount,
      subtotal,
      shippingCharge,
      totalAmount,
    });
  } catch (error) {
    console.error("Create order error:", error);

    // Restore stock if order processing fails.
    for (const item of decrementedStock) {
      try {
        await Product.findByIdAndUpdate(item.product, {
          $inc: {
            stock: item.quantity,
          },
        });
      } catch (rollbackError) {
        console.error(
          "Stock rollback failed:",
          rollbackError.message
        );
      }
    }

    // Restore coins if they were deducted.
    if (coinsDeducted && order && requestedCoins > 0) {
      try {
        await CoinWallet.findOneAndUpdate(
          { user: order.user },
          {
            $inc: {
              balance: requestedCoins,
              [`tierBalances.${currentTier}`]: requestedCoins,
              totalRedeemed: -requestedCoins,
            },
          }
        );
      } catch (rollbackError) {
        console.error(
          "Wallet rollback failed:",
          rollbackError.message
        );
      }
    }

    // Remove transactions and failed order.
    if (order) {
      try {
        await CoinTransaction.deleteMany({
          order: order._id,
        });

        await Order.findByIdAndDelete(order._id);
      } catch (rollbackError) {
        console.error(
          "Order rollback failed:",
          rollbackError.message
        );
      }
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create order",
    });
  }
};

const createProductOrderPayment = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;
    const { shippingAddress, coinsToRedeem = 0 } = req.body;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Valid user ID is required",
      });
    }

    if (
      !shippingAddress ||
      !shippingAddress.name ||
      !shippingAddress.phone ||
      !shippingAddress.addressLine ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete shipping address is required",
      });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Razorpay keys are not configured",
      });
    }

    // Load cart
    const cart = await Cart.findOne({ user: userId }).populate(
      "items.product"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // Calculate subtotal using server-side prices
    let subtotal = 0;

    for (const cartItem of cart.items) {
      const product = cartItem.product;

      if (!product || !product.isActive) {
        throw new Error("A product in your cart is unavailable");
      }

      const quantity = Number(cartItem.quantity);
      const moq = Number(product.moq) || 1;
      const stock = Number(product.stock);

      if (!Number.isInteger(quantity) || quantity < moq) {
        throw new Error(
          `Minimum order quantity for ${product.name} is ${moq}`
        );
      }

      if (!Number.isFinite(stock) || quantity > stock) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      const eligibleTiers = (product.bulkPricing || [])
        .filter(
          (tier) =>
            Number(tier.minQuantity) <= quantity &&
            Number.isFinite(Number(tier.price)) &&
            Number(tier.price) >= 0
        )
        .sort(
          (a, b) =>
            Number(b.minQuantity) - Number(a.minQuantity)
        );

      let price;

      if (eligibleTiers.length > 0) {
        price = Number(eligibleTiers[0].price);
      } else if (
        product.b2bPrice !== undefined &&
        product.b2bPrice !== null &&
        Number.isFinite(Number(product.b2bPrice))
      ) {
        price = Number(product.b2bPrice);
      } else {
        price = Number(product.price);
      }

      if (!Number.isFinite(price) || price < 0) {
        throw new Error(`Invalid price for ${product.name}`);
      }

      subtotal += price * quantity;
    }

    subtotal = Number(subtotal.toFixed(2));

    // Validate requested coin redemption
    const requested = Number(coinsToRedeem);

    if (!Number.isInteger(requested) || requested < 0) {
      return res.status(400).json({
        success: false,
        message: "coinsToRedeem must be a non-negative integer",
      });
    }

    // Match the existing order flow: current membership tier only
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let currentTier = "Silver";

    const membershipActive =
      user.membership?.status === "active" &&
      user.membership?.endDate &&
      new Date(user.membership.endDate) > new Date() &&
      user.membership?.plan;

    if (membershipActive) {
      const membership = await Membership.findById(
        user.membership.plan
      );

      if (membership?.isActive) {
        const matchedTier = [
          "Silver",
          "Gold",
          "Platinum",
          "Diamond",
        ].find(
          (tier) =>
            tier.toLowerCase() === membership.name?.toLowerCase()
        );

        if (matchedTier) currentTier = matchedTier;
      }
    }

    const wallet = await CoinWallet.findOne({ user: userId });

    const availableCoins = Math.max(
      0,
      Number(wallet?.tierBalances?.[currentTier]) || 0
    );

    const maxCoinsAllowed = Math.floor(subtotal * 0.1 * 10);

    // Preserve the existing flow's automatic redemption:
    // coinsToRedeem is optional; zero means use the existing automatic rule.
    const coinsRedeemed =
      requested > 0
        ? Math.min(requested, availableCoins, maxCoinsAllowed)
        : Math.min(availableCoins, maxCoinsAllowed);

    const coinDiscount = Number((coinsRedeemed / 10).toFixed(2));
    const shippingCharge = subtotal >= 1000 ? 0 : 50;

    const totalAmount = Number(
      Math.max(
        0,
        subtotal + shippingCharge - coinDiscount
      ).toFixed(2)
    );

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Online payment amount must be greater than zero",
      });
    }

    // Create Razorpay order; amount must be in paise
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `product_${new mongoose.Types.ObjectId()}`,
      notes: {
        purpose: "PRODUCT_ORDER",
        userId: String(userId),
        membershipTier: currentTier,
        coinsRedeemed: String(coinsRedeemed),
      },
    });
const checkoutItems = cart.items.map((item) => {
  const product = item.product;
  const quantity = Number(item.quantity);

  const eligibleTiers = (product.bulkPricing || [])
    .filter(
      (tier) =>
        Number(tier.minQuantity) <= quantity &&
        Number.isFinite(Number(tier.price)) &&
        Number(tier.price) >= 0
    )
    .sort(
      (a, b) => Number(b.minQuantity) - Number(a.minQuantity)
    );

  let price;

  if (eligibleTiers.length > 0) {
    price = Number(eligibleTiers[0].price);
  } else if (
    product.b2bPrice !== undefined &&
    product.b2bPrice !== null &&
    Number.isFinite(Number(product.b2bPrice))
  ) {
    price = Number(product.b2bPrice);
  } else {
    price = Number(product.price);
  }

  return {
    product: product._id,
    quantity,
    price,
  };
});
    // Save a payment record. The actual Order is created after verification.
    await Payment.create({
      user: userId,
      purpose: "PRODUCT_ORDER",
      amount: totalAmount,
      currency: "INR",
      razorpayOrderId: razorpayOrder.id,
      status: "CREATED",
      checkoutData: {
        items: checkoutItems,
  shippingAddress,
  coinsRedeemed,
  membershipTier: currentTier,
  subtotal,
  shippingCharge,
  coinDiscount,
  totalAmount,
},
    });

    return res.status(201).json({
      success: true,
      message: "Payment order created",
      key: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      subtotal,
      shippingCharge,
      coinDiscount,
      coinsRedeemed,
      membershipTier: currentTier,
      totalAmount,
      shippingAddress,
    });
  } catch (error) {
    console.error("Create product payment error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create payment",
    });
  }
};


const verifyProductOrderPayment = async (req, res) => {
  let claimedPaymentId = null;
  let order = null;
  let coinsRedeemed = 0;
  let currentTier = "Silver";
  let deductedCoins = false;
  let coinTransactionId = null;
  const decrementedStock = [];

  try {
    const userId = req.user?._id || req.body.userId;

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // --------------------------------------------------
    // 1. Validate request
    // --------------------------------------------------

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Valid user ID is required",
      });
    }

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Razorpay payment details are required",
      });
    }

    const payment = await Payment.findOne({
      user: userId,
      purpose: "PRODUCT_ORDER",
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Product payment record not found",
      });
    }

    // --------------------------------------------------
    // 2. Idempotency: return an existing finalized order
    // --------------------------------------------------

    if (payment.status === "PAID") {
      if (payment.razorpayPaymentId !== razorpay_payment_id) {
        return res.status(409).json({
          success: false,
          message: "Payment record has already been used",
        });
      }

      if (!payment.order) {
        return res.status(409).json({
          success: false,
          paymentCaptured: true,
          message:
            "Payment was captured, but order finalization needs reconciliation.",
        });
      }

      const existingOrder = await Order.findById(payment.order)
        .populate("items.product")
        .populate("user", "name email");

      if (!existingOrder) {
        return res.status(409).json({
          success: false,
          paymentCaptured: true,
          message:
            "The payment is recorded, but its order is missing. Reconciliation is required.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        order: existingOrder,
      });
    }

    // PROCESSING records must not be claimed by another request.
    // A recovery procedure is needed for abandoned PROCESSING records.
    if (payment.status !== "CREATED") {
      return res.status(409).json({
        success: false,
        paymentCaptured: true,
        message:
          "This payment is already being processed or requires reconciliation.",
      });
    }

    // --------------------------------------------------
    // 3. Verify Razorpay signature
    // --------------------------------------------------

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Razorpay secret is not configured",
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const receivedBuffer = Buffer.from(razorpay_signature, "hex");

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // --------------------------------------------------
    // 4. Verify payment directly with Razorpay
    // --------------------------------------------------

    const razorpayPayment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    if (
      razorpayPayment.order_id !== razorpay_order_id ||
      razorpayPayment.status !== "captured" ||
      razorpayPayment.currency !== payment.currency ||
      Number(razorpayPayment.amount) !==
        Math.round(Number(payment.amount) * 100)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment is not captured or payment details do not match",
      });
    }

    const checkout = payment.checkoutData;

    if (
      !checkout ||
      !Array.isArray(checkout.items) ||
      checkout.items.length === 0 ||
      !checkout.shippingAddress
    ) {
      return res.status(409).json({
        success: false,
        paymentCaptured: true,
        message:
          "Saved checkout details are incomplete. Reconciliation is required.",
      });
    }

    // --------------------------------------------------
    // 5. Validate saved checkout amounts
    // --------------------------------------------------

    const subtotalFromSnapshot = Number(checkout.subtotal);
    const shippingCharge = Number(checkout.shippingCharge);
    const coinDiscount = Number(checkout.coinDiscount);
    const totalAmount = Number(checkout.totalAmount);

    if (
      !Number.isFinite(subtotalFromSnapshot) ||
      subtotalFromSnapshot < 0 ||
      !Number.isFinite(shippingCharge) ||
      shippingCharge < 0 ||
      !Number.isFinite(coinDiscount) ||
      coinDiscount < 0 ||
      !Number.isFinite(totalAmount) ||
      totalAmount <= 0 ||
      Math.abs(
        subtotalFromSnapshot + shippingCharge - coinDiscount - totalAmount
      ) > 0.01 ||
      Math.abs(totalAmount - Number(payment.amount)) > 0.01 ||
      Math.abs(
        coinDiscount -
          Number(checkout.coinsRedeemed || 0) / 10
      ) > 0.01
    ) {
      return res.status(409).json({
        success: false,
        paymentCaptured: true,
        message:
          "Saved payment amounts are inconsistent. Reconciliation is required.",
      });
    }

    // --------------------------------------------------
    // 6. Validate cart and saved product prices
    // --------------------------------------------------

    const cart = await Cart.findOne({ user: userId }).populate(
      "items.product"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(409).json({
        success: false,
        paymentCaptured: true,
        message:
          "Cart is empty. Payment reconciliation is required.",
      });
    }

    if (cart.items.length !== checkout.items.length) {
      return res.status(409).json({
        success: false,
        paymentCaptured: true,
        message:
          "Cart changed after payment creation. Reconciliation is required.",
      });
    }

    const orderItems = [];
    let calculatedSubtotal = 0;

    for (const savedItem of checkout.items) {
      const cartItem = cart.items.find(
        (item) =>
          String(item.product?._id) === String(savedItem.product)
      );

      if (
        !cartItem ||
        Number(cartItem.quantity) !== Number(savedItem.quantity)
      ) {
        return res.status(409).json({
          success: false,
          paymentCaptured: true,
          message:
            "Cart items changed after payment creation. Reconciliation is required.",
        });
      }

      const product = await Product.findById(savedItem.product);

      if (!product || !product.isActive) {
        return res.status(409).json({
          success: false,
          paymentCaptured: true,
          message:
            "A purchased product is unavailable. Reconciliation is required.",
        });
      }

      const quantity = Number(savedItem.quantity);
      const price = Number(savedItem.price);
      const moq = Number(product.moq) || 1;

      if (
        !Number.isInteger(quantity) ||
        quantity < moq ||
        !Number.isFinite(price) ||
        price < 0
      ) {
        return res.status(409).json({
          success: false,
          paymentCaptured: true,
          message:
            `Invalid saved quantity or price for ${product.name}. Reconciliation is required.`,
        });
      }

      orderItems.push({
        product: product._id,
        quantity,
        price,
      });

      calculatedSubtotal += price * quantity;
    }

    calculatedSubtotal = Number(calculatedSubtotal.toFixed(2));

    if (
      Math.abs(calculatedSubtotal - subtotalFromSnapshot) > 0.01
    ) {
      return res.status(409).json({
        success: false,
        paymentCaptured: true,
        message:
          "Saved checkout subtotal is inconsistent. Reconciliation is required.",
      });
    }

    // --------------------------------------------------
    // 7. Validate user and coin redemption
    // --------------------------------------------------

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        paymentCaptured: true,
        message: "User not found. Reconciliation is required.",
      });
    }

    coinsRedeemed = Number(checkout.coinsRedeemed || 0);
    currentTier = checkout.membershipTier || "Silver";

    const validTiers = [
      "Silver",
      "Gold",
      "Platinum",
      "Diamond",
    ];

    if (
      !validTiers.includes(currentTier) ||
      !Number.isInteger(coinsRedeemed) ||
      coinsRedeemed < 0 ||
      coinsRedeemed > Math.floor(subtotalFromSnapshot)
    ) {
      return res.status(409).json({
        success: false,
        paymentCaptured: true,
        message:
          "Invalid saved coin redemption. Reconciliation is required.",
      });
    }

    // --------------------------------------------------
    // 8. Atomically claim payment for processing
    // --------------------------------------------------

    const claimedPayment = await Payment.findOneAndUpdate(
      {
        _id: payment._id,
        status: "CREATED",
      },
      {
        $set: {
          status: "PROCESSING",
          razorpayPaymentId: razorpay_payment_id,
        },
      },
      { new: true }
    );

    if (!claimedPayment) {
      return res.status(409).json({
        success: false,
        paymentCaptured: true,
        message:
          "Payment is already being processed. Check your orders before retrying.",
      });
    }

    claimedPaymentId = claimedPayment._id;

    // --------------------------------------------------
    // 9. Finalize order
    // --------------------------------------------------

    try {
      // Deduct coins atomically.
      if (coinsRedeemed > 0) {
        const updatedWallet = await CoinWallet.findOneAndUpdate(
          {
            user: userId,
            balance: { $gte: coinsRedeemed },
            [`tierBalances.${currentTier}`]: {
              $gte: coinsRedeemed,
            },
          },
          {
            $inc: {
              balance: -coinsRedeemed,
              [`tierBalances.${currentTier}`]: -coinsRedeemed,
              totalRedeemed: coinsRedeemed,
            },
          },
          { new: true }
        );

        if (!updatedWallet) {
          throw new Error(
            "Insufficient coin balance. Reconciliation is required."
          );
        }

        deductedCoins = true;
      }

      // Deduct stock atomically.
      for (const item of orderItems) {
        const updatedProduct = await Product.findOneAndUpdate(
          {
            _id: item.product,
            stock: { $gte: item.quantity },
            isActive: true,
          },
          {
            $inc: { stock: -item.quantity },
          },
          { new: true }
        );

        if (!updatedProduct) {
          throw new Error(
            "Insufficient stock. Reconciliation is required."
          );
        }

        decrementedStock.push(item);
      }

      // Create the order.
      order = await Order.create({
        user: userId,
        items: orderItems,
        shippingAddress: checkout.shippingAddress,
        paymentMethod: "ONLINE",
        paymentStatus: "PAID",
        subtotal: subtotalFromSnapshot,
        discount: coinDiscount,
        shippingCharge,
        totalAmount,
        orderStatus: "PLACED",
        trackingHistory: [
          {
            status: "PLACED",
            note: "Order placed after successful online payment",
            timestamp: new Date(),
          },
        ],
      });

      // Create coin transaction.
      if (coinsRedeemed > 0) {
        const transaction = await CoinTransaction.create({
          user: userId,
          type: "redemption",
          coins: coinsRedeemed,
          direction: "debit",
          order: order._id,
          membershipTier: currentTier,
          description: `${coinsRedeemed} ${currentTier} coins redeemed`,
          status: "completed",
        });

        coinTransactionId = transaction._id;
      }

      // Link the order and mark the payment PAID.
      const finalizedPayment = await Payment.findOneAndUpdate(
        {
          _id: claimedPaymentId,
          status: "PROCESSING",
          razorpayPaymentId: razorpay_payment_id,
        },
        {
          $set: {
            order: order._id,
            status: "PAID",
            processedAt: new Date(),
          },
        },
        { new: true }
      );

      if (!finalizedPayment) {
        throw new Error(
          "Payment finalization failed. Reconciliation is required."
        );
      }

      // Clear cart only after payment and order are finalized.
      cart.items = [];
      await cart.save();

      const populatedOrder = await Order.findById(order._id)
        .populate("items.product")
        .populate("user", "name email");

      const updatedWallet = await CoinWallet.findOne({
        user: userId,
      });

      return res.status(200).json({
        success: true,
        message: "Payment verified and order created successfully",
        order: populatedOrder,
        coinsRedeemed,
        availableCoins: Math.max(
          0,
          Number(updatedWallet?.tierBalances?.[currentTier]) || 0
        ),
        membershipTier: currentTier,
        totalAmount,
      });
    } catch (finalizeError) {
      console.error(
        "Paid order finalization error:",
        finalizeError
      );

      /*
       * Only compensate if the payment is still PROCESSING.
       * If it has already become PAID, preserve the finalized
       * order and payment rather than deleting successful records.
       */
      const currentPayment = await Payment.findById(
        claimedPaymentId
      ).catch(() => null);

      if (currentPayment?.status === "PROCESSING") {
        if (order) {
          await Payment.updateOne(
            {
              _id: claimedPaymentId,
              status: "PROCESSING",
            },
            {
              $unset: { order: 1 },
            }
          ).catch((err) =>
            console.error("Payment unlink failed:", err.message)
          );

          if (coinTransactionId) {
            await CoinTransaction.findByIdAndDelete(
              coinTransactionId
            ).catch((err) =>
              console.error(
                "Coin transaction rollback failed:",
                err.message
              )
            );
          }

          await Order.findByIdAndDelete(order._id).catch((err) =>
            console.error("Order rollback failed:", err.message)
          );
        }

        for (const item of decrementedStock) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity },
          }).catch((err) =>
            console.error("Stock rollback failed:", err.message)
          );
        }

        if (deductedCoins) {
          await CoinWallet.findOneAndUpdate(
            { user: userId },
            {
              $inc: {
                balance: coinsRedeemed,
                [`tierBalances.${currentTier}`]: coinsRedeemed,
                totalRedeemed: -coinsRedeemed,
              },
            }
          ).catch((err) =>
            console.error("Coin rollback failed:", err.message)
          );
        }
      }

      /*
       * Keep the payment record for reconciliation.
       * Do not mark a captured payment FAILED.
       * PROCESSING records need a recovery/manual reconciliation
       * procedure; blindly resetting to CREATED can double-charge
       * or double-process a captured payment.
       */
      return res.status(500).json({
        success: false,
        paymentCaptured: true,
        message:
          "Payment was captured, but order finalization did not complete. The payment record has been preserved for reconciliation. Please contact support.",
      });
    }
  } catch (error) {
    console.error("Verify product payment error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Payment verification failed",
    });
  }
};




const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({
      user: userId,
    })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};


const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("items.product")
      .populate("user", "name email phone");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      message: "Order fetched successfully",
      order,
    });
  } catch (error) {
    console.error("Get order error:", error);

    res.status(500).json({
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .populate("items.product", "name logo images")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.error("Get all orders error:", error);

    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// Preview rewards before placing an order

const getRewardPreview = async (req, res) => {
  try {
    const { userId, productId, quantity: requestedQuantity } = req.body;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Valid user ID is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // =========================================
    // 1. CALCULATE SUBTOTAL
    // Supports Product Details and Checkout
    // =========================================

    let subtotal = 0;

    const calculateItemPrice = (product, quantity) => {
      if (!product) {
        throw new Error("A product no longer exists");
      }

      const moq = Number(product.moq) || 1;
      const stock = Number(product.stock) || 0;

      if (!Number.isFinite(quantity) || quantity < moq) {
        throw new Error(
          `${product.name} requires a minimum order quantity of ${moq}`
        );
      }

      if (quantity > stock) {
        throw new Error(
          `Insufficient stock for ${product.name}`
        );
      }

      const tiers = (product.bulkPricing || [])
        .filter(
          (tier) =>
            Number(tier.minQuantity) <= quantity &&
            Number(tier.price) >= 0
        )
        .sort(
          (a, b) =>
            Number(b.minQuantity) - Number(a.minQuantity)
        );

      let price = Number(product.price) || 0;

      if (tiers.length > 0) {
        price = Number(tiers[0].price);
      } else if (Number(product.b2bPrice) > 0) {
        price = Number(product.b2bPrice);
      }

      return price * quantity;
    };

    if (productId) {
      // Product Details: selected product and quantity

      if (!mongoose.isValidObjectId(productId)) {
        return res.status(400).json({
          success: false,
          message: "Valid product ID is required",
        });
      }

      const product = await Product.findById(productId);

      if (!product || !product.isActive) {
        return res.status(404).json({
          success: false,
          message: "Product not found or unavailable",
        });
      }

      const quantity = Number(requestedQuantity);

      subtotal = calculateItemPrice(product, quantity);
    } else {
      // Checkout: calculate the entire cart

      const cart = await Cart.findOne({ user: userId }).populate(
        "items.product"
      );

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Cart is empty",
        });
      }

      for (const item of cart.items) {
        const product = item.product;
        const quantity = Number(item.quantity);

        subtotal += calculateItemPrice(product, quantity);
      }
    }

    subtotal = Number(subtotal.toFixed(2));

    // =========================================
    // 2. FIND ACTIVE MEMBERSHIP
    // =========================================

    let membershipName = "Silver";
    let multiplier = 1;

    const membershipActive =
      user.membership?.status === "active" &&
      user.membership?.endDate &&
      new Date(user.membership.endDate) > new Date() &&
      user.membership?.plan;

    if (membershipActive) {
      const membership = await Membership.findById(
        user.membership.plan
      );

      if (membership?.isActive) {
        membershipName = membership.name;
        multiplier = Number(membership.coinMultiplier) || 1;
      }
    }

    // =========================================
    // 3. GET CURRENT TIER'S COIN BALANCE
    // =========================================

    const validTiers = [
      "Silver",
      "Gold",
      "Platinum",
      "Diamond",
    ];

    const currentTier =
      validTiers.find(
        (tier) =>
          tier.toLowerCase() === membershipName.toLowerCase()
      ) || "Silver";

    const wallet = await CoinWallet.findOne({ user: userId })
  .lean();

const tierBalance = wallet?.tierBalances?.[currentTier];

const availableCoins = Math.max(
  0,
  Number(tierBalance ?? 0) || 0
);



    // =========================================
    // 4. AUTOMATIC COIN DISCOUNT
    // 10 coins = ₹1
    // Maximum discount = 10% of subtotal
    // =========================================

    const maxDiscount = Number((subtotal * 0.1).toFixed(2));

    const maxCoinsAllowed = Math.floor(maxDiscount * 10);

    const coinsToRedeem = Math.min(
      availableCoins,
      maxCoinsAllowed
    );

    const coinDiscount = Number(
      (coinsToRedeem / 10).toFixed(2)
    );

    // =========================================
    // 5. ESTIMATE REWARDS
    // Rewards are credited after delivery
    // =========================================

    const eligibleAmount = Math.max(
      0,
      subtotal - coinDiscount
    );

    const estimatedCoinsEarned = Math.floor(
      (eligibleAmount / 100) * multiplier
    );

    const finalAmount = Number(
      eligibleAmount.toFixed(2)
    );

    // =========================================
    // 6. RESPONSE
    // =========================================

    return res.status(200).json({
      success: true,
      preview: {
        subtotal,
        membership: currentTier,
        membershipTier: currentTier,
        coinMultiplier: multiplier,
        availableCoins,
        coinsToRedeem,
        coinDiscount,
        estimatedCoinsEarned,
        maxDiscount,
        finalAmount,
        note:
          "Coins are applied automatically. Rewards are credited after delivery.",
      },
    });
  } catch (error) {
    console.error("Reward preview error:", error);

    const isValidationError =
      error.message.includes("minimum order quantity") ||
      error.message.includes("Insufficient stock") ||
      error.message.includes("no longer exists");

    return res.status(isValidationError ? 400 : 500).json({
      success: false,
      message: error.message || "Failed to calculate reward preview",
    });
  }
};



const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, note } = req.body;

    const allowedStatuses = [
      "PLACED",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const currentStatus = order.orderStatus;

    // --------------------------------
    // Valid status transitions
    // --------------------------------

    const allowedTransitions = {
      PLACED: ["CONFIRMED", "CANCELLED"],

      CONFIRMED: ["PROCESSING", "CANCELLED"],

      PROCESSING: ["SHIPPED", "CANCELLED"],

      SHIPPED: ["OUT_FOR_DELIVERY"],

      OUT_FOR_DELIVERY: ["DELIVERED"],

      DELIVERED: [],

      CANCELLED: [],
    };

    if (
      currentStatus !== status &&
      !allowedTransitions[currentStatus]?.includes(status)
    ) {
      return res.status(400).json({
        message: `Cannot change order status from ${currentStatus} to ${status}`,
      });
    }

    // --------------------------------
    // Update order status
    // --------------------------------

    // --------------------------------
// Restore stock when order is cancelled
// --------------------------------

if (
  status === "CANCELLED" &&
  currentStatus !== "CANCELLED"
) {
  for (const item of order.items) {
    await Product.findByIdAndUpdate(
      item.product,
      {
        $inc: {
          stock: Number(item.quantity),
        },
      }
    );
  }
}

// --------------------------------
// Update order status
// --------------------------------

order.orderStatus = status;

order.trackingHistory.push({
  status,
  note:
    note ||
    `Order status changed to ${status}`,
  timestamp: new Date(),
});

await order.save();
    await order.save();
    if (status === "DELIVERED") {
      await rewardPurchase(order);
    }

    // --------------------------------
    // Return updated order
    // --------------------------------

    const updatedOrder = await Order.findById(orderId)
      .populate("user", "name email phone")
      .populate(
        "items.product",
        "name logo images"
      );

    res.status(200).json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error(
      "Update order status error:",
      error
    );

    res.status(500).json({
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

const requestReturn = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        message: "Return reason is required",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Only delivered orders can be returned
    if (order.orderStatus !== "DELIVERED") {
      return res.status(400).json({
        message:
          "Only delivered orders can be returned",
      });
    }

    // Prevent duplicate return requests
    if ( order.returnStatus &&
      order.returnStatus !== "NONE") {
      return res.status(400).json({
        message:
          "A return request already exists for this order",
      });
    }

    order.returnStatus = "REQUESTED";
    order.returnReason = reason.trim();
    order.returnRequestedAt = new Date();

    await order.save();

    res.status(200).json({
      message: "Return request submitted successfully",
      order,
    });
  } catch (error) {
    console.error(
      "Request return error:",
      error
    );

    res.status(500).json({
      message: "Failed to request return",
      error: error.message,
    });
  }
};

const getAllReturns = async (req, res) => {
  try {
    const returns = await Order.find({
  returnStatus: {
    $in: [
      "REQUESTED",
      "APPROVED",
      "PICKED_UP",
      "RECEIVED",
      "REFUNDED",
      "REJECTED",
    ],
  },
})
      .populate("user", "name email phone")
      .populate("items.product", "name logo images")
      .sort({ returnRequestedAt: -1 });

    res.status(200).json({
      message: "Returns fetched successfully",
      returns,
    });
  } catch (error) {
    console.error("Get returns error:", error);

    res.status(500).json({
      message: "Failed to fetch returns",
      error: error.message,
    });
  }
};


const updateReturnStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "APPROVED",
      "PICKED_UP",
      "RECEIVED",
      "REFUNDED",
      "REJECTED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid return status",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const currentStatus = order.returnStatus;

    const allowedTransitions = {
      REQUESTED: ["APPROVED", "REJECTED"],
      APPROVED: ["PICKED_UP"],
      PICKED_UP: ["RECEIVED"],
      RECEIVED: ["REFUNDED"],
      REFUNDED: [],
      REJECTED: [],
      NONE: [],
    };

    if (
      !allowedTransitions[currentStatus]?.includes(status)
    ) {
      return res.status(400).json({
        message:
          `Cannot change return status from ${currentStatus} to ${status}`,
      });
    }

    order.returnStatus = status;

    await order.save();

    const updatedOrder = await Order.findById(orderId)
      .populate("user", "name email phone")
      .populate(
        "items.product",
        "name logo images"
      );

    res.status(200).json({
      message: "Return status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error(
      "Update return status error:",
      error
    );

    res.status(500).json({
      message: "Failed to update return status",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  createProductOrderPayment,
  verifyProductOrderPayment,
  getOrdersByUser,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  requestReturn,
  getAllReturns,
  updateReturnStatus,
  getRewardPreview,
};