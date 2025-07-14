// middlewares/fetchRateLimitMax.js
const pool = require('./db');

async function fetchUserRateLimit(req, res, next) {
  const ip = req.ip === '::1' ? '127.0.0.1' : req.ip;
  let max = 100;           // default for “normal” users

  try {
    const { rows } = await pool.query(
      'SELECT description FROM denylist WHERE ip_address = $1',
      [ip]
    );

    if (rows.length > 0) {
      const desc = rows[0].description;
      if (desc === 'human')   max = 1;
      else if (desc === 'bot') max = 10;
    }
  } catch (err) {
    console.error('Error fetching rate limit max:', err);
    // keep max = 100 on error
  }

  // store it for the rate limiter
  req.rateLimitMax = max;
  next();
}

module.exports = fetchUserRateLimit;
