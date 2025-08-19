const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying ChessFi Smart Contracts to Sepolia Testnet...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  // Verify we're on Sepolia
  const network = await ethers.provider.getNetwork();
  if (network.chainId !== 11155111n) {
    throw new Error("❌ This script is designed for Sepolia testnet (Chain ID: 11155111)");
  }
  console.log("🌐 Network: Sepolia Testnet (Chain ID: 11155111)");

  // Check if deployer has enough ETH for deployment
  const balance = await deployer.provider.getBalance(deployer.address);
  if (balance < ethers.parseEther("0.1")) {
    throw new Error("❌ Insufficient balance. Need at least 0.1 ETH for deployment");
  }

  console.log("\n⏳ Starting deployment process...");

  try {
    // Deploy ChessToken first
    console.log("\n🎯 Deploying ChessToken...");
    const ChessToken = await ethers.getContractFactory("ChessToken");
    const chessToken = await ChessToken.deploy();
    await chessToken.waitForDeployment();
    const chessTokenAddress = await chessToken.getAddress();
    console.log("✅ ChessToken deployed to:", chessTokenAddress);

    // Wait for deployment to be mined
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Deploy ChessGame contract
    console.log("\n🎯 Deploying ChessGame...");
    const ChessGame = await ethers.getContractFactory("ChessGame");
    const chessGame = await ChessGame.deploy();
    await chessGame.waitForDeployment();
    const chessGameAddress = await chessGame.getAddress();
    console.log("✅ ChessGame deployed to:", chessGameAddress);

    await new Promise(resolve => setTimeout(resolve, 5000));

    // Deploy ChessNFT contract
    console.log("\n🎯 Deploying ChessNFT...");
    const ChessNFT = await ethers.getContractFactory("ChessNFT");
    const chessNFT = await ChessNFT.deploy();
    await chessNFT.waitForDeployment();
    const chessNFTAddress = await chessNFT.getAddress();
    console.log("✅ ChessNFT deployed to:", chessNFTAddress);

    await new Promise(resolve => setTimeout(resolve, 5000));

    // Deploy ChessTournament contract
    console.log("\n🎯 Deploying ChessTournament...");
    const ChessTournament = await ethers.getContractFactory("ChessTournament");
    const chessTournament = await ChessTournament.deploy(chessGameAddress);
    await chessTournament.waitForDeployment();
    const chessTournamentAddress = await chessTournament.getAddress();
    console.log("✅ ChessTournament deployed to:", chessTournamentAddress);

    // Wait for all deployments to be mined
    console.log("\n⏳ Waiting for all deployments to be mined...");
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Set up contract interactions
    console.log("\n🔐 Setting up contract authorizations...");
    
    try {
      // Authorize ChessGame to reward tokens
      console.log("Authorizing ChessGame to reward tokens...");
      const authGameTx = await chessToken.setAuthorizedRewarder(chessGameAddress, true);
      await authGameTx.wait();
      console.log("✅ ChessGame authorized to reward tokens");

      // Authorize ChessTournament to reward tokens
      console.log("Authorizing ChessTournament to reward tokens...");
      const authTournamentTx = await chessToken.setAuthorizedRewarder(chessTournamentAddress, true);
      await authTournamentTx.wait();
      console.log("✅ ChessTournament authorized to reward tokens");
    } catch (error) {
      console.log("⚠️ Warning: Could not set authorizations:", error.message);
    }

    // Configure contract settings
    console.log("\n⚙️ Configuring contract settings...");
    
    try {
      // Set ChessGame configuration
      console.log("Configuring ChessGame...");
      const stakeLimitsTx = await chessGame.setStakeLimits(
        ethers.parseEther("0.001"), // 0.001 ETH min
        ethers.parseEther("10")      // 10 ETH max
      );
      await stakeLimitsTx.wait();
      console.log("✅ ChessGame stake limits configured");

      const gameFeeTx = await chessGame.setPlatformFee(25); // 2.5%
      await gameFeeTx.wait();
      console.log("✅ ChessGame platform fee set to 2.5%");
    } catch (error) {
      console.log("⚠️ Warning: Could not configure ChessGame:", error.message);
    }

    try {
      // Set ChessTournament configuration
      console.log("Configuring ChessTournament...");
      const entryFeeTx = await chessTournament.setEntryFeeLimits(
        ethers.parseEther("0.001"), // 0.001 ETH min
        ethers.parseEther("5")       // 5 ETH max
      );
      await entryFeeTx.wait();
      console.log("✅ Tournament entry fee limits configured");

      const tournamentFeeTx = await chessTournament.setPlatformFee(50); // 5%
      await tournamentFeeTx.wait();
      console.log("✅ Tournament platform fee set to 5%");
    } catch (error) {
      console.log("⚠️ Warning: Could not configure ChessTournament:", error.message);
    }

    // Deployment summary
    console.log("\n🎉 Deployment to Sepolia Testnet completed successfully!");
    console.log("\n📋 Contract Addresses:");
    console.log("ChessToken:", chessTokenAddress);
    console.log("ChessGame:", chessGameAddress);
    console.log("ChessNFT:", chessNFTAddress);
    console.log("ChessTournament:", chessTournamentAddress);

    console.log("\n🔗 Sepolia Explorer Links:");
    console.log(`ChessToken: https://sepolia.etherscan.io/address/${chessTokenAddress}`);
    console.log(`ChessGame: https://sepolia.etherscan.io/address/${chessGameAddress}`);
    console.log(`ChessNFT: https://sepolia.etherscan.io/address/${chessNFTAddress}`);
    console.log(`ChessTournament: https://sepolia.etherscan.io/address/${chessTournamentAddress}`);

    console.log("\n🔗 Next Steps:");
    console.log("1. Verify contracts on Etherscan (optional but recommended)");
    console.log("2. Update frontend configuration with contract addresses");
    console.log("3. Update backend configuration with contract addresses");
    console.log("4. Test contract interactions on Sepolia");
    console.log("5. Get some Sepolia ETH from faucet for testing");

    // Save deployment info
    const deploymentInfo = {
      network: "sepolia",
      chainId: 11155111,
      deployer: deployer.address,
      contracts: {
        ChessToken: chessTokenAddress,
        ChessGame: chessGameAddress,
        ChessNFT: chessNFTAddress,
        ChessTournament: chessTournamentAddress
      },
      timestamp: new Date().toISOString(),
      etherscanBase: "https://sepolia.etherscan.io"
    };

    const fs = require('fs');
    fs.writeFileSync(
      'deployment-sepolia.json',
      JSON.stringify(deploymentInfo, null, 2)
    );
    console.log("\n💾 Deployment info saved to deployment-sepolia.json");

    // Create environment file template
    const envTemplate = `# ChessFi Contract Addresses - Sepolia Testnet
CHESS_TOKEN_ADDRESS=${chessTokenAddress}
CHESS_GAME_ADDRESS=${chessGameAddress}
CHESS_NFT_ADDRESS=${chessNFTAddress}
CHESS_TOURNAMENT_ADDRESS=${chessTournamentAddress}

# Network Configuration
NETWORK_CHAIN_ID=11155111
NETWORK_NAME=sepolia
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID

# Optional: Etherscan API Key for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key_here
`;

    fs.writeFileSync('.env.sepolia.example', envTemplate);
    console.log("💾 Environment template saved to .env.sepolia.example");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 