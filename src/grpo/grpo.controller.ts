import {
  Body,
  Controller,
  Get,
  Head,
  Headers,
  HttpException,
  Param,
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
  @Get('my-ready-grpos/:id')
  async getMyReadyGrposByDocEntry(
    @Req() req: { user?: UserDashboard },
    @Param('id') id: string,
  ) {
    const user = req.user;

    if (id && id !== 'undefined' && id !== 'null') {
      return this.grpoService.getMyReadyGrposByDocEntry(user, id);
    } else {
      throw new HttpException('Invalid DocEntry', 400);
    }
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
  @Get('download-attachment/:id')
  async downloadAttachment(@Param('id') id: string, @Res() res: Response) {
    const result: { data: any; ATTACHMENTNAME: string } =
      await this.grpoService.downloadAttachment(id);
    if (result) {
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=${result.ATTACHMENTNAME}`,
      );
      return res.send(result.data);
    } else {
      throw new HttpException('Invalid Attachment', 400);
    }
  }
}
