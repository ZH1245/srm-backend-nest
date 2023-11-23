// -------------------------------------------------------------------------
import { HttpException, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtPayload, verify } from 'jsonwebtoken';
import { executeAndReturnResult } from 'src/utils/executeAndReturnResult';
// -------------------------------------------------------------------------

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(
    req: Request & { user?: string | JwtPayload },
    res: Response,
    next: NextFunction,
  ) {
    const { authorization } = req.headers;
    if (authorization) {
      const token = authorization.split(' ')[1];
      await verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
          console.log({ ...err });

          if (err.name === 'TokenExpiredError') {
            throw new HttpException('Session Expired. Login Again', 403);
          } else if (err.name === 'JsonWebTokenError') {
            throw new HttpException('Invalid Auth Header', 403);
          } else {
            throw new HttpException('UnAuthorized', 403);
          }
          //   return res.status(401).json({ message: 'Invalid Token' });
        } else {
          // console.log(decoded);
          console.info(
            `Current Requested User is: ${(decoded as any).CODE} , ${
              (decoded as any).NAME
            } , ${(decoded as any).EMAIL} => TIME (${new Date()})`,
          );
          const getOriginalUser = await executeAndReturnResult(`
          SELECT * FROM "SRMUSERS" WHERE "EMAIL" = TRIM('${
            (decoded as any).EMAIL
          }') AND "CODE" = TRIM('${(decoded as any).CODE}') AND "ID" = TRIM('${
            (decoded as any).ID
          }')
          `);
          if (getOriginalUser.count !== 0) {
            if (getOriginalUser[0]['ISACTIVE'] == 1) {
              const { CODE, EMAIL, ROLE, ID, NAME } = getOriginalUser[0];
              req.user = { CODE, EMAIL, NAME, ROLE, ID };
              next();
            } else {
              throw new HttpException('UnAuthorized', 403);
            }
          } else {
            throw new HttpException('UnAuthorized', 403);
          }
        }
      });
    } else {
      throw new HttpException('UnAuthorized', 403);
    }
  }
}
