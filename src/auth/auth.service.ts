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
      const result: Result<UserDashboard & { PASSWORD: string }> = await global
        .connection.query(`
            Select * FROM "SRMUSERS" WHERE "EMAIL" = '${body.EMAIL}';
        `);
      if (result.count !== 0) {
        if (result[0].PASSWORD === body.PASSWORD) {
          const { CODE, EMAIL, NAME, ROLE } = result[0];
          //   sign jwt token
          const token = sign(
            { CODE, EMAIL, NAME, ROLE },
            process.env.JWT_SECRET,
            {
              expiresIn: '30m',
            },
          );
          return { token };
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
