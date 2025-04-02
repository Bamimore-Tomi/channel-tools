// src/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const { createConnection } = require('./config/db');

// Routes
const authRoutes = require('./routes/auth');
const channelRoutes = require('./routes/channels');
const messageRoutes = require('./routes/messages');
const replyRoutes = require('./routes/replies');
const searchRoutes = require('./routes/search');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up static file directory for uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Database connection
createConnection();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/replies', replyRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Programming Channels API' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});