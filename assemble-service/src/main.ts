import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AssembleService } from './assemble.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const assemble = app.get(AssembleService);
  await assemble.run();
}
bootstrap();
