require('dotenv').config();
const Redis = require('ioredis');
const pool = require('./db');

//Connecta to redis using environment variables
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
  //extract IP address from request headers
  const ip = (req.headers['x-forwarded-for'] || req.ip || '').split(',')[0].trim();

  try {
    // Checks if IP is permanently blocked on Redis
    const isBlocked = await redisClient.get(`blocked:${ip}`);
    if (isBlocked) {
      return res.status(429).json({ message: 'You are permanently blocked.' });
    }

    // Checks Postgres denylist table for IP address, 
    const { rows } = await pool.query(
      'SELECT description FROM denylist WHERE ip_address = $1',
      [ip]
    );

    let maxRequests = 100; // default normal user limit
    // if exists, fetches description and based on description adjusts rate limits i.e 10 requests for bots and 1 requet per hour for human threat actors
    if (rows.length > 0) {
      if (rows[0].description === 'human') {
        maxRequests = 1;
      } else if (rows[0].description === 'bot') {
        maxRequests = 10;
      }
    }

    // Sets Redis key
    const redisKey = `ratelimit:${ip}`;

    // Increments request count in Redis. If the key doesnt exist, it will be created with a value of 1, If it exists, it will be incremented by 1
    const current = await redisClient.incr(redisKey);

    if (current === 1) {
      // Sets expiry for window duration on first request
      await redisClient.expire(redisKey, WINDOW_SECONDS);
    }
    //bots exceeding limit will be blocked for 1 hour, returns 429 status code
    if (current > maxRequests) {

      if (rows.length > 0 && rows[0].description === 'bot') {
        await redisClient.set(`blocked:${ip}`, '1', 'EX', WINDOW_SECONDS);
      }

      return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    }
    
    req.maxRequests = maxRequests;
    req.currentRequests = current;
    // Allow the request if everything is fine and the limit is not exceeded
    next();
  } catch (err) {
    console.error('Adaptive rate limiter error:', err);
    next();
  }
}

module.exports = adaptiveRateLimiter;
module.exports.redisClient = redisClient; // Exports redisClient 