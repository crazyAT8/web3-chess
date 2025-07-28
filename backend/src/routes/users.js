const express = require('express');
const { User, Game, NFT } = require('../models');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const Joi = require('joi');

const router = express.Router();

// Get current user profile
router.get('/profile', asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    include: [
      { model: Game, as: 'whiteGames', attributes: ['id', 'status', 'result', 'created_at'] },
      { model: Game, as: 'blackGames', attributes: ['id', 'status', 'result', 'created_at'] },
      { model: NFT, as: 'ownedNFTs', attributes: ['id', 'name', 'nft_type', 'rarity'] }
    ]
  });

  res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      wallet_address: user.wallet_address,
      avatar_url: user.avatar_url,
      rating: user.rating,
      title: user.title,
      games_played: user.games_played,
      games_won: user.games_won,
      games_drawn: user.games_drawn,
      games_lost: user.games_lost,
      win_rate: user.win_rate,
      rank: user.rank,
      total_earnings: user.total_earnings,
      is_online: user.is_online,
      last_seen: user.last_seen,
      preferences: user.preferences,
      is_verified: user.is_verified,
      created_at: user.created_at
    },
    stats: {
      total_games: user.whiteGames.length + user.blackGames.length,
      total_nfts: user.ownedNFTs.length
    }
  });
}));

// Get user by ID
router.get('/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findByPk(userId, {
    attributes: [
      'id', 'username', 'avatar_url', 'rating', 'title', 'games_played',
      'games_won', 'games_drawn', 'games_lost', 'win_rate', 'rank',
      'is_online', 'last_seen', 'created_at'
    ]
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({ user });
}));

// Search users
router.get('/search/:query', asyncHandler(async (req, res) => {
  const { query } = req.params;
  const { limit = 10 } = req.query;

  const users = await User.findAll({
    where: {
      username: {
        [require('sequelize').Op.iLike]: `%${query}%`
      }
    },
    attributes: [
      'id', 'username', 'avatar_url', 'rating', 'title', 'is_online'
    ],
    limit: parseInt(limit),
    order: [['rating', 'DESC']]
  });

  res.json({ users });
}));

// Get online users
router.get('/online/list', asyncHandler(async (req, res) => {
  const { limit = 50 } = req.query;

  const users = await User.findAll({
    where: {
      is_online: true
    },
    attributes: [
      'id', 'username', 'avatar_url', 'rating', 'title', 'last_seen'
    ],
    limit: parseInt(limit),
    order: [['last_seen', 'DESC']]
  });

  res.json({ users });
}));

// Get user game history
router.get('/:userId/games', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { limit = 20, offset = 0 } = req.query;

  const games = await Game.findAndCountAll({
    where: {
      [require('sequelize').Op.or]: [
        { white_player_id: userId },
        { black_player_id: userId }
      ]
    },
    include: [
      { model: User, as: 'whitePlayer', attributes: ['id', 'username', 'rating'] },
      { model: User, as: 'blackPlayer', attributes: ['id', 'username', 'rating'] },
      { model: User, as: 'winner', attributes: ['id', 'username'] }
    ],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.json({
    games: games.rows,
    total: games.count,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
}));

// Get user NFTs
router.get('/:userId/nfts', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { type, rarity, limit = 20, offset = 0 } = req.query;

  const whereClause = { owner_id: userId };
  
  if (type) whereClause.nft_type = type;
  if (rarity) whereClause.rarity = rarity;

  const nfts = await NFT.findAndCountAll({
    where: whereClause,
    include: [
      { model: User, as: 'owner', attributes: ['id', 'username'] },
      { model: User, as: 'creator', attributes: ['id', 'username'] }
    ],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.json({
    nfts: nfts.rows,
    total: nfts.count,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
}));

// Update user preferences
router.put('/preferences', asyncHandler(async (req, res) => {
  const { preferences } = req.body;
  const user = req.user;

  if (preferences) {
    user.preferences = { ...user.preferences, ...preferences };
    await user.save();
  }

  res.json({
    message: 'Preferences updated successfully',
    preferences: user.preferences
  });
}));

// Get leaderboard
router.get('/leaderboard/global', asyncHandler(async (req, res) => {
  const { limit = 100, offset = 0 } = req.query;

  const users = await User.findAll({
    attributes: [
      'id', 'username', 'avatar_url', 'rating', 'title', 'games_played',
      'win_rate', 'rank'
    ],
    order: [['rating', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  // Update ranks
  users.forEach((user, index) => {
    user.rank = parseInt(offset) + index + 1;
  });

  res.json({ users });
}));

module.exports = router; 