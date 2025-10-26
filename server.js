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

// ✅ Allowed origins (update when frontend is hosted)
const allowedOrigins = [
  'http://localhost:5173', // local frontend
  'https://bus-tracker-frontend-u8p8.vercel.app', 
];

const io = socketIO(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ✅ Middleware
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
  credentials: true,
}));
app.use(express.json());

// ✅ Test route
app.get('/', (req, res) => {
  res.send('🚀 Bus Tracker Backend is running!');
});

// ✅ Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/buses', require('./routes/buses'));
app.use('/api/location', require('./routes/location'));
app.use('/api/chat', require('./routes/chat'));

// ✅ Socket.IO Auth Middleware
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

// ✅ Socket.IO Events
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id} (${socket.user.username})`);

  socket.on('locationUpdate', (data) => {
    io.emit('locationBroadcast', data);
  });

  socket.on('chatMessage', async (msgData) => {
    try {
      const savedChat = await ChatMessage.create({
        username: socket.user.username,
        role: socket.user.role,
        message: msgData.text,
        timestamp: new Date(),
      });

      io.emit('chatMessage', {
        username: savedChat.username,
        role: savedChat.role,
        text: savedChat.message,
        timestamp: savedChat.timestamp,
      });
    } catch (err) {
      console.error('❌ Failed to save chat message:', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// ✅ Handle Socket.IO connection errors
io.engine.on('connection_error', (err) => {
  console.log('❌ Socket.IO connection error:', err.message);
});

// ✅ MongoDB + Start Server
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log('✅ MongoDB connected successfully');
      const port = process.env.PORT || 5000;
      server.listen(port, '0.0.0.0', () => {
        console.log(`🚀 Server running on port ${port}`);
      });
    })
    .catch(err => console.error('❌ MongoDB connection error:', err));
