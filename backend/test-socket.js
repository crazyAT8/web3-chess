const { Server } = require('socket.io');
const { createServer } = require('http');
const express = require('express');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Simple socket handler for testing
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-game', (gameId) => {
    console.log('Client joined game:', gameId);
    socket.join(`game:${gameId}`);
    socket.emit('game-state', { message: 'Connected to game' });
  });
  
  socket.on('make-move', (data) => {
    console.log('Move received:', data);
    socket.to(`game:${data.gameId}`).emit('move-made', {
      move: data.move,
      gameState: { currentFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' }
    });
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Test Socket.IO server running on port ${PORT}`);
});
