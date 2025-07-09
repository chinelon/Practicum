// db.js
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  // user: process.env.DB_USER,
  // host: process.env.DB_HOST,
  // database: process.env.DB_NAME,
  // password: process.env.DB_PASSWORD,
  // port: process.env.DB_PORT,
  connectionString: process.env.DB_URL
});

pool.connect()
  .then(() => console.log('Connected to Postgres database'))
  .catch(err => console.error('Failed to connect to Postgres database', err.stack));

module.exports = pool;
