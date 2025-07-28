import { Inject, Injectable } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs/promises';
import * as fssync from 'fs';
import { MinioService } from '../minio.service';
import { RedisService } from 'src/redis.service';

@Injectable()
export class VideosService {
  private readonly basePath = '/tmp/uploads';

  @Inject(MinioService)
  private readonly minio: MinioService;

  @Inject(RedisService)
  private readonly redis: RedisService;

  async storeChunk(
    fileId: string,
    index: number,
    total: number,
    buffer: Buffer,
  ) {
    const dir = join(this.basePath, fileId);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(join(dir, `${index}.part`), buffer);
    await this.redis.addChunk(fileId, index);

    const receivedCount = await this.redis.getReceivedChunkCount(fileId);
    if (receivedCount === total) {
      this.assembleChunks(fileId)
        .then(() => this.redis.clearChunks(fileId))
        .catch((err) => {
          console.error(`Error assembling chunks for file ${fileId}:`, err);
        });
    }
  }

  async assembleChunks(fileId: string) {
    const lock = await this.redis.tryLock(fileId);
    if (!lock) return;

    const dir = join(this.basePath, fileId);
    const outputPath = join(this.basePath, `${fileId}.mp4`);
    const files = await fs.readdir(dir);

    const partFiles = files
      .filter((f) => f.endsWith('.part'))
      .sort((a, b) => parseInt(a) - parseInt(b));

    const writeStream = fssync.createWriteStream(outputPath);
    for (const part of partFiles) {
      const chunk = await fs.readFile(join(dir, part));
      writeStream.write(chunk);
    }

    await new Promise((res) => writeStream.end(res));

    await this.minio.uploadVideo('stream', `${fileId}.mp4`, outputPath);
    await Promise.all([
      this.redis.pushJob(fileId, '360p'),
      this.redis.pushJob(fileId, '720p'),
      this.redis.pushJob(fileId, '1080p'),
    ]);

    await fs.rm(dir, { recursive: true, force: true });
    await fs.unlink(outputPath);

    await this.redis.releaseLock(fileId);
  }
}
