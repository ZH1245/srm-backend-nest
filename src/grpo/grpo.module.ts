// -------------------------------------------------------------------------
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { corsOptions } from 'src/main';
import { SapModule } from 'src/sap/sap.module';
import * as cors from 'cors';
// -------------------------------------------------------------------------
@Module({
  imports: [SapModule],
})
export class GrpoModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cors(corsOptions)).forRoutes('grpo/download-attachment/:id');
  }
}
