// -------------------------------------------------------------------------
import { HttpException, Injectable } from '@nestjs/common';
import { UserDashboard } from './dashboard.controller';
import type { Result } from 'odbc';
import { executeAndReturnResult } from 'src/utils/executeAndReturnResult';
// -------------------------------------------------------------------------

@Injectable()
export class DashboardService {
  /**
   * Retrieves the dashboard data for a vendor user.
   * @param authUser The authenticated user.
   * @returns An object containing the counts of pending, completed, and ready purchase orders.
   * @throws HttpException if there is an error executing the SQL query.
   */
  async getVendorDashboard(authUser: UserDashboard) {
    const counts = { pending: 0, completed: 0, ready: 0 };
    try {
      // const result: Result<{ COUNT: string }> = await executeAndReturnResult(
      //   `SELECT COUNT("GRPO#") AS "COUNT"
      //   FROM
      //   (
      //     SELECT
      //   DISTINCT P."DocNum" AS "GRPO#"
      // FROM "PDN1" P1
      // INNER JOIN "OPDN" P on P1."DocEntry" = P."DocEntry" AND P."CardCode" = '${
      //   authUser.CODE
      // }'
      // INNER JOIN "OPOR" PR ON TO_VARCHAR(PR."DocNum") = TO_VARCHAR(P1."BaseRef")
      // LEFT JOIN "@OIGP" GP ON TO_VARCHAR(P."U_GPN") = TO_VARCHAR(GP."DocNum")
      // WHERE P."DocDate" >= '2023-01-01' AND P."U_GPN" IS NOT NULL
      // AND P1."ItemCode" NOT IN
      //   (
      //     SELECT "ItemCode"  FROM "PCH1" AP1
      //     INNER JOIN "OPCH" AP ON AP."DocEntry" = AP1."DocEntry"
      //     WHERE TO_VARCHAR(AP1."BaseRef") = TO_VARCHAR(P."DocNum") AND AP."DocStatus" <> 'C'
      //   )
      //   AND P1."ItemCode" NOT IN (
      //     SELECT "ITEMCODE" FROM "SRM_GRPO1" SG1
      //     INNER JOIN "SRM_OGRPO" SG ON SG."DOCENTRY" = SG1."DOCENTRY" WHERE SG."VENDORCODE" = '${authUser.CODE.trim()}' AND "BILLNO" = GP."U_DANo"
      //   ));`,
      // );
      const result: Result<{ COUNT: string }> = await executeAndReturnResult(
        `SELECT COUNT("GRPO#") AS "COUNT"
        FROM
        (
          SELECT
        DISTINCT P."DocNum" AS "GRPO#"
        FROM "PDN1" P1 
          INNER JOIN "OPDN" P on P1."DocEntry" = P."DocEntry" 
          INNER JOIN "OPOR" PR ON TO_VARCHAR(PR."DocNum") = TO_VARCHAR(P1."BaseRef") 
          LEFT JOIN "@OIGP" GP ON TO_VARCHAR(P."U_GPN") = TO_VARCHAR(GP."DocNum") 
          LEFT JOIN "OBPL" BR ON P."BPLId" = BR."BPLId" 
          LEFT JOIN "SRM_GRPO1" SG1 ON P1."DocEntry" = SG1."LINEDOCENTRY" AND P1."ItemCode" = SG1."ITEMCODE"
          WHERE P."DocDate" >= '2023-01-01' 
          AND P."U_GPN" IS NOT NULL 
          AND P."CardCode" = '${authUser.CODE}' 
          AND P1."ItemCode" NOT IN ( SELECT
            "ItemCode" 
            FROM "PCH1" AP1 
            INNER JOIN "OPCH" AP ON AP."DocEntry" = AP1."DocEntry" 
            WHERE TO_VARCHAR(AP1."BaseRef") = TO_VARCHAR(P."DocNum") 
            AND AP."DocStatus" <> 'C' ) 
          AND P1."ItemCode" NOT IN ( SELECT
            "ItemCode" 
            FROM "SRM_OGRPO" 
            WHERE "VENDORCODE" = '${authUser.CODE}' 
            AND "BILLNO" = GP."U_DANo" )
            AND SG1."LINEDOCENTRY" IS NULL  
        );`,
      );

      if (result.count !== 0) {
        counts.pending = JSON.parse(result[0].COUNT);
      } else {
        counts.pending = 0;
      }
      const readyPO: Result<{ COUNT: string }> = await executeAndReturnResult(
        `SELECT COUNT("DOCENTRY") AS "COUNT" FROM "SRM_OGRPO" WHERE "VENDORCODE" ='${authUser.CODE}' AND "STATUS" = 'ready';`,
      );

      // const readyPO: Result<{ COUNT: string }> = await createStatementAndExecute(
      //   'SELECT COUNT("DOCENTRY") AS "COUNT" FROM "SRM_OGRPO" WHERE "VENDORCODE" = ? AND "STATUS" = ?;',
      //   [authUser.CODE, 'ready'],
      // );
      if (readyPO.count !== 0) {
        counts.ready = JSON.parse(readyPO[0].COUNT);
      } else {
        counts.ready = 0;
      }
      const completed: Result<{ COUNT: string }> = await executeAndReturnResult(
        `SELECT COUNT("DOCENTRY") AS "COUNT" FROM "SRM_OGRPO" WHERE "VENDORCODE" ='${authUser.CODE}' AND "STATUS" = 'completed';`,
      );

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
    } catch (e) {
      throw new HttpException(e.message, 400);
    }
  }
  /**
   * Retrieves the counts of users, defected receipts, and completed GRPOs for the admin dashboard.
   * @returns An object containing the counts of users, defected receipts, and completed GRPOs.
   * @throws HttpException if there is an error while retrieving the counts.
   */
  async getAdminDashboard() {
    const counts = { users: 0, defectedReceipts: 0, completedGrpos: 0 };
    try {
      const result: Result<{ COUNT: string }> = await executeAndReturnResult(
        `SELECT COUNT("ID") AS "COUNT" FROM "SRMUSERS"`,
      );
      // const result: Result<{ COUNT: string }> = await createStatementAndExecute(
      //   'SELECT COUNT("ID") AS "COUNT" FROM "SRMUSERS";',
      //   [],
      // );

      if (result.count !== 0) {
        counts.users = JSON.parse(result[0].COUNT);
        const defected: Result<{ COUNT: string }> =
          await executeAndReturnResult(
            `SELECT COUNT("DOCENTRY") AS "COUNT" FROM "SRM_OGRPO" WHERE "STATUS" = 'completed' AND "DRAFTID" IS NULL`,
          );
        if (defected.count !== 0) {
          counts.defectedReceipts = JSON.parse(defected[0].COUNT);
        } else {
          counts.defectedReceipts = 0;
        }
      } else {
        counts.users = 0;
      }

      const completed: Result<{ COUNT: string }> = await executeAndReturnResult(
        `SELECT COUNT("DOCENTRY") AS "COUNT" FROM "SRM_OGRPO" WHERE "STATUS" = 'completed' AND "DRAFTID" IS NOT NULL;`,
      );
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
    } catch (e) {
      throw new HttpException(e.message, 400);
    }
  }
}
