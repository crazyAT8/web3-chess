const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const NFT = sequelize.define('NFT', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  token_id: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  contract_address: {
    type: DataTypes.STRING(42),
    allowNull: false,
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/
    }
  },
  owner_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  creator_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  nft_type: {
    type: DataTypes.ENUM('piece', 'avatar', 'board', 'collection'),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  animation_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  external_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  rarity: {
    type: DataTypes.ENUM('common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'),
    defaultValue: 'common'
  },
  attributes: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  stats: {
    type: DataTypes.JSONB,
    defaultValue: {
      attack: 0,
      defense: 0,
      speed: 0,
      intelligence: 0
    }
  },
  abilities: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  is_tradeable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_staked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  staked_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  staking_rewards: {
    type: DataTypes.DECIMAL(20, 8),
    defaultValue: 0.00
  },
  mint_price: {
    type: DataTypes.DECIMAL(20, 8),
    defaultValue: 0.00
  },
  current_price: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: true
  },
  last_sale_price: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: true
  },
  last_sale_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  transaction_hash: {
    type: DataTypes.STRING(66),
    allowNull: true
  },
  block_number: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  network: {
    type: DataTypes.ENUM('ethereum', 'polygon', 'sepolia', 'mumbai'),
    defaultValue: 'ethereum'
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  collection_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  edition_number: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  total_editions: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'nfts',
  hooks: {
    beforeCreate: (nft) => {
      // Generate token ID if not provided
      if (!nft.token_id) {
        nft.token_id = `${nft.contract_address}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
    }
  }
});

// Instance methods
NFT.prototype.updatePrice = async function(newPrice) {
  this.current_price = newPrice;
  await this.save();
};

NFT.prototype.recordSale = async function(salePrice) {
  this.last_sale_price = salePrice;
  this.last_sale_date = new Date();
  await this.save();
};

NFT.prototype.stake = async function() {
  this.is_staked = true;
  this.staked_at = new Date();
  await this.save();
};

NFT.prototype.unstake = async function() {
  this.is_staked = false;
  this.staked_at = null;
  await this.save();
};

NFT.prototype.addReward = async function(amount) {
  this.staking_rewards += parseFloat(amount);
  await this.save();
};

NFT.prototype.transferOwnership = async function(newOwnerId) {
  this.owner_id = newOwnerId;
  await this.save();
};

module.exports = NFT; 