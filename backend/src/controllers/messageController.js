// src/controllers/messageController.js
const { query } = require('../config/db');
const { validationResult } = require('express-validator');

// Get all messages in a channel
const getChannelMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    
    // Check if channel exists
    const channels = await query('SELECT * FROM channels WHERE id = ?', [channelId]);
    
    if (!channels.length) {
      return res.status(404).json({ message: 'Channel not found' });
    }
    
    // Get all messages with user info and upvote/downvote counts
    const messages = await query(`
      SELECT m.*, 
        u.display_name, u.avatar_url,
        (SELECT COUNT(*) FROM ratings WHERE message_id = m.id AND is_upvote = TRUE) AS upvotes,
        (SELECT COUNT(*) FROM ratings WHERE message_id = m.id AND is_upvote = FALSE) AS downvotes,
        (SELECT COUNT(*) FROM replies WHERE message_id = m.id) AS reply_count
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.channel_id = ?
      ORDER BY m.created_at DESC
    `, [channelId]);
    
    res.json({ messages });
  } catch (error) {
    console.error('Get channel messages error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single message by ID
const getMessageById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get message with user info and upvote/downvote counts
    const messages = await query(`
      SELECT m.*, 
        u.display_name, u.avatar_url,
        (SELECT COUNT(*) FROM ratings WHERE message_id = m.id AND is_upvote = TRUE) AS upvotes,
        (SELECT COUNT(*) FROM ratings WHERE message_id = m.id AND is_upvote = FALSE) AS downvotes
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.id = ?
    `, [id]);
    
    if (!messages.length) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    res.json({ message: messages[0] });
  } catch (error) {
    console.error('Get message error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new message
const createMessage = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { channelId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    // Handle image URL if it exists
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    
    // Check if channel exists
    const channels = await query('SELECT * FROM channels WHERE id = ?', [channelId]);
    
    if (!channels.length) {
      return res.status(404).json({ message: 'Channel not found' });
    }
    
    // Create new message
    const result = await query(
      'INSERT INTO messages (channel_id, user_id, content, image_url) VALUES (?, ?, ?, ?)',
      [channelId, userId, content, imageUrl]
    );
    
    // Get the newly created message
    const messages = await query(`
      SELECT m.*, 
        u.display_name, u.avatar_url,
        0 AS upvotes,
        0 AS downvotes,
        0 AS reply_count
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.id = ?
    `, [result.insertId]);
    
    res.status(201).json({
      message: 'Message created successfully',
      messageData: messages[0]
    });
  } catch (error) {
    console.error('Create message error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a message
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if message exists
    const messages = await query('SELECT * FROM messages WHERE id = ?', [id]);
    
    if (!messages.length) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    const message = messages[0];
    
    // Check if user is admin or message creator
    if (req.user.role !== 'admin' && message.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }
    
    // Delete message (this will cascade delete replies)
    await query('DELETE FROM messages WHERE id = ?', [id]);
    
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Rate a message (upvote or downvote)
const rateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_upvote } = req.body;
    const userId = req.user.id;
    
    // Check if message exists
    const messages = await query('SELECT * FROM messages WHERE id = ?', [id]);
    
    if (!messages.length) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if user has already rated this message
    const existingRatings = await query(
      'SELECT * FROM ratings WHERE user_id = ? AND message_id = ?',
      [userId, id]
    );
    
    if (existingRatings.length > 0) {
      // Update existing rating
      await query(
        'UPDATE ratings SET is_upvote = ? WHERE user_id = ? AND message_id = ?',
        [is_upvote, userId, id]
      );
    } else {
      // Create new rating
      await query(
        'INSERT INTO ratings (user_id, message_id, is_upvote) VALUES (?, ?, ?)',
        [userId, id, is_upvote]
      );
    }
    
    // Get updated counts
    const upvotes = await query(
      'SELECT COUNT(*) AS count FROM ratings WHERE message_id = ? AND is_upvote = TRUE',
      [id]
    );
    
    const downvotes = await query(
      'SELECT COUNT(*) AS count FROM ratings WHERE message_id = ? AND is_upvote = FALSE',
      [id]
    );
    
    res.json({
      message: 'Rating updated successfully',
      upvotes: upvotes[0].count,
      downvotes: downvotes[0].count
    });
  } catch (error) {
    console.error('Rate message error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getChannelMessages,
  getMessageById,
  createMessage,
  deleteMessage,
  rateMessage
};