//FIRST VERSION
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
// REDIS VERSION
// require('dotenv').config(); // Load environment variables
// const rateLimit = require('express-rate-limit');
// const { RedisStore } = require('rate-limit-redis'); 
// //const redisClient = require('./redisClient');
// const Redis = require('ioredis');

// const pool = require('./db');
// const redisClient = new Redis({
//   username: process.env.REDIS_USERNAME || 'default',
//   password: process.env.REDIS_PASSWORD,
//   host: process.env.REDIS_HOST,
//   port: Number(process.env.REDIS_PORT),
//  // tls: true,
// });
// const adaptiveRateLimiter = rateLimit({
//   windowMs: 60 * 60 * 1000, // 1 hour window

//   store: new RedisStore({
//     sendCommand: (...args) => redisClient.call(...args),
//   }),

//   max: async (req, res) => {
//     const ip = req.ip === '::1' ? '127.0.0.1' : req.ip;

//     // 🔐 Step 1: Check for block flag
//     const isBlocked = await redisClient.get(`bot_blocked:${ip}`);
//     if (isBlocked) {
//       console.log(`🚫 Permanently blocking ${ip}`);
//       return 0;
//     }

//     try {
//       const result = await pool.query(
//         'SELECT * FROM denylist WHERE ip_address = $1',
//         [ip]
//       );

//       if (result.rows.length > 0) {
//         const description = result.rows[0].description;

//         if (description === 'bot') {
//           // 🔄 Step 2: Increment request count in Redis
//           const botKey = `bot_req_count:${ip}`;
//           const count = await redisClient.incr(botKey);

//           // Optional: Set expiration
//           if (count === 1) {
//             await redisClient.expire(botKey, 3600); // 1 hour
//           }

//           // 🚨 Step 3: Block if limit exceeded
//           if (count > 10) {
//             await redisClient.set(`bot_blocked:${ip}`, true, 'EX', 3600); // block for 1 hour
//             console.log(`🚨 Bot IP ${ip} exceeded threshold — now blocked`);
//             return 0;
//           }

//           return 10; // otherwise allow up to 10 requests
//         }

//         if (description === 'human') {
//           return 1;
//         }
//       }

//       return 100; // normal user
//     } catch (err) {
//       console.error('Rate limiter DB error:', err);
//       return 100;
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

// SEMI WORKING VERSION 
// require('dotenv').config();
// const rateLimit = require('express-rate-limit');
// const { RedisStore } = require('rate-limit-redis');
// const Redis = require('ioredis');
// const pool = require('./db');

// const redisClient = new Redis({
//   username: process.env.REDIS_USERNAME || 'default',
//   password: process.env.REDIS_PASSWORD,
//   host: process.env.REDIS_HOST,
//   port: Number(process.env.REDIS_PORT),
// });

// // Middleware to set max limit per IP, **async** but before limiter
// async function fetchRateLimitMax(req, res, next) {
//   const ip = req.ip === '::1' ? '127.0.0.1' : req.ip;

//   try {
//     // Check permanent block
//     const isBlocked = await redisClient.get(`bot_blocked:${ip}`);
//     if (isBlocked) {
//       req.rateLimitMax = 0;
//       return next();
//     }

//     // Check Postgres denylist
//     const { rows } = await pool.query(
//       'SELECT description FROM denylist WHERE ip_address = $1',
//       [ip]
//     );

//     if (rows.length > 0 && rows[0].description === 'bot') {
//       const key = `bot_req_count:${ip}`;
//       const count = await redisClient.incr(key);
//       if (count === 1) await redisClient.expire(key, 60 * 60);

//       if (count > 10) {
//         await redisClient.set(`bot_blocked:${ip}`, '1', 'EX', 60 * 60);
//         req.rateLimitMax = 0;
//         return next();
//       }

//       req.rateLimitMax = 10;
//       return next();
//     }

//     if (rows.length > 0 && rows[0].description === 'human') {
//       req.rateLimitMax = 1;
//       return next();
//     }

//     // Normal user
//     req.rateLimitMax = 100;
//     next();
//   } catch (err) {
//     console.error('Error fetching rate limit max:', err);
//     req.rateLimitMax = 100; // fallback
//     next();
//   }
// }

// // Now the rate limiter with **sync max** reading from req.rateLimitMax
// const adaptiveRateLimiter = rateLimit({
//   windowMs: 60 * 60 * 1000, // 1 hour window
//   max: (req) => req.rateLimitMax ?? 100,
//   keyGenerator: (req) => (req.ip === '::1' ? '127.0.0.1' : req.ip),
//   store: new RedisStore({
//     sendCommand: (...args) => redisClient.call(...args),
//   }),
//   standardHeaders: true,
//   legacyHeaders: false,
//   handler: (req, res) => {
//     res.status(429).json({ message: 'Too many requests. Please try again later.' });
//   },
// });

// module.exports = {
//   fetchRateLimitMax,
//   adaptiveRateLimiter,
// };


require('dotenv').config();
const Redis = require('ioredis');
const pool = require('./db');

const redisClient = new Redis({
  username: process.env.REDIS_USERNAME || 'default',
  password: process.env.REDIS_PASSWORD,
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

redisClient.on('connect', () => console.log('🟢 Connected to Redis'));
redisClient.on('error', (err) => console.error('🔴 Redis error:', err));

const WINDOW_SECONDS = 60 * 60; // 1 hour window

async function adaptiveRateLimiter(req, res, next) {
  const ip = req.ip === '::1' ? '127.0.0.1' : req.ip;
//const ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || '').split(',')[0].trim();

  try {
    // Check if IP is permanently blocked (human block)
    const isBlocked = await redisClient.get(`blocked:${ip}`);
    if (isBlocked) {
      return res.status(429).json({ message: 'You are permanently blocked.' });
    }

    // Check classification from Postgres denylist
    const { rows } = await pool.query(
      'SELECT description FROM denylist WHERE ip_address = $1',
      [ip]
    );

    let maxRequests = 100; // default normal user limit

    if (rows.length > 0) {
      if (rows[0].description === 'human') {
        maxRequests = 1;
      } else if (rows[0].description === 'bot') {
        maxRequests = 10;
      }
    }

    // Use Redis key per IP
    const redisKey = `ratelimit:${ip}`;

    // Increment request count atomically
    const current = await redisClient.incr(redisKey);

    if (current === 1) {
      // Set expiry for window duration on first request
      await redisClient.expire(redisKey, WINDOW_SECONDS);
    }

    if (current > maxRequests) {
      // For bots, set block for 1 hour after exceeding limit
      if (rows.length > 0 && rows[0].description === 'bot') {
        await redisClient.set(`blocked:${ip}`, '1', 'EX', WINDOW_SECONDS);
      }

      return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    }

    // Allow the request
    next();
  } catch (err) {
    console.error('Adaptive rate limiter error:', err);
    // Fail open - allow request if error
    next();
  }
}

module.exports = adaptiveRateLimiter;
module.exports.redisClient = redisClient; // Export redisClient for testing or other uses