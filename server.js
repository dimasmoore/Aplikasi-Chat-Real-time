require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');

// Import controllers
const authController = require('./controllers/authController');
const socketController = require('./controllers/socketController');

// Import middlewares
const { checkAuth, socketAuth } = require('./middlewares/auth');
const { socketRateLimiter } = require('./middlewares/rateLimiter');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 
  }
}));

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Database connection
mongoose.connect('mongodb://localhost:27017/chat-app')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import models
const User = require('./models/User');
const Message = require('./models/Message');

// Socket.io middleware
io.use(socketRateLimiter);
io.use(socketAuth);

// Socket.io connection handling
io.on('connection', (socket) => socketController.handleConnection(io, socket));

// Auth routes
app.get('/api/check-session', authController.checkSession);
app.post('/api/register', authController.register);
app.post('/api/login', authController.login);
app.post('/api/logout', authController.logout);

// Protected routes
app.get('/', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
