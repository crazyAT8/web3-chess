const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
    validate: {
      len: [3, 50],
      is: /^[a-zA-Z0-9_]+$/
    }
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  wallet_address: {
    type: DataTypes.STRING(42),
    unique: true,
    allowNull: false,
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/
    }
  },
  nonce: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: () => Math.floor(Math.random() * 1000000).toString()
  },
  avatar_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  rating: {
    type: DataTypes.INTEGER,
    defaultValue: 1200,
    validate: {
      min: 0,
      max: 3000
    }
  },
  games_played: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  games_won: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  games_drawn: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  games_lost: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  win_rate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
    get() {
      const total = this.games_played;
      return total > 0 ? ((this.games_won / total) * 100).toFixed(2) : 0.00;
    }
  },
  rank: {
    type: DataTypes.INTEGER,
    defaultValue: null
  },
  title: {
    type: DataTypes.ENUM('Novice', 'Amateur', 'Expert', 'Master', 'Grandmaster'),
    defaultValue: 'Novice'
  },
  total_earnings: {
    type: DataTypes.DECIMAL(20, 8),
    defaultValue: 0.00
  },
  is_online: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  last_seen: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  preferences: {
    type: DataTypes.JSONB,
    defaultValue: {
      theme: 'dark',
      sound_enabled: true,
      notifications_enabled: true,
      auto_accept_challenges: false
    }
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_banned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  ban_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      // Generate nonce for wallet authentication
      user.nonce = Math.floor(Math.random() * 1000000).toString();
    },
    beforeUpdate: async (user) => {
      // Update win rate when games change
      if (user.changed('games_won') || user.changed('games_played')) {
        const total = user.games_played;
        user.win_rate = total > 0 ? ((user.games_won / total) * 100) : 0;
      }
    }
  }
});

// Instance methods
User.prototype.updateStats = async function(gameResult) {
  this.games_played += 1;
  
  switch (gameResult) {
    case 'win':
      this.games_won += 1;
      break;
    case 'draw':
      this.games_drawn += 1;
      break;
    case 'loss':
      this.games_lost += 1;
      break;
  }
  
  await this.save();
};

User.prototype.updateRating = async function(newRating) {
  this.rating = Math.max(0, Math.min(3000, newRating));
  
  // Update title based on rating
  if (this.rating >= 2500) this.title = 'Grandmaster';
  else if (this.rating >= 2200) this.title = 'Master';
  else if (this.rating >= 1800) this.title = 'Expert';
  else if (this.rating >= 1400) this.title = 'Amateur';
  else this.title = 'Novice';
  
  await this.save();
};

User.prototype.generateNonce = async function() {
  this.nonce = Math.floor(Math.random() * 1000000).toString();
  await this.save();
  return this.nonce;
};

module.exports = User; 