import { HttpException, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtPayload, verify } from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(
    req: Request & { user?: string | JwtPayload },
    res: Response,
    next: NextFunction,
  ) {
    const { authorization } = req.headers;
    if (authorization) {
      const token = authorization.split(' ')[1];
      verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          console.log(err);

          if (err.name === 'TokenExpiredError') {
            throw new HttpException('Session Expired. Login Again', 401);
          } else if (err.name === 'JsonWebTokenError') {
            throw new HttpException('Invalid Auth Header', 401);
          } else {
            throw new HttpException('UnAuthorized', 401);
          }
          //   return res.status(401).json({ message: 'Invalid Token' });
        } else {
          // console.log(decoded);
          req.user = decoded;
          next();
        }
      });
    } else {
      throw new HttpException('UnAuthorized', 401);
    }
  }
}
