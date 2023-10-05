import {
  Body,
  Controller,
  Get,
  Head,
  Headers,
  Patch,
  Post,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { GrpoService } from './grpo.service';
import { UserDashboard } from 'src/dashboard/dashboard.controller';
import { Request, Response } from 'express';
import { writeFile } from 'fs/promises';
import { JwtPayload } from 'jsonwebtoken';
import {
  AnyFilesInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { CreateGrpoPayload } from './types';

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
  async getMyReadyGrpos(@Req() req: { user?: UserDashboard }) {
    const user = req.user;
    return this.grpoService.getMyReadyGrpos(user);
  }

  @Post('create-my-grpo')
  //   @UseInterceptors(AnyFilesInterceptor())
  @UseInterceptors(AnyFilesInterceptor())
  async createMyGrpo(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: CreateGrpoPayload,
    @Req() req: Request & { user?: UserDashboard },
  ) {
    const user = req.user;
    const result = await this.grpoService.createMyGrpo(user, files, body);
    return result;
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
