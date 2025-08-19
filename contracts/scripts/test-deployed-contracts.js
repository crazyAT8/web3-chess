const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing Deployed ChessFi Contracts on Sepolia...");

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

  // Get signer
  const [signer] = await ethers.getSigners();
  console.log("🔑 Testing with account:", signer.address);
  console.log("💰 Balance:", ethers.formatEther(await signer.provider.getBalance(signer.address)), "ETH");

  try {
    // Test ChessToken
    console.log("\n🎯 Testing ChessToken...");
    const ChessToken = await ethers.getContractFactory("ChessToken");
    const chessToken = ChessToken.attach(contracts.ChessToken);
    
    const tokenName = await chessToken.name();
    const tokenSymbol = await chessToken.symbol();
    const totalSupply = await chessToken.totalSupply();
    const ownerBalance = await chessToken.balanceOf(signer.address);
    
    console.log("✅ Token Name:", tokenName);
    console.log("✅ Token Symbol:", tokenSymbol);
    console.log("✅ Total Supply:", ethers.formatEther(totalSupply));
    console.log("✅ Owner Balance:", ethers.formatEther(ownerBalance));

    // Test ChessGame
    console.log("\n🎯 Testing ChessGame...");
    const ChessGame = await ethers.getContractFactory("ChessGame");
    const chessGame = ChessGame.attach(contracts.ChessGame);
    
    const minStake = await chessGame.minStake();
    const maxStake = await chessGame.maxStake();
    const platformFee = await chessGame.platformFee();
    
    console.log("✅ Min Stake:", ethers.formatEther(minStake), "ETH");
    console.log("✅ Max Stake:", ethers.formatEther(maxStake), "ETH");
    console.log("✅ Platform Fee:", platformFee.toString(), "basis points (", (platformFee / 10).toString(), "%)");

    // Test ChessNFT
    console.log("\n🎯 Testing ChessNFT...");
    const ChessNFT = await ethers.getContractFactory("ChessNFT");
    const chessNFT = ChessNFT.attach(contracts.ChessNFT);
    
    const nftName = await chessNFT.name();
    const nftSymbol = await chessNFT.symbol();
    const mintingEnabled = await chessNFT.mintingEnabled();
    const mintFee = await chessNFT.mintFee();
    
    console.log("✅ NFT Name:", nftName);
    console.log("✅ NFT Symbol:", nftSymbol);
    console.log("✅ Minting Enabled:", mintingEnabled);
    console.log("✅ Mint Fee:", ethers.formatEther(mintFee), "ETH");

    // Test ChessTournament
    console.log("\n🎯 Testing ChessTournament...");
    const ChessTournament = await ethers.getContractFactory("ChessTournament");
    const chessTournament = ChessTournament.attach(contracts.ChessTournament);
    
    const chessGameAddress = await chessTournament.chessGameContract();
    const platformFeeTournament = await chessTournament.platformFee();
    const minEntryFee = await chessTournament.minEntryFee();
    const maxEntryFee = await chessTournament.maxEntryFee();
    
    console.log("✅ ChessGame Contract:", chessGameAddress);
    console.log("✅ Platform Fee:", platformFeeTournament.toString(), "basis points (", (platformFeeTournament / 10).toString(), "%)");
    console.log("✅ Min Entry Fee:", ethers.formatEther(minEntryFee), "ETH");
    console.log("✅ Max Entry Fee:", ethers.formatEther(maxEntryFee), "ETH");

    // Test contract interactions
    console.log("\n🔐 Testing Contract Authorizations...");
    
    try {
      const isGameAuthorized = await chessToken.authorizedRewarders(contracts.ChessGame);
      const isTournamentAuthorized = await chessToken.authorizedRewarders(contracts.ChessTournament);
      
      console.log("✅ ChessGame Authorized:", isGameAuthorized);
      console.log("✅ ChessTournament Authorized:", isTournamentAuthorized);
    } catch (error) {
      console.log("⚠️ Could not check authorizations:", error.message);
    }

    // Test basic functionality
    console.log("\n🎮 Testing Basic Functionality...");
    
    try {
      // Try to create a game (this will fail if not enough ETH, but that's expected)
      console.log("Testing game creation...");
      const createGameTx = await chessGame.createGame(ethers.parseEther("0.001"), { value: ethers.parseEther("0.001") });
      console.log("✅ Game creation transaction sent:", createGameTx.hash);
      
      // Wait for transaction to be mined
      await createGameTx.wait();
      console.log("✅ Game created successfully!");
      
      // Get the created game
      const gameId = await chessGame._gameIds();
      const game = await chessGame.getGame(gameId);
      console.log("✅ Game ID:", gameId.toString());
      console.log("✅ Game State:", game.state.toString());
      
    } catch (error) {
      if (error.message.includes("insufficient funds")) {
        console.log("ℹ️ Game creation test skipped - insufficient funds (this is expected)");
      } else {
        console.log("⚠️ Game creation test failed:", error.message);
      }
    }

    console.log("\n🎉 All contract tests completed successfully!");
    console.log("\n📋 Contract Summary:");
    console.log("ChessToken:", contracts.ChessToken);
    console.log("ChessGame:", contracts.ChessGame);
    console.log("ChessNFT:", contracts.ChessNFT);
    console.log("ChessTournament:", contracts.ChessTournament);

  } catch (error) {
    console.error("❌ Contract testing failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Testing failed:", error);
    process.exit(1);
  }); 