import { HttpException, Injectable } from '@nestjs/common';
import { UserDashboard } from './dashboard.controller';
import { GrpoService } from 'src/grpo/grpo.service';
import { Result } from 'odbc';
import { createStatementAndExecute } from 'src/utils/createStatementAndExecute';

@Injectable()
export class DashboardService {
  async getVendorDashboard(authUser: UserDashboard) {
    const counts = { pending: 0, completed: 0, ready: 0 };
    const result: Result<{ COUNT: string }> = await global.connection
      .query(
        `
      SELECT COUNT(P."DocNum") AS "COUNT"  FROM "PDN1" P1
      INNER JOIN "OPDN" P on P1."DocEntry" = P."DocEntry" AND P."CardCode" = '${authUser.CODE}'
`,
      )
      .catch((e) => {
        throw new HttpException(e.message, 400);
      });
    if (result.count !== 0) {
      counts.pending = JSON.parse(result[0].COUNT);
    } else {
      counts.pending = 0;
    }
    const readyPO: Result<{ COUNT: string }> = await global.connection
      .query(
        `
    SELECT COUNT("DOCENTRY") AS "COUNT" FROM "SRM_OGRPO" WHERE "VENDORCODE" ='${authUser.CODE}' AND "STATUS" = 'ready';
    `,
      )
      .catch((e) => {
        throw new HttpException(e.message, 400);
      });
    // const readyPO: Result<{ COUNT: string }> = await createStatementAndExecute(
    //   'SELECT COUNT("DOCENTRY") AS "COUNT" FROM "SRM_OGRPO" WHERE "VENDORCODE" = ? AND "STATUS" = ?;',
    //   [authUser.CODE, 'ready'],
    // );
    if (readyPO.count !== 0) {
      counts.ready = JSON.parse(readyPO[0].COUNT);
    } else {
      counts.ready = 0;
    }
    const completed: Result<{ COUNT: string }> = await global.connection
      .query(
        `
    SELECT COUNT("DOCENTRY") AS "COUNT" FROM "SRM_OGRPO" WHERE "VENDORCODE" ='${authUser.CODE}' AND "STATUS" = 'completed';
    `,
      )
      .catch((e) => {
        throw new HttpException(e.message, 400);
      });
    // const completed: Result<{ COUNT: string }> =
    //   await createStatementAndExecute(
    //     'SELECT COUNT("DOCENTRY") AS "COUNT" FROM "SRM_OGRPO" WHERE "VENDORCODE" = ? AND "STATUS" = ?;',
    //     [authUser.CODE, 'completed'],
    //   );
    if (completed.count !== 0) {
      counts.completed = JSON.parse(completed[0].COUNT);
    } else {
      counts.completed = 0;
    }
    return counts;
  }
  async getAdminDashboard() {
    const counts = { users: 0, defectedReceipts: 0, completedGrpos: 0 };
    const result: Result<{ COUNT: string }> = await global.connection
      .query(
        `
      SELECT COUNT("ID") AS "COUNT" FROM "SRMUSERS"`,
      )
      .catch((e) => {
        throw new HttpException(e.message, 400);
      });
    // const result: Result<{ COUNT: string }> = await createStatementAndExecute(
    //   'SELECT COUNT("ID") AS "COUNT" FROM "SRMUSERS";',
    //   [],
    // );
    if (result.count !== 0) {
      counts.users = JSON.parse(result[0].COUNT);
    } else {
      counts.users = 0;
    }

    const completed: Result<{ COUNT: string }> = await global.connection
      .query(
        `
        SELECT COUNT("DOCENTRY") AS "COUNT" FROM "SRM_OGRPO" WHERE "STATUS" = 'completed';
    `,
      )
      .catch((e) => {
        throw new HttpException(e.message, 400);
      });
    // const completed: Result<{ COUNT: string }> =
    //   await createStatementAndExecute(
    //     'SELECT COUNT("DOCENTRY") AS "COUNT" FROM "SRM_OGRPO" WHERE "STATUS" = ?;',
    //     ['completed'],
    //   );
    if (completed.count !== 0) {
      counts.completedGrpos = JSON.parse(completed[0].COUNT);
    } else {
      counts.completedGrpos = 0;
    }
    return counts;
  }
}
