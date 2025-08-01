import { Controller, Get, Param, Res } from '@nestjs/common';

import { StreamService } from './stream.service';
import { Response } from 'express';

@Controller('stream')
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @Get(':fileId/:res')
  async getStream(
    @Param('fileId') fileId: string,
    @Param('res') res: string,
    @Res() response: Response,
  ) {
    const playlist = await this.streamService.getStream(fileId, res);

    response.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    return response.send(playlist);
  }

  @Get('/mp4/:fileId/:res')
  async getVideo(
    @Param('fileId') fileId: string,
    @Param('res') res: string,
    @Res() response: Response,
  ) {
    const videoUrl = await this.streamService.getVideoUrl(fileId, res);

    response.setHeader('Content-Type', 'video/mp4');
    response.redirect(301, videoUrl);
  }
}
