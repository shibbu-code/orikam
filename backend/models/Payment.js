const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
{
user: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
required: true,
index: true,
},


purpose: {
  type: String,
  enum: ["PRODUCT_ORDER", "MEMBERSHIP"],
  required: true,
},

// Used for product orders
order: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Order",
  default: null,
},
checkoutData: {
  type: mongoose.Schema.Types.Mixed,
  default: null,
},

// Used for membership purchases/upgrades
membershipPlan: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Membership",
  default: null,
},

amount: {
  type: Number,
  required: true,
  min: 0,
},

currency: {
  type: String,
  default: "INR",
},

razorpayOrderId: {
  type: String,
  required: true,
  unique: true,
},

razorpayPaymentId: {
  type: String,
  default: null,
},

status: {
  type: String,
  enum: ["CREATED", "PROCESSING", "PAID", "FAILED"],
  default: "CREATED",
},

processedAt: {
  type: Date,
  default: null,
},


},
{ timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
