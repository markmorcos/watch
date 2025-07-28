import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideosService } from './videos.service';

@Controller('upload')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Post('chunk')
  @UseInterceptors(FileInterceptor('chunk'))
  async uploadChunk(
    @UploadedFile() chunk: Express.Multer.File,
    @Body() body: { fileId: string; index: string; total: string },
  ) {
    await this.videosService.storeChunk(
      body.fileId,
      Number(body.index),
      Number(body.total),
      chunk.buffer,
    );
    return { status: 'chunk received' };
  }
}
