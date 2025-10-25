const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const ChatMessage = require('./models/chatmessage');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// --- Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/buses', require('./routes/buses'));
app.use('/api/location', require('./routes/location'));
app.use('/api/chat', require('./routes/chat'));

// --- Socket.IO Auth Middleware ---
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication token missing'));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = { username: decoded.username, role: decoded.role };
    next();
  } catch (err) {
    console.error('❌ JWT verification failed:', err.message);
    return next(new Error('Authentication failed'));
  }
});

// --- Socket.IO Events ---
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id} (${socket.user.username})`);

  // Location updates from drivers
  socket.on('locationUpdate', (data) => {
    io.emit('locationBroadcast', data); // send to all clients
  });

  // Global chat messages
  socket.on('chatMessage', async (msgData) => {
    try {
      const savedChat = await ChatMessage.create({
        username: socket.user.username,
        role: socket.user.role,
        message: msgData.text,
        timestamp: new Date()
      });

      io.emit('chatMessage', {
        username: savedChat.username,
        role: savedChat.role,
        text: savedChat.message,
        timestamp: savedChat.timestamp
      });
    } catch (err) {
      console.error('❌ Failed to save chat message:', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// --- Connect MongoDB and Start Server ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    const port = process.env.PORT || 5000;
    server.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
