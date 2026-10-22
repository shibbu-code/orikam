
const mongoose = require("mongoose");

const coinTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "purchase",
        "referral",
        "redemption",
        "refund",
        "adjustment",
      ],
      required: true,
    },

    coins: {
      type: Number,
      required: true,
      min: 1,
    },

    direction: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },

    // Membership tier associated with this transaction.
    membershipTier: {
  type: String,
  enum: ["Legacy", "Silver", "Gold", "Platinum", "Diamond"],
  default: "Legacy",
},

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    description: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "completed", "reversed"],
      default: "completed",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "CoinTransaction",
  coinTransactionSchema
);
