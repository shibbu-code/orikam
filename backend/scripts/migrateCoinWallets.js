const mongoose = require("mongoose");
require("dotenv").config();

const CoinWallet = require("../models/CoinWallet");

async function migrateWallets() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const wallets = await CoinWallet.find({
      legacyBalance: { $exists: false },
    });

    let migrated = 0;

    for (const wallet of wallets) {
      const tiers = wallet.tierBalances || {};

      const tierCoins =
        (tiers.Silver || 0) +
        (tiers.Gold || 0) +
        (tiers.Platinum || 0) +
        (tiers.Diamond || 0);

      wallet.legacyBalance = Math.max(
        0,
        (wallet.balance || 0) - tierCoins
      );

      await wallet.save();
      migrated++;
    }

    console.log(`Migration complete. Wallets migrated: ${migrated}`);
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

migrateWallets();