import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { MinioService } from './minio.service';
import { StreamController } from './stream/stream.controller';
import { StreamService } from './stream/stream.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [StreamController],
  providers: [ConfigService, MinioService, StreamService],
})
export class AppModule {}
