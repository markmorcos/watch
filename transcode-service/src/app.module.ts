import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MinioService } from './minio.service';
import { RedisService } from './redis.service';
import { TranscodeService } from './transcode.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [],
  providers: [MinioService, RedisService, TranscodeService],
})
export class AppModule {}
