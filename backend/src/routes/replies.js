// src/routes/replies.js
const express = require('express');
const { body } = require('express-validator');
const { 
  getMessageReplies, 
  getNestedReplies, 
  createMessageReply, 
  createNestedReply, 
  deleteReply, 
  rateReply 
} = require('../controllers/replyController');
const { authenticateToken } = require('../middleware/auth');
const { uploadImage } = require('../middleware/fileUpload');

const router = express.Router();

// Get all replies for a message
router.get('/message/:messageId', getMessageReplies);

// Get all nested replies (child replies) for a parent reply
router.get('/parent/:replyId', getNestedReplies);

// Create a reply to a message - requires authentication
router.post(
  '/message/:messageId',
  authenticateToken,
  uploadImage,
  [
    body('content', 'Content is required').notEmpty()
  ],
  createMessageReply
);

// Create a nested reply - requires authentication
router.post(
  '/parent/:replyId',
  authenticateToken,
  uploadImage,
  [
    body('content', 'Content is required').notEmpty()
  ],
  createNestedReply
);

// Delete a reply - requires authentication and authorization
router.delete('/:id', authenticateToken, deleteReply);

// Rate a reply (upvote/downvote) - requires authentication
router.post(
  '/:id/rate',
  authenticateToken,
  [
    body('is_upvote', 'Rating type is required').isBoolean()
  ],
  rateReply
);

module.exports = router;