
// adaptiveRateLimiter.js
const rateLimit = require('express-rate-limit');
const pool = require('./db');

const adaptiveRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: async (req, res) => {
    const ip = req.ip === '::1' ? '127.0.0.1' : req.ip;
    console.log(`🔍 Rate limit check for ${ip} on ${req.path}`);

    try {
      const result = await pool.query(
        'SELECT * FROM denylist WHERE ip_address = $1',
        [ip]
      );
      if (result.rows.length > 0) {
        // IP is in denylist → bot → strict limit
        return 10;
      }
    } catch (err) {
      console.error('Rate limiter DB check failed:', err);
    }

    // Legitimate user → looser limit
    return 100;
  },
  keyGenerator: (req) => {
    return req.ip === '::1' ? '127.0.0.1' : req.ip;
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      message: 'Too many requests. Please try again later.',
    });
  },
});

module.exports = adaptiveRateLimiter;


// async function getUserType(ip, userAgent) {
//   const query = `SELECT anomaly_type FROM deny_list WHERE ip_address = $1 OR user_agent = $2 LIMIT 1`;
//   const values = [ip, userAgent];
//   try {
//     const res = await pool.query(query, values);
//     return res.rows.length ? res.rows[0].anomaly_type : null;
//   } catch (err) {
//     console.error('DB error:', err);
//     return null;
//   }
// }

// async function addToDenyList(ip, userAgent, anomalyType) {
//   const upsert = `
//     INSERT INTO deny_list (ip_address, user_agent, anomaly_type, hits)
//     VALUES ($1, $2, $3, 1)
//     ON CONFLICT (ip_address)
//     DO UPDATE SET hits = deny_list.hits + 1, timestamp = CURRENT_TIMESTAMP
//   `;
//   const values = [ip, userAgent, anomalyType];
//   try {
//     await pool.query(upsert, values);
//   } catch (err) {
//     console.error('Failed to update deny list:', err);
//   }
// }

// module.exports = {
//   getUserType,
//   addToDenyList,
// };
