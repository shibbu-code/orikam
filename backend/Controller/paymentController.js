
const Razorpay = require("razorpay");
const mongoose = require("mongoose");
const crypto = require("crypto");

const Payment = require("../models/Payment");
const Membership = require("../models/Membership");
const User = require("../models/User");
const CoinWallet = require("../models/CoinWallet");
const { rewardReferral } = require("../utils/coinRewards");
require("dotenv").config();
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Prevent two requests from processing the same payment simultaneously.
const processingPayments = new Set();

const getTierRank = (multiplier) => {
  const ranks = {
    1: 1,
    1.25: 2,
    1.5: 3,
    2: 4,
  };

  return ranks[Number(multiplier)] || 0;
};

// Create a Razorpay order for membership purchase or upgrade.
exports.createMembershipPayment = async (req, res) => {
  try {
    const { userId, planId } = req.body;

    if (
      !userId ||
      !planId ||
      !mongoose.isValidObjectId(userId) ||
      !mongoose.isValidObjectId(planId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid user ID and membership plan ID are required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const plan = await Membership.findOne({
      _id: planId,
      isActive: true,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Membership plan not found or inactive",
      });
    }

    const now = new Date();

    const hasActiveMembership =
      user.membership?.status === "active" &&
      user.membership?.endDate &&
      new Date(user.membership.endDate) > now;

    if (hasActiveMembership) {
      const currentPlanId = user.membership.plan?._id
        ? user.membership.plan._id.toString()
        : user.membership.plan?.toString();

      if (currentPlanId === plan._id.toString()) {
        return res.status(400).json({
          success: false,
          message: "You already have this active membership",
        });
      }

      const currentPlan = await Membership.findById(currentPlanId);

      if (!currentPlan) {
        return res.status(400).json({
          success: false,
          message: "Current membership plan could not be found",
        });
      }

      if (
        getTierRank(plan.coinMultiplier) <=
        getTierRank(currentPlan.coinMultiplier)
      ) {
        return res.status(400).json({
          success: false,
          message: "You can only upgrade to a higher membership tier",
        });
      }
    }

    const amountInRupees = Number(plan.monthlyPrice);

    if (!Number.isFinite(amountInRupees) || amountInRupees <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid membership plan price",
      });
    }

    if (
      !process.env.RAZORPAY_KEY_ID ||
      !process.env.RAZORPAY_KEY_SECRET
    ) {
      return res.status(500).json({
        success: false,
        message: "Razorpay credentials are not configured",
      });
    }

    const amountInPaise = Math.round(amountInRupees * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `mem_${new mongoose.Types.ObjectId().toString()}`,
      notes: {
        userId: user._id.toString(),
        planId: plan._id.toString(),
        purpose: "MEMBERSHIP",
      },
    });

    await Payment.create({
      user: user._id,
      purpose: "MEMBERSHIP",
      membershipPlan: plan._id,
      amount: amountInRupees,
      currency: "INR",
      razorpayOrderId: razorpayOrder.id,
      status: "CREATED",
    });

    return res.status(201).json({
      success: true,
      message: "Payment order created",
      key: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      plan: {
        _id: plan._id,
        name: plan.name,
        price: amountInRupees,
      },
      customer: {
        name: user.name,
        email: user.email,
        contact: user.phone || "",
      },
    });
  } catch (error) {
    console.error("Create membership payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create membership payment",
    });
  }
};

