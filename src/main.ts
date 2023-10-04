import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createConnection } from './utils/connections';
import { json } from 'express';
const PORT = process.env.PORT || 5000;
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    rawBody: true,
  });
  app.use(json());

  await app.listen(PORT);
  await createConnection();
}
bootstrap();
