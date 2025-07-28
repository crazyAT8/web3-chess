const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Tournament = sequelize.define('Tournament', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  format: {
    type: DataTypes.ENUM('swiss', 'round_robin', 'elimination', 'blitz', 'rapid'),
    defaultValue: 'swiss'
  },
  status: {
    type: DataTypes.ENUM('upcoming', 'registration', 'active', 'completed', 'cancelled'),
    defaultValue: 'upcoming'
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  registration_deadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  max_participants: {
    type: DataTypes.INTEGER,
    defaultValue: 64
  },
  min_participants: {
    type: DataTypes.INTEGER,
    defaultValue: 8
  },
  current_participants: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  time_control: {
    type: DataTypes.INTEGER, // Time in minutes
    defaultValue: 10
  },
  increment: {
    type: DataTypes.INTEGER, // Time increment in seconds
    defaultValue: 0
  },
  entry_fee: {
    type: DataTypes.DECIMAL(20, 8),
    defaultValue: 0.00
  },
  prize_pool: {
    type: DataTypes.JSONB,
    defaultValue: {
      first: 0,
      second: 0,
      third: 0,
      fourth: 0,
      fifth: 0
    }
  },
  total_prize_pool: {
    type: DataTypes.DECIMAL(20, 8),
    defaultValue: 0.00
  },
  rating_min: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  rating_max: {
    type: DataTypes.INTEGER,
    defaultValue: 3000
  },
  is_rated: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  organizer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  rules: {
    type: DataTypes.JSONB,
    defaultValue: {
      allow_draws: true,
      tiebreak_method: 'buchholz',
      pairing_system: 'swiss'
    }
  },
  standings: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  brackets: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  games: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  winners: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'tournaments',
  hooks: {
    beforeCreate: (tournament) => {
      // Calculate total prize pool
      const prizes = tournament.prize_pool || {};
      tournament.total_prize_pool = Object.values(prizes).reduce((sum, prize) => sum + parseFloat(prize || 0), 0);
    },
    beforeUpdate: (tournament) => {
      // Update total prize pool if prize_pool changed
      if (tournament.changed('prize_pool')) {
        const prizes = tournament.prize_pool || {};
        tournament.total_prize_pool = Object.values(prizes).reduce((sum, prize) => sum + parseFloat(prize || 0), 0);
      }
    }
  }
});

// Instance methods
Tournament.prototype.addParticipant = async function(userId) {
  if (this.current_participants >= this.max_participants) {
    throw new Error('Tournament is full');
  }
  
  if (this.status !== 'registration') {
    throw new Error('Tournament registration is closed');
  }
  
  this.current_participants += 1;
  await this.save();
};

Tournament.prototype.removeParticipant = async function(userId) {
  if (this.current_participants > 0) {
    this.current_participants -= 1;
    await this.save();
  }
};

Tournament.prototype.startTournament = async function() {
  if (this.current_participants < this.min_participants) {
    throw new Error(`Need at least ${this.min_participants} participants to start tournament`);
  }
  
  this.status = 'active';
  this.started_at = new Date();
  await this.save();
};

Tournament.prototype.completeTournament = async function() {
  this.status = 'completed';
  this.end_date = new Date();
  await this.save();
};

Tournament.prototype.updateStandings = async function(standings) {
  this.standings = standings;
  await this.save();
};

Tournament.prototype.addGame = async function(gameId) {
  const games = this.games || [];
  games.push(gameId);
  this.games = games;
  await this.save();
};

module.exports = Tournament; 