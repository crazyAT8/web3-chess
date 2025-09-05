const { sequelize } = require('./src/database/connection');
const { User, Game, Tournament, NFT } = require('./src/models');

async function testModels() {
  try {
    console.log('🧪 Testing database models...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Test User model
    console.log('👤 Testing User model...');
    const userCount = await User.count();
    console.log(`   Found ${userCount} users`);
    
    // Test Game model
    console.log('🎮 Testing Game model...');
    const gameCount = await Game.count();
    console.log(`   Found ${gameCount} games`);
    
    // Test Tournament model
    console.log('🏆 Testing Tournament model...');
    const tournamentCount = await Tournament.count();
    console.log(`   Found ${tournamentCount} tournaments`);
    
    // Test NFT model
    console.log('🎨 Testing NFT model...');
    const nftCount = await NFT.count();
    console.log(`   Found ${nftCount} NFTs`);
    
    // Test associations
    console.log('🔗 Testing model associations...');
    
    // Test User-Game associations
    const userWithGames = await User.findOne({
      include: [
        { model: Game, as: 'whiteGames' },
        { model: Game, as: 'blackGames' },
        { model: Game, as: 'wonGames' }
      ]
    });
    
    if (userWithGames) {
      console.log(`   User ${userWithGames.username} has ${userWithGames.whiteGames.length} white games`);
      console.log(`   User ${userWithGames.username} has ${userWithGames.blackGames.length} black games`);
      console.log(`   User ${userWithGames.username} has won ${userWithGames.wonGames.length} games`);
    }
    
    // Test Tournament-Game associations
    const tournamentWithGames = await Tournament.findOne({
      include: [{ model: Game, as: 'tournamentGames' }]
    });
    
    if (tournamentWithGames) {
      console.log(`   Tournament ${tournamentWithGames.name} has ${tournamentWithGames.tournamentGames.length} games`);
    }
    
    // Test NFT-User associations
    const nftWithOwner = await NFT.findOne({
      include: [
        { model: User, as: 'owner' },
        { model: User, as: 'creator' }
      ]
    });
    
    if (nftWithOwner) {
      console.log(`   NFT ${nftWithOwner.name} is owned by ${nftWithOwner.owner?.username || 'Unknown'}`);
      console.log(`   NFT ${nftWithOwner.name} was created by ${nftWithOwner.creator?.username || 'Unknown'}`);
    }
    
    console.log('✅ All model tests passed!');
    console.log('🎉 Database models are working correctly');
    
  } catch (error) {
    console.error('❌ Model test failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testModels()
    .then(() => {
      console.log('Model testing completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Model testing failed:', error);
      process.exit(1);
    });
}

module.exports = { testModels };
