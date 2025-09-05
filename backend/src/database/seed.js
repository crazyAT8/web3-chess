require('dotenv').config();
const { sequelize } = require('./connection');
const { User, Game, Tournament, NFT } = require('../models');

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
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
    
    // Create sample NFTs
    const nfts = await createSampleNFTs(users);
    console.log(`✅ Created ${nfts.length} sample NFTs`);
    
    // Create sample games
    const games = await createSampleGames(users);
    console.log(`✅ Created ${games.length} sample games`);
    
    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

async function createSampleUsers() {
  const users = [
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
  ];
  
  return await User.bulkCreate(users);
}

async function createSampleTournaments(users) {
  const organizer = users.find(u => u.username === 'TournamentOrganizer');
  
  const tournaments = [
    {
      name: 'ChessFi Championship 2024',
      description: 'The ultimate chess tournament with amazing prizes!',
      format: 'swiss',
      status: 'upcoming',
      start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      registration_deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      max_participants: 64,
      min_participants: 8,
      time_control: 15,
      increment: 10,
      entry_fee: 0.01,
      prize_pool: {
        first: 1.0,
        second: 0.5,
        third: 0.25,
        fourth: 0.1,
        fifth: 0.05
      },
      is_public: true,
      organizer_id: organizer.id
    },
    {
      name: 'Blitz Battle Royale',
      description: 'Fast-paced blitz tournament for quick games!',
      format: 'elimination',
      status: 'registration',
      start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      registration_deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      max_participants: 32,
      min_participants: 4,
      time_control: 3,
      increment: 2,
      entry_fee: 0.005,
      prize_pool: {
        first: 0.5,
        second: 0.25,
        third: 0.1
      },
      is_public: true,
      organizer_id: organizer.id
    }
  ];
  
  return await Tournament.bulkCreate(tournaments);
}

async function createSampleNFTs(users) {
  const nfts = [
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
      attributes: [
        { trait_type: 'Crown', value: 'Golden' },
        { trait_type: 'Power', value: 'High' },
        { trait_type: 'Rarity', value: 'Legendary' }
      ],
      stats: {
        attack: 95,
        defense: 90,
        speed: 85,
        intelligence: 100
      },
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
      attributes: [
        { trait_type: 'Material', value: 'Crystal' },
        { trait_type: 'Magic', value: 'High' },
        { trait_type: 'Rarity', value: 'Epic' }
      ],
      stats: {
        attack: 90,
        defense: 85,
        speed: 95,
        intelligence: 95
      },
      mint_price: 0.05,
      current_price: 0.08,
      network: 'ethereum',
      is_verified: true
    },
    {
      token_id: 'chess-board-001',
      contract_address: '0xabcdef1234567890abcdef1234567890abcdef12',
      owner_id: users[2].id,
      creator_id: users[2].id,
      nft_type: 'board',
      name: 'Mystical Forest Board',
      description: 'A magical chess board with forest-themed design',
      image_url: 'https://example.com/boards/mystical-forest.png',
      rarity: 'rare',
      attributes: [
        { trait_type: 'Theme', value: 'Forest' },
        { trait_type: 'Magic', value: 'Medium' },
        { trait_type: 'Rarity', value: 'Rare' }
      ],
      stats: {
        attack: 70,
        defense: 80,
        speed: 75,
        intelligence: 85
      },
      mint_price: 0.02,
      current_price: 0.03,
      network: 'ethereum',
      is_verified: true
    }
  ];
  
  return await NFT.bulkCreate(nfts);
}

async function createSampleGames(users) {
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
        { from: 'e2', to: 'e4', piece: 'pawn', timestamp: new Date() },
        { from: 'e7', to: 'e5', piece: 'pawn', timestamp: new Date() },
        { from: 'g1', to: 'f3', piece: 'knight', timestamp: new Date() }
      ],
      rating_change_white: 15,
      rating_change_black: -15,
      stake_amount: 0.01,
      started_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      completed_at: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
    },
    {
      white_player_id: users[2].id,
      black_player_id: users[3].id,
      game_type: 'blitz',
      time_control: 5,
      increment: 0,
      status: 'active',
      current_turn: 'white',
      moves: [
        { from: 'd2', to: 'd4', piece: 'pawn', timestamp: new Date() },
        { from: 'd7', to: 'd5', piece: 'pawn', timestamp: new Date() }
      ],
      stake_amount: 0.005,
      started_at: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
    }
  ];
  
  return await Game.bulkCreate(games);
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seed()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seed };
