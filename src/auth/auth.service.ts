import { HttpException, Injectable } from '@nestjs/common';
import { LoginDTO } from './type';
import { validateSQL } from 'src/utils/checkSQL';
import { Result } from 'odbc';
import { UserDashboard } from 'src/dashboard/dashboard.controller';
import { sign } from 'jsonwebtoken';

import * as moment from 'moment';
import { User } from 'src/user/type';
import { createStatementAndExecute } from 'src/utils/createStatementAndExecute';
// import { randomBytes } from 'crypto';
@Injectable()
export class AuthService {
  async login(body: LoginDTO) {
    const { PASSWORD, EMAIL } = body;
    const doesEmailContainSQL = validateSQL(EMAIL);
    const doesPasswordContainSQL = validateSQL(PASSWORD);
    if (!doesEmailContainSQL && !doesPasswordContainSQL) {
      // @ts-ignore
      const result: Result<
        UserDashboard & {
          PASSWORD: string;
          ISACTIVE: '0' | '1';
          ISVERIFIED: '0' | '1';
          ID: string;
        }
      > = await global.connection
        .query(`Select * FROM "SRMUSERS" WHERE "EMAIL" = '${body.EMAIL}';`)
        .catch((e) => {
          throw new HttpException(e.message, 400);
        });
      // let existingUserCommand = await global.connection.createStatement();
      // await existingUserCommand.prepare(
      //   'SELECT * FROM "SRMUSERS" WHERE "EMAIL" = ?',
      // );
      // await existingUserCommand.bind([body.EMAIL], (err) => {
      //   if (err) {
      //     throw new HttpException(err.message, 400);
      //   }
      // });
      // const result: Result<
      //   UserDashboard & {
      //     PASSWORD: string;
      //     ISACTIVE: '0' | '1';
      //     ISVERIFIED: '0' | '1';
      //     ID: string;
      //   }
      // > = await existingUserCommand.execute();
      // await existingUserCommand.close();
      // existingUserCommand = null;
      if (result.count !== 0) {
        if (result[0].PASSWORD === body.PASSWORD) {
          if (result[0].ISACTIVE === '0')
            throw new HttpException('The Requested User is Disabled', 400);
          // throw new HttpException('The', 400);
          if (result[0].ISVERIFIED === '0')
            throw new HttpException('Email Not Verified', 400);
          if (result[0].ISACTIVE === '1' && result[0].ISVERIFIED === '1') {
            const { CODE, EMAIL, NAME, ROLE, ID } = result[0];
            //   sign jwt token
            const token = sign(
              { CODE, EMAIL, NAME, ROLE, ID },
              process.env.JWT_SECRET,
              {
                expiresIn: '30m',
              },
            );
            return { token };
          }
          //   return { token };
        } else {
          throw new HttpException('Credentials Incorrect', 400);
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
  async generateOTP(email: string) {
    console.log(email);
    //  check if user exists against en email;
    const isUser: Result<User> = await global.connection
      .query(
        `
      SELECT * FROM SRMUSERS WHERE EMAIL = '${email}';
    `,
      )
      .catch((e) => {
        throw new HttpException(e.message, 400);
      });
    // const isUser: Result<User> = await createStatementAndExecute(
    //   'SELECT * FROM SRMUSERS WHERE "EMAIL" = ?',
    //   [email],
    // );

    if (isUser.count === 0) throw new HttpException('User Not Found', 404);
    else {
      const code = Math.floor(100000 + Math.random() * 900000);
      const expiryTime = moment().add(10, 'minutes').format('X');
      console.log(expiryTime, 'expiryTime');
      console.log('code', code);
      // await global.connection.beginTransaction();
      // const result = await createStatementAndExecute(
      //   'INSERT INTO SRM_OTP (CODE,EMAIL,EXPIRY,USERID) VALUES (?,?,?,?)',
      //   [code, email, expiryTime, isUser[0].ID],
      // )
      // .catch((e) => {
      //   throw new HttpException(e.message || 'Error Generating OTP', 400);
      // })
      // .then(async (res: Result<any>) => {
      //   await global.connection.commit();
      //   return res;
      // });
      await global.connection.beginTransaction();
      const result: Result<any> = await global.connection
        .query(
          `
        INSERT INTO SRM_OTP (CODE,EMAIL,EXPIRY,USERID) VALUES ('${code}','${email}','${expiryTime}','${isUser[0].ID}');
      `,
        )
        .catch(async (e) => {
          await global.connection.rollback();
          throw new HttpException(e.message || 'Error Generating OTP', 400);
        });

      if (result.count !== 0) {
        //   send email
        return { message: 'OTP Sent to Email', data: true };
      } else {
        throw new HttpException('Error Generating OTP', 400);
      }
    }
  }
  async verifyOTPAndUpdatePassword(body: {
    password: string;
    otp: string;
    email: string;
  }) {
    const checkEmailExist = await global.connection
      .query(
        `
      SELECT * FROM SRMUSERS WHERE EMAIL = '${body.email}';
    `,
      )
      .catch((e) => {
        throw new HttpException(e.message, 400);
      });
    // const checkEmailExist = await createStatementAndExecute(
    //   'SELECT * FROM SRMUSERS WHERE "EMAIL" = ?',
    //   [body.email],
    // );
    if (checkEmailExist.count === 0)
      throw new HttpException('User Not Found', 404);
    else {
      // check OTP VALID FROM SRM_OTP
      const checkOTP: Result<{
        EXPIRY: string;
        EMAIL: string;
        ID: string;
        ISVERIFIED: '0' | '1';
      }> = await global.connection
        .query(
          `
        SELECT * FROM SRM_OTP WHERE EMAIL = '${body.email}' AND "CODE" = '${body.otp}';
      `,
        )
        .catch((e) => {
          throw new HttpException(e.message, 400);
        });
      // const checkOTP = await createStatementAndExecute(
      //   'SELECT * FROM SRM_OTP WHERE "EMAIL" = ? AND "CODE" = ?',
      //   [body.email, body.otp],
      // );
      if (checkOTP.count !== 0) {
        const isverified = checkOTP[0].ISVERIFIED;
        if (isverified === '1') {
          throw new HttpException('Email Already Verified', 400);
        } else {
          const expiry = checkOTP[0].EXPIRY;
          const currentTime = moment().format('X');
          const isAfter = moment(new Date(currentTime)).isAfter(expiry);
          if (isAfter) {
            throw new HttpException('OTP Expired', 400);
          } else {
            await global.connection.beginTransaction();
            const updatePassword = await global.connection
              .query(
                `
            UPDATE SRMUSERS SET PASSWORD = '${body.password}' WHERE EMAIL = '${body.email}';
            `,
              )
              .catch(async (e) => {
                await global.connection.rollback();
                throw new HttpException(e.message, 400);
              });
            // const updatePassword = await createStatementAndExecute(
            //   'UPDATE SRMUSERS SET "PASSWORD" = ? WHERE "EMAIL" = ?',
            //   [body.password, body.email],
            // );
            if (updatePassword.count !== 0) {
              const updateOTP = await global.connection
                .query(
                  `
                UPDATE SRM_OTP SET ISVERIFIED = true WHERE EMAIL = '${body.email}' AND "CODE" = '${body.otp}';
              `,
                )
                .catch(async (e) => {
                  await global.connection.rollback();
                  throw new HttpException(e.message, 400);
                });
              // const updateOTP = await createStatementAndExecute(
              //   'UPDATE SRM_OTP SET "ISVERIFIED" = true WHERE "EMAIL" = ? AND "CODE" = ?',
              //   [body.email, body.otp],
              // );
              if (updateOTP.count !== 0) {
                await global.connection.commit();
                return { message: 'Password Updated Successfully', data: true };
              } else {
                // await global.connection.rollback();
                throw new HttpException('Error Updating OTP', 400);
              }
            } else {
              throw new HttpException('Error Updating Password', 400);
            }
          }
        }
      } else {
        throw new HttpException('Error Updating Password', 400);
      }
    }
  }
}
