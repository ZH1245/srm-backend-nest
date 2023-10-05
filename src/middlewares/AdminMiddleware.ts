import { HttpException, Injectable, NestMiddleware } from '@nestjs/common';
import { UserDashboard } from 'src/dashboard/dashboard.controller';

@Injectable()
export class AdminMiddleware implements NestMiddleware {
  use(req: Request & { user?: UserDashboard }, next: (error?: any) => void) {
    const user = req.user;
    if (user?.ROLE !== 'admin') {
      throw new HttpException('UnAuthorized', 401);
    } else next();
  }
}
