const express = require('express');
const { Tournament, User, Game } = require('../models');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const Joi = require('joi');

const router = express.Router();

// Validation schemas
const createTournamentSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).optional(),
  format: Joi.string().valid('swiss', 'round_robin', 'elimination', 'blitz', 'rapid').default('swiss'),
  start_date: Joi.date().greater('now').required(),
  max_participants: Joi.number().integer().min(8).max(1000).default(64),
  time_control: Joi.number().integer().min(1).max(180).default(10),
  increment: Joi.number().integer().min(0).max(60).default(0),
  entry_fee: Joi.number().min(0).default(0),
  prize_pool: Joi.object({
    first: Joi.number().min(0).default(0),
    second: Joi.number().min(0).default(0),
    third: Joi.number().min(0).default(0),
    fourth: Joi.number().min(0).default(0),
    fifth: Joi.number().min(0).default(0)
  }).default({}),
  rating_min: Joi.number().integer().min(0).max(3000).default(0),
  rating_max: Joi.number().integer().min(0).max(3000).default(3000),
  is_public: Joi.boolean().default(true)
});

// Get all tournaments
router.get('/', asyncHandler(async (req, res) => {
  const { status, format, limit = 20, offset = 0 } = req.query;

  const whereClause = {};
  if (status) whereClause.status = status;
  if (format) whereClause.format = format;

  const tournaments = await Tournament.findAndCountAll({
    where: whereClause,
    include: [
      { model: User, as: 'organizer', attributes: ['id', 'username'] }
    ],
    order: [['start_date', 'ASC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.json({
    tournaments: tournaments.rows,
    total: tournaments.count,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
}));

// Get specific tournament
router.get('/:tournamentId', asyncHandler(async (req, res) => {
  const { tournamentId } = req.params;

  const tournament = await Tournament.findByPk(tournamentId, {
    include: [
      { model: User, as: 'organizer', attributes: ['id', 'username', 'rating'] },
      { model: Game, as: 'games', attributes: ['id', 'status', 'result', 'white_player_id', 'black_player_id'] }
    ]
  });

  if (!tournament) {
    throw new AppError('Tournament not found', 404);
  }

  res.json(tournament);
}));

// Create new tournament
router.post('/', asyncHandler(async (req, res) => {
  const { error, value } = createTournamentSchema.validate(req.body);
  if (error) {
    throw new AppError('Validation failed', 400, error.details);
  }

  const tournament = await Tournament.create({
    ...value,
    organizer_id: req.user.id,
    status: 'upcoming'
  });

  const tournamentWithOrganizer = await Tournament.findByPk(tournament.id, {
    include: [
      { model: User, as: 'organizer', attributes: ['id', 'username'] }
    ]
  });

  res.status(201).json({
    message: 'Tournament created successfully',
    tournament: tournamentWithOrganizer
  });
}));

// Register for tournament
router.post('/:tournamentId/register', asyncHandler(async (req, res) => {
  const { tournamentId } = req.params;
  const userId = req.user.id;

  const tournament = await Tournament.findByPk(tournamentId);
  if (!tournament) {
    throw new AppError('Tournament not found', 404);
  }

  if (tournament.status !== 'registration') {
    throw new AppError('Tournament registration is closed', 400);
  }

  if (tournament.current_participants >= tournament.max_participants) {
    throw new AppError('Tournament is full', 400);
  }

  // Check rating requirements
  const user = await User.findByPk(userId);
  if (user.rating < tournament.rating_min || user.rating > tournament.rating_max) {
    throw new AppError('Your rating does not meet tournament requirements', 400);
  }

  // Add participant (simplified - in real app you'd have a separate participants table)
  await tournament.addParticipant(userId);

  res.json({
    message: 'Successfully registered for tournament',
    tournament_id: tournamentId
  });
}));

// Start tournament
router.post('/:tournamentId/start', asyncHandler(async (req, res) => {
  const { tournamentId } = req.params;
  const userId = req.user.id;

  const tournament = await Tournament.findByPk(tournamentId);
  if (!tournament) {
    throw new AppError('Tournament not found', 404);
  }

  if (tournament.organizer_id !== userId) {
    throw new AppError('Only tournament organizer can start the tournament', 403);
  }

  if (tournament.status !== 'registration') {
    throw new AppError('Tournament cannot be started', 400);
  }

  await tournament.startTournament();

  res.json({
    message: 'Tournament started successfully',
    tournament_id: tournamentId
  });
}));

// Get tournament standings
router.get('/:tournamentId/standings', asyncHandler(async (req, res) => {
  const { tournamentId } = req.params;

  const tournament = await Tournament.findByPk(tournamentId);
  if (!tournament) {
    throw new AppError('Tournament not found', 404);
  }

  // This would be more complex in a real implementation
  // For now, return the stored standings
  res.json({
    tournament_id: tournamentId,
    standings: tournament.standings || []
  });
}));

// Get tournament games
router.get('/:tournamentId/games', asyncHandler(async (req, res) => {
  const { tournamentId } = req.params;
  const { limit = 20, offset = 0 } = req.query;

  const games = await Game.findAndCountAll({
    where: { tournament_id: tournamentId },
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

module.exports = router; 