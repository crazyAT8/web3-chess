require('dotenv').config();
const { sequelize } = require('./connection');
const { User, Game, Tournament, NFT } = require('../models');

async function migrate() {
  try {
    console.log('🔄 Starting database migration...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Sync all models (create tables if they don't exist)
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Database models synchronized.');
    
    // Create indexes for better performance
    await createIndexes();
    console.log('✅ Database indexes created.');
    
    console.log('🎉 Database migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

async function createIndexes() {
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    // User indexes
    await queryInterface.addIndex('users', ['wallet_address'], { unique: true });
    await queryInterface.addIndex('users', ['username'], { unique: true });
    await queryInterface.addIndex('users', ['email'], { unique: true });
    await queryInterface.addIndex('users', ['rating']);
    await queryInterface.addIndex('users', ['is_online']);
    
    // Game indexes
    await queryInterface.addIndex('games', ['white_player_id']);
    await queryInterface.addIndex('games', ['black_player_id']);
    await queryInterface.addIndex('games', ['winner_id']);
    await queryInterface.addIndex('games', ['status']);
    await queryInterface.addIndex('games', ['tournament_id']);
    await queryInterface.addIndex('games', ['created_at']);
    
    // Tournament indexes
    await queryInterface.addIndex('tournaments', ['organizer_id']);
    await queryInterface.addIndex('tournaments', ['status']);
    await queryInterface.addIndex('tournaments', ['start_date']);
    await queryInterface.addIndex('tournaments', ['is_public']);
    
    // NFT indexes
    await queryInterface.addIndex('nfts', ['token_id'], { unique: true });
    await queryInterface.addIndex('nfts', ['contract_address']);
    await queryInterface.addIndex('nfts', ['owner_id']);
    await queryInterface.addIndex('nfts', ['creator_id']);
    await queryInterface.addIndex('nfts', ['nft_type']);
    await queryInterface.addIndex('nfts', ['rarity']);
    await queryInterface.addIndex('nfts', ['is_tradeable']);
    await queryInterface.addIndex('nfts', ['is_staked']);
    
    console.log('✅ All indexes created successfully');
  } catch (error) {
    // Some indexes might already exist, which is fine
    if (error.name === 'SequelizeDatabaseError' && error.message.includes('already exists')) {
      console.log('ℹ️  Some indexes already exist, skipping...');
    } else {
      throw error;
    }
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrate()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrate, createIndexes };
