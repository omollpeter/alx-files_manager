import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();
    this.connected = false;

    this.client.on('error', (error) => {
      console.log(error);
    });

    this.client.on('connect', () => {
      this.connected = true;
    });
    this.client.connect();
  }

  isAlive() {
    return this.connected;
  }

  async get(key) {
    const result = await this.client.get(key);
    return result;
  }

  async set(key, value, duration) {
    await this.client.set(key, value, {
      EX: duration,
    });
  }

  async del(key) {
    await this.client.del(key);
  }
}

const redisClient = new RedisClient();

export default redisClient;
