import { Inject, Injectable } from '@nestjs/common';

import { MinioService } from '../minio.service';
import { RedisService } from '../redis.service';

@Injectable()
export class VideosService {
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
    await this.minio.uploadChunk(
      'stream',
      `${fileId}/tmp/${index}.part`,
      buffer,
    );

    console.log(`Chunk ${index} of file ${fileId} uploaded.`);

    await this.redis.addChunk(fileId, index);

    const receivedCount = await this.redis.getReceivedChunkCount(fileId);
    if (receivedCount === total) {
      console.log(
        `All chunks received for file ${fileId}. Initiating assembly.`,
      );
      await this.redis.pushJob({ type: 'assemble', fileId });
      await this.redis.clearChunks(fileId);
    }
  }
}
