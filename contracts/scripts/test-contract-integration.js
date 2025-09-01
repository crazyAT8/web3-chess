const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing deployed contract integration...\n");

  // Get the signer
  const [deployer] = await ethers.getSigners();
  console.log("📝 Testing with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH\n");

  // Contract addresses from deployment
  const CHESS_TOKEN_ADDRESS = "0x0E887B3aAd61c724De20308cc7a3d6d8197A992a";
  const CHESS_NFT_ADDRESS = "0x91a32Ce740BE656f8F150806d9d4a22518136415";
  const CHESS_GAME_ADDRESS = "0x3DF6f0284Bf92fd48c5517b9cA9788aB479f0796";
  const CHESS_TOURNAMENT_ADDRESS = "0x3a34F400393cB1193616dF72Eb843Fe826ABC137";

  try {
    // Test ChessToken contract
    console.log("🔍 Testing ChessToken contract...");
    const ChessToken = await ethers.getContractFactory("ChessToken");
    const chessToken = ChessToken.attach(CHESS_TOKEN_ADDRESS);
    
    const tokenName = await chessToken.name();
    const tokenSymbol = await chessToken.symbol();
    const tokenDecimals = await chessToken.decimals();
    
    console.log(`   ✅ Name: ${tokenName}`);
    console.log(`   ✅ Symbol: ${tokenSymbol}`);
    console.log(`   ✅ Decimals: ${tokenDecimals}`);
    
    const deployerBalance = await chessToken.balanceOf(deployer.address);
    console.log(`   ✅ Deployer balance: ${ethers.formatEther(deployerBalance)} ${tokenSymbol}\n`);

    // Test ChessNFT contract
    console.log("🔍 Testing ChessNFT contract...");
    const ChessNFT = await ethers.getContractFactory("ChessNFT");
    const chessNFT = ChessNFT.attach(CHESS_NFT_ADDRESS);
    
    const nftName = await chessNFT.name();
    const nftSymbol = await chessNFT.symbol();
    
    console.log(`   ✅ Name: ${nftName}`);
    console.log(`   ✅ Symbol: ${nftSymbol}`);
    
    const deployerNFTBalance = await chessNFT.balanceOf(deployer.address);
    console.log(`   ✅ Deployer NFT balance: ${deployerNFTBalance}\n`);

    // Test ChessGame contract
    console.log("🔍 Testing ChessGame contract...");
    const ChessGame = await ethers.getContractFactory("ChessGame");
    const chessGame = ChessGame.attach(CHESS_GAME_ADDRESS);
    
    const minStake = await chessGame.minStake();
    const maxStake = await chessGame.maxStake();
    const platformFee = await chessGame.platformFee();
    
    console.log(`   ✅ Min stake: ${ethers.formatEther(minStake)} ETH`);
    console.log(`   ✅ Max stake: ${ethers.formatEther(maxStake)} ETH`);
    console.log(`   ✅ Platform fee: ${platformFee} basis points (${platformFee / 100}%)\n`);

    // Test ChessTournament contract
    console.log("🔍 Testing ChessTournament contract...");
    const ChessTournament = await ethers.getContractFactory("ChessTournament");
    const chessTournament = ChessTournament.attach(CHESS_TOURNAMENT_ADDRESS);
    
    const tournamentCount = await chessTournament.tournamentCount();
    console.log(`   ✅ Tournament count: ${tournamentCount}\n`);

    // Test basic game creation (with minimal stake)
    console.log("🎮 Testing game creation...");
    const testStake = ethers.parseEther("0.001");
    
    try {
      const createGameTx = await chessGame.createGame(testStake, { value: testStake });
      console.log(`   📝 Game creation transaction hash: ${createGameTx.hash}`);
      
      const receipt = await createGameTx.wait();
      console.log(`   ✅ Game created successfully! Gas used: ${receipt.gasUsed.toString()}`);
      
      // Get the created game
      const gameId = await chessGame._gameIds();
      const game = await chessGame.games(gameId - 1);
      
      console.log(`   🎯 Game ID: ${gameId - 1}`);
      console.log(`   👤 White player: ${game.whitePlayer}`);
      console.log(`   💰 Stake: ${ethers.formatEther(game.stake)} ETH`);
      console.log(`   📊 State: ${game.state}`);
      
    } catch (error) {
      console.log(`   ❌ Game creation failed: ${error.message}`);
    }

    console.log("\n🎉 Contract integration test completed!");
    
  } catch (error) {
    console.error("❌ Contract integration test failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
