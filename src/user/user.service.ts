// -------------------------------------------------------------------------
import { HttpException, Injectable } from '@nestjs/common';
import { Result } from 'odbc';
import {
  DeleteUserDTO,
  DisableUserDTO,
  EnableUserDTO,
  NewUserDTO,
} from './type';
import { EditUserValidatorDTO } from './validators';
import { executeAndReturnResult } from 'src/utils/executeAndReturnResult';
import { EmailService } from 'src/email/email.service';
import { UserDashboard } from 'src/dashboard/dashboard.controller';
// -------------------------------------------------------------------------

@Injectable()
/**
 * Service for managing user data.
 */
export class UserService {
  constructor(private readonly emailService: EmailService) {}
  /**
   * Retrieves a list of users who have not been created yet.
   * @returns A string indicating the operation performed.
   */
  async getNotCreatedUsers() {
    const result = await global.connection
      .query(
        `
        SELECT * FROM "VW_NOTSRMUSERS"
      `,
      )
      .catch((e) => {
        throw new HttpException(e.message, 400);
      });
    // const result = await createStatementAndExecute(
    //   `SELECT * FROM "VW_NOTSRMUSERS"`,
    //   [],
    // );
    if (result.count !== 0) {
      return result;
    } else {
      throw new HttpException('No users found', 404);
    }
  }
  /**
   * Retrieves a list of users who have already been created.
   * @returns A string indicating the operation performed.
   */
  async getCreatedUsers(user: UserDashboard) {
    const result = await global.connection
      .query(
        `SELECT "ID","NAME", "EMAIL","ROLE","ISACTIVE","ISVERIFIED","CODE","MOBILE", TO_VARCHAR(TO_DATE("CREATEDAT"),'DD-MM-YYYY') AS "CREATEDAT" FROM "SRMUSERS"
        ${
          user.ROLE !== 'admin'
            ? `WHERE "ROLE" NOT IN ('admin','purchase') `
            : ''
        }
        ORDER BY "NAME" ASC;
      `,
      )
      .catch((e) => {
        throw new HttpException(e.message, 400);
      });
    // const result = await createStatementAndExecute(
    //   `SELECT "ID","NAME", "EMAIL","ROLE","ISACTIVE","ISVERIFIED","CODE","MOBILE" FROM "SRMUSERS";`,
    //   [],
    // );
    if (result.count !== 0) {
      return result;
    } else {
      throw new HttpException('No users found', 404);
    }
  }

  /**
   * Verifies the email of a user.
   * @returns A string indicating the operation performed.
   */
  async verifyEmail(body: { email: string; id: string; OTPCODE: string }) {
    const result = (await global.connection
      .query(
        `
        SELECT "ID","OTPCODE", "EXPIRYTIME" FROM "SRMOTPCODES" WHERE "EMAIL" = TRIM('${body.email}');
      `,
      )
      .catch((e) => {
        throw new HttpException(e.message, 400);
      })) as Result<{ EXPIRYTIME: Date; OTPCODE: string; ID: string }>;
    // const result: Result<{ EXPIRYTIME: Date; OTPCODE: string; ID: string }> =
    //   await createStatementAndExecute(
    //     `SELECT "ID","OTPCODE", "EXPIRYTIME" FROM "SRMOTPCODES" WHERE "EMAIL" = ?;`,
    //     [body.email],
    //   );
    if (result.count !== 0) {
      if (result[0].EXPIRYTIME > new Date()) {
        if (result[0].OTPCODE === body.OTPCODE && result[0].ID === body.id) {
          const changesInUserTable = await global.connection
            .query(
              `
          UPDATE "SRMUSERS" SET "ISVERIFIED" = 1 WHERE "EMAIL" = TRIM('${body.email}');
          `,
            )
            .catch(async (e) => {
              await global.connection.rollback();
              throw new HttpException(e.message, 400);
            });
          // const changesInUserTable = await createStatementAndExecute(
          //   `UPDATE "SRMUSERS" SET "ISVERIFIED" = 1 WHERE "EMAIL" = ?;`,
          //   [body.email],
          // );
          const changesInOTPTable = await global.connection
            .query(
              `
          Update "SRMOTPCODES" SET "ISUSED" = 1 WHERE "EMAIL" = TRIM('${body.email}') AND "ID" = TRIM('${body.id}');
          `,
            )
            .catch(async (e) => {
              await global.connection.rollback();
              throw new HttpException(e.message, 400);
            });
          // const changesInOTPTable = await createStatementAndExecute(
          //   `Update "SRM_OTP" SET "ISVERIFIED" = true WHERE "EMAIL" = ? AND "ID" = ?;`,
          //   [body.email, body.id],
          // );
          return { message: 'Email verified successfully' };
        }
      } else {
        throw new HttpException('OTP expired', 404);
      }
    } else {
      throw new HttpException('No users found', 404);
    }
  }
  /**
   * Disables a user account.
   * @returns A string indicating the operation performed.
   */
  async disableUser(body: DisableUserDTO) {
    await global.connection.beginTransaction();
    const result = await global.connection
      .query(
        `
        UPDATE "SRMUSERS" SET "ISACTIVE" = false WHERE "ID" = TRIM('${body.ID}');
    `,
      )
      .catch(async (e) => {
        await global.connection.rollback();
        throw new HttpException(e.message, 400);
      });
    // const result = await createStatementAndExecute(
    //   `UPDATE "SRMUSERS" SET "ISACTIVE" = false WHERE "ID" = ?;`,
    //   [body.ID],
    // );
    if (result.count !== 0) {
      return { message: 'User disabled successfully' };
    } else {
      throw new HttpException('No users found', 404);
    }
  }

