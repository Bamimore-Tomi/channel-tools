// src/routes/users.js
const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, (req, res) => {
    // The user is already attached to req by the authenticateToken middleware
    const user = req.user;

    // Remove sensitive information
    const userInfo = {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        role: user.role,
        created_at: user.created_at
    };

    res.json({ user: userInfo });
});

// Update user profile
router.put(
    '/profile',
    authenticateToken,
    [
        body('display_name', 'Display name is required').optional().notEmpty(),
        body('avatar_url').optional()
    ],
    async (req, res) => {
        try {
            const { display_name, avatar_url } = req.body;
            const userId = req.user.id;

            // Update user profile
            await require('../config/db').query(
                'UPDATE users SET display_name = ?, avatar_url = ? WHERE id = ?',
                [
                    display_name || req.user.display_name,
                    avatar_url || req.user.avatar_url,
                    userId
                ]
            );

            // Get updated user
            const users = await require('../config/db').query(
                'SELECT id, username, display_name, avatar_url, role FROM users WHERE id = ?',
                [userId]
            );

            res.json({
                message: 'Profile updated successfully',
                user: users[0]
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// Change password
router.put(
    '/password',
    authenticateToken,
    [
        body('current_password', 'Current password is required').notEmpty(),
        body('new_password', 'New password must be at least 6 characters').isLength({ min: 6 })
    ],
    async (req, res) => {
        try {
            const { current_password, new_password } = req.body;
            const userId = req.user.id;

            // Check current password
            const bcrypt = require('bcrypt');
            const isMatch = await bcrypt.compare(current_password, req.user.password);

            if (!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(new_password, salt);

            // Update password
            await require('../config/db').query(
                'UPDATE users SET password = ? WHERE id = ?',
                [hashedPassword, userId]
            );

            res.json({ message: 'Password updated successfully' });
        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

module.exports = router;