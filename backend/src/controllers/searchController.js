// src/controllers/searchController.js
const { query } = require('../config/db');

// Search all content (messages and replies)
const searchAll = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    // Search in messages
    const messages = await query(`
      SELECT m.*, 
        u.display_name, u.avatar_url,
        c.name AS channel_name,
        'message' AS type
      FROM messages m
      JOIN users u ON m.user_id = u.id
      JOIN channels c ON m.channel_id = c.id
      WHERE m.content LIKE ?
      ORDER BY m.created_at DESC
      LIMIT 20
    `, [`%${q}%`]);
    
    // Search in replies
    const replies = await query(`
      SELECT r.*, 
        u.display_name, u.avatar_url,
        m.content AS message_content,
        c.name AS channel_name,
        'reply' AS type
      FROM replies r
      JOIN users u ON r.user_id = u.id
      JOIN messages m ON r.message_id = m.id
      JOIN channels c ON m.channel_id = c.id
      WHERE r.content LIKE ?
      ORDER BY r.created_at DESC
      LIMIT 20
    `, [`%${q}%`]);
    
    // Combine and sort by created_at
    const results = [...messages, ...replies].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
    
    res.json({ results });
  } catch (error) {
    console.error('Search all error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search users
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    // Search users by username or display_name
    const users = await query(`
      SELECT id, username, display_name, avatar_url, created_at
      FROM users
      WHERE username LIKE ? OR display_name LIKE ?
      ORDER BY display_name
      LIMIT 20
    `, [`%${q}%`, `%${q}%`]);
    
    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get users with the most posts (messages + replies)
const getUsersWithMostPosts = async (req, res) => {
  try {
    // Get user post counts
    const users = await query(`
      SELECT 
        u.id, 
        u.username, 
        u.display_name, 
        u.avatar_url,
        (SELECT COUNT(*) FROM messages WHERE user_id = u.id) +
        (SELECT COUNT(*) FROM replies WHERE user_id = u.id) AS post_count
      FROM users u
      ORDER BY post_count DESC
      LIMIT 10
    `);
    
    res.json({ users });
  } catch (error) {
    console.error('Get users with most posts error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get users with the highest ratings
const getUsersWithHighestRatings = async (req, res) => {
  try {
    // Get user rating stats
    const users = await query(`
      SELECT 
        u.id, 
        u.username, 
        u.display_name, 
        u.avatar_url,
        (
          SELECT COUNT(*) FROM ratings r
          JOIN messages m ON r.message_id = m.id
          WHERE m.user_id = u.id AND r.is_upvote = TRUE
        ) + (
          SELECT COUNT(*) FROM ratings r
          JOIN replies rep ON r.reply_id = rep.id
          WHERE rep.user_id = u.id AND r.is_upvote = TRUE
        ) AS upvotes,
        (
          SELECT COUNT(*) FROM ratings r
          JOIN messages m ON r.message_id = m.id
          WHERE m.user_id = u.id AND r.is_upvote = FALSE
        ) + (
          SELECT COUNT(*) FROM ratings r
          JOIN replies rep ON r.reply_id = rep.id
          WHERE rep.user_id = u.id AND r.is_upvote = FALSE
        ) AS downvotes
      FROM users u
      HAVING (upvotes + downvotes) > 0
      ORDER BY (upvotes - downvotes) DESC, upvotes DESC
      LIMIT 10
    `);
    
    // Calculate rating percentage
    const usersWithRatings = users.map(user => ({
      ...user,
      total_votes: user.upvotes + user.downvotes,
      rating_percentage: user.upvotes / (user.upvotes + user.downvotes) * 100
    }));
    
    res.json({ users: usersWithRatings });
  } catch (error) {
    console.error('Get users with highest ratings error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get content by a specific user
const getUserContent = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const users = await query('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (!users.length) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get messages by user
    const messages = await query(`
      SELECT m.*, 
        c.name AS channel_name,
        'message' AS type,
        (SELECT COUNT(*) FROM ratings WHERE message_id = m.id AND is_upvote = TRUE) AS upvotes,
        (SELECT COUNT(*) FROM ratings WHERE message_id = m.id AND is_upvote = FALSE) AS downvotes
      FROM messages m
      JOIN channels c ON m.channel_id = c.id
      WHERE m.user_id = ?
      ORDER BY m.created_at DESC
    `, [userId]);
    
    // Get replies by user
    const replies = await query(`
      SELECT r.*, 
        m.content AS message_content,
        c.name AS channel_name,
        'reply' AS type,
        (SELECT COUNT(*) FROM ratings WHERE reply_id = r.id AND is_upvote = TRUE) AS upvotes,
        (SELECT COUNT(*) FROM ratings WHERE reply_id = r.id AND is_upvote = FALSE) AS downvotes
      FROM replies r
      JOIN messages m ON r.message_id = m.id
      JOIN channels c ON m.channel_id = c.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `, [userId]);
    
    // Combine and sort by created_at
    const content = [...messages, ...replies].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
    
    res.json({
      user: {
        id: users[0].id,
        username: users[0].username,
        display_name: users[0].display_name,
        avatar_url: users[0].avatar_url
      },
      content
    });
  } catch (error) {
    console.error('Get user content error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  searchAll,
  searchUsers,
  getUsersWithMostPosts,
  getUsersWithHighestRatings,
  getUserContent
};