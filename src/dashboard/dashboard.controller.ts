import { Controller, Get, Req, Res } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Response } from 'express';

export type UserDashboard = {
  EMAIL: string;
  CODE: string;
  NAME: string;
  ROLE: string;
};
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('vendor')
  async getVendorDashboard(
    @Res() res: Response,
    @Req() req: Request & { user?: UserDashboard },
  ) {
    const user: UserDashboard = req.user;
    const result = await this.dashboardService.getVendorDashboard(user);
    return res.json({ data: result });
  }

  @Get('admin')
  async getAdminDashboard(@Res() res: Response) {
    const result = await this.dashboardService.getAdminDashboard();
    return res.json({ data: result });
  }
}
