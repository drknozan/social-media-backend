import { createClient } from 'redis';

const redisClient = createClient({ url: process.env.REDIS_URL });

redisClient.on('error', err => console.log(err));

if (!redisClient.isOpen) {
  redisClient.connect();
}

export default redisClient;
