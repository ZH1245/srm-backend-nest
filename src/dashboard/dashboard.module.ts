// -------------------------------------------------------------------------
import { Module } from '@nestjs/common';
import { YprModule } from 'src/ypr/ypr.module';
// -------------------------------------------------------------------------

@Module({
  imports: [YprModule],
})
export class DashboardModule {}
