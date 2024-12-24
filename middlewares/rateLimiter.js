const rateLimit = require('express-rate-limit');

const socketRateLimit = new Map();

const socketRateLimiter = (socket, next) => {
  const clientId = socket.handshake.address;
  if (!socketRateLimit.has(clientId)) {
    socketRateLimit.set(clientId, {
      timestamp: Date.now(),
      count: 1
    });
    return next();
  }

  const rateLimitInfo = socketRateLimit.get(clientId);
  const currentTime = Date.now();
  const timeWindow = 60000; 
  const maxConnections = 100;

  if (currentTime - rateLimitInfo.timestamp > timeWindow) {
    socketRateLimit.set(clientId, {
      timestamp: currentTime,
      count: 1
    });
    return next();
  }

  if (rateLimitInfo.count >= maxConnections) {
    return next(new Error('Too many connection attempts. Please try again later.'));
  }

  rateLimitInfo.count++;
  socketRateLimit.set(clientId, rateLimitInfo);
  next();
};

module.exports = { socketRateLimiter };
