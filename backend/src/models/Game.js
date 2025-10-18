const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Game = sequelize.define('Game', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  white_player_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  black_player_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  game_type: {
    type: DataTypes.ENUM('blitz', 'rapid', 'classical', 'bullet'),
    defaultValue: 'rapid'
  },
  time_control: {
    type: DataTypes.INTEGER, // Time in minutes
    defaultValue: 10
  },
  increment: {
    type: DataTypes.INTEGER, // Time increment in seconds
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('pending', 'active', 'completed', 'abandoned', 'draw'),
    defaultValue: 'pending'
  },
  result: {
    type: DataTypes.ENUM('white_win', 'black_win', 'draw', 'abandoned'),
    allowNull: true
  },
  winner_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  initial_fen: {
    type: DataTypes.STRING,
    defaultValue: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
  },
  current_fen: {
    type: DataTypes.STRING,
    defaultValue: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
  },
  moves: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  move_history: {
    type: DataTypes.TEXT, // PGN format
    allowNull: true
  },
  white_time_remaining: {
    type: DataTypes.INTEGER, // Time in seconds
    allowNull: true
  },
  black_time_remaining: {
    type: DataTypes.INTEGER, // Time in seconds
    allowNull: true
  },
  current_turn: {
    type: DataTypes.ENUM('white', 'black'),
    defaultValue: 'white'
  },
  is_check: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_checkmate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_stalemate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_draw: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  draw_reason: {
    type: DataTypes.ENUM('agreement', 'insufficient_material', 'threefold_repetition', 'fifty_move_rule', 'stalemate'),
    allowNull: true
  },
  captured_pieces: {
    type: DataTypes.JSONB,
    defaultValue: { white: [], black: [] }
  },
  game_events: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  rating_change_white: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  rating_change_black: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  stake_amount: {
    type: DataTypes.DECIMAL(20, 8),
    defaultValue: 0.00
  },
  tournament_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'tournaments',
      key: 'id'
    }
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  analysis_data: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  last_move_timestamp: {
    type: DataTypes.BIGINT,
    allowNull: true
  }
}, {
  tableName: 'games',
  hooks: {
    beforeCreate: (game) => {
      // Set initial time remaining
      game.white_time_remaining = game.time_control * 60;
      game.black_time_remaining = game.time_control * 60;
    },
    beforeUpdate: (game) => {
      // Update game status based on conditions
      if (game.is_checkmate) {
        game.status = 'completed';
        game.result = game.current_turn === 'white' ? 'black_win' : 'white_win';
        game.winner_id = game.current_turn === 'white' ? game.black_player_id : game.white_player_id;
        game.completed_at = new Date();
      } else if (game.is_stalemate || game.is_draw) {
        game.status = 'completed';
        game.result = 'draw';
        game.completed_at = new Date();
      }
    }
  }
});

// Instance methods
Game.prototype.addMove = async function(move) {
  const moves = this.moves || [];
  moves.push({
    ...move,
    timestamp: new Date().toISOString(),
    turn: this.current_turn
  });
  
  this.moves = moves;
  this.current_turn = this.current_turn === 'white' ? 'black' : 'white';
  
  // Update game events
  const events = this.game_events || [];
  events.push({
    type: 'move',
    data: move,
    timestamp: new Date().toISOString()
  });
  this.game_events = events;
  
  await this.save();
};

Game.prototype.updateTime = async function(player, timeRemaining) {
  if (player === 'white') {
    this.white_time_remaining = timeRemaining;
  } else {
    this.black_time_remaining = timeRemaining;
  }
  await this.save();
};

Game.prototype.completeGame = async function(result, winnerId = null) {
  this.status = 'completed';
  this.result = result;
  this.winner_id = winnerId;
  this.completed_at = new Date();
  
  // Add completion event
  const events = this.game_events || [];
  events.push({
    type: 'game_completed',
    data: { result, winner_id: winnerId },
    timestamp: new Date().toISOString()
  });
  this.game_events = events;
  
  await this.save();
};

Game.prototype.abandonGame = async function() {
  this.status = 'abandoned';
  this.result = 'abandoned';
  this.completed_at = new Date();
  
  const events = this.game_events || [];
  events.push({
    type: 'game_abandoned',
    timestamp: new Date().toISOString()
  });
  this.game_events = events;
  
  await this.save();
};

module.exports = Game; 