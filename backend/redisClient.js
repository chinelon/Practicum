const Redis = require('ioredis');

// Connect to local Redis (default)
const redisClient = new Redis({
  host: '127.0.0.1',
  port: 6379,
  // password: 'your_redis_password' // if you're using Redis Cloud
});

redisClient.on('connect', () => console.log('Connected to Redis'));
redisClient.on('error', (err) => console.error('Redis Error:', err));

module.exports = redisClient;
