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
      await new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        const job = await this.redis.getJob();
        if (!job) continue;

        const { fileId, resolution } = job;
        console.log(`🔁 Transcoding ${fileId} at ${resolution}...`);

        const tempDir = `/tmp/transcode/${fileId}/${resolution}`;
        await fs.mkdir(tempDir, { recursive: true });

        const inputPath = join(tempDir, 'original.mp4');

        try {
          await this.minio.downloadFile(
            'stream',
            `${fileId}/video.mp4`,
            inputPath,
          );
        } catch (err) {
          console.error(`❌ Failed to download video for ${fileId}:`, err);
          continue;
        }

        await transcodeToResolution(inputPath, tempDir, resolution);

        const variantPath = join(tempDir, 'video.mp4');
        const streamPath = join(tempDir, 'playlist.m3u8');
        const files = await fs.readdir(tempDir);

        const uploads = [
          this.minio.uploadFile(
            'stream',
            `${fileId}/${resolution}/video.mp4`,
            variantPath,
          ),
          this.minio.uploadFile(
            'stream',
            `${fileId}/${resolution}/playlist.m3u8`,
            streamPath,
          ),
        ];

        for (const part of files) {
          if (part.endsWith('.ts')) {
            uploads.push(
              this.minio.uploadFile(
                'stream',
                `${fileId}/${resolution}/${part}`,
                join(tempDir, part),
              ),
            );
          }
        }

        await Promise.all(uploads);

        console.log(`✅ Transcoded ${fileId} at ${resolution}`);
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (err) {
        console.error('❌ Transcode error:', err);
      }
    }
  }
}
