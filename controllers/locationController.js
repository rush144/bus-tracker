// server.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = http.createServer(app);

// Allow CORS for localhost:5173 and other origins if needed
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"], // add your frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors({ origin: ["http://localhost:5173"] })); // optional for REST API
app.use(express.json());

// In-memory storage for live locations
let driverLocations = {}; // { driverId: { lat, lng, timestamp } }

// REST API to get current locations (optional)
app.get('/api/locations', (req, res) => {
  res.json(driverLocations);
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Driver sending location
  socket.on('locationUpdate', (data) => {
    const { id, lat, lng } = data;
    driverLocations[id] = { lat, lng, timestamp: new Date() };

    // Broadcast to all other clients (passengers)
    socket.broadcast.emit('driverLocation', { id, lat, lng });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
