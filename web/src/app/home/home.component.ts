import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { VideosService } from '../videos.service';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  videosService = inject(VideosService);

  loading = this.videosService.loading;
  videos = this.videosService.videos;

  ngOnInit() {
    this.videosService.getVideos().subscribe();
  }
}
