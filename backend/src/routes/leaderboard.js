const express = require('express');
const { User, Game, Tournament } = require('../models');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const router = express.Router();

// Get global leaderboard
router.get('/global', asyncHandler(async (req, res) => {
  const { limit = 100, offset = 0 } = req.query;

  const users = await User.findAll({
    attributes: [
      'id', 'username', 'avatar_url', 'rating', 'title', 'games_played',
      'games_won', 'games_drawn', 'games_lost', 'win_rate', 'rank'
    ],
    where: {
      games_played: {
        [require('sequelize').Op.gte]: 5 // Minimum games to appear on leaderboard
      }
    },
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

// Get top players by category
router.get('/top/:category', asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { limit = 10 } = req.query;

  let orderBy;
  let whereClause = {};

  switch (category) {
    case 'rating':
      orderBy = [['rating', 'DESC']];
      whereClause.games_played = { [require('sequelize').Op.gte]: 5 };
      break;
    case 'games':
      orderBy = [['games_played', 'DESC']];
      break;
    case 'wins':
      orderBy = [['games_won', 'DESC']];
      break;
    case 'winrate':
      orderBy = [['win_rate', 'DESC']];
      whereClause.games_played = { [require('sequelize').Op.gte]: 10 };
      break;
    case 'earnings':
      orderBy = [['total_earnings', 'DESC']];
      break;
    default:
      throw new AppError('Invalid category', 400);
  }

  const users = await User.findAll({
    attributes: [
      'id', 'username', 'avatar_url', 'rating', 'title', 'games_played',
      'games_won', 'win_rate', 'total_earnings'
    ],
    where: whereClause,
    order: orderBy,
    limit: parseInt(limit)
  });

  res.json({ users });
}));

// Get platform statistics
router.get('/stats', asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalGames,
    activeUsers,
    totalTournaments,
    averageRating,
    totalEarnings
  ] = await Promise.all([
    User.count(),
    Game.count(),
    User.count({ where: { is_online: true } }),
    Tournament.count(),
    User.findOne({
      attributes: [[require('sequelize').fn('AVG', require('sequelize').col('rating')), 'avgRating']],
      where: { games_played: { [require('sequelize').Op.gte]: 5 } }
    }),
    User.findOne({
      attributes: [[require('sequelize').fn('SUM', require('sequelize').col('total_earnings')), 'totalEarnings']]
    })
  ]);

  // Get recent activity
  const recentGames = await Game.findAll({
    include: [
      { model: User, as: 'whitePlayer', attributes: ['username'] },
      { model: User, as: 'blackPlayer', attributes: ['username'] }
    ],
    order: [['created_at', 'DESC']],
    limit: 5
  });

  // Get top players
  const topPlayers = await User.findAll({
    attributes: ['id', 'username', 'rating', 'title'],
    order: [['rating', 'DESC']],
    limit: 5
  });

  res.json({
    stats: {
      totalUsers,
      totalGames,
      activeUsers,
      totalTournaments,
      averageRating: parseFloat(averageRating?.dataValues?.avgRating || 0).toFixed(0),
      totalEarnings: parseFloat(totalEarnings?.dataValues?.totalEarnings || 0).toFixed(2)
    },
    recentGames,
    topPlayers
  });
}));

// Get user ranking
router.get('/user/:userId/ranking', asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Get user's rank
  const rank = await User.count({
    where: {
      rating: { [require('sequelize').Op.gt]: user.rating },
      games_played: { [require('sequelize').Op.gte]: 5 }
    }
  });

  // Get nearby players
  const nearbyPlayers = await User.findAll({
    attributes: ['id', 'username', 'rating', 'title'],
    where: {
      rating: {
        [require('sequelize').Op.between]: [user.rating - 50, user.rating + 50]
      },
      games_played: { [require('sequelize').Op.gte]: 5 }
    },
    order: [['rating', 'DESC']],
    limit: 10
  });

  res.json({
    user: {
      id: user.id,
      username: user.username,
      rating: user.rating,
      title: user.title,
      rank: rank + 1
    },
    nearbyPlayers
  });
}));

module.exports = router; 