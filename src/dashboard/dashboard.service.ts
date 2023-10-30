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
      //   FROM "PDN1" P1
      //     INNER JOIN "OPDN" P on P1."DocEntry" = P."DocEntry"
      //     INNER JOIN "OPOR" PR ON TO_VARCHAR(PR."DocNum") = TO_VARCHAR(P1."BaseRef")
      //     LEFT JOIN "@OIGP" GP ON TO_VARCHAR(P."U_GPN") = TO_VARCHAR(GP."DocNum")
      //     LEFT JOIN "OBPL" BR ON P."BPLId" = BR."BPLId"
      //     LEFT JOIN "SRM_GRPO1" SG1 ON P1."DocEntry" = SG1."LINEDOCENTRY" AND P1."ItemCode" = SG1."ITEMCODE"
      //     WHERE P."DocDate" >= '2023-01-01'
      //     AND P."U_GPN" IS NOT NULL
      //     AND P."CardCode" = TRIM('${authUser.CODE}')
      //     AND P1."ItemCode" NOT IN ( SELECT
      //       "ItemCode"
      //       FROM "PCH1" AP1
      //       INNER JOIN "OPCH" AP ON AP."DocEntry" = AP1."DocEntry"
      //       WHERE TO_VARCHAR(AP1."BaseRef") = TO_VARCHAR(P."DocNum")
      //       AND AP."DocStatus" <> 'C' )
      //     AND P1."ItemCode" NOT IN ( SELECT
      //       "ItemCode"
      //       FROM "SRM_OGRPO"
      //       WHERE "VENDORCODE" = TRIM('${authUser.CODE}')
      //       AND "BILLNO" = GP."U_DANo" )
      //       AND SG1."LINEDOCENTRY" IS NULL
      //   );`,
      // );
      const result: Result<{ COUNT: string }> = await executeAndReturnResult(
        `SELECT COUNT("GRPO#") AS COUNT FROM (
          SELECT "GRPO#"--, SUM("OpenQty") AS "OpenQty", SUM("LINEOPENQTY") 
          FROM (
          
          SELECT
                    p."CardCode",
                    P."DocNum" AS "GRPO#",
                    P."BPLId" AS "BranchID",
                    (SELECT "Series" FROM "VW_SRM_APSERIES" WHERE "SeriesName" = LEFT(S."SeriesName",5)) AS "Series" ,
                    P."BPLName" AS "BranchName",
                    (SELECT TO_VARCHAR(TO_DATE("DocDate"),'DD-MM-YYYY') FROM OPOR mm WHERE TO_VARCHAR(mm."DocNum") = P1."BaseRef")"DocDate",
                    "Quantity" AS "TotalQty",
                    
                    --IFNULL(P1."OpenQty",P1."Quantity") AS "OpenQty",
                    IFNULL(P1."OpenQty",P1."Quantity") AS "BillQty",
                    
                    GP."U_DANo" AS "Bill#",
                    TO_VARCHAR(TO_DATE(P."DocDate"),'DD-MM-YYYY') AS "BillDate",
                    P1."BaseRef" AS "PO#",
                    IFNULL(P1."U_QtyFail",0) AS "RejectedQty",
                    IFNULL(P1."U_QtyPass",P1."Quantity") AS "PassedQty",
                    TO_VARCHAR(TO_DATE(P1."ShipDate"),'DD-MM-YYYY') AS "ShipDate",
                    P1."ItemCode",
                    P1."Dscription" AS "Item Dsc",
                    P1."LineNum" AS "LineNum",
                    P."DocEntry" AS "LineDOCENTRY",
                    P1."BaseRef" AS "LineBASEREF",
                    P1."BaseType" AS "LineBASETYPE",
                    P1."BaseEntry" AS "LineBASEENTRY",
                    P1."BaseLine" AS "LineBASELINE",
                    P1."Price" AS "PRICE",
                    P1."Currency"AS "Curr",
                    P1."OpenQty" AS "LINEOPENQTY" ,
                    --a."BillQty",
                    (P1."OpenQty" -IFNULL(a."BillQty",0)) "OpenQty"
                    FROM "PDN1" P1 
                    INNER JOIN "OPDN" P on P1."DocEntry" = P."DocEntry"  
                    LEFT JOIN "@OIGP" GP ON TO_VARCHAR(P."U_GPN") = TO_VARCHAR(GP."DocNum") 
                    LEFT JOIN
                    (
                    SELECT d."GRPONO", d."ITEMCODE",SUM(d."BILLQTY")"BillQty",d."LINENUM"
                    FROM "SRM_OGRPO" m 
                    INNER JOIN "SRM_GRPO1" d ON m."DOCENTRY" = d."DOCENTRY" 
                    WHERE "VENDORCODE" = TRIM('${authUser.CODE}') AND m."STATUS" = 'ready'  --AND "BILLNO" = GP."U_DANo"
                    GROUP BY  d."GRPONO", d."ITEMCODE",d."LINENUM"
                    )a ON a."GRPONO" = P."DocNum" AND a."ITEMCODE" = P1."ItemCode" AND a."LINENUM" = P1."LineNum" 
                    LEFT JOIN NNM1 S ON S."Series" = P."Series"  
                    WHERE P."DocDate" >= '2023-01-01' AND P."U_GPN" IS NOT NULL AND P."CardCode" = TRIM('${authUser.CODE}') --'$VENDOR' 
                    AND P1."ItemCode" NOT IN 
                    (
                    SELECT
                    AP1."ItemCode" 
                    FROM "PCH1" AP1 
                    INNER JOIN "OPCH" AP ON AP."DocEntry" = AP1."DocEntry" 
                    WHERE TO_VARCHAR(AP1."BaseRef") = TO_VARCHAR(P."DocNum") AND AP1."ItemCode" = p1."ItemCode" AND P1."LineNum" = AP1."BaseLine"  AND AP."DocStatus" <> 'C')       
                    AND (P1."OpenQty" -IFNULL(a."BillQty",0)) > 0 
                   
          
          )
          GROUP BY "GRPO#"
          HAVING SUM("OpenQty") > 0
          )`,
      );

      if (result.count !== 0) {
        counts.pending = JSON.parse(result[0].COUNT);
      } else {
        counts.pending = 0;
      }
      const readyPO: Result<{ COUNT: string }> = await executeAndReturnResult(
        `SELECT COUNT("DOCENTRY") AS "COUNT" FROM "SRM_OGRPO" WHERE "VENDORCODE" = TRIM('${authUser.CODE}') AND "STATUS" = 'ready';`,
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
        `SELECT COUNT("DOCENTRY") AS "COUNT" FROM "SRM_OGRPO" WHERE "VENDORCODE" = TRIM('${authUser.CODE}') AND "STATUS" = 'completed';`,
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
