import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly client: Redis;

  constructor(private readonly config: ConfigService) {
    const host = this.config.getOrThrow<string>('REDIS_HOST');
    const port = this.config.getOrThrow<number>('REDIS_PORT');
    const username = this.config.getOrThrow<string>('REDIS_USERNAME');
    const password = this.config.getOrThrow<string>('REDIS_PASSWORD');

    this.client = new Redis({ host, port, username, password });
  }

  async addChunk(fileId: string, index: number) {
    await this.client.sadd(`stream:upload:${fileId}:receivedChunks`, index);
  }

  async getReceivedChunkCount(fileId: string): Promise<number> {
    return this.client.scard(`stream:upload:${fileId}:receivedChunks`);
  }

  async clearChunks(fileId: string) {
    await this.client.del(`stream:upload:${fileId}:receivedChunks`);
  }

  async tryLock(fileId: string): Promise<boolean> {
    const lockKey = `stream:upload:${fileId}:lock`;
    const result = await this.client.set(lockKey, '1', 'EX', 120, 'NX');
    return result === 'OK';
  }

  async releaseLock(fileId: string) {
    const lockKey = `stream:upload:${fileId}:lock`;
    if (await this.client.exists(lockKey)) {
      await this.client.del(lockKey);
    }
  }

  async pushJob(fileId: string, res: string) {
    await this.client.rpush(
      'stream:transcode',
      JSON.stringify({ fileId, res }),
    );
  }
}
