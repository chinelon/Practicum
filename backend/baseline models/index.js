// //baseline 1
// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');


// const app = express();
// app.use(cors());
// app.use(express.json());

// const { Pool } = require('pg');
// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
// });

// pool.connect()
//   .then(() => console.log('Connected to Postgres database'))
//   .catch(err => console.error('Failed to connect to Postgres database', err.stack));

// app.post('/signup', async (req, res) => {
//   const { name, phoneno, address, email, password } = req.body;
//   try {
//     const result = await pool.query(
//       'INSERT INTO users (name, phoneno, address, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING *',
//       [name, phoneno, address, email, password]
//     );
//     res.status(201).json(result.rows[0]);
//   } catch (error) {
//     console.error('Error inserting user:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });
// app.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const result = await pool.query(
//       'SELECT * FROM users WHERE email = $1 AND password = $2',
//       [email, password]
//     );
//     if (result.rows.length > 0) {
//       res.status(200).json(result.rows[0]);
//     } else {
//       res.status(401).json({ error: 'Invalid credentials' });
//     }
//   } catch (error) {
//     console.error('Error logging in user:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });
// app.get('/allusers', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM users');
//     res.status(200).json(result.rows);
//   } catch (error) {
//     console.error('Error fetching users:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });
// app.get('/users/:id', async (req, res) => {
//   const { id } = req.params;
//   try {
//     const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
//     if (result.rows.length > 0) {
//       res.status(200).json(result.rows[0]);
//     } else {
//       res.status(404).json({ error: 'User not found' });
//     }
//   } catch (error) {
//     console.error('Error fetching user:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });
// app.put('/users/:id', async (req, res) => {
//   const { id } = req.params;
//   const { name, phoneno, address, email, password } = req.body;
//   try {
//     const result = await pool.query(
//       'UPDATE users SET name = $1, phoneno = $2, address = $3, email = $4, password = $5 WHERE id = $6 RETURNING *',
//       [name, phoneno, address, email, password, id]
//     );
//     if (result.rows.length > 0) {
//       res.status(200).json(result.rows[0]);
//     } else {
//       res.status(404).json({ error: 'User not found' });
//     }
//   } catch (error) {
//     console.error('Error updating user:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });
// app.delete('/users/:id', async (req, res) => {
//   const { id } = req.params;
//   try {
//     const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
//     if (result.rows.length > 0) {
//       res.status(200).json({ message: 'User deleted successfully' });
//     } else {
//       res.status(404).json({ error: 'User not found' });
//     }
//   } catch (error) {
//     console.error('Error deleting user:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// module.exports = app;
// module.exports.pool = pool;
