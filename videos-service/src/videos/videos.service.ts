import { Injectable } from '@nestjs/common';

import { MinioService } from '../minio.service';

@Injectable()
export class VideosService {
  constructor(private readonly minio: MinioService) {}

  async listVideos(): Promise<{ id: string; resolutions: string[] }[]> {
    const files = await this.minio.listObjects('stream');

    const grouped: Record<string, string[]> = {};

    for (const path of files) {
      const [id, filename] = path.split('/');
      const res = filename?.split('.')[0];
      if (!id || !res) continue;

      if (!grouped[id]) grouped[id] = [];
      grouped[id].push(res);
    }

    return Object.entries(grouped).map(([id, resolutions]) => ({
      id,
      resolutions,
    }));
  }

  async getVideo(fileId: string, res: string) {
    return this.minio.getObject('stream', `${fileId}/${res}/video.mp4`);
  }
}
