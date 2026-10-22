const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");
const CoinWallet = require("../models/CoinWallet");
const CoinTransaction = require("../models/CoinTransaction");
const mongoose = require("mongoose");
const Membership = require("../models/Membership");
const { rewardPurchase } = require("../utils/coinRewards");

const COIN_BUCKETS = [
  "legacyBalance",
  "Silver",
  "Gold",
  "Platinum",
  "Diamond",
];

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

    const wallet = await CoinWallet.findOne({ user: userId });

    const tierBalance = wallet?.tierBalances?.get
      ? wallet.tierBalances.get(currentTier)
      : wallet?.tierBalances?.[currentTier];

    const availableCoins = Math.max(
      0,
      Number(tierBalance) || 0
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
  getOrdersByUser,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  requestReturn,
  getAllReturns,
  updateReturnStatus,
  getRewardPreview,
};