  /**
   * Enables a user account.
   * @returns A string indicating the operation performed.
   */
  async enableUser(body: EnableUserDTO) {
    await global.connection.beginTransaction();
    const result = await global.connection
      .query(
        `
        UPDATE "SRMUSERS" SET "ISACTIVE" = true WHERE "ID" = TRIM('${body.ID}');
    `,
      )
      .catch(async (e) => {
        await global.connection.rollback();
        throw new HttpException(e.message, 400);
      });
    // const result = await createStatementAndExecute(
    //   'UPDATE "SRMUSERS" SET "ISACTIVE" = true WHERE "ID" = ?;',
    //   [body.ID],
    // );
    if (result.count !== 0) {
      return { message: 'User enabled successfully' };
    } else {
      throw new HttpException('No users found', 404);
    }
  }

  /**
   * Deletes a user account.
   * @returns A string indicating the operation performed.
   */
  async deleteUser(body: DeleteUserDTO) {
    await global.connection.beginTransaction();
    const result = await global.connection
      .query(
        `
        DELETE FROM "SRMUSERS" WHERE "ID" = TRIM('${body.ID}');
    `,
      )
      .catch(async (e) => {
        await global.connection.rollback();
        throw new HttpException(e.message, 400);
      });
    // const result = await createStatementAndExecute(
    //   'DELETE FROM "SRMUSERS" WHERE "ID" = ?;',
    //   [body.ID],
    // );
    if (result.count !== 0) {
      return { message: 'User deleted successfully' };
    } else {
      throw new HttpException('No users found', 404);
    }
  }
  async getUserByQueryParams(query: any) {
    const result = await global.connection
      .query(
        `
      SELECT "NAME", "EMAIL","ROLE","ISACTIVE","ISVERIFIED" FROM "SRMUSERS" WHERE "NAME" LIKE '%${query.name}%' AND "EMAIL" LIKE '%${query.email}%' AND "ROLE" LIKE '%${query.role}%' AND "ISACTIVE" LIKE '%${query.isactive}%' AND "ISVERIFIED" LIKE '%${query.isverified}%';
    `,
      )
      .catch((e) => {
        throw new HttpException(e.message, 400);
      });
    // const result = await createStatementAndExecute(
    //   'SELECT "NAME", "EMAIL","ROLE","ISACTIVE","ISVERIFIED" FROM "SRMUSERS" WHERE "NAME" LIKE ? AND "EMAIL" LIKE ? AND "ROLE" LIKE ? AND "ISACTIVE" LIKE ? AND "ISVERIFIED" LIKE ?;',
    //   [query.name, query.email, query.role, query.isactive, query.isverified],
    // );
    return result;
  }
  async createNewUser(body: NewUserDTO): Promise<{ message: string }> {
    // const salt = await genSalt(10);
    // const hashedPassword = await hash(body.PASSWORD, salt);
    // ---------------------------------------------
    const existingUser = await executeAndReturnResult(
      `SELECT "EMAIL" FROM "SRMUSERS" WHERE "EMAIL" = TRIM('${body.EMAIL}');`,
    ).catch((e) => {
      throw new HttpException(e.message, 400);
    });
    // const existingUser = await createStatementAndExecute(
    //   'SELECT "EMAIL" FROM "SRMUSERS" WHERE "EMAIL" = ?;',
    //   [body.EMAIL],
    // );
    if (existingUser.count !== 0) {
      throw new HttpException('User already exists with same Email', 400);
    } else {
      await global.connection.beginTransaction();
      const result = await executeAndReturnResult(
        `INSERT INTO "SRMUSERS" ("NAME","EMAIL","ROLE","MOBILE","PASSWORD","CODE") VALUES ( TRIM('${body.NAME}'), TRIM('${body.EMAIL}') , TRIM('${body.ROLE}') ,TRIM('${body.MOBILE}'), TRIM('${body.PASSWORD}'), TRIM('${body.CODE}'));`,
        true,
      )
        // const result = await createStatementAndExecute(
        //   'INSERT INTO "SRMUSERS" ("NAME","EMAIL","ROLE","MOBILE","PASSWORD","CODE") VALUES (?,?,?,?,?,?);',
        //   [
        //     body.NAME,
        //     body.EMAIL,
        //     body.ROLE,
        //     body.MOBILE,
        //     body.PASSWORD,
        //     body.CODE,
        //   ],
        // )
        .then(async () => {
          return await global.connection
            .commit()
            .catch((e) => {
              console.log(e.message);
              throw new HttpException(e.message, 400);
            })
            .then(async () => {
              await this.emailService.sendNewUserEmail({
                name: body.NAME,
                code: body.CODE,
                password: body.PASSWORD,
                email: body.EMAIL,
              });
              return { message: 'User created successfully' };
            });
        })
        .catch(async (e) => {
          console.log(e);
          await global.connection.rollback();
          throw new HttpException(e.message || 'Error Creating User', 400);
        });
      return result;
    }
  }
  async EditUser(body: EditUserValidatorDTO) {
    const result = await global.connection
      .query(
        `
    UPDATE "SRMUSERS"
      SET
      "NAME" = TRIM('${body.NAME}'),
      "EMAIL" = TRIM('${body.EMAIL}'),
      "ROLE" = TRIM('${body.ROLE}'),
      "MOBILE" = TRIM('${body.MOBILE}'),
      "CODE" = TRIM('${body.CODE}'),
      "ISACTIVE" = ${body.ISACTIVE === '1' ? true : false}
      WHERE "ID" = TRIM('${body.ID}');
    `,
      )
      .catch(async (e) => {
        await global.connection.rollback();
        throw new HttpException(e.message || 'Error Updating User', 400);
      });
    // const result = await createStatementAndExecute(
    //   'UPDATE "SRMUSERS" SET "NAME" = ?, "EMAIL" = ?, "ROLE" = ?, "MOBILE" = ?, "CODE" = ?, "ISACTIVE" = ? WHERE "ID" = ?;',
    //   [
    //     body.NAME,
    //     body.EMAIL,
    //     body.ROLE,
    //     body.MOBILE,
    //     body.CODE,
    //     body.ISACTIVE === '1' ? true : false,
    //     body.ID,
    //   ],
    // );
    if (result.count !== 0) return { message: 'User updated successfully' };
    else throw new HttpException('No users found', 404);
  }
  async getMyDetails(id: string) {
    const result = await global.connection
      .query(
        `SELECT "NAME", "EMAIL","MOBILE" FROM "SRMUSERS" WHERE "ID" = TRIM('${id}');
    `,
      )
      .catch((e) => {
        throw new HttpException(e.message, 400);
      });
    // const result = await createStatementAndExecute(
    //   'SELECT "NAME", "EMAIL","MOBILE" FROM "SRMUSERS" WHERE "ID" = ?;',
    //   [id],
    // );
    if (result.count !== 0) return result[0];
    else throw new HttpException('No users found', 404);
  }
  async updateUser(payload: {
    EMAIL: string;
    NAME: string;
    MOBILE: string;
    PASSWORD: string;
    ID: string;
  }) {
    try {
      await global.connection.beginTransaction();
      const result = await global.connection
        .query(
          `UPDATE "SRMUSERS" SET "NAME" = TRIM('${payload.NAME}'), "EMAIL" = TRIM('${payload.EMAIL}'), "MOBILE" = TRIM('${payload.MOBILE}'), "PASSWORD" = TRIM('${payload.PASSWORD}')
      WHERE "ID" = TRIM('${payload.ID}');`,
        )
        // const result = await createStatementAndExecute(
        //   'UPDATE "SRMUSERS" SET "NAME" = ?, "EMAIL" = ?, "MOBILE" = ?, "PASSWORD" = ?, ISVERIFIED = false WHERE "ID" = ?;',
        //   [
        //     payload.NAME,
        //     payload.EMAIL,
        //     payload.MOBILE,
        //     payload.PASSWORD,
        //     payload.ID,
        //   ],
        // )
        .then(async (res) => {
          await global.connection.commit();
          return res;
        })
        .catch(async (e) => {
          await global.connection.rollback();
          throw e;
        });
      if (result.count !== 0) return { message: 'User updated successfully' };
      else throw new HttpException('No users found', 404);
    } catch (e: Error | HttpException | any) {
      throw new HttpException(e.message || 'Error Updating User', 400);
    }
  }
}
