

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Coins, Copy, Share2, Gift, Users, ArrowLeft } from "lucide-react";
import "./Membership.css";
import Footer from "../../components/home/Footer"
import Navbar from "../../components/commen/Navbar";
const TIER_ORDER = ["Silver", "Gold", "Platinum", "Diamond"];

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });


const Membership = () => {
  const navigate = useNavigate();
const userId = localStorage.getItem("userId");

const [plans, setPlans] = useState([]);
const [membership, setMembership] = useState(null);
const [wallet, setWallet] = useState(null);
const [referralCode, setReferralCode] = useState("");

const [loading, setLoading] = useState(true);
const [purchasingPlan, setPurchasingPlan] = useState(null);
const [error, setError] = useState("");
const [success, setSuccess] = useState("");
const [transactions, setTransactions] = useState([]);
const [copying, setCopying] = useState(false);

// Load membership, wallet, plans, transactions, and referral code
const loadMembershipData = async () => {
try {
setLoading(true);
setError("");


  const plansResponse = await api.get("/api/membership/plans");

  const plansData =
    plansResponse.data.plans ||
    plansResponse.data.data ||
    [];

  setPlans(
    (Array.isArray(plansData) ? plansData : []).sort(
      (a, b) =>
        TIER_ORDER.indexOf(a.name) -
        TIER_ORDER.indexOf(b.name)
    )
  );

  if (!userId) {
    setMembership(null);
    setWallet(null);
    setTransactions([]);
    setReferralCode("");
    return;
  }

  const [
    membershipResponse,
    walletResponse,
    historyResponse,
    userResponse,
  ] = await Promise.all([
    api.get(`/api/membership/my/${userId}`),
    api.get(`/api/membership/wallet/${userId}`),
    api.get(`/api/membership/history/${userId}`),
    api.get(`/api/users/${userId}`),
  ]);

  const membershipData =
    membershipResponse.data.membership ||
    membershipResponse.data.data?.membership ||
    membershipResponse.data.data ||
    null;

  const walletData =
    walletResponse.data.wallet ||
    walletResponse.data.data?.wallet ||
    walletResponse.data.data ||
    null;

  const historyData =
    historyResponse.data.transactions ||
    historyResponse.data.history ||
    historyResponse.data.data?.transactions ||
    historyResponse.data.data ||
    [];

  const userData =
    userResponse.data.user ||
    userResponse.data.data?.user ||
    userResponse.data.data ||
    null;

  setMembership(membershipData);
  setWallet(walletData);

  setTransactions(
    Array.isArray(historyData) ? historyData : []
  );

  setReferralCode(userData?.referralCode || "");
} catch (err) {
  setError(
    err.response?.data?.message ||
      "Unable to load membership details. Please try again."
  );
} finally {
  setLoading(false);
}


};

useEffect(() => {
loadMembershipData();
}, [userId]);

// Copy referral code


const handleCopyCode = async () => {
  if (!referralCode || copying) return;

  setCopying(true);

  try {
    await navigator.clipboard.writeText(referralCode);

    setSuccess("Referral code copied successfully!");

    setTimeout(() => {
      setSuccess("");
    }, 2500);
  } catch (error) {
    console.error("Failed to copy referral code:", error);
    setError("Unable to copy referral code.");
  } finally {
    setCopying(false);
  }
};





// Generate registration invitation link
const getReferralLink = () => {
return `${window.location.origin}/register?ref=${encodeURIComponent(
      referralCode
    )}`;
};

// Share referral invitation
const handleShareInvite = async () => {
if (!referralCode) {
setError("Your referral code is not available.");
return;
}

const referralLink = getReferralLink();

const shareData = {
  title: "Join ORIKAM",
  text:
    "Join ORIKAM and explore membership benefits! Use my referral link to register.",
  url: referralLink,
};

try {
  if (navigator.share) {
    await navigator.share(shareData);
  } else {
    await navigator.clipboard.writeText(referralLink);
    setSuccess("Invitation link copied! Share it with your friends.");
  }
} catch (err) {
  if (err.name !== "AbortError") {
    try {
      await navigator.clipboard.writeText(referralLink);
      setSuccess("Invitation link copied! Share it with your friends.");
    } catch {
      setError("Unable to share or copy the invitation link.");
    }
  }
}


};

// Return membership only if it is active and unexpired
const getActiveMembership = () => {
if (
!membership ||
membership.status !== "active" ||
!membership.endDate ||
new Date(membership.endDate) <= new Date()
) {
return null;
}


return membership;


};

const activeMembership = getActiveMembership();

// Get the current membership tier
const getCurrentTierName = () => {
const plan = activeMembership?.plan;


const tierName =
  (typeof plan === "object" ? plan?.name : null) ||
  plans.find(
    (item) =>
      String(item._id) ===
      String(typeof plan === "object" ? plan?._id : plan)
  )?.name;

return (
  TIER_ORDER.find(
    (tier) =>
      tier.toLowerCase() === tierName?.toLowerCase()
  ) || "Free"
);


};

const currentTierName = getCurrentTierName();

// Display only coins belonging to the current membership tier
const getCurrentTierCoins = () => {
const balances = wallet?.tierBalances;


const tierBalance = balances?.get
  ? balances.get(currentTierName)
  : balances?.[currentTierName];

return Math.max(0, Number(tierBalance) || 0);


};

const currentTierCoins = getCurrentTierCoins();

// Resolve current membership plan ID
const getCurrentPlanId = () => {
const plan = activeMembership?.plan;


if (!plan) return null;

return typeof plan === "object" ? plan._id : plan;


};

const currentPlanId = getCurrentPlanId();

// Purchase or upgrade membership

const handlePurchase = async (plan) => {
  if (!userId) {
    setError("Please log in to purchase a membership.");
    return;
  }

  if (purchasingPlan) return;

  setError("");
  setSuccess("");

  const currentPlan = plans.find(
    (item) => String(item._id) === String(currentPlanId)
  );

  if (
    activeMembership &&
    currentPlan &&
    TIER_ORDER.indexOf(plan.name) <=
      TIER_ORDER.indexOf(currentPlan.name)
  ) {
    setError("You can only upgrade to a higher membership tier.");
    return;
  }

  try {
    setPurchasingPlan(plan._id);

    // Load Razorpay Checkout.
    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded) {
      throw new Error("Unable to load Razorpay Checkout. Please try again.");
    }

    // Ask the backend to create a payment order.
    const response = await api.post(
      "/api/membership/create-payment",
      {
        userId,
        planId: plan._id,
      }
    );

    const paymentData = response.data;

    if (
      !paymentData.success ||
      !paymentData.razorpayOrderId ||
      !paymentData.key
    ) {
      throw new Error(
        paymentData.message || "Unable to create payment order."
      );
    }

    // Open Razorpay Checkout.
    const options = {
      key: paymentData.key,
      amount: paymentData.amount,
      currency: paymentData.currency,
      name: "ORIKAM",
      description: `${plan.name} Membership - 30 Days`,
      order_id: paymentData.razorpayOrderId,

      prefill: {
        name: paymentData.customer?.name || "",
        email: paymentData.customer?.email || "",
        contact: paymentData.customer?.contact || "",
      },

      theme: {
        color: "#d10000",
      },

      handler: async (razorpayResponse) => {
        try {
          setError("");

          // Verify payment with your backend.
          const verificationResponse = await api.post(
            "/api/membership/verify-payment",
            {
              userId,
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_signature: razorpayResponse.razorpay_signature,
            }
          );

          if (!verificationResponse.data.success) {
            throw new Error(
              verificationResponse.data.message ||
                "Payment verification failed."
            );
          }

          const referralReward =
            verificationResponse.data.referralReward;

          let successMessage =
            `${plan.name} membership activated successfully!`;

          if (referralReward?.rewarded) {
            successMessage +=
              ` You received ${referralReward.newUserCoins} referral coins!`;
          }

          setSuccess(successMessage);

          // Refresh membership, wallet, coins, and transaction history.
          await loadMembershipData();
        } catch (verificationError) {
          console.error(
            "Membership payment verification error:",
            verificationError
          );

          setError(
            verificationError.response?.data?.message ||
              verificationError.message ||
              "Payment may have succeeded, but verification failed. Please refresh your membership details before trying again."
          );
        } finally {
          setPurchasingPlan(null);
        }
      },

      modal: {
        ondismiss: () => {
          setPurchasingPlan(null);
        },
      },
    };

    const checkout = new window.Razorpay(options);

    checkout.on("payment.failed", (event) => {
      console.error("Razorpay payment failed:", event.error);

      setError(
        event.error?.description ||
          "Payment failed. Please try again."
      );

      setPurchasingPlan(null);
    });

    checkout.open();
  } catch (err) {
    console.error("Membership checkout error:", err);

    setError(
      err.response?.data?.message ||
        err.message ||
        "Unable to start membership payment."
    );

    setPurchasingPlan(null);
  }
};