// Verify payment and activate membership only after successful verification.
exports.verifyMembershipPayment = async (req, res) => {
  let paymentRecordId = null;

  try {
    const {
      userId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !userId ||
      !mongoose.isValidObjectId(userId) ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid payment verification details are required",
      });
    }

    const payment = await Payment.findOne({
      user: userId,
      razorpayOrderId: razorpay_order_id,
      purpose: "MEMBERSHIP",
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Membership payment record not found",
      });
    }

    paymentRecordId = payment._id.toString();

    // Idempotent response for a payment already processed successfully.
    if (payment.status === "PAID") {
      if (payment.razorpayPaymentId !== razorpay_payment_id) {
        return res.status(409).json({
          success: false,
          message: "This order has already been paid with another payment",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Membership payment was already processed",
      });
    }

    if (payment.status !== "CREATED") {
      return res.status(400).json({
        success: false,
        message: "This payment cannot be processed",
      });
    }

    if (processingPayments.has(paymentRecordId)) {
      return res.status(409).json({
        success: false,
        message: "Payment verification is already in progress",
      });
    }

    processingPayments.add(paymentRecordId);

    // Verify the signature using the server-side secret.
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const receivedBuffer = Buffer.from(razorpay_signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    const validSignature =
      receivedBuffer.length === expectedBuffer.length &&
      receivedBuffer.length > 0 &&
      crypto.timingSafeEqual(receivedBuffer, expectedBuffer);

    if (!validSignature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Independently confirm payment status and details with Razorpay.
    const razorpayPayment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    if (
      razorpayPayment.order_id !== razorpay_order_id ||
      razorpayPayment.status !== "captured" ||
      razorpayPayment.currency !== payment.currency ||
      razorpayPayment.amount !== Math.round(payment.amount * 100)
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment is not captured or payment details do not match",
      });
    }

    const user = await User.findById(userId);
    const plan = await Membership.findById(payment.membershipPlan);

    if (!user || !plan || !plan.isActive) {
      return res.status(400).json({
        success: false,
        message: "User or membership plan is no longer available",
      });
    }

    // Recheck upgrade eligibility because membership may have changed
    // after the payment order was created.
    const now = new Date();

    const currentlyActive =
      user.membership?.status === "active" &&
      user.membership?.endDate &&
      new Date(user.membership.endDate) > now;

    if (currentlyActive) {
      const currentPlanId = user.membership.plan?._id
        ? user.membership.plan._id.toString()
        : user.membership.plan?.toString();

      if (currentPlanId === plan._id.toString()) {
        return res.status(409).json({
          success: false,
          message: "This membership is already active",
        });
      }

      const currentPlan = await Membership.findById(currentPlanId);

      if (
        !currentPlan ||
        getTierRank(plan.coinMultiplier) <=
          getTierRank(currentPlan.coinMultiplier)
      ) {
        return res.status(409).json({
          success: false,
          message: "Membership upgrade is no longer eligible",
        });
      }
    }

    // Save the payment claim first to prevent another request from
    // processing the same payment concurrently.
    const claimedPayment = await Payment.findOneAndUpdate(
      {
        _id: payment._id,
        status: "CREATED",
        razorpayPaymentId: null,
      },
      {
        $set: {
          status: "PAID",
          razorpayPaymentId: razorpay_payment_id,
          processedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!claimedPayment) {
      const latestPayment = await Payment.findById(payment._id);

      if (
        latestPayment?.status === "PAID" &&
        latestPayment.razorpayPaymentId === razorpay_payment_id
      ) {
        return res.status(200).json({
          success: true,
          message: "Membership payment was already processed",
        });
      }

      return res.status(409).json({
        success: false,
        message: "Payment has already been processed or claimed",
      });
    }

    // Capture first-activation state before changing the membership.
    const isFirstMembership = !user.hasActivatedMembership;

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30);

    user.membership = {
      plan: plan._id,
      status: "active",
      startDate,
      endDate,
      autoRenew: false,
    };

    user.hasActivatedMembership = true;

    await user.save();

    // Preserve the existing wallet-reset behavior.
    await CoinWallet.findOneAndUpdate(
      { user: userId },
      {
        $set: {
          balance: 0,
          legacyBalance: 0,
          "tierBalances.Silver": 0,
          "tierBalances.Gold": 0,
          "tierBalances.Platinum": 0,
          "tierBalances.Diamond": 0,
        },
      },
      { upsert: true, new: true }
    );

    // Award referral rewards only on the user's first membership.
    let referralReward = null;

    if (isFirstMembership && user.referredBy) {
      try {
        referralReward = await rewardReferral(user._id);
      } catch (referralError) {
        // Do not undo a verified purchase because referral processing failed.
        console.error("Membership referral reward error:", referralError);
      }
    }

    const updatedUser = await User.findById(userId).populate(
      "membership.plan"
    );

    return res.status(200).json({
      success: true,
      message: currentlyActive
        ? "Membership upgraded successfully"
        : "Membership purchased successfully",
      membership: updatedUser.membership,
      referralReward,
    });
  } catch (error) {
    console.error("Verify membership payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Payment was verified but membership processing may need recovery. Contact support if your membership is not active.",
    });
  } finally {
    if (paymentRecordId) {
      processingPayments.delete(paymentRecordId);
    }
  }
};

