import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS with specific configuration
  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.use(cookieParser());
  
  // Enable validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  await app.listen(process.env.APP_PORT ?? 3000);
}
bootstrap();
