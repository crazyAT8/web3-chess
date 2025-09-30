require('dotenv').config();
const { sequelize } = require('./connection');
const { User, Game, Tournament, NFT } = require('../models');

async function setupSQLite() {
  try {
    console.log('🚀 Starting ChessFi SQLite database setup...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ SQLite database connection established successfully.');
    
    // Import all models to ensure they're registered
    require('../models');
    
    // Sync all models (create tables if they don't exist)
    await sequelize.sync({ force: true });
    console.log('✅ Database models synchronized.');
    
    // Create sample data
    await createSampleData();
    console.log('✅ Sample data created.');
    
    console.log('🎉 ChessFi SQLite database setup completed successfully!');
    console.log('📊 Database file: ./chessfi-dev.sqlite');
    console.log('🔧 You can now start the server with: npm run dev');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

async function createSampleData() {
  console.log('🌱 Creating sample data...');
  
  // Create sample users
  const users = await User.bulkCreate([
    {
      username: 'ChessMaster2024',
      email: 'master@chessfi.com',
      wallet_address: '0x1234567890123456789012345678901234567890',
      rating: 2200,
      title: 'Master',
      is_verified: true
    },
    {
      username: 'GrandmasterPro',
      email: 'gm@chessfi.com',
      wallet_address: '0x2345678901234567890123456789012345678901',
      rating: 2500,
      title: 'Grandmaster',
      is_verified: true
    },
    {
      username: 'ChessNovice',
      email: 'novice@chessfi.com',
      wallet_address: '0x3456789012345678901234567890123456789012',
      rating: 1200,
      title: 'Novice',
      is_verified: false
    },
    {
      username: 'TournamentOrganizer',
      email: 'organizer@chessfi.com',
      wallet_address: '0x4567890123456789012345678901234567890123',
      rating: 1800,
      title: 'Expert',
      is_verified: true
    }
  ]);
  console.log(`✅ Created ${users.length} sample users`);

  // Create sample tournaments
  const tournaments = await Tournament.bulkCreate([
    {
      name: 'ChessFi Championship 2024',
      description: 'The ultimate chess tournament with amazing prizes!',
      format: 'swiss',
      status: 'upcoming',
      start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      registration_deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      max_participants: 64,
      min_participants: 8,
      time_control: 15,
      increment: 10,
      entry_fee: 0.01,
      prize_pool: JSON.stringify({
        first: 1.0,
        second: 0.5,
        third: 0.25,
        fourth: 0.1,
        fifth: 0.05
      }),
      is_public: true,
      organizer_id: users[3].id
    },
    {
      name: 'Blitz Battle Royale',
      description: 'Fast-paced blitz tournament for quick games!',
      format: 'elimination',
      status: 'registration',
      start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      registration_deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      max_participants: 32,
      min_participants: 4,
      time_control: 3,
      increment: 2,
      entry_fee: 0.005,
      prize_pool: JSON.stringify({
        first: 0.5,
        second: 0.25,
        third: 0.1
      }),
      is_public: true,
      organizer_id: users[3].id
    }
  ]);
  console.log(`✅ Created ${tournaments.length} sample tournaments`);

  // Create sample NFTs
  const nfts = await NFT.bulkCreate([
    {
      token_id: 'chess-avatar-001',
      contract_address: '0xabcdef1234567890abcdef1234567890abcdef12',
      owner_id: users[0].id,
      creator_id: users[0].id,
      nft_type: 'avatar',
      name: 'Golden King Avatar',
      description: 'A majestic golden king piece for your chess profile',
      image_url: 'https://example.com/avatars/golden-king.png',
      rarity: 'legendary',
      attributes: JSON.stringify([
        { trait_type: 'Crown', value: 'Golden' },
        { trait_type: 'Power', value: 'High' },
        { trait_type: 'Rarity', value: 'Legendary' }
      ]),
      stats: JSON.stringify({
        attack: 95,
        defense: 90,
        speed: 85,
        intelligence: 100
      }),
      mint_price: 0.1,
      current_price: 0.15,
      network: 'ethereum',
      is_verified: true
    },
    {
      token_id: 'chess-piece-001',
      contract_address: '0xabcdef1234567890abcdef1234567890abcdef12',
      owner_id: users[1].id,
      creator_id: users[1].id,
      nft_type: 'piece',
      name: 'Crystal Queen',
      description: 'A beautiful crystal queen piece with magical properties',
      image_url: 'https://example.com/pieces/crystal-queen.png',
      rarity: 'epic',
      attributes: JSON.stringify([
        { trait_type: 'Material', value: 'Crystal' },
        { trait_type: 'Magic', value: 'High' },
        { trait_type: 'Rarity', value: 'Epic' }
      ]),
      stats: JSON.stringify({
        attack: 90,
        defense: 85,
        speed: 95,
        intelligence: 95
      }),
      mint_price: 0.05,
      current_price: 0.08,
      network: 'ethereum',
      is_verified: true
    }
  ]);
  console.log(`✅ Created ${nfts.length} sample NFTs`);

  // Create sample games
  const games = await Game.bulkCreate([
    {
      white_player_id: users[0].id,
      black_player_id: users[1].id,
      game_type: 'rapid',
      time_control: 15,
      increment: 10,
      status: 'completed',
      result: 'white_win',
      winner_id: users[0].id,
      moves: JSON.stringify([
        { from: 'e2', to: 'e4', piece: 'pawn', timestamp: new Date() },
        { from: 'e7', to: 'e5', piece: 'pawn', timestamp: new Date() },
        { from: 'g1', to: 'f3', piece: 'knight', timestamp: new Date() }
      ]),
      rating_change_white: 15,
      rating_change_black: -15,
      stake_amount: 0.01,
      started_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
      completed_at: new Date(Date.now() - 1 * 60 * 60 * 1000)
    },
    {
      white_player_id: users[2].id,
      black_player_id: users[3].id,
      game_type: 'blitz',
      time_control: 5,
      increment: 0,
      status: 'active',
      current_turn: 'white',
      moves: JSON.stringify([
        { from: 'd2', to: 'd4', piece: 'pawn', timestamp: new Date() },
        { from: 'd7', to: 'd5', piece: 'pawn', timestamp: new Date() }
      ]),
      stake_amount: 0.005,
      started_at: new Date(Date.now() - 30 * 60 * 1000)
    }
  ]);
  console.log(`✅ Created ${games.length} sample games`);
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupSQLite();
}

module.exports = { setupSQLite };
