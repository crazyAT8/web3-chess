const { Chess } = require('chess.js');

class ChessGame {
  constructor(fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1') {
    this.chess = new Chess(fen);
  }

  // Get current FEN
  getFEN() {
    return this.chess.fen();
  }

  // Get current position as PGN
  getPGN() {
    return this.chess.pgn();
  }

  // Check if game is over
  isGameOver() {
    return this.chess.isGameOver();
  }

  // Check if in check
  inCheck() {
    return this.chess.inCheck();
  }

  // Check if in checkmate
  inCheckmate() {
    return this.chess.isCheckmate();
  }

  // Check if in stalemate
  inStalemate() {
    return this.chess.isStalemate();
  }

  // Check if in draw
  inDraw() {
    return this.chess.isDraw();
  }

  // Get current turn
  getTurn() {
    return this.chess.turn();
  }

  // Get valid moves for a square
  getMoves(square) {
    return this.chess.moves({ square, verbose: true });
  }

  // Get all valid moves
  getAllMoves() {
    return this.chess.moves({ verbose: true });
  }

  // Make a move
  makeMove(move) {
    try {
      const result = this.chess.move(move);
      if (result) {
        return {
          success: true,
          move: result,
          fen: this.chess.fen(),
          pgn: this.chess.pgn(),
          isGameOver: this.isGameOver(),
          inCheck: this.inCheck(),
          inCheckmate: this.inCheckmate(),
          inStalemate: this.inStalemate(),
          inDraw: this.inDraw(),
          turn: this.getTurn()
        };
      } else {
        return {
          success: false,
          error: 'Invalid move'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Validate a move without making it
  validateMove(move) {
    try {
      const moves = this.chess.moves({ verbose: true });
      return moves.some(m => m.from === move.from && m.to === move.to && 
        (!move.promotion || m.promotion === move.promotion));
    } catch (error) {
      return false;
    }
  }

  // Get game result
  getResult() {
    if (this.inCheckmate()) {
      return this.getTurn() === 'w' ? 'black_win' : 'white_win';
    } else if (this.inStalemate() || this.inDraw()) {
      return 'draw';
    }
    return null;
  }

  // Get board as array
  getBoard() {
    return this.chess.board();
  }

  // Get captured pieces
  getCapturedPieces() {
    const history = this.chess.history({ verbose: true });
    const captured = { white: [], black: [] };
    
    history.forEach(move => {
      if (move.captured) {
        const piece = {
          type: move.captured,
          color: move.color === 'w' ? 'white' : 'black'
        };
        captured[piece.color].push(piece);
      }
    });
    
    return captured;
  }

  // Get move history
  getMoveHistory() {
    return this.chess.history({ verbose: true });
  }

  // Load game from FEN
  loadFEN(fen) {
    try {
      this.chess.load(fen);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Load game from PGN
  loadPGN(pgn) {
    try {
      this.chess.loadPgn(pgn);
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = ChessGame;
