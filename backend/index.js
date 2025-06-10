//baseline 1
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');


const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
 // ssl: { rejectUnauthorized: false }, // for production, adjust accordingly
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) throw err;
  console.log('DB Time:', res.rows[0]);
});
app.post('/api/signup', async (req, res) => {
  const { name, phoneno, address, email, password } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (name, phoneno, address, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, phoneno, address, email, password]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error inserting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND password = $2',
      [email, password]
    );
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, phoneno, address, email, password } = req.body;
  try {
    const result = await pool.query(
      'UPDATE users SET name = $1, phoneno = $2, address = $3, email = $4, password = $5 WHERE id = $6 RETURNING *',
      [name, phoneno, address, email, password, id]
    );
    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length > 0) {
      res.status(200).json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
module.exports.pool = pool;

// app.listen(3000, () => {
//   console.log('Server is running on port 3000');
// });
// module.exports = app; // Export the app for testing or further configuration
// module.exports.pool = pool; // Export the pool for database operations
// This allows you to import the pool in other files if needed
// and use it for database operations without creating a new connection each time.
// You can now use this app in your tests or other modules
// by importing it like this:
// import app from './path/to/this/file';
// or
// import { pool } from './path/to/this/file';
// This is a basic Express server setup with PostgreSQL connection pooling.
// It includes routes for user signup, login, fetching, updating, and deleting users.
// You can expand this further by adding more routes, middleware, or error handling as needed.
// Make sure to install the required packages:
// npm install express pg cors dotenv
// Also, ensure you have a PostgreSQL database set up and the connection string in your .env file.
// You can run this server using Node.js:
// node index.js
// Or if you have nodemon installed, you can use:
// nodemon index.js