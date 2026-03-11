import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appConfig } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  const port = appConfig.port;
  await app.listen(port);
  console.log(`NestJS backend is running on http://localhost:${port}`);
}

bootstrap();