if (loading) {
return ( <div className="membership-loading"> <div className="membership-spinner" /> <p>Loading membership plans...</p> </div>
);
}

return ( <main className="membership-page">
  <Navbar />
  <button
  className="membership-back-btn"
  onClick={() => navigate(-1)}
  aria-label="Go back"
>
  <ArrowLeft size={18} />
  Back
</button>
{/* Hero */} <section className="membership-hero"> <span className="membership-eyebrow">
  
ORIKAM REWARDS </span>

    <h1>
      More benefits.
      <br />
      <span>Every time you shop.</span>
    </h1>

    <p>
      Unlock exclusive discounts and earn more coins
      with every eligible delivered order.
    </p>

    <div className="membership-hero-points">
      <span>✓ Exclusive discounts</span>
      <span>✓ Bonus coins</span>
      <span>✓ 30-day membership</span>
    </div>
  </section>

  {/* Alerts */}
  {error && (
    <div className="membership-alert membership-alert-error">
      <span>{error}</span>
      <button onClick={() => setError("")}>×</button>
    </div>
  )}

  {success && (
    <div className="membership-alert membership-alert-success">
      <span>{success}</span>
      <button onClick={() => setSuccess("")}>×</button>
    </div>
  )}

  {/* Membership account and wallet */}
  <section className="membership-account">
    <div className="membership-account-info">
      <span className="membership-account-label">
        YOUR MEMBERSHIP
      </span>

      <h2>
        {activeMembership
          ? typeof activeMembership.plan === "object"
            ? activeMembership.plan.name
            : plans.find(
                (plan) =>
                  String(plan._id) === String(currentPlanId)
              )?.name || "Active Membership"
          : "Free Account"}
      </h2>

      <p>
        {activeMembership
          ? `Valid until ${new Date(
              activeMembership.endDate
            ).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}`
          : "Choose a membership to unlock additional rewards."}
      </p>
    </div>

    <div className="membership-wallet">
      <div
        className={`membership-coin-icon tier-${currentTierName.toLowerCase()}`}
      >
        <Coins size={28} strokeWidth={2} />
      </div>

      <div>
        <span>AVAILABLE COINS</span>
        <strong>
          {currentTierCoins.toLocaleString("en-IN")}
        </strong>
        <small>{currentTierName} tier</small>
      </div>
    </div>
  </section>

  {/* Refer and Earn */}
  <section className="referral-section">
    <div className="referral-header">
      <div className="referral-heading-icon">
        <Gift size={25} />
      </div>

      <div>
        <span className="membership-eyebrow">
          REFER & EARN
        </span>
        <h2>Share ORIKAM. Earn rewards.</h2>
        <p>
          Invite friends to ORIKAM and earn bonus coins
          when they activate their first membership.
        </p>
      </div>
    </div>

    <div className="referral-rewards">
      <div className="referral-reward-card">
        <Users size={22} />
        <strong>100 Coins</strong>
        <span>For you, when your friend qualifies</span>
      </div>

      <div className="referral-reward-card">
        <Coins size={22} />
        <strong>50 Coins</strong>
        <span>For your friend after qualifying</span>
      </div>
    </div>

    <div className="referral-code-box">
      <div className="referral-code-info">
        <span>Your Referral Code</span>

        <strong>
          {referralCode || "Code unavailable"}
        </strong>

        <small>
          Your friend must register using your referral link
          before activating their first membership.
        </small>
      </div>

      <div className="referral-actions">
       
<button
  type="button"
  onClick={handleCopyCode}
  disabled={!referralCode || copying}
  className="referral-copy-btn"
>
  {copying ? (
    "Copying..."
  ) : success === "Referral code copied successfully!" ? (
    "Copied!"
  ) : (
    <>
      <Copy size={17} />
      Copy Code
    </>
  )}
</button>



        <button
          type="button"
          className="referral-share-button"
          onClick={handleShareInvite}
          disabled={!referralCode}
        >
          <Share2 size={17} />
          Share Invite
        </button>
      </div>
    </div>

    <p className="referral-footnote">
      Referral rewards are issued only when the invited
      user activates their first membership. Upgrades
      do not qualify for another referral reward.
    </p>
  </section>

  {/* Membership plans */}
  <section className="membership-plans-section">
    <div className="membership-section-heading">
      <div>
        <span className="membership-eyebrow">
          MEMBERSHIP PLANS
        </span>
        <h2>Choose your benefits</h2>
      </div>

      <p>All plans are valid for 30 days.</p>
    </div>

    <div className="membership-plans-grid">
      {plans.map((plan) => {
        const isCurrent =
          activeMembership &&
          String(plan._id) === String(currentPlanId);

        const currentPlan = plans.find(
          (item) =>
            String(item._id) === String(currentPlanId)
        );

        const isLowerOrEqualTier =
          activeMembership &&
          currentPlan &&
          TIER_ORDER.indexOf(plan.name) <=
            TIER_ORDER.indexOf(currentPlan.name);

        const isPopular = plan.name === "Gold";

        return (
          <article
            className={`membership-card ${
              isPopular ? "membership-card-popular" : ""
            }`}
            key={plan._id}
          >
            {isPopular && (
              <div className="membership-popular-badge">
                POPULAR
              </div>
            )}

            <div className="membership-card-top">
              <span
                className={`membership-tier-icon tier-${plan.name.toLowerCase()}`}
              >
                {plan.name.charAt(0)}
              </span>

              <h3>{plan.name}</h3>

              <p className="membership-card-description">
                {plan.name === "Silver" &&
                  "A simple start to earning rewards."}

                {plan.name === "Gold" &&
                  "More savings on your regular purchases."}

                {plan.name === "Platinum" &&
                  "Higher rewards for frequent shoppers."}

                {plan.name === "Diamond" &&
                  "Maximum rewards and exclusive savings."}
              </p>
            </div>

            <div className="membership-price">
              <strong>
                ₹
                {Number(plan.monthlyPrice).toLocaleString(
                  "en-IN"
                )}
              </strong>
              <span>/ 30 days</span>
            </div>

            <div className="membership-benefits">
              <div>
                <span>Membership discount</span>
                <strong>
                  {plan.discountPercentage}%
                </strong>
              </div>

              <div>
                <span>Coin multiplier</span>
                <strong>{plan.coinMultiplier}×</strong>
              </div>

              <div>
                <span>Validity</span>
                <strong>30 days</strong>
              </div>
            </div>

            <button
              className={`membership-plan-button ${
                isPopular
                  ? "membership-plan-button-primary"
                  : ""
              }`}
              disabled={
                Boolean(purchasingPlan) ||
                Boolean(isCurrent) ||
                Boolean(isLowerOrEqualTier)
              }
              onClick={() => handlePurchase(plan)}
            >
              {purchasingPlan === plan._id
                ? "Processing..."
                : isCurrent
                ? "Current Plan"
                : isLowerOrEqualTier
                ? "Already Included"
                : activeMembership
                ? "Upgrade Plan"
                : "Choose Plan"}
            </button>
          </article>
        );
      })}
    </div>
  </section>

  {/* How it works */}
  <section className="membership-how-it-works">
    <div>
      <span className="membership-eyebrow">
        HOW IT WORKS
      </span>
      <h2>Rewards made simple</h2>
    </div>

    <div className="membership-steps">
      <article>
        <span>01</span>
        <h3>Choose a plan</h3>
        <p>
          Select a membership that fits your shopping needs.
        </p>
      </article>

      <article>
        <span>02</span>
        <h3>Shop and save</h3>
        <p>
          Enjoy your membership discount on eligible orders.
        </p>
      </article>

      <article>
        <span>03</span>
        <h3>Earn more coins</h3>
        <p>
          Earn coins based on your eligible order amount
          and membership multiplier.
        </p>
      </article>
    </div>
  </section>

  {/* Coin information */}
  <section className="membership-note">
    <strong>A quick note about coins</strong>
    <p>
      Coins are credited after an order is delivered.
      Currently, 10 coins equal ₹1 in redemption value,
      subject to the order redemption limit and your
      available wallet balance.
    </p>
  </section>

  {/* Transaction history */}
  <section className="coin-history-section">
    <div className="coin-history-heading">
      <div>
        <span className="membership-eyebrow">
          YOUR ACTIVITY
        </span>
        <h2>Coin Transaction History</h2>
        <p>Track the coins you earn and redeem.</p>
      </div>

      <div className="coin-history-balance">
        <span>Current Tier Balance</span>
        <strong>
          {currentTierCoins.toLocaleString("en-IN")} coins
        </strong>
      </div>
    </div>

    {transactions.length === 0 ? (
      <div className="coin-history-empty">
        <span className="coin-history-empty-icon">
          <Coins size={32} />
        </span>

        <h3>No transactions yet</h3>

        <p>
          Your coin activity will appear here when you
          earn or redeem coins.
        </p>
      </div>
    ) : (
      <div className="coin-history-list">
        {transactions.map((transaction) => {
          const isCredit =
            transaction.direction === "credit";

          return (
            <article
              className="coin-transaction"
              key={transaction._id}
            >
              <div
                className={`coin-transaction-icon ${
                  isCredit ? "credit" : "debit"
                }`}
              >
                {isCredit ? "+" : "−"}
              </div>

              <div className="coin-transaction-details">
                <h3>
                  {transaction.description ||
                    transaction.type?.charAt(0).toUpperCase() +
                      transaction.type?.slice(1) ||
                    "Coin transaction"}
                </h3>

                <p>
                  {new Date(
                    transaction.createdAt
                  ).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>

                <span
                  className={`coin-transaction-status ${transaction.status}`}
                >
                  {transaction.status}
                </span>

                {transaction.membershipTier && (
                  <small>
                    {transaction.membershipTier} tier
                  </small>
                )}
              </div>

              <strong
                className={
                  isCredit ? "coin-credit" : "coin-debit"
                }
              >
                {isCredit ? "+" : "−"}
                {transaction.coins} coins
              </strong>
            </article>
          );
        })}
      </div>
    )}
  </section>
  <Footer/>
</main>


);
};

export default Membership;
