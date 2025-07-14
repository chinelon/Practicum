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

redisClient.on('error', err => console.log('Redis Client Error', err));

(async () => {
    await redisClient.set('foo', 'connected to Redis Cloud');
    const result = await redisClient.get('foo');
    console.log(result);
})();

module.exports = redisClient;