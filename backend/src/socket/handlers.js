const jwt = require('jsonwebtoken');
const { User, Game } = require('../models');
const ChessGame = require('../utils/chess');

// Store active connections
const activeConnections = new Map(); // userId -> socket
const gameRooms = new Map(); // gameId -> Set of socketIds
const userRooms = new Map(); // userId -> Set of gameIds

const setupSocketHandlers = (io) => {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      // For demo purposes, allow demo token
      if (token === 'demo-token') {
        socket.userId = 'demo-user-1';
        socket.user = { 
          id: 'demo-user-1', 
          username: 'DemoPlayer1',
          is_banned: false 
        };
        return next();
      }
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId);
      
      if (!user || user.is_banned) {
        return next(new Error('User not found or banned'));
      }

      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (error) {
      console.log('Auth error:', error.message);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.username} connected: ${socket.id}`);

    // Store connection
    activeConnections.set(socket.userId, socket);

    // Update user online status
    socket.user.is_online = true;
    socket.user.last_seen = new Date();
    socket.user.save();

    // Join user to their personal room for notifications
    socket.join(`user:${socket.userId}`);

    // Handle joining a game room
    socket.on('join-game', async (gameId) => {
      try {
        const game = await Game.findByPk(gameId, {
          include: [
            { model: User, as: 'whitePlayer', attributes: ['id', 'username'] },
            { model: User, as: 'blackPlayer', attributes: ['id', 'username'] }
          ]
        });

        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        // Check if user is a player in this game
        const isPlayer = game.white_player_id === socket.userId || game.black_player_id === socket.userId;
        if (!isPlayer) {
          socket.emit('error', { message: 'You are not a player in this game' });
          return;
        }

        // Join game room
        socket.join(`game:${gameId}`);
        
        // Track user's game rooms
        if (!userRooms.has(socket.userId)) {
          userRooms.set(socket.userId, new Set());
        }
        userRooms.get(socket.userId).add(gameId);

        // Track game room participants
        if (!gameRooms.has(gameId)) {
          gameRooms.set(gameId, new Set());
        }
        gameRooms.get(gameId).add(socket.id);

        // Notify other players in the game
        socket.to(`game:${gameId}`).emit('player-joined', {
          userId: socket.userId,
          username: socket.user.username,
          timestamp: new Date().toISOString()
        });

        // Send current game state to the joining player
        socket.emit('game-state', {
          game,
          players: {
            white: game.whitePlayer,
            black: game.blackPlayer
          }
        });

        console.log(`User ${socket.user.username} joined game ${gameId}`);
      } catch (error) {
        console.error('Error joining game:', error);
        socket.emit('error', { message: 'Failed to join game' });
      }
    });

    // Handle leaving a game room
    socket.on('leave-game', (gameId) => {
      socket.leave(`game:${gameId}`);
      
      // Remove from tracking
      if (userRooms.has(socket.userId)) {
        userRooms.get(socket.userId).delete(gameId);
      }
      
      if (gameRooms.has(gameId)) {
        gameRooms.get(gameId).delete(socket.id);
        if (gameRooms.get(gameId).size === 0) {
          gameRooms.delete(gameId);
        }
      }

      socket.to(`game:${gameId}`).emit('player-left', {
        userId: socket.userId,
        username: socket.user.username,
        timestamp: new Date().toISOString()
      });

      console.log(`User ${socket.user.username} left game ${gameId}`);
    });

    // Handle making a move
    socket.on('make-move', async (data) => {
      try {
        const { gameId, move } = data;
        
        const game = await Game.findByPk(gameId);
        if (!game || game.status !== 'active') {
          socket.emit('error', { message: 'Game not found or not active' });
          return;
        }

        // Check if it's the user's turn
        const isWhitePlayer = game.white_player_id === socket.userId;
        const isBlackPlayer = game.black_player_id === socket.userId;
        
        if (!isWhitePlayer && !isBlackPlayer) {
          socket.emit('error', { message: 'You are not a player in this game' });
          return;
        }

        const expectedTurn = isWhitePlayer ? 'white' : 'black';
        if (game.current_turn !== expectedTurn) {
          socket.emit('error', { message: 'Not your turn' });
          return;
        }

        // Initialize chess game with current FEN
        const chessGame = new ChessGame(game.current_fen || undefined);
        
        // Validate the move
        const moveObj = {
          from: move.from,
          to: move.to,
          promotion: move.promotion || undefined
        };

        if (!chessGame.validateMove(moveObj)) {
          socket.emit('error', { message: 'Invalid move' });
          return;
        }

        // Make the move
        const moveResult = chessGame.makeMove(moveObj);
        
        if (!moveResult.success) {
          socket.emit('error', { message: moveResult.error || 'Invalid move' });
          return;
        }

        // Create move record
        const moveRecord = {
          from: move.from,
          to: move.to,
          promotion: move.promotion,
          piece: moveResult.move.piece,
          san: moveResult.move.san,
          timestamp: new Date().toISOString(),
          fen: moveResult.fen
        };

        // Add move to game
        await game.addMove(moveRecord);
        
        // Update game state
        game.current_fen = moveResult.fen;
        game.current_turn = moveResult.turn === 'w' ? 'white' : 'black';

        // Check for game end conditions
        if (moveResult.isGameOver) {
          game.status = 'completed';
          game.completed_at = new Date();
          
          if (moveResult.inCheckmate) {
            game.result = moveResult.turn === 'w' ? 'black_win' : 'white_win';
            game.winner_id = moveResult.turn === 'w' ? game.black_player_id : game.white_player_id;
          } else if (moveResult.inStalemate || moveResult.inDraw) {
            game.result = 'draw';
            game.is_draw = true;
          }
        }

        await game.save();

        // Broadcast move to all players in the game
        io.to(`game:${gameId}`).emit('move-made', {
          move: moveRecord,
          player: socket.userId,
          username: socket.user.username,
          timestamp: new Date().toISOString(),
          gameState: {
            currentTurn: game.current_turn,
            currentFen: game.current_fen,
            moves: game.moves,
            status: game.status,
            result: game.result,
            isCheck: moveResult.inCheck,
            isCheckmate: moveResult.inCheckmate,
            isStalemate: moveResult.inStalemate,
            isDraw: moveResult.inDraw
          }
        });

        // Check for game end conditions
        if (game.status === 'completed') {
          io.to(`game:${gameId}`).emit('game-ended', {
            result: game.result,
            winner: game.winner_id,
            timestamp: new Date().toISOString()
          });
        }

      } catch (error) {
        console.error('Error making move:', error);
        socket.emit('error', { message: 'Failed to make move' });
      }
    });

    // Handle chat messages
    socket.on('chat-message', async (data) => {
      try {
        const { gameId, message } = data;
        
        if (!message || message.trim().length === 0) {
          return;
        }

        // Check if user is in the game
        const game = await Game.findByPk(gameId);
        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        const isPlayer = game.white_player_id === socket.userId || game.black_player_id === socket.userId;
        if (!isPlayer) {
          socket.emit('error', { message: 'You are not a player in this game' });
          return;
        }

        const chatMessage = {
          userId: socket.userId,
          username: socket.user.username,
          message: message.trim(),
          timestamp: new Date().toISOString()
        };

        // Broadcast message to all players in the game
        io.to(`game:${gameId}`).emit('chat-message', chatMessage);

      } catch (error) {
        console.error('Error sending chat message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle draw offers
    socket.on('draw-offer', async (gameId) => {
      try {
        const game = await Game.findByPk(gameId);
        if (!game || game.status !== 'active') {
          socket.emit('error', { message: 'Game not found or not active' });
          return;
        }

        const isPlayer = game.white_player_id === socket.userId || game.black_player_id === socket.userId;
        if (!isPlayer) {
          socket.emit('error', { message: 'You are not a player in this game' });
          return;
        }

        // Notify opponent
        const opponentId = game.white_player_id === socket.userId ? game.black_player_id : game.white_player_id;
        io.to(`user:${opponentId}`).emit('draw-offered', {
          gameId,
          from: socket.userId,
          username: socket.user.username,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('Error offering draw:', error);
        socket.emit('error', { message: 'Failed to offer draw' });
      }
    });

    // Handle draw responses
    socket.on('draw-response', async (data) => {
      try {
        const { gameId, accept } = data;
        
        const game = await Game.findByPk(gameId);
        if (!game || game.status !== 'active') {
          socket.emit('error', { message: 'Game not found or not active' });
          return;
        }

        const isPlayer = game.white_player_id === socket.userId || game.black_player_id === socket.userId;
        if (!isPlayer) {
          socket.emit('error', { message: 'You are not a player in this game' });
          return;
        }

        if (accept) {
          await game.completeGame('draw');
          
          // Update both players' stats
          const whitePlayer = await User.findByPk(game.white_player_id);
          const blackPlayer = await User.findByPk(game.black_player_id);

          if (whitePlayer) await whitePlayer.updateStats('draw');
          if (blackPlayer) await blackPlayer.updateStats('draw');
        }

        // Notify both players
        io.to(`game:${gameId}`).emit('draw-response', {
          accepted: accept,
          by: socket.userId,
          username: socket.user.username,
          timestamp: new Date().toISOString()
        });

        if (accept) {
          io.to(`game:${gameId}`).emit('game-ended', {
            result: 'draw',
            timestamp: new Date().toISOString()
          });
        }

      } catch (error) {
        console.error('Error responding to draw:', error);
        socket.emit('error', { message: 'Failed to respond to draw offer' });
      }
    });

    // Handle resignation
    socket.on('resign', async (gameId) => {
      try {
        const game = await Game.findByPk(gameId);
        if (!game || game.status !== 'active') {
          socket.emit('error', { message: 'Game not found or not active' });
          return;
        }

        const isPlayer = game.white_player_id === socket.userId || game.black_player_id === socket.userId;
        if (!isPlayer) {
          socket.emit('error', { message: 'You are not a player in this game' });
          return;
        }

        // Determine winner
        const winner = game.white_player_id === socket.userId ? game.black_player_id : game.white_player_id;
        const result = game.white_player_id === socket.userId ? 'black_win' : 'white_win';

        await game.completeGame(result, winner);

        // Update player stats
        const winnerUser = await User.findByPk(winner);
        const loserUser = await User.findByPk(socket.userId);

        if (winnerUser) await winnerUser.updateStats('win');
        if (loserUser) await loserUser.updateStats('loss');

        // Notify all players
        io.to(`game:${gameId}`).emit('game-ended', {
          result,
          winner,
          resigned: socket.userId,
          username: socket.user.username,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('Error resigning:', error);
        socket.emit('error', { message: 'Failed to resign' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`User ${socket.user.username} disconnected: ${socket.id}`);

      // Remove from active connections
      activeConnections.delete(socket.userId);

      // Update user offline status
      socket.user.is_online = false;
      socket.user.last_seen = new Date();
      await socket.user.save();

      // Leave all game rooms
      if (userRooms.has(socket.userId)) {
        for (const gameId of userRooms.get(socket.userId)) {
          socket.to(`game:${gameId}`).emit('player-disconnected', {
            userId: socket.userId,
            username: socket.user.username,
            timestamp: new Date().toISOString()
          });

          if (gameRooms.has(gameId)) {
            gameRooms.get(gameId).delete(socket.id);
            if (gameRooms.get(gameId).size === 0) {
              gameRooms.delete(gameId);
            }
          }
        }
        userRooms.delete(socket.userId);
      }
    });
  });
};

module.exports = { setupSocketHandlers }; 