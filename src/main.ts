import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true, // Cho phép mọi origin
    credentials: true,
  });

  await app.listen(3000);
  // eslint-disable-next-line no-console
  console.log(`NestJS backend is running on http://localhost:3000`);
}

bootstrap();
