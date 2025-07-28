import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { VideosController } from './videos/videos.controller';
import { MinioService } from './minio.service';
import { RedisService } from './redis.service';
import { VideosService } from './videos/videos.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [VideosController],
  providers: [MinioService, RedisService, VideosService],
})
export class AppModule {}
