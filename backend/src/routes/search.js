// src/routes/search.js
const express = require('express');
const { 
  searchAll, 
  searchUsers, 
  getUsersWithMostPosts, 
  getUsersWithHighestRatings, 
  getUserContent 
} = require('../controllers/searchController');

const router = express.Router();

// Search all content (messages and replies)
router.get('/', searchAll);

// Search users
router.get('/users', searchUsers);

// Get users with the most posts
router.get('/stats/users/most-posts', getUsersWithMostPosts);

// Get users with the highest ratings
router.get('/stats/users/highest-rated', getUsersWithHighestRatings);

// Get content by a specific user
router.get('/user/:userId/content', getUserContent);

module.exports = router;