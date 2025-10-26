// server.js (or your main backend file)
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

app.use(cors());
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

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
