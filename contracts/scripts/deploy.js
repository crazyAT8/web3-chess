const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying ChessFi Smart Contracts...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.getBalance()).toString());

  // Deploy ChessToken first
  console.log("\n🎯 Deploying ChessToken...");
  const ChessToken = await ethers.getContractFactory("ChessToken");
  const chessToken = await ChessToken.deploy();
  await chessToken.deployed();
  console.log("✅ ChessToken deployed to:", chessToken.address);

  // Deploy ChessGame contract
  console.log("\n🎯 Deploying ChessGame...");
  const ChessGame = await ethers.getContractFactory("ChessGame");
  const chessGame = await ChessGame.deploy();
  await chessGame.deployed();
  console.log("✅ ChessGame deployed to:", chessGame.address);

  // Deploy ChessNFT contract
  console.log("\n🎯 Deploying ChessNFT...");
  const ChessNFT = await ethers.getContractFactory("ChessNFT");
  const chessNFT = await ChessNFT.deploy();
  await chessNFT.deployed();
  console.log("✅ ChessNFT deployed to:", chessNFT.address);

  // Deploy ChessTournament contract
  console.log("\n🎯 Deploying ChessTournament...");
  const ChessTournament = await ethers.getContractFactory("ChessTournament");
  const chessTournament = await ChessTournament.deploy(chessGame.address);
  await chessTournament.deployed();
  console.log("✅ ChessTournament deployed to:", chessTournament.address);

  // Authorize contracts to reward tokens
  console.log("\n🔐 Setting up authorizations...");
  
  // Authorize ChessGame to reward tokens
  await chessToken.setAuthorizedRewarder(chessGame.address, true);
  console.log("✅ ChessGame authorized to reward tokens");

  // Authorize ChessTournament to reward tokens
  await chessToken.setAuthorizedRewarder(chessTournament.address, true);
  console.log("✅ ChessTournament authorized to reward tokens");

  // Set initial configuration
  console.log("\n⚙️ Setting initial configuration...");
  
  // Set reasonable stake limits for ChessGame
  await chessGame.setStakeLimits(
    ethers.utils.parseEther("0.001"), // 0.001 ETH min
    ethers.utils.parseEther("10")     // 10 ETH max
  );
  console.log("✅ ChessGame stake limits configured");

  // Set platform fee to 2.5%
  await chessGame.setPlatformFee(25);
  console.log("✅ ChessGame platform fee set to 2.5%");

  // Set tournament entry fee limits
  await chessTournament.setEntryFeeLimits(
    ethers.utils.parseEther("0.001"), // 0.001 ETH min
    ethers.utils.parseEther("5")      // 5 ETH max
  );
  console.log("✅ Tournament entry fee limits configured");

  // Set tournament platform fee to 5%
  await chessTournament.setPlatformFee(50);
  console.log("✅ Tournament platform fee set to 5%");

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Contract Addresses:");
  console.log("ChessToken:", chessToken.address);
  console.log("ChessGame:", chessGame.address);
  console.log("ChessNFT:", chessNFT.address);
  console.log("ChessTournament:", chessTournament.address);

  console.log("\n🔗 Next Steps:");
  console.log("1. Update frontend configuration with contract addresses");
  console.log("2. Update backend configuration with contract addresses");
  console.log("3. Test contract interactions");
  console.log("4. Deploy to testnet for further testing");

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    deployer: deployer.address,
    contracts: {
      ChessToken: chessToken.address,
      ChessGame: chessGame.address,
      ChessNFT: chessNFT.address,
      ChessTournament: chessTournament.address
    },
    timestamp: new Date().toISOString()
  };

  const fs = require('fs');
  fs.writeFileSync(
    'deployment.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n💾 Deployment info saved to deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 