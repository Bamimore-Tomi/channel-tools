// src/controllers/channelController.js
const { query } = require('../config/db');
const { validationResult } = require('express-validator');

// Get all channels
const getAllChannels = async (req, res) => {
    try {
        const channels = await query(`
      SELECT c.*, u.display_name AS creator_name, 
        COUNT(DISTINCT m.id) AS message_count 
      FROM channels c
      JOIN users u ON c.created_by = u.id
      LEFT JOIN messages m ON c.id = m.channel_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);

        res.json({ channels });
    } catch (error) {
        console.error('Get all channels error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a single channel by ID
const getChannelById = async (req, res) => {
    try {
        const { id } = req.params;

        const channels = await query(`
      SELECT c.*, u.display_name AS creator_name
      FROM channels c
      JOIN users u ON c.created_by = u.id
      WHERE c.id = ?
    `, [id]);

        if (!channels.length) {
            return res.status(404).json({ message: 'Channel not found' });
        }

        res.json({ channel: channels[0] });
    } catch (error) {
        console.error('Get channel error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create a new channel
const createChannel = async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, description } = req.body;
        const userId = req.user.id;

        // Check if channel with the same name already exists
        const existingChannels = await query('SELECT * FROM channels WHERE name = ?', [name]);

        if (existingChannels.length > 0) {
            return res.status(400).json({ message: 'Channel with this name already exists' });
        }

        // Create new channel
        const result = await query(
            'INSERT INTO channels (name, description, created_by) VALUES (?, ?, ?)',
            [name, description, userId]
        );

        // Get the newly created channel
        const channels = await query(`
      SELECT c.*, u.display_name AS creator_name
      FROM channels c
      JOIN users u ON c.created_by = u.id
      WHERE c.id = ?
    `, [result.insertId]);

        res.status(201).json({
            message: 'Channel created successfully',
            channel: channels[0]
        });
    } catch (error) {
        console.error('Create channel error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a channel
const deleteChannel = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if channel exists
        const channels = await query('SELECT * FROM channels WHERE id = ?', [id]);

        if (!channels.length) {
            return res.status(404).json({ message: 'Channel not found' });
        }

        const channel = channels[0];

        // Check if user is admin or channel creator
        if (req.user.role !== 'admin' && channel.created_by !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this channel' });
        }

        // Delete channel (this will cascade delete messages and replies)
        await query('DELETE FROM channels WHERE id = ?', [id]);

        res.json({ message: 'Channel deleted successfully' });
    } catch (error) {
        console.error('Delete channel error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllChannels,
    getChannelById,
    createChannel,
    deleteChannel
};