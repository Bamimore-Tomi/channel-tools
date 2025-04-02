// src/controllers/adminController.js
const { query } = require('../config/db');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await query(`
      SELECT 
        id, 
        username, 
        display_name, 
        avatar_url, 
        role,
        created_at,
        (SELECT COUNT(*) FROM messages WHERE user_id = users.id) AS message_count,
        (SELECT COUNT(*) FROM replies WHERE user_id = users.id) AS reply_count
      FROM users
      ORDER BY username
    `);
    
    res.json({ users });
  } catch (error) {
    console.error('Admin get all users error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Cannot delete yourself
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }
    
    // Check if user exists
    const users = await query('SELECT * FROM users WHERE id = ?', [id]);
    
    if (!users.length) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if trying to delete another admin
    if (users[0].role === 'admin' && req.user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete another admin' });
    }
    
    // Delete user (this will cascade delete all related content)
    await query('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get system stats
const getSystemStats = async (req, res) => {
  try {
    // Get total users count
    const [usersCount] = await query('SELECT COUNT(*) AS count FROM users');
    
    // Get total channels count
    const [channelsCount] = await query('SELECT COUNT(*) AS count FROM channels');
    
    // Get total messages count
    const [messagesCount] = await query('SELECT COUNT(*) AS count FROM messages');
    
    // Get total replies count
    const [repliesCount] = await query('SELECT COUNT(*) AS count FROM replies');
    
    // Get recent activity
    const recentActivity = await query(`
      SELECT 
        'message' AS type,
        m.id,
        m.content,
        m.created_at,
        u.display_name,
        c.name AS channel_name
      FROM messages m
      JOIN users u ON m.user_id = u.id
      JOIN channels c ON m.channel_id = c.id
      
      UNION ALL
      
      SELECT 
        'reply' AS type,
        r.id,
        r.content,
        r.created_at,
        u.display_name,
        c.name AS channel_name
      FROM replies r
      JOIN users u ON r.user_id = u.id
      JOIN messages m ON r.message_id = m.id
      JOIN channels c ON m.channel_id = c.id
      
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    res.json({
      stats: {
        users: usersCount.count,
        channels: channelsCount.count,
        messages: messagesCount.count,
        replies: repliesCount.count
      },
      recentActivity
    });
  } catch (error) {
    console.error('Admin get system stats error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
  getSystemStats
};