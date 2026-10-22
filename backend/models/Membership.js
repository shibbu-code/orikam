const mongoose = require("mongoose");

const membershipSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ["Silver", "Gold", "Platinum", "Diamond"],
    },

    monthlyPrice: {
      type: Number,
      required: true,
    },

    coinMultiplier: {
      type: Number,
      required: true,
    },

    discountPercentage: {
      type: Number,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Membership", membershipSchema);