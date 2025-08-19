const { run } = require("hardhat");

async function main() {
  console.log("🔍 Verifying ChessFi Smart Contracts on Sepolia Etherscan...");

  // Load deployment info
  const fs = require('fs');
  let deploymentInfo;
  
  try {
    deploymentInfo = JSON.parse(fs.readFileSync('deployment-sepolia.json', 'utf8'));
    console.log("✅ Loaded deployment info from deployment-sepolia.json");
  } catch (error) {
    console.error("❌ Could not load deployment info. Please run deploy-sepolia.js first.");
    process.exit(1);
  }

  const { contracts } = deploymentInfo;

  console.log("\n📋 Contracts to verify:");
  console.log("ChessToken:", contracts.ChessToken);
  console.log("ChessGame:", contracts.ChessGame);
  console.log("ChessNFT:", contracts.ChessNFT);
  console.log("ChessTournament:", contracts.ChessTournament);

  // Verify ChessToken
  console.log("\n🎯 Verifying ChessToken...");
  try {
    await run("verify:verify", {
      address: contracts.ChessToken,
      constructorArguments: [],
    });
    console.log("✅ ChessToken verified successfully!");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("ℹ️ ChessToken is already verified");
    } else {
      console.log("⚠️ Failed to verify ChessToken:", error.message);
    }
  }

  // Verify ChessGame
  console.log("\n🎯 Verifying ChessGame...");
  try {
    await run("verify:verify", {
      address: contracts.ChessGame,
      constructorArguments: [],
    });
    console.log("✅ ChessGame verified successfully!");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("ℹ️ ChessGame is already verified");
    } else {
      console.log("⚠️ Failed to verify ChessGame:", error.message);
    }
  }

  // Verify ChessNFT
  console.log("\n🎯 Verifying ChessNFT...");
  try {
    await run("verify:verify", {
      address: contracts.ChessNFT,
      constructorArguments: [],
    });
    console.log("✅ ChessNFT verified successfully!");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("ℹ️ ChessNFT is already verified");
    } else {
      console.log("⚠️ Failed to verify ChessNFT:", error.message);
    }
  }

  // Verify ChessTournament
  console.log("\n🎯 Verifying ChessTournament...");
  try {
    await run("verify:verify", {
      address: contracts.ChessTournament,
      constructorArguments: [contracts.ChessGame],
    });
    console.log("✅ ChessTournament verified successfully!");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("ℹ️ ChessTournament is already verified");
    } else {
      console.log("⚠️ Failed to verify ChessTournament:", error.message);
    }
  }

  console.log("\n🎉 Verification process completed!");
  console.log("\n🔗 Verified contracts on Etherscan:");
  console.log(`ChessToken: https://sepolia.etherscan.io/address/${contracts.ChessToken}#code`);
  console.log(`ChessGame: https://sepolia.etherscan.io/address/${contracts.ChessGame}#code`);
  console.log(`ChessNFT: https://sepolia.etherscan.io/address/${contracts.ChessNFT}#code`);
  console.log(`ChessTournament: https://sepolia.etherscan.io/address/${contracts.ChessTournament}#code`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  }); 