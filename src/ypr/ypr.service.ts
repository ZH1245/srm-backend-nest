import { HttpException, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { executeAndReturnResult } from 'src/utils/executeAndReturnResult';

@Injectable()
export class YprService {
  async getPendingYPRs() {
    try {
      const result = await executeAndReturnResult(`
      SELECT
      "DocNum" AS "YPR#",
      TO_VARCHAR(TO_DATE(a."U_DocDate"),'DD-MM-YYYY') AS "DocDate",
      b."U_QtyReq" AS "RequestedQty",
      b."U_ReqBags" AS "RequestedBags",
      '' AS "Action",
      b."LineId" AS "BASELINE",
      "U_ConeWt" AS "ConeWt",
      (Select
      "U_NAME" 
         FROM "OUSR" 
         WHERE "USER_CODE" = a."Creator" ) AS "Requester",
      "Remark" AS "Remarks",
      "U_Branch" AS "Branch",
      "U_ReqType",
      "U_YRSNO",
      "U_SODocNum" AS "SO#",
      (Select
      T0."U_SODocNum" 
         From "@OYRD" T0 
         Where T0."DocNum" = a."U_YRSNO") as "SoNo",
      "U_YarnCode" AS "ItemCode",
      "U_YarnDesc" AS "ItemDescription",
      "U_UOM" AS "UOM",
      "U_YType",
      (SELECT
      "SlpName" 
         FROM OSLP 
         WHERE "SlpCode" = (SELECT
      "SlpCode" 
             FROM ORDR 
             WHERE TO_VARCHAR("DocNum") = TO_Varchar("U_SODocNum"))) AS SALESPERSON,
      (SELECT
      s."CardName" 
         FROM ORDR s 
         WHERE TO_VARCHAR(s."DocNum") = TO_VARCHAR(a."U_SODocNum")) "Supplier",
      map(a."Status",
     'C',
     'Closed',
     'O',
     'Open')"DocStatus",
      (select
      string_agg("U_SODocNum",
     ',') 
         from ( select
      distinct T1."U_SODocNum" 
             from prq1 T1 
             where T1."DocEntry"=a."DocEntry")) "SaleOrder" --,* 
  
     FROM "@OYPR" a 
     INNER JOIN "@YPR1" b ON a."DocEntry" = b."DocEntry" --LEFT JOIN "@YPR2" c on c."DocEntry" = b."DocEntry" AND b."U_YarnCode" = c."U_YarnCode"
 
     LEFT JOIN oitm i on b."U_YarnCode"= i."ItemCode" 
     WHERE NOT EXISTS (SELECT
      mm."U_YPRNO" 
         FROM "OPOR" mm 
         INNER JOIN POR1 dd ON mm."DocEntry" = dd."DocEntry" 
         WHERE mm."CANCELED" = 'N' 
         AND TO_VARCHAR(a."DocNum") = mm."U_YPRNO") 
         AND a."Status" <> 'C'
         AND a."DocNum" NOT IN(SELECT "YPRNO" FROM "SRM_QUOTATIONS")
         AND a."DocNum" <> '831'
     ORDER BY a."U_Branch",
      a."DocNum", a."U_DocDate", b."LineId" ;
        `);
      if (result.count !== 0) {
        return { data: result, message: 'Fetched' };
      } else {
        throw new Error('No Data Found!');
      }
    } catch (e: any) {
      console.log(e);
      throw new HttpException(e.message, e?.status || 400);
    }
  }
  async getPendingYPRsCount() {
    try {
      const result = await executeAndReturnResult(`
      select COUNT(DISTINCT "YPR#") AS "COUNT" FROM 
      ( 
              SELECT
      "DocNum" AS "YPR#",
      (Select
      "U_NAME" 
         FROM "OUSR" 
         WHERE "USER_CODE" = a."Creator" ) AS "Requester",
      "Remark" AS "Remarks",
      "U_Branch" AS "Branch",
      "U_ReqType",
      "U_YRSNO",
      "U_SODocNum" AS "SO#",
      (Select
      T0."U_SODocNum" 
         From "@OYRD" T0 
         Where T0."DocNum" = a."U_YRSNO") as "SoNo",
      "U_YarnCode" AS "ItemCode",
      "U_YarnDesc" AS "ItemDescription",
      "U_UOM" AS "UOM",
      "U_YType",
      (SELECT
      "SlpName" 
         FROM OSLP 
         WHERE "SlpCode" = (SELECT
      "SlpCode" 
             FROM ORDR 
             WHERE TO_VARCHAR("DocNum") = TO_Varchar("U_SODocNum"))) AS SALESPERSON,
      (SELECT
      s."CardName" 
         FROM ORDR s 
         WHERE TO_VARCHAR(s."DocNum") = TO_VARCHAR(a."U_SODocNum")) "Supplier",
      map(a."Status",
     'C',
     'Closed',
     'O',
     'Open')"DocStatus",
      (select
      string_agg("U_SODocNum",
     ',') 
         from ( select
      distinct T1."U_SODocNum" 
             from prq1 T1 
             where T1."DocEntry"=a."DocEntry")) "SaleOrder" --,* 
  
     FROM "@OYPR" a 
     INNER JOIN "@YPR1" b ON a."DocEntry" = b."DocEntry" --LEFT JOIN "@YPR2" c on c."DocEntry" = b."DocEntry" AND b."U_YarnCode" = c."U_YarnCode"
 
     LEFT JOIN oitm i on b."U_YarnCode"= i."ItemCode" 
     WHERE NOT EXISTS (SELECT
      mm."U_YPRNO" 
         FROM "OPOR" mm 
         INNER JOIN POR1 dd ON mm."DocEntry" = dd."DocEntry" 
         WHERE mm."CANCELED" = 'N' 
         AND TO_VARCHAR(a."DocNum") = mm."U_YPRNO")
         AND a."Status"<>'C'
         AND a."DocNum" NOT IN(SELECT "YPRNO" FROM "SRM_QUOTATIONS")
     ORDER BY b."LineId",
      a."DocNum"  
             )  
      `);
      if (result.count !== 0) {
        return { data: JSON.parse(result[0]['COUNT']), message: 'Fetched' };
      } else {
        throw new Error("No YPR's Found");
      }
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, 400);
    }
  }
  async createYPRHeaderQuotation(body) {
    try {
      await global.connection.beginTransaction((err) => {
        if (err) throw err;
      });
      console.log(body);
      return await new Promise(async (resolve, reject) => {
        body.forEach(async (item, index) => {
          //   console.log(item);
          let DocNum = 0;
          const MAX = await executeAndReturnResult(
            `SELECT MAX("DOCNUM")AS "MAX" FROM "SRM_QUOTATIONS"`,
          );
          if (MAX.count === 0) {
            DocNum = index + 1;
          } else {
            DocNum = JSON.parse(MAX[0]['MAX']) + 1 + index;
          }
          //   const result = await executeAndReturnResult(
          //     'SELECT * FROM SRM_QUOTATIONS',
          //   );
          //   console.log(result);
          //   console.log('DOCNUM: ' + DocNum);
          await executeAndReturnResult(
            `INSERT INTO SRM_QUOTATIONS("DOCNUM","YARNCODE","BRANCH","YPRNO","YARNTYPE","CONEWT","STATUS","BASELINE", "CREATEDAT","UPDATEDAT","REQQTY","REQBAGS","DOCDATE") VALUES('${DocNum}', '${
              item.ItemCode
            }','${item.Branch}','${item['YPR#']}','${item['U_YType']}','${
              item.ConeWt
            }','${item.Action}','${item.BASELINE}',CURRENT_DATE,CURRENT_DATE,'${
              item.RequestedQty
            }','${item.RequestedBags}','${moment(
              item.DocDate,
              'DD-MM-YYYY',
            ).format('YYYY-MM-DD')}');`,
            true,
          ).catch((e) => {
            console.log('REJECT');
            reject(e);
          });
          if (index + 1 === body.length) resolve(true);
        });
      })
        .catch(async (e) => {
          console.log('INSIDE CATCH PROMISE');
          await global.connection.rollback((err) => {
            if (err) {
              throw e;
            }
          });
        })
        .then(async (res) => {
          console.log('INSIDE THEN');
          await global.connection.commit((err) => {
            if (err) throw err;
          });
          return res;
        });
    } catch (e) {
      console.log(e);
      await global.connection.rollback((err) => {
        if (err) throw new HttpException(err.message, 400);
      });
      throw new HttpException(e.message, 400);
    }
  }

  async getYPRSForVendor(code) {
    try {
      const result = await executeAndReturnResult(
        `SELECT  "DOCNUM","YARNCODE","BRANCH","YPRNO","YARNTYPE","CONEWT", "STATUS", "BASELINE", TO_VARCHAR(TO_DATE("CREATEDAT"),'DD-MM-YYYY') "CREATEDAT",TO_VARCHAR(TO_DATE("DOCDATE"),'DD-MM-YYYY') "DOCDATE", "REQBAGS","REQQTY"  ,(SELECT "ItemName" FROM "OITM" WHERE "ItemCode" = a."YARNCODE") "YARNDESCRIPTION" FROM "SRM_QUOTATIONS" a
        WHERE "STATUS" <>'dsm' AND ("PREFVENDORS" LIKE '%${code}%' OR "PREFVENDORS" IS NULL)
        ORDER BY "YPRNO","BRANCH", "DOCDATE";`,
        true,
      );
      if (result.count !== 0) {
        return { data: result, message: 'Fetched' };
      } else {
        throw new Error('Nothing Found');
      }
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, 400);
    }
  }
  async getAllQuotations() {
    try {
      const result = await executeAndReturnResult(`
    SELECT "DOCNUM","YARNCODE","BRANCH","YPRNO","YARNTYPE","CONEWT", "STATUS", "BASELINE", TO_VARCHAR(TO_DATE("CREATEDAT"),'DD-MM-YYYY') "CREATEDAT",TO_VARCHAR(TO_DATE("DOCDATE"),'DD-MM-YYYY') "DOCDATE", "REQBAGS","REQQTY" FROM "SRM_QUOTATIONS" WHERE "STATUS" <> 'dsm' ORDER BY "BRANCH","YPRNO";
`);
      if (result.count !== 0) {
        return { data: result, message: 'Fetched' };
      } else {
        throw new Error('No Records Found');
      }
    } catch (e) {
      console.log(e);
      throw new HttpException(e.message, 400);
    }
  }
}
