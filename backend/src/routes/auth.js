const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { ethers } = require('ethers');
const { User } = require('../models');
const { verifyWalletSignature, authRateLimit } = require('../middleware/auth');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const Joi = require('joi');

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit(authRateLimit);

// Validation schemas
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(50).required(),
  wallet_address: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
  email: Joi.string().email().optional()
});

const loginSchema = Joi.object({
  wallet_address: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
  signature: Joi.string().required(),
  message: Joi.string().required()
});

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Get nonce for wallet authentication
router.get('/nonce/:wallet_address', authLimiter, asyncHandler(async (req, res) => {
  const { wallet_address } = req.params;
  
  if (!ethers.isAddress(wallet_address)) {
    throw new AppError('Invalid wallet address', 400);
  }

  let user = await User.findOne({ 
    where: { wallet_address: wallet_address.toLowerCase() } 
  });

  if (!user) {
    // Create new user with default username
    const defaultUsername = `Player_${wallet_address.slice(2, 8)}`;
    user = await User.create({
      username: defaultUsername,
      wallet_address: wallet_address.toLowerCase()
    });
  }

  const nonce = await user.generateNonce();
  const message = `Sign this message to authenticate with ChessFi. Nonce: ${nonce}`;

  res.json({
    nonce,
    message,
    user_exists: !!user.username
  });
}));

// Register new user
router.post('/register', authLimiter, asyncHandler(async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    throw new AppError('Validation failed', 400, error.details);
  }

  const { username, wallet_address, email } = value;

  // Check if username is available
  const existingUsername = await User.findOne({ where: { username } });
  if (existingUsername) {
    throw new AppError('Username already taken', 409);
  }

  // Check if wallet is already registered
  const existingWallet = await User.findOne({ 
    where: { wallet_address: wallet_address.toLowerCase() } 
  });
  
  if (existingWallet) {
    throw new AppError('Wallet already registered', 409);
  }

  // Create new user
  const user = await User.create({
    username,
    wallet_address: wallet_address.toLowerCase(),
    email: email || null
  });

  const token = generateToken(user.id);

  res.status(201).json({
    message: 'User registered successfully',
    user: {
      id: user.id,
      username: user.username,
      wallet_address: user.wallet_address,
      rating: user.rating,
      title: user.title
    },
    token
  });
}));

// Login with wallet signature
router.post('/login', authLimiter, verifyWalletSignature, asyncHandler(async (req, res) => {
  const user = req.user;

  // Update last seen
  user.last_seen = new Date();
  user.is_online = true;
  await user.save();

  // Generate new nonce for next login
  await user.generateNonce();

  const token = generateToken(user.id);

  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      username: user.username,
      wallet_address: user.wallet_address,
      rating: user.rating,
      title: user.title,
      games_played: user.games_played,
      win_rate: user.win_rate,
      rank: user.rank
    },
    token
  });
}));

// Verify token
router.get('/verify', asyncHandler(async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new AppError('No token provided', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.is_banned) {
      throw new AppError('Account is banned', 403);
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        username: user.username,
        wallet_address: user.wallet_address,
        rating: user.rating,
        title: user.title,
        games_played: user.games_played,
        win_rate: user.win_rate,
        rank: user.rank
      }
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Token expired', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid token', 401);
    }
    throw error;
  }
}));

// Refresh token
router.post('/refresh', authLimiter, asyncHandler(async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new AppError('No token provided', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.is_banned) {
      throw new AppError('Account is banned', 403);
    }

    const newToken = generateToken(user.id);

    res.json({
      message: 'Token refreshed successfully',
      token: newToken
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Token expired', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid token', 401);
    }
    throw error;
  }
}));

// Logout (client-side token removal, but we can track it)
router.post('/logout', asyncHandler(async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId);
      
      if (user) {
        user.is_online = false;
        await user.save();
      }
    } catch (error) {
      // Token might be expired, but that's okay for logout
    }
  }

  res.json({ message: 'Logout successful' });
}));

// Update user profile
router.put('/profile', authLimiter, asyncHandler(async (req, res) => {
  const { username, email, avatar_url, preferences } = req.body;
  const user = req.user;

  // Validate username if provided
  if (username && username !== user.username) {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      throw new AppError('Username already taken', 409);
    }
    
    if (!/^[a-zA-Z0-9_]{3,50}$/.test(username)) {
      throw new AppError('Username must be 3-50 characters and contain only letters, numbers, and underscores', 400);
    }
  }

  // Update user fields
  if (username) user.username = username;
  if (email !== undefined) user.email = email;
  if (avatar_url !== undefined) user.avatar_url = avatar_url;
  if (preferences) {
    user.preferences = { ...user.preferences, ...preferences };
  }

  await user.save();

  res.json({
    message: 'Profile updated successfully',
    user: {
      id: user.id,
      username: user.username,
      wallet_address: user.wallet_address,
      email: user.email,
      avatar_url: user.avatar_url,
      preferences: user.preferences,
      rating: user.rating,
      title: user.title
    }
  });
}));

module.exports = router; 