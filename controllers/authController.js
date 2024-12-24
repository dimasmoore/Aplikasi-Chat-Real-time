const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'your-jwt-secret',
      { expiresIn: '24h' }
    );

    req.session.userId = user._id;
    
    res.json({ 
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username
      },
      token 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error logging out' });
    }
    res.json({ message: 'Logged out successfully' });
  });
};

const checkSession = async (req, res) => {
  if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      if (user) {
        const token = jwt.sign(
          { userId: user._id, username: user.username },
          process.env.JWT_SECRET || 'your-jwt-secret',
          { expiresIn: '24h' }
        );

        res.json({ 
          isAuthenticated: true, 
          user: { 
            id: user._id,
            username: user.username 
          },
          token 
        });
        return;
      }
    } catch (error) {
      console.error('Session check error:', error);
    }
  }
  res.json({ isAuthenticated: false });
};

module.exports = {
  register,
  login,
  logout,
  checkSession
};
