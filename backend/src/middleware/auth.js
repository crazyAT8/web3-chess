const { ethers } = require('ethers');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Rate limiting configuration for auth endpoints
const authRateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
};

// Verify wallet signature middleware
const verifyWalletSignature = async (req, res, next) => {
  try {
    const { wallet_address, signature, message } = req.body;
    
    if (!wallet_address || !signature || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Recover the address from the signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    
    // Check if the recovered address matches the provided wallet address
    if (recoveredAddress.toLowerCase() !== wallet_address.toLowerCase()) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Look up the user by wallet address
    const user = await User.findOne({ 
      where: { wallet_address: wallet_address.toLowerCase() } 
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is banned
    if (user.is_banned) {
      return res.status(403).json({ error: 'Account is banned' });
    }

    // Set the user in the request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Signature verification error:', error);
    return res.status(401).json({ error: 'Signature verification failed' });
  }
};

// JWT authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch the user from the database
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is banned
    if (user.is_banned) {
      return res.status(403).json({ error: 'Account is banned' });
    }

    // Set the user in the request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

module.exports = {
  verifyWalletSignature,
  authRateLimit,
  authenticateToken
}; 