// src/routes/auth.js
const express = require('express');
const { body } = require('express-validator');
const { register, login, getCurrentUser } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register a new user
router.post(
  '/register',
  [
    body('username', 'Username is required').notEmpty().isLength({ min: 3, max: 50 }),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    body('display_name', 'Display name is required').notEmpty()
  ],
  register
);

// Login user
router.post(
  '/login',
  [
    body('username', 'Username is required').notEmpty(),
    body('password', 'Password is required').notEmpty()
  ],
  login
);

// Get current user
router.get('/me', authenticateToken, getCurrentUser);

module.exports = router;