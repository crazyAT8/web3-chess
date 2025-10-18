const express = require('express');
const router = express.Router();
const ChessGame = require('../utils/chess');

// Validate a move using chess.js engine
router.post('/validate-move', (req, res) => {
  try {
    const { fen, move } = req.body;
    
    if (!fen || !move) {
      return res.status(400).json({
        valid: false,
        error: 'Missing FEN or move data'
      });
    }

    // Create chess game instance with the given FEN
    const chessGame = new ChessGame(fen);
    
    // Validate the move
    const isValid = chessGame.validateMove(move);
    
    if (isValid) {
      res.json({
        valid: true,
        fen: chessGame.getFEN(),
        inCheck: chessGame.inCheck(),
        inCheckmate: chessGame.inCheckmate(),
        inStalemate: chessGame.inStalemate(),
        inDraw: chessGame.inDraw(),
        isGameOver: chessGame.isGameOver()
      });
    } else {
      res.json({
        valid: false,
        error: 'Invalid move'
      });
    }
  } catch (error) {
    console.error('Move validation error:', error);
    res.status(500).json({
      valid: false,
      error: 'Internal server error during move validation'
    });
  }
});

// Get all valid moves for a position
router.post('/valid-moves', (req, res) => {
  try {
    const { fen, square } = req.body;
    
    if (!fen) {
      return res.status(400).json({
        error: 'Missing FEN data'
      });
    }

    const chessGame = new ChessGame(fen);
    const moves = square ? chessGame.getMoves(square) : chessGame.getAllMoves();
    
    res.json({
      moves: moves,
      fen: chessGame.getFEN(),
      inCheck: chessGame.inCheck(),
      inCheckmate: chessGame.inCheckmate(),
      inStalemate: chessGame.inStalemate(),
      inDraw: chessGame.inDraw(),
      isGameOver: chessGame.isGameOver()
    });
  } catch (error) {
    console.error('Valid moves error:', error);
    res.status(500).json({
      error: 'Internal server error during move generation'
    });
  }
});

// Make a move and return the new position
router.post('/make-move', (req, res) => {
  try {
    const { fen, move } = req.body;
    
    if (!fen || !move) {
      return res.status(400).json({
        success: false,
        error: 'Missing FEN or move data'
      });
    }

    const chessGame = new ChessGame(fen);
    const result = chessGame.makeMove(move);
    
    res.json(result);
  } catch (error) {
    console.error('Make move error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during move execution'
    });
  }
});

module.exports = router;
