import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      dismissDefaultMessages: false,
    }),
  );
  app.enableCors();

  // Serve uploads BEFORE ServeStaticModule catches everything
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`✅ Application is running on: http://localhost:${port}`);
}

bootstrap();
