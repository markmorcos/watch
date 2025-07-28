import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { MinioService } from './minio.service';
import { VideosController } from './videos/videos.controller';
import { VideosService } from './videos/videos.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [VideosController],
  providers: [ConfigService, MinioService, VideosService],
})
export class AppModule {}
