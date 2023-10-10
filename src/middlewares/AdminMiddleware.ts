import { HttpException, Injectable, NestMiddleware } from '@nestjs/common';
import { Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { UserDashboard } from 'src/dashboard/dashboard.controller';

@Injectable()
export class AdminMiddleware implements NestMiddleware {
  use(
    req: Request & { user?: UserDashboard },
    res: Response,
    next: (error?: any) => void,
  ) {
    const user = req.user;
    // console.log(user);
    if (user?.ROLE !== 'admin') {
      throw new HttpException('UnAuthorized', 401);
    } else next();
  }
}
