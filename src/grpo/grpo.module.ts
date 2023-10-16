// -------------------------------------------------------------------------
import { Module } from '@nestjs/common';
import { SapModule } from 'src/sap/sap.module';
// -------------------------------------------------------------------------

@Module({
  imports: [SapModule],
})
export class GrpoModule {}
