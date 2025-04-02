// src/controllers/replyController.js
const { query } = require('../config/db');
const { validationResult } = require('express-validator');

// Get all replies for a message
const getMessageReplies = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    // Check if message exists
    const messages = await query('SELECT * FROM messages WHERE id = ?', [messageId]);
    
    if (!messages.length) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Get all top-level replies (no parent_reply_id)
    const replies = await query(`
      SELECT r.*, 
        u.display_name, u.avatar_url,
        (SELECT COUNT(*) FROM ratings WHERE reply_id = r.id AND is_upvote = TRUE) AS upvotes,
        (SELECT COUNT(*) FROM ratings WHERE reply_id = r.id AND is_upvote = FALSE) AS downvotes,
        (SELECT COUNT(*) FROM replies WHERE parent_reply_id = r.id) AS child_count
      FROM replies r
      JOIN users u ON r.user_id = u.id
      WHERE r.message_id = ? AND r.parent_reply_id IS NULL
      ORDER BY r.created_at ASC
    `, [messageId]);
    
    res.json({ replies });
  } catch (error) {
    console.error('Get message replies error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all replies for a parent reply (nested replies)
const getNestedReplies = async (req, res) => {
  try {
    const { replyId } = req.params;
    
    // Check if parent reply exists
    const parentReplies = await query('SELECT * FROM replies WHERE id = ?', [replyId]);
    
    if (!parentReplies.length) {
      return res.status(404).json({ message: 'Parent reply not found' });
    }
    
    // Get all child replies
    const replies = await query(`
      SELECT r.*, 
        u.display_name, u.avatar_url,
        (SELECT COUNT(*) FROM ratings WHERE reply_id = r.id AND is_upvote = TRUE) AS upvotes,
        (SELECT COUNT(*) FROM ratings WHERE reply_id = r.id AND is_upvote = FALSE) AS downvotes,
        (SELECT COUNT(*) FROM replies WHERE parent_reply_id = r.id) AS child_count
      FROM replies r
      JOIN users u ON r.user_id = u.id
      WHERE r.parent_reply_id = ?
      ORDER BY r.created_at ASC
    `, [replyId]);
    
    res.json({ replies });
  } catch (error) {
    console.error('Get nested replies error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a reply to a message
const createMessageReply = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    // Handle image URL if it exists
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    
    // Check if message exists
    const messages = await query('SELECT * FROM messages WHERE id = ?', [messageId]);
    
    if (!messages.length) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Create new reply
    const result = await query(
      'INSERT INTO replies (message_id, user_id, content, image_url) VALUES (?, ?, ?, ?)',
      [messageId, userId, content, imageUrl]
    );
    
    // Get the newly created reply
    const replies = await query(`
      SELECT r.*, 
        u.display_name, u.avatar_url,
        0 AS upvotes,
        0 AS downvotes,
        0 AS child_count
      FROM replies r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `, [result.insertId]);
    
    res.status(201).json({
      message: 'Reply created successfully',
      reply: replies[0]
    });
  } catch (error) {
    console.error('Create message reply error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a reply to another reply (nested reply)
const createNestedReply = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { replyId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    // Handle image URL if it exists
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    
    // Check if parent reply exists
    const parentReplies = await query('SELECT * FROM replies WHERE id = ?', [replyId]);
    
    if (!parentReplies.length) {
      return res.status(404).json({ message: 'Parent reply not found' });
    }
    
    const parentReply = parentReplies[0];
    
    // Create new nested reply
    const result = await query(
      'INSERT INTO replies (message_id, parent_reply_id, user_id, content, image_url) VALUES (?, ?, ?, ?, ?)',
      [parentReply.message_id, replyId, userId, content, imageUrl]
    );
    
    // Get the newly created reply
    const replies = await query(`
      SELECT r.*, 
        u.display_name, u.avatar_url,
        0 AS upvotes,
        0 AS downvotes,
        0 AS child_count
      FROM replies r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `, [result.insertId]);
    
    res.status(201).json({
      message: 'Nested reply created successfully',
      reply: replies[0]
    });
  } catch (error) {
    console.error('Create nested reply error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a reply
const deleteReply = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if reply exists
    const replies = await query('SELECT * FROM replies WHERE id = ?', [id]);
    
    if (!replies.length) {
      return res.status(404).json({ message: 'Reply not found' });
    }
    
    const reply = replies[0];
    
    // Check if user is admin or reply creator
    if (req.user.role !== 'admin' && reply.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this reply' });
    }
    
    // Delete reply (this will cascade delete child replies)
    await query('DELETE FROM replies WHERE id = ?', [id]);
    
    res.json({ message: 'Reply deleted successfully' });
  } catch (error) {
    console.error('Delete reply error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Rate a reply (upvote or downvote)
const rateReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_upvote } = req.body;
    const userId = req.user.id;
    
    // Check if reply exists
    const replies = await query('SELECT * FROM replies WHERE id = ?', [id]);
    
    if (!replies.length) {
      return res.status(404).json({ message: 'Reply not found' });
    }
    
    // Check if user has already rated this reply
    const existingRatings = await query(
      'SELECT * FROM ratings WHERE user_id = ? AND reply_id = ?',
      [userId, id]
    );
    
    if (existingRatings.length > 0) {
      // Update existing rating
      await query(
        'UPDATE ratings SET is_upvote = ? WHERE user_id = ? AND reply_id = ?',
        [is_upvote, userId, id]
      );
    } else {
      // Create new rating
      await query(
        'INSERT INTO ratings (user_id, reply_id, is_upvote) VALUES (?, ?, ?)',
        [userId, id, is_upvote]
      );
    }
    
    // Get updated counts
    const upvotes = await query(
      'SELECT COUNT(*) AS count FROM ratings WHERE reply_id = ? AND is_upvote = TRUE',
      [id]
    );
    
    const downvotes = await query(
      'SELECT COUNT(*) AS count FROM ratings WHERE reply_id = ? AND is_upvote = FALSE',
      [id]
    );
    
    res.json({
      message: 'Rating updated successfully',
      upvotes: upvotes[0].count,
      downvotes: downvotes[0].count
    });
  } catch (error) {
    console.error('Rate reply error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getMessageReplies,
  getNestedReplies,
  createMessageReply,
  createNestedReply,
  deleteReply,
  rateReply
};