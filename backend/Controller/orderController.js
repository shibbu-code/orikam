const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      shippingAddress,
      paymentMethod,
      discount = 0,
      shippingCharge = 0,
    } = req.body;

    if (!userId || !shippingAddress || !paymentMethod) {
      return res.status(400).json({
        message:
          "User, shipping address and payment method are required",
      });
    }

    const cart = await Cart.findOne({
      user: userId,
    }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    // --------------------------------
    // Validate MOQ and Stock
    // --------------------------------

    for (const item of cart.items) {
      const product = item.product;
      const quantity = Number(item.quantity);

      const moq = Number(product.moq) || 1;
      const stock = Number(product.stock) || 0;

      if (quantity < moq) {
        return res.status(400).json({
          message: `${product.name} requires a minimum order quantity of ${moq}`,
        });
      }

      if (quantity > stock) {
        return res.status(400).json({
          message: `Only ${stock} units of ${product.name} are available`,
        });
      }
    }

    // --------------------------------
    // Calculate Effective B2B Prices
    // --------------------------------

    const items = cart.items.map((item) => {
      const product = item.product;
      const quantity = Number(item.quantity);

      let effectivePrice = Number(product.price) || 0;

      // Find applicable bulk pricing tiers
      const applicableTiers = (product.bulkPricing || [])
        .filter(
          (tier) =>
            Number(tier.minQuantity) <= quantity
        )
        .sort(
          (a, b) =>
            Number(b.minQuantity) -
            Number(a.minQuantity)
        );

      // Use the largest applicable bulk pricing tier
      if (applicableTiers.length > 0) {
        effectivePrice = Number(
          applicableTiers[0].price
        );
      }

      // Otherwise use B2B price
      else if (Number(product.b2bPrice) > 0) {
        effectivePrice = Number(product.b2bPrice);
      }

      return {
        product: product._id,
        quantity,
        price: effectivePrice,
      };
    });

    // --------------------------------
    // Calculate Subtotal
    // --------------------------------

    const subtotal = items.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0
    );

    const totalAmount =
      subtotal - Number(discount) + Number(shippingCharge);

    // --------------------------------
    // Create Order
    // --------------------------------

    const order = await Order.create({
      user: userId,

      items,

      shippingAddress,

      subtotal,

      discount: Number(discount),

      shippingCharge: Number(shippingCharge),

      totalAmount,

      paymentMethod,

      paymentStatus:
        paymentMethod === "ONLINE"
          ? "PAID"
          : "PENDING",

      orderStatus: "PLACED",

      trackingHistory: [
        {
          status: "PLACED",
          note: "Order placed successfully",
        },
      ],
    });

    // --------------------------------
    // Decrease Product Stock
    // --------------------------------

    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        {
          $inc: {
            stock: -Number(item.quantity),
          },
        }
      );
    }

    // --------------------------------
    // Clear Cart
    // --------------------------------

    cart.items = [];
    await cart.save();

    // --------------------------------
    // Return Populated Order
    // --------------------------------

    const populatedOrder = await Order.findById(
      order._id
    ).populate("items.product");

    res.status(201).json({
      message: "Order placed successfully",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);

    res.status(500).json({
      message: "Failed to create order",
      error: error.message,
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
};