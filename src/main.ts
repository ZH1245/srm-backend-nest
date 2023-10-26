import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createConnection } from './utils/connections';
import { json, urlencoded } from 'express';
import * as csurf from 'csurf';
import helmet from 'helmet';

const PORT = process.env.PORT || 5000;
import * as cors from 'cors';
const allowedOrigins = ['http://192.168.5.252:3000'];
export const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('You are not Allowed to Access this Page!'));
    }
  },
  credentials: true,
};
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    bodyParser: false,
  });
  // app.use(csurf());
  app.use(urlencoded({ extended: true }));
  app.use(json({ limit: '90mb' }));
  app.enableCors();
  app.use(helmet());

  // cors({
  //   origin: '*',
  //   allowedHeaders: ['Authorization', 'content-*'],
  //   methods: ['*'],
  // }),

  await createConnection()
    .then(async () => {
      console.log('Connected To Dabatase. Stating Server...');
      await app.listen(PORT).then(() => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch((e) => {
      console.log(e);
      console.log('Error connecting to database');
      process.exit(1);
      // return;
    });
}

bootstrap();
