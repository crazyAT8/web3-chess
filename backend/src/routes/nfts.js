const express = require('express');
const { NFT, User } = require('../models');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const Joi = require('joi');

const router = express.Router();

// Validation schemas
const createNFTSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).optional(),
  nft_type: Joi.string().valid('piece', 'avatar', 'board', 'collection').required(),
  rarity: Joi.string().valid('common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic').default('common'),
  attributes: Joi.array().items(Joi.object()).default([]),
  stats: Joi.object({
    attack: Joi.number().min(0).max(100).default(0),
    defense: Joi.number().min(0).max(100).default(0),
    speed: Joi.number().min(0).max(100).default(0),
    intelligence: Joi.number().min(0).max(100).default(0)
  }).default({}),
  abilities: Joi.array().items(Joi.string()).default([]),
  mint_price: Joi.number().min(0).default(0),
  network: Joi.string().valid('ethereum', 'polygon', 'sepolia', 'mumbai').default('ethereum')
});

// Get user's NFTs
router.get('/my', asyncHandler(async (req, res) => {
  const { type, rarity, limit = 20, offset = 0 } = req.query;
  const userId = req.user.id;

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

// Get all NFTs (marketplace)
router.get('/marketplace', asyncHandler(async (req, res) => {
  const { type, rarity, min_price, max_price, limit = 20, offset = 0 } = req.query;

  const whereClause = { is_tradeable: true };
  
  if (type) whereClause.nft_type = type;
  if (rarity) whereClause.rarity = rarity;
  if (min_price) whereClause.current_price = { [require('sequelize').Op.gte]: parseFloat(min_price) };
  if (max_price) {
    whereClause.current_price = {
      ...whereClause.current_price,
      [require('sequelize').Op.lte]: parseFloat(max_price)
    };
  }

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

// Get specific NFT
router.get('/:nftId', asyncHandler(async (req, res) => {
  const { nftId } = req.params;

  const nft = await NFT.findByPk(nftId, {
    include: [
      { model: User, as: 'owner', attributes: ['id', 'username', 'avatar_url'] },
      { model: User, as: 'creator', attributes: ['id', 'username', 'avatar_url'] }
    ]
  });

  if (!nft) {
    throw new AppError('NFT not found', 404);
  }

  res.json(nft);
}));

// Create new NFT (mint)
router.post('/mint', asyncHandler(async (req, res) => {
  const { error, value } = createNFTSchema.validate(req.body);
  if (error) {
    throw new AppError('Validation failed', 400, error.details);
  }

  const userId = req.user.id;

  // Generate token ID
  const tokenId = `${value.network}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const nft = await NFT.create({
    ...value,
    token_id: tokenId,
    contract_address: '0x0000000000000000000000000000000000000000', // Placeholder
    owner_id: userId,
    creator_id: userId,
    current_price: value.mint_price
  });

  const nftWithDetails = await NFT.findByPk(nft.id, {
    include: [
      { model: User, as: 'owner', attributes: ['id', 'username'] },
      { model: User, as: 'creator', attributes: ['id', 'username'] }
    ]
  });

  res.status(201).json({
    message: 'NFT minted successfully',
    nft: nftWithDetails
  });
}));

// Update NFT price
router.put('/:nftId/price', asyncHandler(async (req, res) => {
  const { nftId } = req.params;
  const { price } = req.body;
  const userId = req.user.id;

  if (!price || price < 0) {
    throw new AppError('Invalid price', 400);
  }

  const nft = await NFT.findByPk(nftId);
  if (!nft) {
    throw new AppError('NFT not found', 404);
  }

  if (nft.owner_id !== userId) {
    throw new AppError('You do not own this NFT', 403);
  }

  nft.current_price = price;
  await nft.save();

  res.json({
    message: 'NFT price updated successfully',
    nft
  });
}));

// Stake NFT
router.post('/:nftId/stake', asyncHandler(async (req, res) => {
  const { nftId } = req.params;
  const userId = req.user.id;

  const nft = await NFT.findByPk(nftId);
  if (!nft) {
    throw new AppError('NFT not found', 404);
  }

  if (nft.owner_id !== userId) {
    throw new AppError('You do not own this NFT', 403);
  }

  if (nft.is_staked) {
    throw new AppError('NFT is already staked', 400);
  }

  await nft.stake();

  res.json({
    message: 'NFT staked successfully',
    nft
  });
}));

// Unstake NFT
router.post('/:nftId/unstake', asyncHandler(async (req, res) => {
  const { nftId } = req.params;
  const userId = req.user.id;

  const nft = await NFT.findByPk(nftId);
  if (!nft) {
    throw new AppError('NFT not found', 404);
  }

  if (nft.owner_id !== userId) {
    throw new AppError('You do not own this NFT', 403);
  }

  if (!nft.is_staked) {
    throw new AppError('NFT is not staked', 400);
  }

  await nft.unstake();

  res.json({
    message: 'NFT unstaked successfully',
    nft
  });
}));

// Claim staking rewards
router.post('/:nftId/claim-rewards', asyncHandler(async (req, res) => {
  const { nftId } = req.params;
  const userId = req.user.id;

  const nft = await NFT.findByPk(nftId);
  if (!nft) {
    throw new AppError('NFT not found', 404);
  }

  if (nft.owner_id !== userId) {
    throw new AppError('You do not own this NFT', 403);
  }

  if (!nft.is_staked) {
    throw new AppError('NFT is not staked', 400);
  }

  if (nft.staking_rewards <= 0) {
    throw new AppError('No rewards to claim', 400);
  }

  const rewards = nft.staking_rewards;
  nft.staking_rewards = 0;
  await nft.save();

  // Update user's total earnings
  const user = await User.findByPk(userId);
  user.total_earnings += rewards;
  await user.save();

  res.json({
    message: 'Rewards claimed successfully',
    rewards,
    nft
  });
}));

// Get NFT statistics
router.get('/stats/overview', asyncHandler(async (req, res) => {
  const [
    totalNFTs,
    totalOwners,
    totalVolume,
    averagePrice,
    stakedNFTs
  ] = await Promise.all([
    NFT.count(),
    NFT.count({ distinct: true, col: 'owner_id' }),
    NFT.findOne({
      attributes: [[require('sequelize').fn('SUM', require('sequelize').col('last_sale_price')), 'totalVolume']],
      where: { last_sale_price: { [require('sequelize').Op.gt]: 0 } }
    }),
    NFT.findOne({
      attributes: [[require('sequelize').fn('AVG', require('sequelize').col('current_price')), 'avgPrice']],
      where: { current_price: { [require('sequelize').Op.gt]: 0 } }
    }),
    NFT.count({ where: { is_staked: true } })
  ]);

  // Get recent sales
  const recentSales = await NFT.findAll({
    where: { last_sale_price: { [require('sequelize').Op.gt]: 0 } },
    include: [
      { model: User, as: 'owner', attributes: ['username'] }
    ],
    order: [['last_sale_date', 'DESC']],
    limit: 5
  });

  res.json({
    stats: {
      totalNFTs,
      totalOwners,
      totalVolume: parseFloat(totalVolume?.dataValues?.totalVolume || 0).toFixed(2),
      averagePrice: parseFloat(averagePrice?.dataValues?.avgPrice || 0).toFixed(2),
      stakedNFTs
    },
    recentSales
  });
}));

module.exports = router; 