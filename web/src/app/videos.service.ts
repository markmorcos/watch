import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';

import { environment } from '../environments/environment';

export interface VideoEntry {
  id: string;
  title: string;
  resolutions: string[];
}

@Injectable({ providedIn: 'root' })
export class VideosService {
  http = inject(HttpClient);

  loading = signal(false);
  videos = signal<VideoEntry[]>([]);

  getVideos() {
    this.loading.set(true);
    return this.http
      .get<VideoEntry[]>(`${environment.videosApiBaseUrl}/api/videos`)
      .pipe(
        tap({
          next: (videos) => {
            this.videos.set(videos);
          },
          finalize: () => {
            this.loading.set(false);
          },
        })
      );
  }

  getVideoUrl(fileId: string, res: string) {
    this.loading.set(true);
    return this.http
      .get(`${environment.videosApiBaseUrl}/api/videos/${fileId}/${res}`, {
        responseType: 'text' as const,
      })
      .pipe(
        tap({
          next: (url) => {
            return url;
          },
          finalize: () => {
            this.loading.set(false);
          },
        })
      );
  }

  getStreamUrl(fileId: string, res: string) {
    return `${environment.streamApiBaseUrl}/api/stream/${fileId}/${res}`;
  }
}
