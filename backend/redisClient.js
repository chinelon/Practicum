// const Redis = require('ioredis');

// // Connect to local Redis (default)
// const redisClient = new Redis({
//   host: '127.0.0.1',
//   port: 6379,
//   // password: 'your_redis_password' // if you're using Redis Cloud
// });

// redisClient.on('connect', () => console.log('Connected to Redis'));
// redisClient.on('error', (err) => console.error('Redis Error:', err));

// module.exports = redisClient;
const { createClient } = require('redis');
const Redis = require('ioredis');

const redisClient = new Redis({
    username: 'default',
    password: '8Luau8iJycqpnw3thBZeAxP1mAMZfQrT',
    socket: {
        host: 'redis-17508.c11.us-east-1-3.ec2.redns.redis-cloud.com',
        port: 17508,
        tls: true
    }
});

redisClient.on('error', err => console.log('Redis Client Error', err));

(async () => {
    await redisClient.set('foo', 'connected to Redis Cloud');
    const result = await redisClient.get('foo');
    console.log(result);
})();

module.exports = redisClient;