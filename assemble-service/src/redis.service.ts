import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

interface TranscodeJob {
  type: 'transcode';
  fileId: string;
  resolution: string;
}

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

  async getJob(): Promise<{ fileId: string } | null> {
    const job = await this.client.blpop('stream:assemble', 0);

    if (!job) return null;

    const [, data] = job;
    if (!data) return null;

    const { fileId } = JSON.parse(data) as { fileId: string; res: string };

    return { fileId };
  }

  pushJob(payload: TranscodeJob) {
    return this.client.rpush('stream:transcode', JSON.stringify(payload));
  }

  async tryLock(fileId: string): Promise<boolean> {
    const lockKey = `stream:assemble:${fileId}:lock`;
    const result = await this.client.set(lockKey, '1', 'EX', 120, 'NX');
    return result === 'OK';
  }

  async releaseLock(fileId: string) {
    const lockKey = `stream:assemble:${fileId}:lock`;
    if (await this.client.exists(lockKey)) {
      await this.client.del(lockKey);
    }
  }
}
