import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { YprService } from './ypr.service';
import { Request, Response } from 'express';
import { UserDashboard } from 'src/dashboard/dashboard.controller';

@Controller('ypr')
export class YprController {
  constructor(private readonly yprService: YprService) {}

  @Get('pending')
  async getPendingYPRs(@Res() response: Response) {
    const result = await this.yprService.getPendingYPRs();
    return response.json(result);
  }
  @Get('pending/count')
  async getPendingYPRsCount(@Res() response: Response) {
    const result = await this.yprService.getPendingYPRsCount();
    return response.json(result);
  }
  @Get('my')
  async getByVendor(
    @Req() req: Request & { user?: UserDashboard },
    @Res() res: Response,
  ) {
    const result = await this.yprService.getYPRSForVendor(req.user.CODE);
    return res.json(result);
  }
  @Get('all')
  async getAllQuotations(@Res() response: Response) {
    const result = await this.yprService.getAllQuotations();
    return response.json(result);
  }

  @Get('modified')
  async getModifiedYPRs() {}

  @Post('create')
  async createYPRQuotationHeader(@Body() body, @Res() response: Response) {
    const result = await this.yprService.createYPRHeaderQuotation(body);
    return response.json(result);
  }
}
