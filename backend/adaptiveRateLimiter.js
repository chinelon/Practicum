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

// adaptiveRateLimiter.js
require('dotenv').config();
const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const Redis = require('ioredis');
const pool = require('./db');

const redisClient = new Redis({
  username: process.env.REDIS_USERNAME || 'default',
  password: process.env.REDIS_PASSWORD,
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
});

redisClient.on('connect', () => console.log('🟢 Connected to Redis'));
redisClient.on('error', (err) => console.error('🔴 Redis error:', err));

async function determineLimit(ip) {
  // 1) Check permanent block
  const isBlocked = await redisClient.get(`bot_blocked:${ip}`);
  if (isBlocked) return { max: 0, windowMs: 60 * 60 * 1000 };

  // 2) Lookup classification in Postgres
  const { rows } = await pool.query(
    'SELECT description FROM denylist WHERE ip_address = $1',
    [ip]
  );

  if (rows.length > 0 && rows[0].description === 'bot') {
    // increment bot count in Redis
    const key = `bot_req_count:${ip}`;
    const count = await redisClient.incr(key);
    if (count === 1) {
      await redisClient.expire(key, 60 * 60); // 1 hour
    }
    if (count > 10) {
      // block for next hour
      await redisClient.set(`bot_blocked:${ip}`, '1', 'EX', 60 * 60);
      return { max: 0, windowMs: 60 * 60 * 1000 };
    }
    return { max: 10, windowMs: 60 * 60 * 1000 };
  }

  if (rows.length > 0 && rows[0].description === 'human') {
    return { max: 1, windowMs: 60 * 60 * 1000 };
  }

  // normal user
  return { max: 100, windowMs: 60 * 60 * 1000 };
}

module.exports = async function adaptiveRateLimiter(req, res, next) {
  const ip = req.ip === '::1' ? '127.0.0.1' : req.ip;

  let config;
  try {
    config = await determineLimit(ip);
  } catch (err) {
    console.error('Error determining rate limit:', err);
    config = { max: 100, windowMs: 60 * 60 * 1000 };
  }

  // instantiate the limiter with our dynamic config
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    keyGenerator: () => ip,
    store: new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
    }),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      return res
        .status(429)
        .json({ message: 'Too many requests. Please try again later.' });
    },
  })(req, res, next);
};
