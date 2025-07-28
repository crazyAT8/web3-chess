const express = require('express');
const { Game, User } = require('../models');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const Joi = require('joi');

const router = express.Router();

// Validation schemas
const createGameSchema = Joi.object({
  opponent_id: Joi.string().uuid().required(),
  game_type: Joi.string().valid('blitz', 'rapid', 'classical', 'bullet').default('rapid'),
  time_control: Joi.number().integer().min(1).max(180).default(10),
  increment: Joi.number().integer().min(0).max(60).default(0),
  stake_amount: Joi.number().min(0).default(0)
});

const makeMoveSchema = Joi.object({
  from: Joi.string().pattern(/^[a-h][1-8]$/).required(),
  to: Joi.string().pattern(/^[a-h][1-8]$/).required(),
  promotion: Joi.string().valid('q', 'r', 'b', 'n').optional()
});

// Get user's games
router.get('/', asyncHandler(async (req, res) => {
  const { status, limit = 20, offset = 0 } = req.query;
  const userId = req.user.id;

  const whereClause = {
    [require('sequelize').Op.or]: [
      { white_player_id: userId },
      { black_player_id: userId }
    ]
  };

  if (status) {
    whereClause.status = status;
  }

  const games = await Game.findAndCountAll({
    where: whereClause,
    include: [
      { model: User, as: 'whitePlayer', attributes: ['id', 'username', 'rating', 'avatar_url'] },
      { model: User, as: 'blackPlayer', attributes: ['id', 'username', 'rating', 'avatar_url'] },
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

// Get specific game
router.get('/:gameId', asyncHandler(async (req, res) => {
  const { gameId } = req.params;
  const userId = req.user.id;

  const game = await Game.findOne({
    where: {
      id: gameId,
      [require('sequelize').Op.or]: [
        { white_player_id: userId },
        { black_player_id: userId }
      ]
    },
    include: [
      { model: User, as: 'whitePlayer', attributes: ['id', 'username', 'rating', 'avatar_url'] },
      { model: User, as: 'blackPlayer', attributes: ['id', 'username', 'rating', 'avatar_url'] },
      { model: User, as: 'winner', attributes: ['id', 'username'] }
    ]
  });

  if (!game) {
    throw new AppError('Game not found', 404);
  }

  res.json(game);
}));

// Create new game
router.post('/', asyncHandler(async (req, res) => {
  const { error, value } = createGameSchema.validate(req.body);
  if (error) {
    throw new AppError('Validation failed', 400, error.details);
  }

  const { opponent_id, game_type, time_control, increment, stake_amount } = value;
  const userId = req.user.id;

  // Check if opponent exists
  const opponent = await User.findByPk(opponent_id);
  if (!opponent) {
    throw new AppError('Opponent not found', 404);
  }

  // Check if opponent is not the same user
  if (opponent_id === userId) {
    throw new AppError('Cannot play against yourself', 400);
  }

  // Check if opponent is online
  if (!opponent.is_online) {
    throw new AppError('Opponent is not online', 400);
  }

  // Randomly assign colors
  const isWhite = Math.random() < 0.5;
  const white_player_id = isWhite ? userId : opponent_id;
  const black_player_id = isWhite ? opponent_id : userId;

  const game = await Game.create({
    white_player_id,
    black_player_id,
    game_type,
    time_control,
    increment,
    stake_amount,
    status: 'pending'
  });

  const gameWithPlayers = await Game.findByPk(game.id, {
    include: [
      { model: User, as: 'whitePlayer', attributes: ['id', 'username', 'rating', 'avatar_url'] },
      { model: User, as: 'blackPlayer', attributes: ['id', 'username', 'rating', 'avatar_url'] }
    ]
  });

  res.status(201).json({
    message: 'Game created successfully',
    game: gameWithPlayers
  });
}));

// Accept game invitation
router.post('/:gameId/accept', asyncHandler(async (req, res) => {
  const { gameId } = req.params;
  const userId = req.user.id;

  const game = await Game.findOne({
    where: {
      id: gameId,
      status: 'pending',
      [require('sequelize').Op.or]: [
        { white_player_id: userId },
        { black_player_id: userId }
      ]
    }
  });

  if (!game) {
    throw new AppError('Game not found or already started', 404);
  }

  game.status = 'active';
  game.started_at = new Date();
  await game.save();

  const gameWithPlayers = await Game.findByPk(game.id, {
    include: [
      { model: User, as: 'whitePlayer', attributes: ['id', 'username', 'rating', 'avatar_url'] },
      { model: User, as: 'blackPlayer', attributes: ['id', 'username', 'rating', 'avatar_url'] }
    ]
  });

  res.json({
    message: 'Game accepted and started',
    game: gameWithPlayers
  });
}));

// Make a move
router.post('/:gameId/move', asyncHandler(async (req, res) => {
  const { gameId } = req.params;
  const { error, value } = makeMoveSchema.validate(req.body);
  if (error) {
    throw new AppError('Validation failed', 400, error.details);
  }

  const { from, to, promotion } = value;
  const userId = req.user.id;

  const game = await Game.findByPk(gameId, {
    include: [
      { model: User, as: 'whitePlayer', attributes: ['id', 'username', 'rating'] },
      { model: User, as: 'blackPlayer', attributes: ['id', 'username', 'rating'] }
    ]
  });

  if (!game) {
    throw new AppError('Game not found', 404);
  }

  if (game.status !== 'active') {
    throw new AppError('Game is not active', 400);
  }

  // Check if it's the user's turn
  const isWhitePlayer = game.white_player_id === userId;
  const isBlackPlayer = game.black_player_id === userId;
  
  if (!isWhitePlayer && !isBlackPlayer) {
    throw new AppError('You are not a player in this game', 403);
  }

  const expectedTurn = isWhitePlayer ? 'white' : 'black';
  if (game.current_turn !== expectedTurn) {
    throw new AppError('Not your turn', 400);
  }

  // Here you would implement chess move validation
  // For now, we'll accept any move
  const move = {
    from,
    to,
    promotion,
    piece: 'p', // This would be determined by the chess logic
    san: `${from}-${to}${promotion ? `=${promotion.toUpperCase()}` : ''}`,
    timestamp: new Date().toISOString()
  };

  await game.addMove(move);

  // Update current FEN (this would be calculated by chess logic)
  // For now, we'll just update the turn
  game.current_turn = game.current_turn === 'white' ? 'black' : 'white';

  // Check for game end conditions (simplified)
  // In a real implementation, you'd use a chess engine
  if (game.moves.length > 50) {
    // Simple draw condition for demonstration
    game.status = 'completed';
    game.result = 'draw';
    game.is_draw = true;
    game.completed_at = new Date();
  }

  await game.save();

  const updatedGame = await Game.findByPk(gameId, {
    include: [
      { model: User, as: 'whitePlayer', attributes: ['id', 'username', 'rating', 'avatar_url'] },
      { model: User, as: 'blackPlayer', attributes: ['id', 'username', 'rating', 'avatar_url'] },
      { model: User, as: 'winner', attributes: ['id', 'username'] }
    ]
  });

  res.json({
    message: 'Move made successfully',
    move,
    game: updatedGame
  });
}));

// Resign game
router.post('/:gameId/resign', asyncHandler(async (req, res) => {
  const { gameId } = req.params;
  const userId = req.user.id;

  const game = await Game.findByPk(gameId, {
    include: [
      { model: User, as: 'whitePlayer', attributes: ['id', 'username', 'rating'] },
      { model: User, as: 'blackPlayer', attributes: ['id', 'username', 'rating'] }
    ]
  });

  if (!game) {
    throw new AppError('Game not found', 404);
  }

  if (game.status !== 'active') {
    throw new AppError('Game is not active', 400);
  }

  const isWhitePlayer = game.white_player_id === userId;
  const isBlackPlayer = game.black_player_id === userId;
  
  if (!isWhitePlayer && !isBlackPlayer) {
    throw new AppError('You are not a player in this game', 403);
  }

  // Determine winner
  const winner = isWhitePlayer ? game.black_player_id : game.white_player_id;
  const result = isWhitePlayer ? 'black_win' : 'white_win';

  await game.completeGame(result, winner);

  // Update player stats
  const winnerUser = await User.findByPk(winner);
  const loserUser = await User.findByPk(userId);

  if (winnerUser) {
    await winnerUser.updateStats('win');
  }
  if (loserUser) {
    await loserUser.updateStats('loss');
  }

  const updatedGame = await Game.findByPk(gameId, {
    include: [
      { model: User, as: 'whitePlayer', attributes: ['id', 'username', 'rating', 'avatar_url'] },
      { model: User, as: 'blackPlayer', attributes: ['id', 'username', 'rating', 'avatar_url'] },
      { model: User, as: 'winner', attributes: ['id', 'username'] }
    ]
  });

  res.json({
    message: 'Game resigned',
    game: updatedGame
  });
}));

// Offer draw
router.post('/:gameId/draw-offer', asyncHandler(async (req, res) => {
  const { gameId } = req.params;
  const userId = req.user.id;

  const game = await Game.findByPk(gameId);

  if (!game || game.status !== 'active') {
    throw new AppError('Game not found or not active', 404);
  }

  const isPlayer = game.white_player_id === userId || game.black_player_id === userId;
  if (!isPlayer) {
    throw new AppError('You are not a player in this game', 403);
  }

  // Add draw offer to game events
  const events = game.game_events || [];
  events.push({
    type: 'draw_offered',
    player_id: userId,
    timestamp: new Date().toISOString()
  });
  game.game_events = events;
  await game.save();

  res.json({
    message: 'Draw offer sent',
    game_id: gameId
  });
}));

// Accept/decline draw offer
router.post('/:gameId/draw-response', asyncHandler(async (req, res) => {
  const { gameId } = req.params;
  const { accept } = req.body;
  const userId = req.user.id;

  const game = await Game.findByPk(gameId);

  if (!game || game.status !== 'active') {
    throw new AppError('Game not found or not active', 404);
  }

  const isPlayer = game.white_player_id === userId || game.black_player_id === userId;
  if (!isPlayer) {
    throw new AppError('You are not a player in this game', 403);
  }

  if (accept) {
    await game.completeGame('draw');
    
    // Update both players' stats
    const whitePlayer = await User.findByPk(game.white_player_id);
    const blackPlayer = await User.findByPk(game.black_player_id);

    if (whitePlayer) await whitePlayer.updateStats('draw');
    if (blackPlayer) await blackPlayer.updateStats('draw');
  }

  const updatedGame = await Game.findByPk(gameId, {
    include: [
      { model: User, as: 'whitePlayer', attributes: ['id', 'username', 'rating', 'avatar_url'] },
      { model: User, as: 'blackPlayer', attributes: ['id', 'username', 'rating', 'avatar_url'] },
      { model: User, as: 'winner', attributes: ['id', 'username'] }
    ]
  });

  res.json({
    message: accept ? 'Draw accepted' : 'Draw declined',
    game: updatedGame
  });
}));

module.exports = router; 