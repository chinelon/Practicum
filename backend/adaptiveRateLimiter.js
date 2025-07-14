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


//reverting back
// const rateLimit = require('express-rate-limit');
// const pool = require('./db');

// // 🚨 Simple in-memory store for bot request counts and blocked IPs
// const botRequestCounts = {};
// const permanentlyBlocked = {};

// const adaptiveRateLimiter = rateLimit({
//   windowMs: 60 * 60 * 1000, // 1 hour window

//   max: async (req, res) => {
//     const ip = req.ip === '::1' ? '127.0.0.1' : req.ip;
//     console.log(`🔍 Rate limit check for ${ip} on ${req.path}`);

//     // Check permanent block list
//     if (permanentlyBlocked[ip]) {
//       console.log(`🚫 ${ip} is permanently blocked`);
//       return 0;
//     }

//     try {
//       const result = await pool.query(
//         'SELECT * FROM denylist WHERE ip_address = $1',
//         [ip]
//       );

//       if (result.rows.length > 0) {
//         const description = result.rows[0].description;

//         if (description === 'human') {
//           return 1;
//         } else if (description === 'bot') {
//           // Track bot request count
//           if (!botRequestCounts[ip]) {
//             botRequestCounts[ip] = 1;
//           } else {
//             botRequestCounts[ip]++;
//           }

//           // If more than 10 requests, block permanently
//           if (botRequestCounts[ip] >= 10) {
//             permanentlyBlocked[ip] = true;
//             delete botRequestCounts[ip]; // optional, free memory
//             console.log(`🚨 IP ${ip} now permanently blocked`);
//             return 0;
//           }


//           return 10;
//         }
//       }

//       // Normal user
//       return 100;
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

//setting new
const  pool = require('./db'); // adjust path if needed

const ipRateMap = new Map(); // In-memory rate tracking

function adaptiveRateLimiter(req, res, next) {
  const ip = req.ip === '::1' ? '127.0.0.1' : req.ip;
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour

  if (!ipRateMap.has(ip)) {
    ipRateMap.set(ip, {
      count: 0,
      startTime: now,
      limit: 100,
      fetched: false
    });
  }

  const ipData = ipRateMap.get(ip);

  if (now - ipData.startTime > windowMs) {
    ipData.count = 0;
    ipData.startTime = now;
    ipData.fetched = false;
  }

  if (!ipData.fetched) {
    pool.query('SELECT description FROM denylist WHERE ip_address = $1', [ip])
      .then(result => {
        if (result.rows.length > 0) {
          const desc = result.rows[0].description;
          if (desc === 'human') ipData.limit = 1;
          else if (desc === 'bot') ipData.limit = 10;
          else ipData.limit = 100;
        } else {
          ipData.limit = 100;
        }
        ipData.fetched = true;
        checkAndProceed();
      })
      .catch(err => {
        console.error('Rate limiter DB error:', err);
        ipData.limit = 100;
        ipData.fetched = true;
        checkAndProceed();
      });
  } else {
    checkAndProceed();
  }

  function checkAndProceed() {
    if (ipData.count >= ipData.limit) {
      console.log(`❌ ${ip} blocked after ${ipData.count} requests`);
      return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    }
    ipData.count++;
    next();
  }
}

module.exports = adaptiveRateLimiter;
