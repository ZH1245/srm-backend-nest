import { Module } from '@nestjs/common';
import { SapService } from './sap.service';

@Module({
  exports: [SapService],
  providers: [SapService],
})
export class SapModule {}
