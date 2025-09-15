const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing Deployed ChessFi Contracts on Hardhat...");
  
  // Load deployment info
  const fs = require('fs');
  const deploymentInfo = JSON.parse(fs.readFileSync('deployment-hardhat.json', 'utf8'));
  
  console.log("✅ Loaded deployment info from deployment-hardhat.json");
  console.log("🌐 Network:", deploymentInfo.network, `(Chain ID: ${deploymentInfo.chainId})`);
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("🔑 Testing with account:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
  
  // Test ChessToken
  console.log("\n🎯 Testing ChessToken...");
  try {
    const ChessToken = await ethers.getContractAt("ChessToken", deploymentInfo.contracts.ChessToken);
    const name = await ChessToken.name();
    const symbol = await ChessToken.symbol();
    const decimals = await ChessToken.decimals();
    const totalSupply = await ChessToken.totalSupply();
    
    console.log("✅ ChessToken name:", name);
    console.log("✅ ChessToken symbol:", symbol);
    console.log("✅ ChessToken decimals:", decimals);
    console.log("✅ ChessToken total supply:", ethers.formatEther(totalSupply));
  } catch (error) {
    console.log("❌ ChessToken test failed:", error.message);
  }
  
  // Test ChessGame
  console.log("\n🎯 Testing ChessGame...");
  try {
    const ChessGame = await ethers.getContractAt("ChessGame", deploymentInfo.contracts.ChessGame);
    const minStake = await ChessGame.minStake();
    const maxStake = await ChessGame.maxStake();
    const platformFee = await ChessGame.platformFee();
    
    console.log("✅ ChessGame min stake:", ethers.formatEther(minStake), "ETH");
    console.log("✅ ChessGame max stake:", ethers.formatEther(maxStake), "ETH");
    console.log("✅ ChessGame platform fee:", platformFee.toString(), "basis points");
  } catch (error) {
    console.log("❌ ChessGame test failed:", error.message);
  }
  
  // Test ChessNFT
  console.log("\n🎯 Testing ChessNFT...");
  try {
    const ChessNFT = await ethers.getContractAt("ChessNFT", deploymentInfo.contracts.ChessNFT);
    const name = await ChessNFT.name();
    const symbol = await ChessNFT.symbol();
    const totalSupply = await ChessNFT.totalSupply();
    
    console.log("✅ ChessNFT name:", name);
    console.log("✅ ChessNFT symbol:", symbol);
    console.log("✅ ChessNFT total supply:", totalSupply.toString());
  } catch (error) {
    console.log("❌ ChessNFT test failed:", error.message);
  }
  
  // Test ChessTournament
  console.log("\n🎯 Testing ChessTournament...");
  try {
    const ChessTournament = await ethers.getContractAt("ChessTournament", deploymentInfo.contracts.ChessTournament);
    const minEntryFee = await ChessTournament.minEntryFee();
    const maxEntryFee = await ChessTournament.maxEntryFee();
    const platformFee = await ChessTournament.platformFee();
    const gameContract = await ChessTournament.gameContract();
    
    console.log("✅ ChessTournament min entry fee:", ethers.formatEther(minEntryFee), "ETH");
    console.log("✅ ChessTournament max entry fee:", ethers.formatEther(maxEntryFee), "ETH");
    console.log("✅ ChessTournament platform fee:", platformFee.toString(), "basis points");
    console.log("✅ ChessTournament game contract:", gameContract);
  } catch (error) {
    console.log("❌ ChessTournament test failed:", error.message);
  }
  
  // Test token rewards
  console.log("\n🎯 Testing Token Rewards...");
  try {
    const ChessToken = await ethers.getContractAt("ChessToken", deploymentInfo.contracts.ChessToken);
    const ChessGame = await ethers.getContractAt("ChessGame", deploymentInfo.contracts.ChessGame);
    
    // Check if ChessGame is authorized to reward tokens
    const isAuthorized = await ChessToken.authorizedRewarders(ChessGame.target);
    console.log("✅ ChessGame authorized for rewards:", isAuthorized);
    
    // Check token balance
    const balance = await ChessToken.balanceOf(deployer.address);
    console.log("✅ Deployer token balance:", ethers.formatEther(balance));
  } catch (error) {
    console.log("❌ Token rewards test failed:", error.message);
  }
  
  console.log("\n🎉 Contract testing completed!");
  console.log("\n📋 Contract Summary:");
  console.log("ChessToken:", deploymentInfo.contracts.ChessToken);
  console.log("ChessGame:", deploymentInfo.contracts.ChessGame);
  console.log("ChessNFT:", deploymentInfo.contracts.ChessNFT);
  console.log("ChessTournament:", deploymentInfo.contracts.ChessTournament);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Testing failed:", error);
    process.exit(1);
  });
