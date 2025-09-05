require('dotenv').config();
const { sequelize } = require('./connection');
const { User, Game, Tournament, NFT } = require('../models');

async function setup() {
  try {
    console.log('🚀 Starting ChessFi database setup...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Sync all models (create tables if they don't exist)
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Database models synchronized.');
    
    // Create indexes for better performance
    await createIndexes();
    console.log('✅ Database indexes created.');
    
    // Run seeding
    await seed();
    
    console.log('🎉 ChessFi database setup completed successfully!');
    console.log('📊 Database is ready for use with sample data.');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

async function createIndexes() {
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    // User indexes
    await queryInterface.addIndex('users', ['wallet_address'], { unique: true, name: 'users_wallet_address' });
    await queryInterface.addIndex('users', ['username'], { unique: true, name: 'users_username' });
    await queryInterface.addIndex('users', ['email'], { unique: true, name: 'users_email' });
    await queryInterface.addIndex('users', ['rating'], { name: 'users_rating' });
    await queryInterface.addIndex('users', ['is_online'], { name: 'users_is_online' });
    
    // Game indexes
    await queryInterface.addIndex('games', ['white_player_id'], { name: 'games_white_player_id' });
    await queryInterface.addIndex('games', ['black_player_id'], { name: 'games_black_player_id' });
    await queryInterface.addIndex('games', ['winner_id'], { name: 'games_winner_id' });
    await queryInterface.addIndex('games', ['status'], { name: 'games_status' });
    await queryInterface.addIndex('games', ['tournament_id'], { name: 'games_tournament_id' });
    await queryInterface.addIndex('games', ['created_at'], { name: 'games_created_at' });
    
    // Tournament indexes
    await queryInterface.addIndex('tournaments', ['organizer_id'], { name: 'tournaments_organizer_id' });
    await queryInterface.addIndex('tournaments', ['status'], { name: 'tournaments_status' });
    await queryInterface.addIndex('tournaments', ['start_date'], { name: 'tournaments_start_date' });
    await queryInterface.addIndex('tournaments', ['is_public'], { name: 'tournaments_is_public' });
    
    // NFT indexes
    await queryInterface.addIndex('nfts', ['token_id'], { unique: true, name: 'nfts_token_id' });
    await queryInterface.addIndex('nfts', ['contract_address'], { name: 'nfts_contract_address' });
    await queryInterface.addIndex('nfts', ['owner_id'], { name: 'nfts_owner_id' });
    await queryInterface.addIndex('nfts', ['creator_id'], { name: 'nfts_creator_id' });
    await queryInterface.addIndex('nfts', ['nft_type'], { name: 'nfts_nft_type' });
    await queryInterface.addIndex('nfts', ['rarity'], { name: 'nfts_rarity' });
    await queryInterface.addIndex('nfts', ['is_tradeable'], { name: 'nfts_is_tradeable' });
    await queryInterface.addIndex('nfts', ['is_staked'], { name: 'nfts_is_staked' });
    
    console.log('✅ All indexes created successfully');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Some indexes already exist, skipping...');
    } else {
      throw error;
    }
  }
}

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Clear existing data (optional - remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('🧹 Clearing existing data...');
      await NFT.destroy({ where: {} });
      await Game.destroy({ where: {} });
      await Tournament.destroy({ where: {} });
      await User.destroy({ where: {} });
    }
    
    // Create sample users
    const users = await createSampleUsers();
    console.log(`✅ Created ${users.length} sample users`);
    
    // Create sample tournaments
    const tournaments = await createSampleTournaments(users);
    console.log(`✅ Created ${tournaments.length} sample tournaments`);
    
    // Create sample games
    const games = await createSampleGames(users, tournaments);
    console.log(`✅ Created ${games.length} sample games`);
    
    // Create sample NFTs
    const nfts = await createSampleNFTs(users);
    console.log(`✅ Created ${nfts.length} sample NFTs`);
    
    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

