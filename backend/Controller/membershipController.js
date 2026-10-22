const mongoose = require("mongoose");
const Membership = require("../models/Membership");
const User = require("../models/User");
const CoinWallet = require("../models/CoinWallet");
const CoinTransaction = require("../models/CoinTransaction");
const {rewardReferral} = require("../utils/coinRewards");

// Membership tier ranking
const getTierRank = (multiplier) => {
  const ranks = {
    1: 1,     // Silver
    1.25: 2,  // Gold
    1.5: 3,   // Platinum
    2: 4,     // Diamond
  };

  return ranks[Number(multiplier)] || 0;
};

// Get all membership plans
exports.getMembershipPlans = async (req, res) => {
  try {
    const plans = await Membership.find({ isActive: true }).sort({
      coinMultiplier: 1,
    });

    return res.status(200).json({
      success: true,
      plans,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get user's current membership
exports.getMyMembership = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(userId).populate(
      "membership.plan"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check whether the membership has expired
    if (
      user.membership.status === "active" &&
      user.membership.endDate &&
      new Date(user.membership.endDate) <= new Date()
    ) {
      user.membership.status = "expired";
      await user.save();
    }

    return res.status(200).json({
      success: true,
      membership: user.membership,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Purchase or upgrade membership

exports.purchaseMembership = async (req, res) => {
  try {
    const { userId, planId } = req.body;

    if (!userId || !planId) {
      return res.status(400).json({
        success: false,
        message: "User ID and membership plan ID are required",
      });
    }

    if (
      !mongoose.isValidObjectId(userId) ||
      !mongoose.isValidObjectId(planId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID or membership plan ID",
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

    // Check whether the user has ever activated a membership.
    // This must happen before changing user.membership.
    const isFirstMembership = !user.hasActivatedMembership;
    if (isFirstMembership) {
  user.hasActivatedMembership = true;
  await user.save();
}
    // Expire the existing membership if necessary
    if (
      user.membership?.status === "active" &&
      user.membership?.endDate &&
      new Date(user.membership.endDate) <= new Date()
    ) {
      user.membership.status = "expired";
    }

    const currentPlanId = user.membership?.plan?._id
      ? user.membership.plan._id.toString()
      : user.membership?.plan?.toString();

    const isCurrentlyActive =
      user.membership?.status === "active" &&
      user.membership?.endDate &&
      new Date(user.membership.endDate) > new Date();

    // Prevent purchasing the same active plan again
    if (
      isCurrentlyActive &&
      currentPlanId === plan._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You already have this active membership. Renewal is not available through this endpoint.",
      });
    }

    // Only allow upgrades while membership is active
    if (isCurrentlyActive) {
      const currentPlan = await Membership.findById(currentPlanId);

      if (!currentPlan) {
        return res.status(400).json({
          success: false,
          message: "Your current membership plan could not be found",
        });
      }

      const currentRank = getTierRank(currentPlan.coinMultiplier);
      const newRank = getTierRank(plan.coinMultiplier);

      if (newRank <= currentRank) {
        return res.status(400).json({
          success: false,
          message:
            "You can only upgrade to a higher membership tier",
        });
      }
    }

    // Demo activation: no payment gateway connected
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

    await user.save();

    // Reset coin balances after membership purchase or upgrade
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

    // Award referral rewards only on first membership activation
    let referralReward = null;

    if (isFirstMembership && user.referredBy) {
      const { rewardReferral } = require("../utils/coinRewards");

      referralReward = await rewardReferral(user._id);
    }

    const updatedUser = await User.findById(userId).populate(
      "membership.plan"
    );

    return res.status(200).json({
      success: true,
      message: isCurrentlyActive
        ? "Membership upgraded successfully"
        : "Membership purchased successfully",
      membership: updatedUser.membership,
      referralReward,
    });
  } catch (error) {
    console.error("Membership purchase error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// Get or create user's coin wallet
exports.getMyWallet = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const wallet = await CoinWallet.findOneAndUpdate(
      { user: userId },
      {
        $setOnInsert: {
          balance: 0,
          totalEarned: 0,
          totalRedeemed: 0,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      wallet,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get coin transaction history
exports.getCoinHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const transactions = await CoinTransaction.find({
      user: userId,
    })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      transactions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};