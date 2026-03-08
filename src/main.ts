import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appConfig } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const origin = appConfig.isProduction
    ? (appConfig.corsOrigin
        ? appConfig.corsOrigin.split(',').map((o) => o.trim()).filter(Boolean)
        : [])
    : true;
  app.enableCors({
    origin,
    credentials: true,
  });

  const port = appConfig.port;
  await app.listen(port);
  console.log(`NestJS backend is running on http://localhost:${port}`);
}

bootstrap();
