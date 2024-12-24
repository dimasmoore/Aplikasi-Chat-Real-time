const Message = require('../models/Message');

const handleConnection = (io, socket) => {
  console.log('User connected:', socket.userId);

  socket.on('message', async (data) => {
    try {
      const message = new Message({
        sender: socket.userId,
        content: data.content
      });
      await message.save();
      
      io.emit('message', {
        id: message._id,
        sender: socket.user.username,
        content: message.content,
        timestamp: message.timestamp
      });
    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('error', { message: 'Error saving message' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId);
  });
};

module.exports = { handleConnection };
