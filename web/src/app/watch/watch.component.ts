import {
  Component,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Hls from 'hls.js';

import { VideosService } from '../videos.service';

@Component({
  selector: 'app-watch',
  standalone: true,
  imports: [],
  templateUrl: './watch.component.html',
  styleUrl: './watch.component.css',
})
export class WatchComponent {
  videosService = inject(VideosService);
  route = inject(ActivatedRoute);

  @ViewChild('videoPlayer') videoElement!: ElementRef<HTMLVideoElement>;

  ngAfterViewInit() {
    const fileId = this.route.snapshot.params['fileId'];
    const video = this.videoElement.nativeElement;
    const url = this.videosService.getStreamUrl(fileId, '360p');
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    }
  }
}
