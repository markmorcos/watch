import { Injectable } from '@nestjs/common';
import { MinioService } from './minio.service';
import { RedisService } from './redis.service';
import { join } from 'path';
import * as fs from 'fs/promises';
import * as fssync from 'fs';

@Injectable()
export class AssembleService {
  constructor(
    private readonly redis: RedisService,
    private readonly minio: MinioService,
  ) {}

  async run() {
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        const job = await this.redis.getJob();
        if (!job) continue;

        const { fileId } = job;

        console.log(`🔁 Assembling ${fileId}...`);

        await this.assembleChunks(fileId);

        console.log(`✅ Assembled ${fileId}`);
      } catch (err) {
        console.error('❌ Assemble error:', err);
      }
    }
  }

  async assembleChunks(fileId: string) {
    const lock = await this.redis.tryLock(fileId);
    if (!lock) return;

    const chunks = await this.minio.listChunks('stream', `${fileId}/tmp/`);
    const partFiles = chunks.sort((a, b) => {
      const aIndex = parseInt(a.split('/').pop()?.split('.')[0] ?? '0');
      const bIndex = parseInt(b.split('/').pop()?.split('.')[0] ?? '0');
      return aIndex - bIndex;
    });

    await fs.mkdir(`/tmp/${fileId}`, { recursive: true });
    const outputPath = join(`/tmp/${fileId}`, 'video.mp4');
    const writeStream = fssync.createWriteStream(outputPath);

    for (const part of partFiles) {
      const chunk = await this.minio.getChunkStream('stream', part);
      await new Promise<void>((resolve, reject) => {
        chunk.pipe(writeStream, { end: false });
        chunk.on('end', resolve);
        chunk.on('error', reject);
      });
    }

    writeStream.end();
    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    await this.minio.uploadFile('stream', `${fileId}/video.mp4`, outputPath);

    await Promise.all([
      this.redis.pushJob({ type: 'transcode', fileId, resolution: '360p' }),
      this.redis.pushJob({ type: 'transcode', fileId, resolution: '720p' }),
      this.redis.pushJob({ type: 'transcode', fileId, resolution: '1080p' }),
    ]);

    await this.minio.deleteFolder('stream', `${fileId}/tmp/`);
    await fs.rm(`/tmp/${fileId}`, { recursive: true, force: true });

    await this.redis.releaseLock(fileId);
  }
}
