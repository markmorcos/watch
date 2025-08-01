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

  async getJob(): Promise<{ fileId: string; resolution: string } | null> {
    const job = await this.client.blpop('stream:transcode', 0);

    if (!job) return null;

    const [, data] = job;
    if (!data) return null;

    const { fileId, resolution } = JSON.parse(data) as {
      fileId: string;
      resolution: string;
    };

    return { fileId, resolution };
  }
}
