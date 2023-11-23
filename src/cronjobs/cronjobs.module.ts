import { Module } from '@nestjs/common';
import { GrpoModule } from 'src/grpo/grpo.module';

@Module({
  imports: [GrpoModule],
})
export class CronjobsModule {}
