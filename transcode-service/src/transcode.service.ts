import { Injectable } from '@nestjs/common';
import { MinioService } from './minio.service';
import { RedisService } from './redis.service';
import { transcodeToResolution } from './ffmpeg.util';
import { join } from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class TranscodeService {
  constructor(
    private readonly redis: RedisService,
    private readonly minio: MinioService,
  ) {}

  async run() {
    while (true) {
      try {
        const job = await this.redis.getJob();
        if (!job) continue;

        const { fileId, res } = job;
        console.log(`🔁 Transcoding ${fileId} at ${res}...`);

        const tempDir = `/tmp/transcode/${fileId}/${res}`;
        await fs.mkdir(tempDir, { recursive: true });

        const inputPath = join(tempDir, 'original.mp4');
        await this.minio.downloadFile('stream', `${fileId}.mp4`, inputPath);

        const promises: Promise<any>[] = [];

        promises.push(transcodeToResolution(inputPath, tempDir, res));

        const variantPath = join(tempDir, 'video.mp4');
        promises.push(
          this.minio.uploadFile(
            'stream',
            `${fileId}/${res}/video.mp4`,
            variantPath,
          ),
        );

        const streamPath = join(tempDir, 'playlist.m3u8');
        promises.push(
          this.minio.uploadFile(
            'stream',
            `${fileId}/${res}/playlist.m3u8`,
            streamPath,
          ),
        );

        const parts = await fs.readdir(tempDir);
        for (const part of parts) {
          if (part.endsWith('.ts')) {
            promises.push(
              this.minio.uploadFile(
                'stream',
                `${fileId}/${res}/${part}`,
                join(tempDir, part),
              ),
            );
          }
        }

        await Promise.all(promises);

        console.log(`✅ Transcoded ${fileId}`);
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (err) {
        console.error('❌ Transcode error:', err);
      }
    }
  }
}
