import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createConnection } from './utils/connections';
import { json, urlencoded } from 'express';
const PORT = process.env.PORT || 5000;
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    bodyParser: false,
  });

  app.use(urlencoded({ extended: true }));
  app.use(json({ limit: '50mb' }));
  await app.listen(PORT);
  await createConnection();
}
bootstrap();
