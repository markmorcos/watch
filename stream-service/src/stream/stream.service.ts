import { Injectable } from '@nestjs/common';

import { MinioService } from '../minio.service';

@Injectable()
export class StreamService {
  constructor(private readonly minio: MinioService) {}

  async getStream(fileId: string, res: string) {
    // Step 1: Download original playlist
    const objectName = `${fileId}/${res}/playlist.m3u8`;
    const playlist = await this.minio.getObjectAsText('stream', objectName);

    // Step 2: Replace each segment with a signed URL
    const lines = playlist.split('\n');
    const signedLines = await Promise.all(
      lines.map(async (line) => {
        if (line.trim().endsWith('.ts')) {
          const signedUrl = await this.minio.getUrl(
            'stream',
            `${fileId}/${res}/${line.trim()}`,
          );
          return signedUrl;
        }
        return line;
      }),
    );

    return signedLines.join('\n');
  }
}
