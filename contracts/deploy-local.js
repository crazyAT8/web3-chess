const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying ChessFi contracts to local Hardhat network...\n");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString(), "wei\n");

  // Deploy ChessToken
  console.log("🪙 Deploying ChessToken...");
  const ChessToken = await hre.ethers.getContractFactory("ChessToken");
  const chessToken = await ChessToken.deploy();
  await chessToken.waitForDeployment();
  const chessTokenAddress = await chessToken.getAddress();
  console.log("✅ ChessToken deployed to:", chessTokenAddress);

  // Deploy ChessNFT
  console.log("🎨 Deploying ChessNFT...");
  const ChessNFT = await hre.ethers.getContractFactory("ChessNFT");
  const chessNFT = await ChessNFT.deploy();
  await chessNFT.waitForDeployment();
  const chessNFTAddress = await chessNFT.getAddress();
  console.log("✅ ChessNFT deployed to:", chessNFTAddress);

  // Deploy ChessGame
  console.log("♟️ Deploying ChessGame...");
  const ChessGame = await hre.ethers.getContractFactory("ChessGame");
  const chessGame = await ChessGame.deploy();
  await chessGame.waitForDeployment();
  const chessGameAddress = await chessGame.getAddress();
  console.log("✅ ChessGame deployed to:", chessGameAddress);

  // Deploy ChessTournament (requires ChessGame contract address)
  console.log("🏆 Deploying ChessTournament...");
  const ChessTournament = await hre.ethers.getContractFactory("ChessTournament");
  const chessTournament = await ChessTournament.deploy(chessGameAddress);
  await chessTournament.waitForDeployment();
  const chessTournamentAddress = await chessTournament.getAddress();
  console.log("✅ ChessTournament deployed to:", chessTournamentAddress);

  console.log("\n🎉 All contracts deployed successfully!");
  console.log("\n📋 Contract Addresses for Frontend:");
  console.log("=====================================");
  console.log(`NEXT_PUBLIC_CHESS_TOKEN_ADDRESS=${chessTokenAddress}`);
  console.log(`NEXT_PUBLIC_CHESS_NFT_ADDRESS=${chessNFTAddress}`);
  console.log(`NEXT_PUBLIC_CHESS_GAME_ADDRESS=${chessGameAddress}`);
  console.log(`NEXT_PUBLIC_CHESS_TOURNAMENT_ADDRESS=${chessTournamentAddress}`);
  console.log("=====================================");
  
  console.log("\n💡 Copy these environment variables to your frontend/.env.local file");
  console.log("🔗 Or use them directly in your frontend configuration");
  
  console.log("\n🚀 Next steps:");
  console.log("1. Copy the addresses above to your frontend configuration");
  console.log("2. Start your frontend: cd frontend && npm run dev");
  console.log("3. Connect your wallet to the Hardhat Local network");
  console.log("4. Test the integration at /profile → Testing tab");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
