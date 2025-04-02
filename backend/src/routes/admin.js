// src/routes/admin.js
const express = require('express');
const { 
  getAllUsers, 
  deleteUser, 
  getSystemStats 
} = require('../controllers/adminController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticateToken, isAdmin);

// Get all users
router.get('/users', getAllUsers);

// Delete a user
router.delete('/users/:id', deleteUser);

// Get system stats
router.get('/stats', getSystemStats);

module.exports = router;