// src/routes/channels.js
const express = require('express');
const { body } = require('express-validator');
const { 
  getAllChannels, 
  getChannelById, 
  createChannel, 
  deleteChannel 
} = require('../controllers/channelController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all channels
router.get('/', getAllChannels);

// Get single channel by ID
router.get('/:id', getChannelById);

// Create a new channel - requires authentication
router.post(
  '/',
  authenticateToken,
  [
    body('name', 'Channel name is required').notEmpty().isLength({ min: 3, max: 100 }),
    body('description', 'Description is required').notEmpty()
  ],
  createChannel
);

// Delete channel - requires authentication and authorization
router.delete('/:id', authenticateToken, deleteChannel);

module.exports = router;