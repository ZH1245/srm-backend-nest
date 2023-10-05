import { HttpException, Injectable } from '@nestjs/common';
import { LoginDTO } from './type';
import { validateSQL } from 'src/utils/checkSQL';
import { Result } from 'odbc';
import { UserDashboard } from 'src/dashboard/dashboard.controller';
import { sign } from 'jsonwebtoken';
import { randomBytes } from 'crypto';
@Injectable()
export class AuthService {
  async login(body: LoginDTO) {
    const { PASSWORD, EMAIL } = body;
    const doesEmailContainSQL = validateSQL(EMAIL);
    const doesPasswordContainSQL = validateSQL(PASSWORD);
    if (!doesEmailContainSQL && !doesPasswordContainSQL) {
      const result: Result<
        UserDashboard & {
          PASSWORD: string;
          ISACTIVE: '0' | '1';
          ISVERIFIED: '0' | '1';
        }
      > = await global.connection.query(`
            Select * FROM "SRMUSERS" WHERE "EMAIL" = '${body.EMAIL}';
        `);
      if (result.count !== 0) {
        if (result[0].PASSWORD === body.PASSWORD) {
          if (result[0].ISACTIVE === '0')
            throw new HttpException('User Not Active', 400);
          if (result[0].ISVERIFIED === '0')
            throw new HttpException('Email Not Verified', 400);
          if (result[0].ISACTIVE === '1' && result[0].ISVERIFIED === '1') {
            const { CODE, EMAIL, NAME, ROLE, ISACTIVE, ISVERIFIED } = result[0];
            //   sign jwt token
            const token = sign(
              { CODE, EMAIL, NAME, ROLE },
              process.env.JWT_SECRET,
              {
                expiresIn: '30m',
              },
            );
            return { token };
          }
          //   return { token };
        } else {
          throw new HttpException('Invalid Credentials', 400);
        }
      } else {
        throw new HttpException('User Not Found', 404);
      }
    } else {
      throw new HttpException('Invalid Credentials', 400);
    }
  }
  async register() {
    return 'register';
  }
  async generateOTP() {
    return 'generate-otp';
  }
  async verifyOTPAndUpdatePassword() {
    return 'verify-otp-password';
  }
}
