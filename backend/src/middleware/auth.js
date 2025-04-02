// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to authenticate user token
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    // Verify token
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }
      
      // Check if user exists in the database
      const users = await query('SELECT * FROM users WHERE id = ?', [decoded.id]);
      
      if (!users.length) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Store user object in the request
      req.user = users[0];
      next();
    });
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin rights required.' });
  }
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

module.exports = {
  authenticateToken,
  isAdmin,
  generateToken
};