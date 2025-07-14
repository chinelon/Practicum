
// const rateLimit = require('express-rate-limit');
// const pool = require('./db');

// const adaptiveRateLimiter = rateLimit({
//   windowMs: 60 * 60 * 1000, // 1 hour window
//   max: async (req, res) => {
//     const ip = req.ip === '::1' ? '127.0.0.1' : req.ip;
//     console.log(`🔍 Rate limit check for ${ip} on ${req.path}`);

//     try {
//       const result = await pool.query(
//         'SELECT * FROM denylist WHERE ip_address = $1',
//         [ip]
//       );
//      if (result.rows.length > 0) {
//         const description = result.rows[0].description;

//         if (description === 'human') {
//           //  Fully block access
//           console.log(` Blocking access for ${ip} - human detected`);
//           return 1;
//         } else if (description === 'bot') {
//           return 10;
//         }
//       }
//       // Normal user
//       return 100;
//     } catch (err) {
//       console.error('Rate limiter DB error:', err);
//       return 100; // fallback in case of DB error
//     }
//   },
//   keyGenerator: (req) => {
//     return req.ip === '::1' ? '127.0.0.1' : req.ip;
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
//   handler: (req, res) => {
//     res.status(429).json({
//       message: 'Too many requests. Please try again later.',
//     });
//   },
// });

// module.exports = adaptiveRateLimiter;

const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis'); 
const redisClient = require('./redisClient');
const pool = require('./db');

const adaptiveRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window

  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),

  max: async (req, res) => {
    const ip = req.ip === '::1' ? '127.0.0.1' : req.ip;
    console.log(`🔍 Rate limit check for ${ip} on ${req.path}`);

    try {
      const result = await pool.query(
        'SELECT * FROM denylist WHERE ip_address = $1',
        [ip]
      );

      if (result.rows.length > 0) {
        const description = result.rows[0].description;

        if (description === 'human') {
          console.log(`🚫 Blocking access for ${ip} - human`);
          return 1; // Effectively blocks after 1 request
        } else if (description === 'bot') {
          console.log(`🤖 Limiting ${ip} - bot`);
          return 10;
        }
      }

      console.log(`👤 Normal access for ${ip}`);
      return 100; // Normal user
    } catch (err) {
      console.error('❗ Rate limiter DB error:', err);
      return 100;
    }
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
