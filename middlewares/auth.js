const jwt = require('jsonwebtoken');

const checkAuth = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

const socketAuth = (socket, next) => {
  const token = socket.handshake.auth.token;
  const userId = socket.handshake.auth.userId;

  if (!token || !userId) {
    return next(new Error('Authentication required'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');
    if (decoded.userId !== userId) {
      return next(new Error('Invalid authentication credentials'));
    }
    socket.userId = userId;
    socket.user = decoded;
    next();
  } catch (error) {
    return next(new Error('Invalid token'));
  }
};

module.exports = { checkAuth, socketAuth };
