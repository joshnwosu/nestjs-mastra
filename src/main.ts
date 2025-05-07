import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Set GOOGLE_GENERATIVE_AI_API_KEY from GEMINI_API_KEY in .env
  process.env.GOOGLE_GENERATIVE_AI_API_KEY =
    configService.get<string>('GEMINI_API_KEY');

  await app.listen(3005);
}
bootstrap();
