import { Module } from '@nestjs/common';
import { EmailService } from './email.service';

@Module({
  // exports: [EmailService],
})
export class EmailModule {}
