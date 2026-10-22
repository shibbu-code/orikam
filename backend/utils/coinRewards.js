const User = require("../models/User");
const CoinWallet = require("../models/CoinWallet");
const CoinTransaction = require("../models/CoinTransaction");
const Membership = require("../models/Membership");
const Order = require("../models/Order");

const VALID_TIERS = ["Silver", "Gold", "Platinum", "Diamond"];

const BASE_AMOUNT = 100;
const BASE_COINS = 1;

// Get the user's active membership tier
const getActiveTier = async (user) => {
  if (
    user.membership?.status === "active" &&
    user.membership?.endDate &&
    new Date(user.membership.endDate) > new Date() &&
    user.membership?.plan
  ) {
    const membership = await Membership.findById(
      user.membership.plan
    );

    if (membership?.isActive) {
      const tier = VALID_TIERS.find(
        (name) =>
          name.toLowerCase() === membership.name?.toLowerCase()
      );

      if (tier) {
        return {
          tier,
          multiplier: Number(membership.coinMultiplier) || 1,
        };
      }
    }
  }

  return { tier: "Silver", multiplier: 1 };
};

// Credit coins to the specified membership tier
const creditCoins = async ({
  userId,
  coins,
  tier,
  type,
  orderId = null,
  description,
}) => {
  if (coins <= 0) return;

  const tierField = `tierBalances.${tier}`;

  await CoinWallet.findOneAndUpdate(
    { user: userId },
    {
      $inc: {
        balance: coins,
        totalEarned: coins,
        [tierField]: coins,
      },
      $setOnInsert: {
        legacyBalance: 0,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  await CoinTransaction.create({
    user: userId,
    type,
    coins,
    direction: "credit",
    order: orderId,
    membershipTier: tier,
    description,
    status: "completed",
  });
};

// Referral rewards: called when a new user activates their first membership
const rewardReferral = async (newUserId) => {
  const newUser = await User.findById(newUserId);

  if (!newUser) {
    throw new Error("User not found for referral reward");
  }

  if (!newUser.referredBy || newUser.referralRewardClaimed) {
    return { rewarded: false };
  }

  // Confirm that the new user's membership is active and unexpired
  if (
    newUser.membership?.status !== "active" ||
    !newUser.membership?.plan ||
    !newUser.membership?.endDate ||
    new Date(newUser.membership.endDate) <= new Date()
  ) {
    return { rewarded: false };
  }

  const referrer = await User.findById(newUser.referredBy);

  if (!referrer) {
    return { rewarded: false };
  }

  const customerMembership = await getActiveTier(newUser);
  const referrerMembership = await getActiveTier(referrer);

  // Reward the inviter: 100 coins in their current tier
  await creditCoins({
    userId: referrer._id,
    coins: 100,
    tier: referrerMembership.tier,
    type: "referral",
    description: `Referral reward for inviting ${newUser.name}`,
  });

  // Reward the new user: 50 coins in their first membership tier
  await creditCoins({
    userId: newUser._id,
    coins: 50,
    tier: customerMembership.tier,
    type: "referral",
    description: "Welcome referral reward",
  });

  newUser.referralRewardClaimed = true;
  await newUser.save();

  return {
    rewarded: true,
    inviterCoins: 100,
    newUserCoins: 50,
    inviterTier: referrerMembership.tier,
    newUserTier: customerMembership.tier,
  };
};

// Purchase rewards: called when an order becomes DELIVERED
const rewardPurchase = async (order) => {
  if (!order) {
    throw new Error("Order is required for purchase rewards");
  }

  // Prevent duplicate purchase rewards
  if (order.coinsRewarded) {
    return { rewarded: false, reason: "already_rewarded" };
  }

  const user = await User.findById(order.user);

  if (!user) {
    throw new Error("User not found for coin reward");
  }

  const eligibleAmount = Math.max(
    0,
    Number(order.subtotal || 0) - Number(order.discount || 0)
  );

  const { tier, multiplier } = await getActiveTier(user);

  const coins = Math.floor(
    (eligibleAmount / BASE_AMOUNT) * BASE_COINS * multiplier
  );

  if (coins > 0) {
    await creditCoins({
      userId: user._id,
      coins,
      tier,
      type: "purchase",
      orderId: order._id,
      description: `${tier} coins earned on order ${order._id}`,
    });
  }

  order.coinsEarned = coins;
  order.coinsRewarded = true;
  await order.save();

  // Referral rewards are intentionally NOT handled here.
  // They are awarded by rewardReferral during first membership activation.

  return {
    rewarded: true,
    coinsEarned: coins,
    tier,
  };
};

module.exports = {
  rewardReferral,
  rewardPurchase,
};