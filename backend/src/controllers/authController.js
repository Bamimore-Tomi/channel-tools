// src/controllers/authController.js
const bcrypt = require('bcrypt');
const { query } = require('../config/db');
const { generateToken } = require('../middleware/auth');
const { validationResult } = require('express-validator');

// Register a new user
const register = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { username, password, display_name, avatar_url } = req.body;
    
    // Check if username already exists
    const existingUsers = await query('SELECT * FROM users WHERE username = ?', [username]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Insert new user
    const result = await query(
      'INSERT INTO users (username, password, display_name, avatar_url) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, display_name, avatar_url || null]
    );
    
    // Get the newly created user
    const users = await query('SELECT id, username, display_name, avatar_url, role FROM users WHERE id = ?', [result.insertId]);
    const user = users[0];
    
    // Generate JWT token
    const token = generateToken(user);
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { username, password } = req.body;
    
    // Find user by username
    const users = await query('SELECT * FROM users WHERE username = ?', [username]);
    
    if (!users.length) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    // User is already set in the request by the authenticateToken middleware
    const user = req.user;
    
    res.json({
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Get current user error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser
};