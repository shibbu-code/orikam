const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
{
fullName: {
type: String,
required: true,
trim: true,
},
phone: {
type: String,
required: true,
trim: true,
},
addressLine: {
type: String,
required: true,
trim: true,
},
landmark: {
type: String,
trim: true,
default: "",
},
city: {
type: String,
required: true,
trim: true,
},
state: {
type: String,
required: true,
trim: true,
},
pincode: {
type: String,
required: true,
trim: true,
},
addressType: {
type: String,
enum: ["Home", "Office", "Other"],
default: "Home",
},
isDefault: {
type: Boolean,
default: false,
},
},
{
timestamps: true,
}
);

const userSchema = new mongoose.Schema(
{
name: {
type: String,
required: true,
trim: true,
},


email: {
  type: String,
  required: true,
  unique: true,
  lowercase: true,
  trim: true,
},

password: {
  type: String,
  required: true,
},

phone: {
  type: String,
  trim: true,
},

role: {
  type: String,
  enum: ["customer", "admin"],
  default: "customer",
},

recentlyViewed: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
],

addresses: {
  type: [addressSchema],
  default: [],
},

// Membership
membership: {
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Membership",
    default: null,
  },

  status: {
    type: String,
    enum: ["inactive", "active", "expired", "cancelled"],
    default: "inactive",
  },

  startDate: {
    type: Date,
    default: null,
  },

  endDate: {
    type: Date,
    default: null,
  },

  autoRenew: {
    type: Boolean,
    default: false,
  },
},
hasActivatedMembership: {
  type: Boolean,
  default: false,
},

// Referral
referralCode: {
  type: String,
  unique: true,
  sparse: true,
  uppercase: true,
  trim: true,
},

referredBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  default: null,
},

referralRewardClaimed: {
  type: Boolean,
  default: false,
},


},
{
timestamps: true,
}
);

module.exports = mongoose.model("User", userSchema);
