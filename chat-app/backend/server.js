const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
  cors: { origin: "http://localhost:5173" } 
});

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ROUTES - ADD THESE LINES
app.use('/api/auth', require('./routes/auth'));
app.use('/api/messages', require('./routes/messages'));



server.listen(5000, () => console.log('🚀 Server on port 5000'));
