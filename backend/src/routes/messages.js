// src/routes/messages.js
const express = require('express');
const { body } = require('express-validator');
const { 
  getChannelMessages, 
  getMessageById, 
  createMessage, 
  deleteMessage, 
  rateMessage 
} = require('../controllers/messageController');
const { authenticateToken } = require('../middleware/auth');
const { uploadImage } = require('../middleware/fileUpload');

const router = express.Router();

// Get all messages in a channel
router.get('/channel/:channelId', getChannelMessages);

// Get a single message
router.get('/:id', getMessageById);

// Create a new message - requires authentication
router.post(
  '/channel/:channelId',
  authenticateToken,
  uploadImage,
  [
    body('content', 'Content is required').notEmpty()
  ],
  createMessage
);

// Delete a message - requires authentication and authorization
router.delete('/:id', authenticateToken, deleteMessage);

// Rate a message (upvote/downvote) - requires authentication
router.post(
  '/:id/rate',
  authenticateToken,
  [
    body('is_upvote', 'Rating type is required').isBoolean()
  ],
  rateMessage
);

module.exports = router;