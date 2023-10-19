import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createConnection } from './utils/connections';
import { json, urlencoded } from 'express';
const PORT = process.env.PORT || 5000;
import * as cors from 'cors';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    bodyParser: false,
  });

  app.use(urlencoded({ extended: true }));
  app.use(json({ limit: '50mb' }));
  app.use(
    cors({
      origin: '*',
      allowedHeaders: ['Authorization', 'content-*'],
      methods: ['*'],
    }),
  );

  await app.listen(PORT).then(() => {
    console.log(`Server is running on port ${PORT}`);
  });

  await createConnection();
}

bootstrap();