async function createSampleUsers() {
  const users = [
    {
      username: 'ChessMaster2024',
      email: 'master@chessfi.com',
      wallet_address: '0x1234567890123456789012345678901234567890',
      nonce: 'sample-nonce-1',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chess1',
      rating: 1850,
      games_played: 150,
      games_won: 95,
      games_drawn: 20,
      games_lost: 35,
      win_rate: 63.33,
      title: 'Master',
      total_earnings: 2.5,
      is_online: true,
      preferences: {
        theme: 'dark',
        sound_enabled: true,
        notifications_enabled: true,
        auto_accept_challenges: false
      },
      is_verified: true
    },
    {
      username: 'RapidPlayer',
      email: 'rapid@chessfi.com',
      wallet_address: '0x2345678901234567890123456789012345678901',
      nonce: 'sample-nonce-2',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chess2',
      rating: 1650,
      games_played: 200,
      games_won: 120,
      games_drawn: 30,
      games_lost: 50,
      win_rate: 60.0,
      title: 'Expert',
      total_earnings: 1.8,
      is_online: false,
      preferences: {
        theme: 'light',
        sound_enabled: false,
        notifications_enabled: true,
        auto_accept_challenges: true
      },
      is_verified: true
    }
  ];
  
  return await User.bulkCreate(users);
}

async function createSampleTournaments(users) {
  const tournaments = [
    {
      name: 'ChessFi Grand Championship',
      description: 'The ultimate chess tournament with massive prizes!',
      format: 'swiss',
      status: 'upcoming',
      start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      registration_deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      max_participants: 64,
      min_participants: 16,
      current_participants: 12,
      time_control: 15,
      increment: 10,
      entry_fee: 0.1,
      prize_pool: {
        first: 5.0,
        second: 2.5,
        third: 1.0,
        fourth: 0.5,
        fifth: 0.25
      },
      total_prize_pool: 9.25,
      rating_min: 1200,
      rating_max: 2500,
      is_rated: true,
      is_public: true,
      organizer_id: users[0].id,
      rules: {
        allow_draws: true,
        tiebreak_method: 'buchholz',
        pairing_system: 'swiss'
      }
    }
  ];
  
  return await Tournament.bulkCreate(tournaments);
}

async function createSampleGames(users, tournaments) {
  const games = [
    {
      white_player_id: users[0].id,
      black_player_id: users[1].id,
      game_type: 'rapid',
      time_control: 15,
      increment: 10,
      status: 'completed',
      result: 'white_win',
      winner_id: users[0].id,
      moves: [
        { move: 'e4', notation: '1.e4', time: 5000 },
        { move: 'e5', notation: '1...e5', time: 4500 }
      ],
      move_history: '1.e4 e5',
      current_turn: 'black',
      is_check: false,
      is_checkmate: false,
      is_stalemate: false,
      is_draw: false,
      captured_pieces: {
        white: [],
        black: []
      },
      game_events: [
        { type: 'move', player: 'white', move: 'e4', timestamp: new Date() },
        { type: 'move', player: 'black', move: 'e5', timestamp: new Date() }
      ],
      rating_change_white: 15,
      rating_change_black: -15,
      stake_amount: 0.1,
      tournament_id: tournaments[0].id,
      started_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
      completed_at: new Date(Date.now() - 1 * 60 * 60 * 1000),
      analysis_data: {
        accuracy_white: 85.2,
        accuracy_black: 78.9,
        blunders_white: 1,
        blunders_black: 3
      }
    }
  ];
  
  return await Game.bulkCreate(games);
}

async function createSampleNFTs(users) {
  const nfts = [
    {
      token_id: '1',
      contract_address: '0xabcdef1234567890abcdef1234567890abcdef12',
      owner_id: users[0].id,
      creator_id: users[0].id,
      nft_type: 'piece',
      name: 'Golden King',
      description: 'A majestic golden king piece with royal aura',
      image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=king1',
      animation_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=king1',
      external_url: 'https://chessfi.com/nft/1',
      rarity: 'legendary',
      attributes: [
        { trait_type: 'Power', value: 95 },
        { trait_type: 'Defense', value: 90 }
      ],
      metadata: {
        collection: 'ChessFi Pieces',
        artist: 'ChessFi Team'
      },
      stats: {
        attack: 95,
        defense: 90,
        speed: 85,
        intelligence: 100
      },
      abilities: [
        { name: 'Royal Command', description: 'Increases team morale', power: 10 }
      ],
      is_tradeable: true,
      is_staked: false,
      staking_rewards: 0,
      mint_price: 0.1,
      current_price: 0.5,
      last_sale_price: 0.3,
      last_sale_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      transaction_hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      block_number: 12345678,
      network: 'ethereum',
      is_verified: true,
      collection_id: '550e8400-e29b-41d4-a716-446655440000',
      edition_number: 1,
      total_editions: 100
    }
  ];
  
  return await NFT.bulkCreate(nfts);
}

// Run setup if this file is executed directly
if (require.main === module) {
  setup();
}

module.exports = { setup };
