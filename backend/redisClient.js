dotenv = require('dotenv');
const Redis = require('ioredis');

const redisClient = new Redis({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        tls: true
    }
});

redisClient.on('connect', () => console.log('Connected to Redis'));
redisClient.on('error', (err) => console.error('Redis Error:', err));

module.exports = redisClient;