
const mongoose = require("mongoose");

const coinWalletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Total available coins across all balances
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Existing coins earned before tier-specific tracking
    legacyBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Coins earned under each membership tier
    tierBalances: {
      Silver: { type: Number, default: 0, min: 0 },
      Gold: { type: Number, default: 0, min: 0 },
      Platinum: { type: Number, default: 0, min: 0 },
      Diamond: { type: Number, default: 0, min: 0 },
    },

    totalEarned: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalRedeemed: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CoinWallet", coinWalletSchema);

