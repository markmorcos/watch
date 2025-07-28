import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';

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
    return this.http.get<VideoEntry[]>('https://watch.morcos.tech/videos').pipe(
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
      .get(`https://watch.morcos.tech/videos/${fileId}/${res}`, {
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
    return `https://watch.morcos.tech/stream/${fileId}/${res}`;
  }
}
