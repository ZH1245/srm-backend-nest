import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { GrpoService } from './grpo.service';
import { UserDashboard } from 'src/dashboard/dashboard.controller';
import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { CreateGrpoPayload } from './types';
import {
  CreateMyGRPOValidatorDTO,
  MyCompletedGRPOSByID,
  MyReadyGRPOSByID,
} from './validators';

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
  async getMyCompletedGrpos(
    @Req() req: { user?: UserDashboard },
    @Res() res: Response,
  ) {
    const result = await this.grpoService.getMyCompletedGrpos(req.user);
    return res.json({ data: result.data, message: result.message });
  }

  @Get('my-ready-grpos')
  async getMyReadyGrpos(@Req() req: { user?: UserDashboard }) {
    const user = req.user;
    return this.grpoService.getMyReadyGrpos(user);
  }
  @Get('my-ready-grpos/:id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getMyReadyGrposByDocEntry(
    @Req() req: { user?: UserDashboard },
    @Param('id') id: MyReadyGRPOSByID['id'],
  ) {
    const user = req.user;
    if (id) {
      return this.grpoService.getMyReadyGrposByDocEntry(user, id);
    } else {
      throw new HttpException('Invalid DocEntry', 400);
    }
  }
  @Get('my-completed-grpos/:id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getMyCompletedGrposByDocEntry(
    @Req() req: { user?: UserDashboard },
    @Param('id') id: MyCompletedGRPOSByID['id'],
  ) {
    const user = req.user;

    if (id) {
      return this.grpoService.getMyCompletedGrposByDocEntry(user, id);
    } else {
      throw new HttpException('Invalid DocEntry', 400);
    }
  }

  @Post('create-my-grpo')
  //   @UseInterceptors(AnyFilesInterceptor())
  @UseInterceptors(AnyFilesInterceptor())
  async createMyGrpo(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: CreateMyGRPOValidatorDTO,
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
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async downloadAttachment(
    @Param('id') id: MyCompletedGRPOSByID['id'],
    @Res() res: Response,
  ) {
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

  @Get('all-invoices-grpos')
  async getAllInvoicesFromGrpos(
    @Req() req: { user?: UserDashboard },
    @Res() res: Response,
  ) {
    const user = req.user;
    const result = await this.grpoService.getAllInvoicesFromGrpos(user);
    return res.json({ data: result.data, message: result.message });
  }
  @Get('all-invoices-grpos/:id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getInvoiceDetails(
    @Req() req: { user?: UserDashboard },
    @Res() res: Response,
    @Param('id') id: MyCompletedGRPOSByID['id'],
  ) {
    const user = req.user;
    const result = await this.grpoService.getInvoiceDetails(user, id);
    return res.json({ data: result.data, message: result.message });
  }
}
