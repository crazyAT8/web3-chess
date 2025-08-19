const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying ChessFi Smart Contracts...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("�� Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name, `(Chain ID: ${network.chainId})`);

  // Deploy ChessToken first
  console.log("\n🎯 Deploying ChessToken...");
  const ChessToken = await ethers.getContractFactory("ChessToken");
  const chessToken = await ChessToken.deploy();
  await chessToken.waitForDeployment();
  const chessTokenAddress = await chessToken.getAddress();
  console.log("✅ ChessToken deployed to:", chessTokenAddress);

  // Deploy ChessGame contract
  console.log("\n🎯 Deploying ChessGame...");
  const ChessGame = await ethers.getContractFactory("ChessGame");
  const chessGame = await ChessGame.deploy();
  await chessGame.waitForDeployment();
  const chessGameAddress = await chessGame.getAddress();
  console.log("✅ ChessGame deployed to:", chessGameAddress);

  // Deploy ChessNFT contract
  console.log("\n🎯 Deploying ChessNFT...");
  const ChessNFT = await ethers.getContractFactory("ChessNFT");
  const chessNFT = await ChessNFT.deploy();
  await chessNFT.waitForDeployment();
  const chessNFTAddress = await chessNFT.getAddress();
  console.log("✅ ChessNFT deployed to:", chessNFTAddress);

  // Deploy ChessTournament contract
  console.log("\n🎯 Deploying ChessTournament...");
  const ChessTournament = await ethers.getContractFactory("ChessTournament");
  const chessTournament = await ChessTournament.deploy(chessGameAddress);
  await chessTournament.waitForDeployment();
  const chessTournamentAddress = await chessTournament.getAddress();
  console.log("✅ ChessTournament deployed to:", chessTournamentAddress);

  // Wait a bit for transactions to be mined
  console.log("\n⏳ Waiting for transactions to be mined...");
  await new Promise(resolve => setTimeout(resolve, 10000));

  // Authorize contracts to reward tokens
  console.log("\n🔐 Setting up authorizations...");
  
  try {
    // Authorize ChessGame to reward tokens
    const authGameTx = await chessToken.setAuthorizedRewarder(chessGameAddress, true);
    await authGameTx.wait();
    console.log("✅ ChessGame authorized to reward tokens");

    // Authorize ChessTournament to reward tokens
    const authTournamentTx = await chessToken.setAuthorizedRewarder(chessTournamentAddress, true);
    await authTournamentTx.wait();
    console.log("✅ ChessTournament authorized to reward tokens");
  } catch (error) {
    console.log("⚠️ Warning: Could not set authorizations:", error.message);
  }

  // Set initial configuration
  console.log("\n⚙️ Setting initial configuration...");
  
  try {
    // Set reasonable stake limits for ChessGame
    const stakeLimitsTx = await chessGame.setStakeLimits(
      ethers.parseEther("0.001"), // 0.001 ETH min
      ethers.parseEther("10")      // 10 ETH max
    );
    await stakeLimitsTx.wait();
    console.log("✅ ChessGame stake limits configured");

    // Set platform fee to 2.5%
    const gameFeeTx = await chessGame.setPlatformFee(25);
    await gameFeeTx.wait();
    console.log("✅ ChessGame platform fee set to 2.5%");
  } catch (error) {
    console.log("⚠️ Warning: Could not configure ChessGame:", error.message);
  }

  try {
    // Set tournament entry fee limits
    const entryFeeTx = await chessTournament.setEntryFeeLimits(
      ethers.parseEther("0.001"), // 0.001 ETH min
      ethers.parseEther("5")       // 5 ETH max
    );
    await entryFeeTx.wait();
    console.log("✅ Tournament entry fee limits configured");

    // Set tournament platform fee to 5%
    const tournamentFeeTx = await chessTournament.setPlatformFee(50);
    await tournamentFeeTx.wait();
    console.log("✅ Tournament platform fee set to 5%");
  } catch (error) {
    console.log("⚠️ Warning: Could not configure ChessTournament:", error.message);
  }

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Contract Addresses:");
  console.log("ChessToken:", chessTokenAddress);
  console.log("ChessGame:", chessGameAddress);
  console.log("ChessNFT:", chessNFTAddress);
  console.log("ChessTournament:", chessTournamentAddress);

  console.log("\n🔗 Next Steps:");
  console.log("1. Update frontend configuration with contract addresses");
  console.log("2. Update backend configuration with contract addresses");
  console.log("3. Test contract interactions");
  console.log("4. Deploy to testnet for further testing");

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId,
    deployer: deployer.address,
    contracts: {
      ChessToken: chessTokenAddress,
      ChessGame: chessGameAddress,
      ChessNFT: chessNFTAddress,
      ChessTournament: chessTournamentAddress
    },
    timestamp: new Date().toISOString()
  };

  const fs = require('fs');
  const deploymentFile = `deployment-${network.name}.json`;
  fs.writeFileSync(
    deploymentFile,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`\n💾 Deployment info saved to ${deploymentFile}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 