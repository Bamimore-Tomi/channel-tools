// src/config/db.js
const mysql = require('mysql2/promise');

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'app_user',
  password: process.env.DB_PASSWORD || 'app_password',
  database: process.env.DB_NAME || 'programming_channels',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create a connection pool
let pool;

// Function to create database connection
const createConnection = async () => {
  try {
    pool = mysql.createPool(dbConfig);
    
    // Test connection
    const connection = await pool.getConnection();
    console.log('Database connected successfully');
    connection.release();
    
    return pool;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    // Try again after a delay
    setTimeout(createConnection, 5000);
  }
};

// Get connection pool
const getPool = () => {
  if (!pool) {
    throw new Error('Database connection not initialized');
  }
  return pool;
};

// Execute query
const query = async (sql, params) => {
  try {
    const [results] = await getPool().execute(sql, params);
    return results;
  } catch (error) {
    console.error('Query error:', error.message);
    throw error;
  }
};

module.exports = {
  createConnection,
  getPool,
  query
};