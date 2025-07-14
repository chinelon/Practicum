const Redis = require('ioredis');

// Connect to local Redis (default)
const redisClient = new Redis({
   username: 'default',
    password: '8Luau8iJycqpnw3thBZeAxP1mAMZfQrT',
    socket: {
        host: 'redis-17508.c11.us-east-1-3.ec2.redns.redis-cloud.com',
        port: 17508
    }
});

redisClient.on('connect', () => console.log('Connected to Redis'));
redisClient.on('error', (err) => console.error('Redis Error:', err));

module.exports = redisClient;


// await client.connect();

// await client.set('foo', 'bar');
// const result = await client.get('foo');
// console.log(result)  // >>> bar

