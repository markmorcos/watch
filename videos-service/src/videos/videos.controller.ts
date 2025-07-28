import { Controller, Get, Param } from '@nestjs/common';

import { VideosService } from './videos.service';

@Controller('/')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get()
  async getAll() {
    return this.videosService.listVideos();
  }

  @Get(':fileId/:res')
  async getVideo(@Param('fileId') fileId: string, @Param('res') res: string) {
    return this.videosService.getVideo(fileId, res);
  }
}
