import {
  Controller,
  Get,
  Head,
  Headers,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { GrpoService } from './grpo.service';
import { UserDashboard } from 'src/dashboard/dashboard.controller';
import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';

@Controller('grpo')
export class GrpoController {
  constructor(private readonly grpoService: GrpoService) {}

  @Get('my-pending-grpos')
  async getMyPendingGrpos(
    @Req() req: Request & { user?: string | JwtPayload },
    @Res() res: Response,
  ) {
    const result = await this.grpoService.getMyPendingGrpos(req.user);
    return res.json({ data: result, message: 'Fetched' });
  }

  @Get('my-completed-grpos')
  async getMyCompletedGrpos() {
    return this.grpoService.getMyCompletedGrpos();
  }

  @Get('my-ready-grpos')
  async getMyReadyGrpos() {
    return this.grpoService.getMyReadyGrpos();
  }

  @Post('create-my-grpo')
  async createMyGrpo() {
    return this.grpoService.createMyGrpo();
  }

  @Patch('mark-grpo-as-ready')
  async markGrpoAsReady() {
    return this.grpoService.markGrpoAsReady();
  }
  @Patch('mark-grpo-as-completed')
  async markGrpoAsCompleted() {
    return this.grpoService.markGrpoAsCompleted();
  }
}
