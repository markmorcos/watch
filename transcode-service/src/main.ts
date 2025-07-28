import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TranscodeService } from './transcode.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const transcode = app.get(TranscodeService);
  await transcode.run();
}
bootstrap();
