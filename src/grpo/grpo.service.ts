// -------------------------------------------------------------------------
import { HttpException, Injectable } from '@nestjs/common';
import { writeFile, readFile, stat } from 'fs/promises';
import { Result } from 'odbc';
import * as mime from 'mime';
import { UserDashboard } from 'src/dashboard/dashboard.controller';
import { validateSQL } from 'src/utils/checkSQL';
import { CreateMyGRPOValidatorDTO, MyReadyGRPOSByID } from './validators';
import { Agent } from 'https';
import { executeAndReturnResult } from 'src/utils/executeAndReturnResult';
import { SapService } from 'src/sap/sap.service';
import axios from 'axios';
import { SAPDRAFTSUCCESS } from './types';
import { Response } from 'express';
// import { createReadStream } from 'fs';
import * as moment from 'moment';
// -------------------------------------------------------------------------
export type DataProps = {
  'PO#': number;
  DocDate: string;
  ReceivedQty: number;
  BillQty: number;
  ShipDate: string;
  ITEMCODE: string;
  ITEMDSC: string;
  'Bill#': string;
  BillDate: string;
  LineNum: number;
  GRPONO: number;
  LINETOTAL: number;
  LineBASEENTRY: string;
  LineBASELINE: string;
  LineBASEREF: string;
  LineBASETYPE: string;
  BASETYPE: string;
  LINEDOCENTRY: string;
  OPENQTY: number;
  PRICE: number;
  PONO: string;
  SHIPDATE: string;
  PODATE: string;
  RECEIVEDQTY: number;
  BILLQTY: number;
  Series: number;
};
// -------------------------------------------------------------------------
@Injectable()
export class GrpoService {
  constructor(private readonly sapSercice: SapService) {}
  /**
   * Retrieves pending GRPOs for a given user.
   * @param me - The user object.
   * @returns A Promise that resolves to an array of pending GRPOs.
   * @throws HttpException if the user's code is invalid or no GRPOs are found.
   */
  async getMyPendingGrpos(me: UserDashboard) {
    try {
      const doesCodeContainSQL = validateSQL(me.CODE);
      if (!doesCodeContainSQL) {
        //   const result = await executeAndReturnResult(
        //     `SELECT
        //     p."CardCode",
        //     P."DocNum" AS "GRPO#",
        //     P."BPLId" AS "BranchID",
        //     (SELECT "Series" FROM "VW_SRM_APSERIES" WHERE "SeriesName" = LEFT(S."SeriesName",5)) AS "Series" ,
        //     BR."BPLName" AS "BranchName",
        //     TO_VARCHAR(TO_DATE(PR."DocDate"),
        //    'DD-MM-YYYY') AS "DocDate",
        //     "Quantity" AS "TotalQty",
        //     IFNULL(P1."OpenQty",
        //    P1."Quantity") AS "OpenQty",
        //     IFNULL(P1."OpenQty",
        //    P1."Quantity") AS "BillQty",
        //     GP."U_DANo" AS "Bill#",
        //     TO_VARCHAR(TO_DATE(P."DocDate"),
        //    'DD-MM-YYYY') AS "BillDate",
        //     P1."BaseRef" AS "PO#",
        //     IFNULL(P1."U_QtyFail",
        //    0) AS "RejectedQty",
        //     IFNULL(P1."U_QtyPass",
        //    P1."Quantity") AS "PassedQty",
        //     TO_VARCHAR(TO_DATE(P1."ShipDate"),
        //    'DD-MM-YYYY') AS "ShipDate",
        //     P1."ItemCode",
        //    P1."Dscription" AS "Item Dsc",
        //     P1."LineNum" AS "LineNum",
        //     P."DocEntry" AS "LineDOCENTRY",
        //     P1."BaseRef" AS "LineBASEREF",
        //     P1."BaseType" AS "LineBASETYPE",
        //     P1."BaseEntry" AS "LineBASEENTRY",
        //     P1."BaseLine" AS "LineBASELINE",
        //     P1."Price" AS "PRICE",
        //     P1."Currency"AS "Curr",
        //     P1."OpenQty" AS "LINEOPENQTY"
        //  FROM "PDN1" P1
        //  INNER JOIN "OPDN" P on P1."DocEntry" = P."DocEntry"
        //  INNER JOIN "OPOR" PR ON TO_VARCHAR(PR."DocNum") = TO_VARCHAR(P1."BaseRef")
        //  LEFT JOIN "@OIGP" GP ON TO_VARCHAR(P."U_GPN") = TO_VARCHAR(GP."DocNum")
        //  LEFT JOIN "OBPL" BR ON P."BPLId" = BR."BPLId"
        //  LEFT JOIN "SRM_GRPO1" SG1 ON P1."DocEntry" = SG1."LINEDOCENTRY" AND P1."ItemCode" = SG1."ITEMCODE"
        //  LEFT JOIN NNM1 S ON S."Series" = P."Series"
        //  WHERE P."DocDate" >= '2023-01-01'
        //  AND P."U_GPN" IS NOT NULL
        //  AND P."CardCode" = '${me.CODE}'
        //  AND P1."ItemCode" NOT IN ( SELECT
        //     "ItemCode"
        //    FROM "PCH1" AP1
        //    INNER JOIN "OPCH" AP ON AP."DocEntry" = AP1."DocEntry"
        //    WHERE TO_VARCHAR(AP1."BaseRef") = TO_VARCHAR(P."DocNum")
        //    AND AP."DocStatus" <> 'C' )
        //  AND P1."ItemCode" NOT IN ( SELECT
        //     "ItemCode"
        //    FROM "SRM_OGRPO"
        //    WHERE "VENDORCODE" = '${me.CODE}'
        //    AND "BILLNO" = GP."U_DANo" )
        //    AND SG1."LINEDOCENTRY" IS NULL
        //    AND IFNULL(P1."OpenQty",
        //    P1."Quantity") > 0
        //    ;`,
        //   );
        const result = await executeAndReturnResult(
          `SELECT
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
          WHERE "VENDORCODE" = TRIM('${me.CODE}') AND m."STATUS" = 'ready'  --AND "BILLNO" = GP."U_DANo"
          GROUP BY  d."GRPONO", d."ITEMCODE",d."LINENUM"
          )a ON a."GRPONO" = P."DocNum" AND a."ITEMCODE" = P1."ItemCode" AND a."LINENUM" = P1."LineNum" 
          LEFT JOIN NNM1 S ON S."Series" = P."Series"  
          WHERE P."DocDate" >= '2023-01-01' AND P."U_GPN" IS NOT NULL AND P."CardCode" = TRIM('${me.CODE}') --'$VENDOR' 
          AND P1."ItemCode" NOT IN 
          (
          SELECT
          AP1."ItemCode" 
          FROM "PCH1" AP1 
          INNER JOIN "OPCH" AP ON AP."DocEntry" = AP1."DocEntry" 
          WHERE TO_VARCHAR(AP1."BaseRef") = TO_VARCHAR(P."DocNum") AND AP1."ItemCode" = p1."ItemCode" AND P1."LineNum" = AP1."BaseLine"  AND AP."DocStatus" <> 'C')       
          AND (P1."OpenQty" -IFNULL(a."BillQty",0)) > 0 
         ;`,
        );
        //       const result = await createStatementAndExecute(
        //         `
        //                   SELECT
        //                   P1."BaseRef" AS "PO#",
        //                   TO_DATE(PR."DocDate") AS "DocDate",
        //                   "Quantity" AS "ReceivedQty",
        //                   "Quantity" AS "BillQty",
        //                   TO_DATE(P1."ShipDate") AS "ShipDate",
        //                   P1."ItemCode",P1."Dscription" AS "Item Dsc",
        //                   P."U_BLNo" AS "Bill#",
        //                   P1."LineNum" AS "LineNum",
        //                   P."DocNum" AS "GRPO#",
        //                   P."U_BLDate" AS "BillDate"
        //                   FROM "PDN1" P1
        //                   INNER JOIN "OPDN" P on P1."DocEntry" = P."DocEntry" AND P."CardCode" = '${me.CODE}'
        //                   INNER JOIN "OPOR" PR ON TO_VARCHAR(PR."DocNum") = TO_VARCHAR(P1."BaseRef")
        // `,
        //         [],
        //       );
        if (result.count !== 0) {
          return result;
        } else {
          throw new HttpException('No GRPOs found', 404);
        }
      } else {
        throw new HttpException('Invalid Code', 400);
      }
    } catch (e) {
      throw new HttpException(e.message, 400);
    }
  }
  /**
   * Retrieves completed GRPOs for a given user.
   * @param user - The user dashboard object.
   * @returns An object containing the fetched data and a message.
   * @throws HttpException if an error occurs while fetching the data.
   */
  async getMyCompletedGrpos(user: UserDashboard) {
    try {
      const result = await executeAndReturnResult(
        `SELECT "DOCENTRY","BILLNO",TO_VARCHAR(TO_DATE("BILLDATE"),'DD-MM-YYYY') AS "BILLDATE","VENDORCODE",TO_VARCHAR(TO_DATE("CREATEDAT"),'DD-MM-YYYY') AS "CREATEDAT"  FROM "SRM_OGRPO" WHERE "VENDORCODE" = TRIM('${user.CODE.trim()}') AND "STATUS" = 'completed';`,
      );
      // const result = await createStatementAndExecute(
      //   'SELECT "DOCENTRY","BILLNO",TO_VARCHAR(TO_DATE("BILLDATE"),\'DD-MM-YYYY\') AS "BILLDATE","VENDORCODE","STATUS",TO_VARCHAR(TO_DATE("CREATEDAT"),\'DD-MM-YYYY\') AS "CREATEDAT"  FROM "SRM_OGRPO" WHERE "VENDORCODE" = ? AND "STATUS" = ?',
      //   [user.CODE, 'completed'],
      // );
      if (result.count !== 0) {
        return { data: result, message: 'Fetched' };
      } else {
        return { data: [], message: 'No GRPOs found' };
      }
    } catch (e) {
      throw new HttpException(e.message, 400);
    }
  }
  /**
   * Retrieves the ready GRPOs for a given user.
   * @param user - The user dashboard object.
   * @returns An object containing the fetched data and a message.
   * @throws HttpException if an error occurs while fetching the data.
   */
  async getMyReadyGrpos(user: UserDashboard) {
    try {
      const result = await executeAndReturnResult(
        `SELECT "DOCENTRY","BILLNO",TO_VARCHAR(TO_DATE("BILLDATE"),'DD-MM-YYYY') AS "BILLDATE",TO_VARCHAR(TO_DATE("CREATEDAT"),'DD-MM-YYYY') AS "CREATEDAT"  FROM "SRM_OGRPO" WHERE "VENDORCODE" = TRIM('${user.CODE.trim()}') AND "STATUS" = 'ready';`,
      );
      // const result = await createStatementAndExecute(
      //   'SELECT "DOCENTRY","BILLNO",TO_VARCHAR(TO_DATE("BILLDATE"),\'DD-MM-YYYY\') AS "BILLDATE","VENDORCODE","STATUS",TO_VARCHAR(TO_DATE("CREATEDAT"),\'DD-MM-YYYY\') AS "CREATEDAT"  FROM "SRM_OGRPO" WHERE "VENDORCODE" = ? AND "STATUS" = ?',
      //   [user.CODE, 'ready'],
      // );
      if (result.count !== 0) {
        return { data: result, message: 'Fetched' };
      } else {
        return { data: [], message: 'No GRPOs found' };
      }
    } catch (e) {
      throw new HttpException(e.message, 400);
    }
  }
  /**
   * Retrieves the header, items, and attachments of a GRPO (Goods Receipt and Purchase Order) by document entry ID
   * for a given user.
   * @param user - The user dashboard object.
   * @param id - The document entry ID of the GRPO to retrieve.
   * @returns An object containing the header, items, and attachments of the GRPO, or an empty array and a message if no GRPOs are found.
   * @throws HttpException if an error occurs while retrieving the GRPO.
   */
  async getMyReadyGrposByDocEntry(user: UserDashboard, id: string) {
    const result = { header: null, items: null, attachments: null };
    try {
      const header = await executeAndReturnResult(
        `SELECT "DOCENTRY" AS "Doc#", BP."BPLName" AS "Branch","BILLNO" AS "Bill#",TO_VARCHAR(TO_DATE("BILLDATE"),'DD-MM-YYYY') AS "Bill Date",TO_VARCHAR(TO_DATE("CREATEDAT"),'DD-MM-YYYY') AS "Draft Date"  FROM "SRM_OGRPO" T0 LEFT JOIN OBPL BP ON BP."BPLId" = T0."BPLID" WHERE T0."VENDORCODE" = TRIM('${user.CODE.trim()}') AND "STATUS" = 'ready' AND T0."DOCENTRY" = TRIM('${id}');`,
      );
      // const header = await createStatementAndExecute(
      //   ` SELECT "DOCENTRY","BILLNO",TO_VARCHAR(TO_DATE("BILLDATE"),'DD-MM-YYYY') AS "BILLDATE","VENDORCODE","STATUS",TO_VARCHAR(TO_DATE("CREATEDAT"),'DD-MM-YYYY') AS "CREATEDAT"  FROM "SRM_OGRPO" T0 WHERE T0."VENDORCODE" = ? AND "STATUS" = ? AND T0."DOCENTRY" = ?`,
      //   [user.CODE, 'ready', id],
      // );
      if (header.count !== 0) {
        result.header = header[0];
        // BEFORE AVAIL QTY FOR EDIT ROW
        // const items = await executeAndReturnResult(
        //   `SELECT "PONO" AS "PO#","GRPONO" AS "GRPO#","PODATE" AS "PO Date","ITEMCODE" AS "Item Code","ITEMDSC" AS "Item Description","SHIPDATE" AS "Ship Date","BILLQTY" AS "Bill Qty" FROM "SRM_GRPO1" T0 WHERE TO_VARCHAR(T0."DOCENTRY") = TO_VARCHAR(TRIM('${id}'));`,
        // );
        const items = await executeAndReturnResult(
          `SELECT
          "ID",
          "PONO" AS "PO#",
         "GRPONO" AS "GRPO#",
         T1."BPLName" AS "BranchName",
         T1."BPLId" AS "BranchID",
         TO_VARCHAR(TO_DATE("PODATE"),'DD-MM-YYYY') AS "PODate",
         "ITEMCODE" AS "ItemCode",
         "ITEMDSC" AS "ItemDescription",
         TO_VARCHAR( TO_DATE("SHIPDATE"),'DD-MM-YYYY') AS "ShipDate",
         "PRICE" AS "Price",
         "BILLQTY" AS "BillQty" ,
         "LINENUM",
         --CASE WHEN T2."OpenQty" IS NULL THEN IFNULL(T2."OpenQty",0) ELSE T2."OpenQty" - T0."BILLQTY" END AS "AvailQty",
         --T2."OpenQty" AS "AvailQty"
         (T2."OpenQty" -IFNULL(T0."BILLQTY",0))"AvailQty"
       FROM "SRM_GRPO1" T0
       LEFT JOIN "OPDN" T1 ON T1."DocNum"= T0."GRPONO" 
       LEFT JOIN "PDN1"  T2 ON T1."DocEntry" = T2."DocEntry" AND T0."LINENUM" = T2."LineNum" AND T0."ITEMCODE" = T2."ItemCode"
       WHERE TO_VARCHAR(T0."DOCENTRY") = TO_VARCHAR(TRIM('${id}'))`,
        );
        // const items = await createStatementAndExecute(
        //   `SELECT "DOCENTRY","LINEID","PONO","GRPONO","PODATE","ITEMCODE","ITEMDSC","SHIPDATE","RECEIVEDQTY","BILLQTY" FROM "SRM_GRPO1" T0 WHERE T0."DOCENTRY" = ?`,
        //   [id],
        // );
        if (items.count !== 0) {
          result.items = items;
        }
        const attachments = await executeAndReturnResult(
          `SELECT "ID","DOCENTRY","ATTACHMENTNAME","LINK" FROM "SRM_GRPO2" T0 WHERE T0."DOCENTRY" = TRIM('${id}');`,
        );
        // const attachments = await createStatementAndExecute(
        //   `SELECT "ID","DOCENTRY","ATTACHMENTNAME","LINK" FROM "SRM_GRPO2" T0 WHERE T0."DOCENTRY" = ?`,
        //   [id],
        // );
        if (attachments.count !== 0) {
          result.attachments = attachments;
        }
        return { data: result };
      } else {
        return { data: [], message: 'No GRPOs found' };
      }
    } catch (e) {
      throw new HttpException(e.message, 400);
    }
  }

  /**
   * Retrieves completed GRPOs for the specified user and document entry ID.
   * @param user - The user dashboard object.
   * @param id - The document entry ID.
   * @returns An object containing the header, items, and attachments of the completed GRPOs, or an empty array with a message if no GRPOs were found.
   * @throws HttpException if an error occurs while retrieving the GRPOs.
   */
  async getMyCompletedGrposByDocEntry(user: UserDashboard, id: string) {
    const result = { header: null, items: null, attachments: null };
    try {
      const header = await executeAndReturnResult(
        `SELECT "DOCENTRY" AS "Doc#", BP."BPLName" AS "Branch","BILLNO" AS "Bill #",TO_VARCHAR(TO_DATE("BILLDATE"),'DD-MM-YYYY') AS "Bill Date",TO_VARCHAR(TO_DATE("CREATEDAT"),'DD-MM-YYYY') AS "Invoice Date" FROM "SRM_OGRPO" T0 LEFT JOIN "OBPL" BP on TO_VARCHAR(BP."BPLId") = TO_VARCHAR(T0."BPLID")
        WHERE T0."VENDORCODE" = TRIM('${user.CODE.trim()}') AND "STATUS" = 'completed' AND T0."DOCENTRY" = TRIM('${id}');`,
      );
      // const header = await createStatementAndExecute(
      //   `SELECT "DOCENTRY","BILLNO",TO_VARCHAR(TO_DATE("BILLDATE"),'DD-MM-YYYY') AS "BILLDATE","VENDORCODE","STATUS",TO_VARCHAR(TO_DATE("CREATEDAT"),'DD-MM-YYYY') AS "CREATEDAT"  FROM "SRM_OGRPO" T0 WHERE T0."VENDORCODE" = ? AND "STATUS" = ? AND T0."DOCENTRY" = ?`,
      //   [user.CODE, 'completed', id],
      // );
      if (header.count !== 0) {
        result.header = header;
        const items = await executeAndReturnResult(
          `SELECT "PONO" AS "PO#","GRPONO" AS "GRPO#","PODATE" AS "PO Date","ITEMCODE" AS "Item Code","ITEMDSC" AS "Item Description","SHIPDATE" AS "Ship Date","BILLQTY" AS "Bill Qty" FROM "SRM_GRPO1" T0 WHERE T0."DOCENTRY" = TRIM('${id}');`,
        );
        // const items = await createStatementAndExecute(
        //   `SELECT "DOCENTRY","LINEID","PONO","GRPONO","PODATE","ITEMCODE","ITEMDSC","SHIPDATE","RECEIVEDQTY","BILLQTY" FROM "SRM_GRPO1" T0 WHERE T0."DOCENTRY" = ?`,
        //   [id],
        // );
        if (items.count !== 0) {
          result.items = items;
        }
        const attachments = await executeAndReturnResult(
          `SELECT "ID","DOCENTRY","ATTACHMENTNAME","LINK" FROM "SRM_GRPO2" T0 WHERE T0."DOCENTRY" = TRIM('${id}');`,
        );
        // const attachments = await createStatementAndExecute(
        //   ` SELECT "ID","DOCENTRY","ATTACHMENTNAME","LINK" FROM "SRM_GRPO2" T0 WHERE T0."DOCENTRY" = ?`,
        //   [id],
        // );
        if (attachments.count !== 0) {
          result.attachments = attachments;
        }
        return { data: result };
      } else {
        return { data: [], message: 'No GRPOs found' };
      }
    } catch (e) {
      throw new HttpException(e.message, 400);
    }
  }
  /**
   * Creates a new GRPO (Goods Receipt Purchase Order) for the given user, with the provided files and body data.
   * @param user - The user dashboard object.
   * @param files - An array of files uploaded by the user.
   * @param body - An object containing the GRPO data, including BILLNO, BILLDATE, ITEMS, and STATUS.
   * @returns A Promise that resolves to an object with a message indicating whether the GRPO was created successfully.
   * @throws An error if there was an issue inserting items or uploading files.
   */
  async createMyGrpoCOPY(
    user: UserDashboard,
    files: Express.Multer.File[],
    body: {
      BPLId: number;
      BILLNO: string;
      BILLDATE: string;
      ITEMS: string;
      STATUS: 'ready' | 'completed';
    },
  ) {
    try {
      const { BILLNO, BILLDATE, ITEMS, BPLId } = body;
      const GrpoItems: Array<DataProps> = JSON.parse(ITEMS);
      const areFilesUploaded = await this.uploadFiles(files);
      if (areFilesUploaded) {
        const CurrentDocEntry: Result<{ DOCENTRY: string }> =
          await executeAndReturnResult(
            `SELECT IFNULL(MAX("DOCENTRY"),0) AS "DOCENTRY" FROM "SRM_OGRPO";`,
          );
        // const CurrentDocEntry = await createStatementAndExecute(
        //   ` SELECT IFNULL(MAX("DOCENTRY"),0) AS "DOCENTRY" FROM "SRM_OGRPO"`,
        //   [],
        // );
        if (CurrentDocEntry.count !== 0) {
          const DocEntry = JSON.parse(CurrentDocEntry[0].DOCENTRY) + 1;
          await global.connection.beginTransaction();
          const result = await executeAndReturnResult(
            `INSERT INTO SRM_OGRPO (DOCENTRY, BILLNO, BILLDATE, VENDORCODE, STATUS) VALUES ( TRIM('${DocEntry}'), TRIM('${BILLNO}'), TRIM('${BILLDATE}'), TRIM('${user.CODE}'), TRIM('${body.STATUS}'));`,
            true,
          )
            // const result = await createStatementAndExecute(
            //   `INSERT INTO SRM_OGRPO (DOCENTRY, BILLNO, BILLDATE, VENDORCODE, STATUS) VALUES (?,?,?,?,?)`,
            //   [DocEntry, BILLNO, BILLDATE, user.CODE, body.STATUS],
            // )
            .then(async () => {
              await new Promise(async (res, rej) => {
                let count = 0;
                await GrpoItems.forEach(async (item) => {
                  await executeAndReturnResult(
                    `INSERT INTO SRM_GRPO1 (DOCENTRY, LINEID, PONO, GRPONO ,PODATE, ITEMCODE, ITEMDSC, SHIPDATE, RECEIVEDQTY, BILLQTY) VALUES (TRIM('${DocEntry}'), TRIM('${item.LineNum}'), TRIM('${item['PO#']}'), TRIM('${item['GRPO#']}'), TRIM('${item.DocDate}'),TRIM('${item.ITEMCODE}'), TRIM('${item['Item Dsc']}'), TRIM('${item.ShipDate}'), TRIM('${item.ReceivedQty}'), TRIM('${item.BillQty}'));`,
                    true,
                  )
                    // await createStatementAndExecute(
                    //   `INSERT INTO SRM_GRPO1 (DOCENTRY, LINEID, PONO, GRPONO ,PODATE, ITEMCODE, ITEMDSC, SHIPDATE, RECEIVEDQTY, BILLQTY) VALUES (?,?,?,?,?,?,?,?,?,?)`,
                    //   [
                    //     DocEntry,
                    //     item.LineNum,
                    //     item['PO#'],
                    //     item['GRPO#'],
                    //     item.DocDate,
                    //     item.ItemCode,
                    //     item['Item Dsc'],
                    //     item.ShipDate,
                    //     item.ReceivedQty,
                    //     item.BillQty,
                    //   ],
                    // )
                    .then(() => {
                      count++;
                      if (count == GrpoItems.length) {
                        res(true);
                      }
                    })
                    .catch(async (e) => {
                      rej(e);
                    });
                });
              })
                .then(async (res: boolean) => {
                  if (res) {
                    await new Promise(async (resolve, reject) => {
                      let count = 0;
                      await files.forEach(async (file, index) => {
                        const fileInsert = await executeAndReturnResult(
                          `INSERT INTO SRM_GRPO2 (DOCENTRY, ATTACHMENTNAME, LINK) VALUES (TRIM('${DocEntry}'), TRIM('${
                            file.originalname
                          }'), TRIM('${'\\\\192.168.5.191\\Backup\\ZAINWEBSITETESTING\\SRM\\attachments\\'}'));
                      `,
                          true,
                        )
                          // const fileInsert = await createStatementAndExecute(
                          //   ` INSERT INTO SRM_GRPO2 (DOCENTRY, ATTACHMENTNAME, LINK) VALUES (?,?,?)`,
                          //   [
                          //     DocEntry,
                          //     file.originalname,
                          //     '\\\\192.168.5.191\\Backup\\ZAINWEBSITETESTING\\SRM\\attachments\\',
                          //   ],
                          // )
                          .then(() => {
                            count++;
                            if (count == files.length) {
                              resolve(true);
                            }
                          })
                          .catch(async (e) => {
                            await global.connection.rollback();
                            reject(e);
                          });
                      });
                    })
                      .then(async () => {
                        await global.connection.commit();
                        return { message: 'GRPO created successfully' };
                      })
                      .catch(async (e) => {
                        await global.connection.rollback();
                        // return { message: e.message };
                        throw new Error(e.message);
                      });
                  } else {
                    await global.connection.rollback();
                    return { message: 'Error inserting items' };
                  }
                })
                .catch(async (e) => {
                  await global.connection.rollback();
                  throw new Error(e.message);
                });
            });
          return result;
        }
      } else {
        throw new HttpException('Files not uploaded', 500);
      }
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }
  async createMyGrpoWithInvoiceCopy(
    user: UserDashboard,
    files: Express.Multer.File[],
    // body: {
    //   BPLId: number;
    //   BILLNO: string;
    //   BILLDATE: string;
    //   ITEMS: string;
    //   STATUS: 'ready' | 'completed';
    // },
    body: CreateMyGRPOValidatorDTO,
  ) {
    try {
      const { BILLNO, BILLDATE, ITEMS, BPLId } = body;
      const GrpoItems: Array<DataProps> = await JSON.parse(ITEMS);
      // console.log(GrpoItems, ' GRPO ITEMS');
      const areFilesUploaded = await this.uploadFiles(files);
      if (areFilesUploaded) {
        const CurrentDocEntry: Result<{ DOCENTRY: string }> =
          await executeAndReturnResult(
            `SELECT IFNULL(MAX("DOCENTRY"),0) AS "DOCENTRY" FROM "SRM_OGRPO";`,
          );
        // const CurrentDocEntry = await createStatementAndExecute(
        //   ` SELECT IFNULL(MAX("DOCENTRY"),0) AS "DOCENTRY" FROM "SRM_OGRPO"`,
        //   [],
        // );
        if (CurrentDocEntry.count !== 0) {
          const DocEntry = JSON.parse(CurrentDocEntry[0].DOCENTRY) + 1;
          await global.connection.beginTransaction();
          const result = await executeAndReturnResult(
            `INSERT INTO SRM_OGRPO (DOCENTRY, BILLNO, BILLDATE, VENDORCODE, STATUS,BPLID) VALUES (TRIM('${DocEntry}'), TRIM('${BILLNO}'), TRIM('${BILLDATE}'), TRIM('${user.CODE}'), TRIM('${body.STATUS}'), TRIM('${body.BPLId}'));`,
            true,
          )
            // const result = await createStatementAndExecute(
            //   `INSERT INTO SRM_OGRPO (DOCENTRY, BILLNO, BILLDATE, VENDORCODE, STATUS) VALUES (?,?,?,?,?)`,
            //   [DocEntry, BILLNO, BILLDATE, user.CODE, body.STATUS],
            // )
            .then(async () => {
              await new Promise(async (res, rej) => {
                let count = 0;
                await GrpoItems.forEach(async (item) => {
                  // await executeAndReturnResult(
                  //   `INSERT INTO SRM_GRPO1 (DOCENTRY, LINEID, PONO, GRPONO ,PODATE, ITEMCODE, ITEMDSC, SHIPDATE, RECEIVEDQTY, BILLQTY) VALUES ('${DocEntry}', '${item.LineNum}', '${item['PO#']}', '${item['GRPO#']}', '${item.DocDate}', '${item.ItemCode}', '${item['Item Dsc']}', '${item.ShipDate}', '${item.ReceivedQty}', '${item.BillQty}');`,
                  //   true,
                  // )
                  // console.log(item, ' ITEMS');
                  await executeAndReturnResult(
                    `INSERT INTO SRM_GRPO1 (DOCENTRY,LINEDOCENTRY,LINENUM,PONO,GRPONO,PODATE,ITEMCODE,ITEMDSC,SHIPDATE,BILLQTY,LINETOTAL) VALUES (TRIM('${DocEntry}'), TRIM('${item.LINEDOCENTRY}'), TRIM('${item.LineNum}'), TRIM('${item['PONO']}'), TRIM('${item['GRPONO']}'), TRIM('${item.PODATE}'), TRIM('${item.ITEMCODE}'), TRIM('${item['ITEMDSC']}'), TRIM('${item.SHIPDATE}'), TRIM('${item.BILLQTY}'), TRIM('${item.LINETOTAL}'));
                  `,
                    true,
                  )
                    // await createStatementAndExecute(
                    //   `INSERT INTO SRM_GRPO1 (DOCENTRY, LINEID, PONO, GRPONO ,PODATE, ITEMCODE, ITEMDSC, SHIPDATE, RECEIVEDQTY, BILLQTY) VALUES (?,?,?,?,?,?,?,?,?,?)`,
                    //   [
                    //     DocEntry,
                    //     item.LineNum,
                    //     item['PO#'],
                    //     item['GRPO#'],
                    //     item.DocDate,
                    //     item.ItemCode,
                    //     item['Item Dsc'],
                    //     item.ShipDate,
                    //     item.ReceivedQty,
                    //     item.BillQty,
                    //   ],
                    // )
                    .then(() => {
                      count++;
                      if (count == GrpoItems.length) {
                        res(true);
                      }
                    })
                    .catch(async (e) => {
                      rej(e);
                    });
                });
              })
                .then(async (res: boolean) => {
                  if (res) {
                    await new Promise(async (resolve, reject) => {
                      let count = 0;
                      await files.forEach(async (file, index) => {
                        const fileInsert = await executeAndReturnResult(
                          `INSERT INTO SRM_GRPO2 (DOCENTRY, ATTACHMENTNAME, LINK) VALUES (TRIM('${DocEntry}'), TRIM('${
                            file.originalname
                          }'), TRIM('${'\\\\192.168.5.191\\Backup\\ZAINWEBSITETESTING\\SRM\\attachments\\'}'));
                      `,
                          true,
                        )
                          // const fileInsert = await createStatementAndExecute(
                          //   ` INSERT INTO SRM_GRPO2 (DOCENTRY, ATTACHMENTNAME, LINK) VALUES (?,?,?)`,
                          //   [
                          //     DocEntry,
                          //     file.originalname,
                          //     '\\\\192.168.5.191\\Backup\\ZAINWEBSITETESTING\\SRM\\attachments\\',
                          //   ],
                          // )
                          .then(() => {
                            count++;
                            if (count == files.length) {
                              resolve(true);
                            }
                          })
                          .catch(async (e) => {
                            await global.connection.rollback();
                            reject(e);
                          });
                      });
                    })
                      .then(async () => {
                        await global.connection.commit();
                        const cookies = await this.sapSercice.loginSAPUser({
                          code: 'admin03',
                          password: 'hamza@815',
                        });
                        console.log(cookies, ' Cookies');
                        const sapPayload = {
                          CardCode: user.CODE,
                          DocObjectCode: 'oPurchaseInvoices',
                          BPL_IDAssignedToInvoice: BPLId,
                          DocumentLines: GrpoItems.map((it, index) => {
                            return {
                              LineNum: index,
                              ItemCode: it.ITEMCODE,
                              Quantity: it.BILLQTY,
                              BaseType: 20,
                              BaseLine: it.LineNum,
                              BaseEntry: it.LINEDOCENTRY,
                            };
                          }),
                        };
                        console.log(sapPayload, ' SAP Payload');
                        const attachmentABS =
                          await this.sapSercice.addAttachments(files);
                        const { AbsoluteEntry, data } = attachmentABS;
                        // console.log({
                        //   ...sapPayload,
                        //   AttachmentEntry: AbsoluteEntry,
                        // });
                        return await axios
                          .post(
                            'https://sap.dfl.com.pk:50000/b1s/v1/Drafts',
                            { ...sapPayload, AttachmentEntry: AbsoluteEntry },
                            {
                              withCredentials: true,
                              httpsAgent: new Agent({
                                rejectUnauthorized: false,
                              }),
                              headers: {
                                // cookies: `B1SESSION=${cookies['B1SESSION']},ROUTEID=${cookies['ROUTEID']}`,
                                cookies: cookies.fullCookie.join(','),
                                cookie: `${cookies['setCookies']}`,
                              },
                            },
                          )
                          .then((res) => {
                            // console.log(res.data, ' SAP ENTRY');
                            return { message: 'GRPO And Invoice Created' };
                          })
                          .catch((e) => {
                            console.log(
                              e?.response?.data?.error?.message?.value,
                              ' SAP ERROR',
                            );
                            throw new Error(
                              e?.response?.data?.error?.message?.value,
                            );
                          });
                      })
                      .catch(async (e) => {
                        await global.connection.rollback();
                        // return { message: e.message };
                        throw new Error(e.message);
                      });
                  } else {
                    await global.connection.rollback();
                    return { message: 'Error inserting items' };
                  }
                })
                .catch(async (e) => {
                  await global.connection.rollback();
                  throw new Error(e.message);
                });
            });
          return result;
        }
      } else {
        throw new HttpException('Files not uploaded', 500);
      }
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }
  async createAndGenerateInvoiceCopy(
    user: UserDashboard,
    files: Express.Multer.File[],
    // body: {
    //   BPLId: number;
    //   BILLNO: string;
    //   BILLDATE: string;
    //   ITEMS: string;
    //   STATUS: 'ready' | 'completed';
    // },
    body: CreateMyGRPOValidatorDTO,
  ) {
    try {
      const { BILLNO, BILLDATE, ITEMS, BPLId } = body;
      const GrpoItems: Array<DataProps> = await JSON.parse(ITEMS);
      // console.log(GrpoItems, ' GRPO ITEMS');
      const areFilesUploaded = await this.uploadFiles(files);
      if (areFilesUploaded) {
        const CurrentDocEntry: Result<{ DOCENTRY: string }> =
          await executeAndReturnResult(
            `SELECT IFNULL(MAX("DOCENTRY"),0) AS "DOCENTRY" FROM "SRM_OGRPO";`,
          );
        // const CurrentDocEntry = await createStatementAndExecute(
        //   ` SELECT IFNULL(MAX("DOCENTRY"),0) AS "DOCENTRY" FROM "SRM_OGRPO"`,
        //   [],
        // );
        if (CurrentDocEntry.count !== 0) {
          const DocEntry = JSON.parse(CurrentDocEntry[0].DOCENTRY) + 1;
          await global.connection.beginTransaction();
          const result = await executeAndReturnResult(
            `INSERT INTO SRM_OGRPO (DOCENTRY, BILLNO, BILLDATE, VENDORCODE, STATUS,BPLID) VALUES (TRIM('${DocEntry}'), TRIM('${BILLNO}'), TRIM('${BILLDATE}'), TRIM('${user.CODE}'), TRIM('${body.STATUS}'),TRIM('${body.BPLId}'));`,
            true,
          )
            // const result = await createStatementAndExecute(
            //   `INSERT INTO SRM_OGRPO (DOCENTRY, BILLNO, BILLDATE, VENDORCODE, STATUS) VALUES (?,?,?,?,?)`,
            //   [DocEntry, BILLNO, BILLDATE, user.CODE, body.STATUS],
            // )
            .then(async () => {
              await new Promise(async (res, rej) => {
                let count = 0;
                await GrpoItems.forEach(async (item) => {
                  // await executeAndReturnResult(
                  //   `INSERT INTO SRM_GRPO1 (DOCENTRY, LINEID, PONO, GRPONO ,PODATE, ITEMCODE, ITEMDSC, SHIPDATE, RECEIVEDQTY, BILLQTY) VALUES ('${DocEntry}', '${item.LineNum}', '${item['PO#']}', '${item['GRPO#']}', '${item.DocDate}', '${item.ItemCode}', '${item['Item Dsc']}', '${item.ShipDate}', '${item.ReceivedQty}', '${item.BillQty}');`,
                  //   true,
                  // )
                  // console.log(item, ' ITEMS');
                  await executeAndReturnResult(
                    `INSERT INTO SRM_GRPO1 (DOCENTRY,LINEDOCENTRY,LINENUM,PONO,GRPONO,PODATE,ITEMCODE,ITEMDSC,SHIPDATE,BILLQTY,LINETOTAL) VALUES (TRIM('${DocEntry}'), TRIM('${item.LINEDOCENTRY}'), TRIM('${item.LineNum}'), TRIM('${item['PONO']}'), TRIM('${item['GRPONO']}'), TRIM('${item.PODATE}'), TRIM('${item.ITEMCODE}'), TRIM('${item['ITEMDSC']}'), TRIM('${item.SHIPDATE}'), TRIM('${item.BILLQTY}'), TRIM('${item.LINETOTAL}'));
                  `,
                    true,
                  )
                    // await createStatementAndExecute(
                    //   `INSERT INTO SRM_GRPO1 (DOCENTRY, LINEID, PONO, GRPONO ,PODATE, ITEMCODE, ITEMDSC, SHIPDATE, RECEIVEDQTY, BILLQTY) VALUES (?,?,?,?,?,?,?,?,?,?)`,
                    //   [
                    //     DocEntry,
                    //     item.LineNum,
                    //     item['PO#'],
                    //     item['GRPO#'],
                    //     item.DocDate,
                    //     item.ItemCode,
                    //     item['Item Dsc'],
                    //     item.ShipDate,
                    //     item.ReceivedQty,
                    //     item.BillQty,
                    //   ],
                    // )
                    .then(() => {
                      count++;
                      if (count == GrpoItems.length) {
                        res(true);
                      }
                    })
                    .catch(async (e) => {
                      rej(e);
                    });
                });
              })
                .then(async (res: boolean) => {
                  if (res) {
                    await new Promise(async (resolve, reject) => {
                      let count = 0;
                      await files.forEach(async (file, index) => {
                        const fileInsert = await executeAndReturnResult(
                          `INSERT INTO SRM_GRPO2 (DOCENTRY, ATTACHMENTNAME, LINK) VALUES (TRIM('${DocEntry}'), TRIM('${
                            file.originalname
                          }'), TRIM('${'\\\\192.168.5.191\\Backup\\ZAINWEBSITETESTING\\SRM\\attachments\\'}'));
                      `,
                          true,
                        )
                          // const fileInsert = await createStatementAndExecute(
                          //   ` INSERT INTO SRM_GRPO2 (DOCENTRY, ATTACHMENTNAME, LINK) VALUES (?,?,?)`,
                          //   [
                          //     DocEntry,
                          //     file.originalname,
                          //     '\\\\192.168.5.191\\Backup\\ZAINWEBSITETESTING\\SRM\\attachments\\',
                          //   ],
                          // )
                          .then(() => {
                            count++;
                            if (count == files.length) {
                              resolve(true);
                            }
                          })
                          .catch(async (e) => {
                            await global.connection.rollback();
                            reject(e);
                          });
                      });
                    })
                      .then(async () => {
                        await global.connection.commit();
                        const cookies = await this.sapSercice.loginSAPUser({
                          code: 'admin03',
                          password: 'hamza@815',
                        });
                        console.log(cookies, ' Cookies');
                        const sapPayload = {
                          CardCode: user.CODE,
                          DocObjectCode: 'oPurchaseInvoices',
                          BPL_IDAssignedToInvoice: BPLId,
                          DocumentLines: GrpoItems.map((it, index) => {
                            return {
                              LineNum: index,
                              ItemCode: it.ITEMCODE,
                              Quantity: it.BILLQTY,
                              BaseType: 20,
                              BaseLine: it.LineNum,
                              BaseEntry: it.LINEDOCENTRY,
                            };
                          }),
                        };
                        console.log(sapPayload, ' SAP Payload');
                        const attachmentABS =
                          await this.sapSercice.addAttachments(files);
                        const { AbsoluteEntry, data } = attachmentABS;
                        // console.log(attachmentABS, ' ATTACHMENT ABS');
                        // return { message: 'GRPO And Invoice Created' };
                        //   ...sapPayload,
                        //   AttachmentEntry: AbsoluteEntry,
                        // });
                        return await axios
                          .post(
                            'https://sap.dfl.com.pk:50000/b1s/v1/Drafts',
                            { ...sapPayload, AttachmentEntry: AbsoluteEntry },
                            {
                              withCredentials: true,
                              httpsAgent: new Agent({
                                rejectUnauthorized: false,
                              }),
                              headers: {
                                // cookies: `B1SESSION=${cookies['B1SESSION']},ROUTEID=${cookies['ROUTEID']}`,
                                cookies: cookies.fullCookie.join(','),
                                cookie: `${cookies['setCookies']}`,
                              },
                            },
                          )
                          .then((res) => {
                            // console.log(res.data, ' SAP ENTRY');
                            return { message: 'GRPO And Invoice Created' };
                          })
                          .catch((e) => {
                            console.log(
                              e?.response?.data?.error?.message?.value,
                              ' SAP ERROR',
                            );
                            throw new Error(
                              e?.response?.data?.error?.message?.value,
                            );
                          });
                      })
                      .catch(async (e) => {
                        await global.connection.rollback();
                        // return { message: e.message };
                        throw new Error(e.message);
                      });
                  } else {
                    await global.connection.rollback();
                    return { message: 'Error inserting items' };
                  }
                })
                .catch(async (e) => {
                  await global.connection.rollback();
                  throw new Error(e.message);
                });
            });
          return result;
        }
      } else {
        throw new HttpException('Files not uploaded', 500);
      }
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }
  async createAndGenerateInvoice(
    user: UserDashboard,
    files: Express.Multer.File[],
    body: CreateMyGRPOValidatorDTO,
  ) {
    try {
      const { BILLNO, BILLDATE, ITEMS, BPLId, SERIES } = body;
      const GrpoItems: Array<DataProps> = await JSON.parse(ITEMS);
      // console.log(GrpoItems, ' GRPO ITEMS');
      const areFilesUploaded = await this.uploadFiles(files);
      if (areFilesUploaded) {
        const CurrentDocEntry: Result<{ DOCENTRY: string }> =
          await executeAndReturnResult(
            `SELECT IFNULL(MAX("DOCENTRY"),0) AS "DOCENTRY" FROM "SRM_OGRPO";`,
          );
        // const CurrentDocEntry = await createStatementAndExecute(
        //   ` SELECT IFNULL(MAX("DOCENTRY"),0) AS "DOCENTRY" FROM "SRM_OGRPO"`,
        //   [],
        // );
        if (CurrentDocEntry.count !== 0) {
          const DocEntry = JSON.parse(CurrentDocEntry[0].DOCENTRY) + 1;
          await global.connection.beginTransaction();
          const result = await executeAndReturnResult(
            `INSERT INTO SRM_OGRPO (DOCENTRY, BILLNO, BILLDATE, VENDORCODE, STATUS,BPLID,SERIES) VALUES (TRIM('${DocEntry}'), TRIM('${BILLNO}'), TRIM('${moment(
              BILLDATE,
              'DD-MM-YYYY',
            ).format('YYYY-MM-DD')}'), TRIM('${user.CODE}'), TRIM('${
              body.STATUS
            }'),TRIM('${body.BPLId}'),TRIM('${SERIES}'));`,
            true,
          )
            // const result = await createStatementAndExecute(
            //   `INSERT INTO SRM_OGRPO (DOCENTRY, BILLNO, BILLDATE, VENDORCODE, STATUS) VALUES (?,?,?,?,?)`,
            //   [DocEntry, BILLNO, BILLDATE, user.CODE, body.STATUS],
            // )
            .then(async () => {
              await new Promise(async (res, rej) => {
                let count = 0;
                await GrpoItems.forEach(async (item) => {
                  // await executeAndReturnResult(
                  //   `INSERT INTO SRM_GRPO1 (DOCENTRY, LINEID, PONO, GRPONO ,PODATE, ITEMCODE, ITEMDSC, SHIPDATE, RECEIVEDQTY, BILLQTY) VALUES ('${DocEntry}', '${item.LineNum}', '${item['PO#']}', '${item['GRPO#']}', '${item.DocDate}', '${item.ItemCode}', '${item['Item Dsc']}', '${item.ShipDate}', '${item.ReceivedQty}', '${item.BillQty}');`,
                  //   true,
                  // )
                  // console.log(item, ' ITEMS');
                  await executeAndReturnResult(
                    `INSERT INTO SRM_GRPO1 (DOCENTRY,LINEDOCENTRY,LINENUM,PONO,GRPONO,PODATE,ITEMCODE,ITEMDSC,SHIPDATE,BILLQTY,PRICE) VALUES (TRIM('${DocEntry}'), TRIM('${
                      item.LINEDOCENTRY
                    }'), TRIM('${item.LineNum}'), TRIM('${
                      item['PONO']
                    }'), TRIM('${item['GRPONO']}'), TRIM('${moment(
                      item.PODATE,
                      'DD-MM-YYYY',
                    ).format('YYYY-MM-DD')}'), TRIM('${
                      item.ITEMCODE
                    }'), TRIM('${item['ITEMDSC']}'), TRIM('${moment(
                      item.SHIPDATE,
                      'DD-MM-YYYY',
                    ).format('YYYY-MM-DD')}'), TRIM('${item.BILLQTY}'),TRIM('${
                      item.PRICE
                    }'));
                  `,
                    true,
                  )
                    // await createStatementAndExecute(
                    //   `INSERT INTO SRM_GRPO1 (DOCENTRY, LINEID, PONO, GRPONO ,PODATE, ITEMCODE, ITEMDSC, SHIPDATE, RECEIVEDQTY, BILLQTY) VALUES (?,?,?,?,?,?,?,?,?,?)`,
                    //   [
                    //     DocEntry,
                    //     item.LineNum,
                    //     item['PO#'],
                    //     item['GRPO#'],
                    //     item.DocDate,
                    //     item.ItemCode,
                    //     item['Item Dsc'],
                    //     item.ShipDate,
                    //     item.ReceivedQty,
                    //     item.BillQty,
                    //   ],
                    // )
                    .then(() => {
                      count++;
                      if (count == GrpoItems.length) {
                        res(true);
                      }
                    })
                    .catch(async (e) => {
                      rej(e);
                    });
                });
              })
                .then(async (res: boolean) => {
                  if (res) {
                    await new Promise(async (resolve, reject) => {
                      let count = 0;
                      await files.forEach(async (file, index) => {
                        const fileInsert = await executeAndReturnResult(
                          `INSERT INTO SRM_GRPO2 (DOCENTRY, ATTACHMENTNAME, LINK) VALUES ( TRIM('${DocEntry}'), '${
                            file.originalname
                          }', '${
                            true
                              ? process.env.SHARE_FOLDER_PATH
                              : '\\\\192.168.5.191\\Backup\\ZAINWEBSITETESTING\\SRM\\attachments\\'
                            // ? '\\\\192.168.5.182\\SAP-Share\\'
                          }');
                      `,
                          true,
                        )
                          // const fileInsert = await createStatementAndExecute(
                          //   ` INSERT INTO SRM_GRPO2 (DOCENTRY, ATTACHMENTNAME, LINK) VALUES (?,?,?)`,
                          //   [
                          //     DocEntry,
                          //     file.originalname,
                          //     '\\\\192.168.5.191\\Backup\\ZAINWEBSITETESTING\\SRM\\attachments\\',
                          //   ],
                          // )
                          .then(() => {
                            count++;
                            if (count == files.length) {
                              resolve(true);
                            }
                          })
                          .catch(async (e) => {
                            await global.connection.rollback();
                            reject(e);
                          });
                      });
                    })
                      .then(async () => {
                        await global.connection.commit();
                        const sapPayload = {
                          CardCode: user.CODE,
                          Series: SERIES,
                          NumAtCard: BILLNO,
                          DocObjectCode: 'oPurchaseInvoices',
                          BPL_IDAssignedToInvoice: BPLId,
                          DocumentLines: GrpoItems.map((it, index) => {
                            return {
                              LineNum: index,
                              ItemCode: it.ITEMCODE.trim(),
                              Quantity: it.BILLQTY,
                              BaseType: 20,
                              BaseLine: it.LineNum,
                              BaseEntry: it.LINEDOCENTRY,
                            };
                          }),
                        };
                        const result: SAPDRAFTSUCCESS =
                          await this.generateMyInvoice(
                            sapPayload,
                            // user,
                            files,
                            // GrpoItems,
                            // BPLId,
                          );
                        if (result) {
                          const { DocEntry: SuccessDocEntry } = result;
                          // Update SRM_GRPO DRAFTID
                          await global.connection.beginTransaction();
                          await executeAndReturnResult(
                            `UPDATE SRM_OGRPO SET DRAFTID= TRIM('${SuccessDocEntry}') WHERE DOCENTRY= TRIM('${DocEntry}');`,
                            true,
                          ).then(async () => {
                            await global.connection.commit();
                          });
                        }
                      })
                      .catch(async (e) => {
                        await global.connection.rollback();
                        // return { message: e.message };
                        throw new Error(e.message);
                      });
                  } else {
                    await global.connection.rollback();
                    return { message: 'Error inserting items' };
                  }
                })
                .catch(async (e) => {
                  await global.connection.rollback();
                  throw new Error(e.message);
                });
            });
          return result;
        }
      } else {
        throw new HttpException('Files not uploaded', 500);
      }
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }
  async createMyDraftPO(
    user: UserDashboard,
    files: Express.Multer.File[],
    body: CreateMyGRPOValidatorDTO,
  ) {
    try {
      const { BILLNO, BILLDATE, ITEMS, BPLId, SERIES } = body;
      const GrpoItems: Array<DataProps> = await JSON.parse(ITEMS);
      // console.log(GrpoItems, ' GRPO ITEMS');
      const areFilesUploaded = await this.uploadFiles(files);
      if (areFilesUploaded) {
        const CurrentDocEntry: Result<{ DOCENTRY: string }> =
          await executeAndReturnResult(
            `SELECT IFNULL(MAX("DOCENTRY"),0) AS "DOCENTRY" FROM "SRM_OGRPO";`,
          );
        if (CurrentDocEntry.count !== 0) {
          const DocEntry = JSON.parse(CurrentDocEntry[0].DOCENTRY) + 1;
          await global.connection.beginTransaction();

          const result = await executeAndReturnResult(
            `INSERT INTO SRM_OGRPO (DOCENTRY, BILLNO, BILLDATE, VENDORCODE, STATUS,BPLID,SERIES) VALUES ( TRIM('${DocEntry}'), TRIM('${BILLNO}'), TRIM('${moment(
              BILLDATE,
              'DD-MM-YYYY',
            ).format('YYYY-MM-DD')}'), TRIM('${user.CODE}'), TRIM('${
              body.STATUS
            }'),TRIM('${body.BPLId}'),TRIM('${SERIES}'));`,
            true,
          ).then(async () => {
            await new Promise(async (res, rej) => {
              let count = 0;
              await GrpoItems.forEach(async (item) => {
                console.log(ITEMS);
                await executeAndReturnResult(
                  `INSERT INTO SRM_GRPO1 (DOCENTRY,LINEDOCENTRY,LINENUM,PONO,GRPONO,PODATE,ITEMCODE,ITEMDSC,SHIPDATE,BILLQTY,PRICE) VALUES (TRIM('${DocEntry}'), TRIM('${
                    item.LINEDOCENTRY
                  }'), TRIM('${item.LineNum}'), TRIM('${
                    item['PONO']
                  }'), TRIM('${item['GRPONO']}'), TRIM('${moment(
                    item.PODATE,
                    'DD-MM-YYYY',
                  ).format('YYYY-MM-DD')}'), TRIM('${item.ITEMCODE}'), TRIM('${
                    item['ITEMDSC']
                  }'), TRIM('${moment(item.SHIPDATE, 'DD-MM-YYYY').format(
                    'YYYY-MM-DD',
                  )}'), TRIM('${item.BILLQTY}'),TRIM('${item.PRICE}'));
                  `,
                  true,
                )
                  .then(() => {
                    count++;
                    if (count == GrpoItems.length) {
                      res(true);
                    }
                  })
                  .catch(async (e) => {
                    rej(e);
                  });
              });
            })
              .then(async (res: boolean) => {
                if (res) {
                  await new Promise(async (resolve, reject) => {
                    let count = 0;
                    await files.forEach(async (file, index) => {
                      const fileInsert = await executeAndReturnResult(
                        `INSERT INTO SRM_GRPO2 (DOCENTRY, ATTACHMENTNAME, LINK) VALUES ( TRIM('${DocEntry}'), '${
                          file.originalname
                        }', '${
                          true
                            ? process.env.SHARE_FOLDER_PATH
                            : '\\\\192.168.5.191\\Backup\\ZAINWEBSITETESTING\\SRM\\attachments\\'
                        }');
                      `,
                        true,
                      )
                        .then(() => {
                          count++;
                          if (count == files.length) {
                            resolve(true);
                          }
                        })
                        .catch(async (e) => {
                          await global.connection.rollback();
                          reject(e);
                        });
                    });
                  })
                    .then(async () => {
                      await global.connection.commit();
                      return { message: 'GRPO Created' };
                    })
                    .catch(async (e) => {
                      await global.connection.rollback();
                      // return { message: e.message };
                      throw new Error(e.message);
                    });
                } else {
                  await global.connection.rollback();
                  return { message: 'Error inserting items' };
                }
              })
              .catch(async (e) => {
                await global.connection.rollback();
                throw new Error(e.message);
              });
          });
          return result;
        }
      } else {
        throw new HttpException('Files not uploaded', 500);
      }
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }

  async generateMyInvoice(
    payload: {
      CardCode: string;
      DocObjectCode: string;
      BPL_IDAssignedToInvoice: string;
      DocumentLines: {
        LineNum: number;
        ItemCode: string;
        Quantity: number;
        BaseType: number;
        BaseLine: number;
        BaseEntry: string;
      }[];
    },
    // user: UserDashboard,
    files: Express.Multer.File[],
    // GrpoItems: Array<DataProps>,
    // BPLId: number | string,
  ) {
    try {
      const cookies = await this.sapSercice.loginSAPUser({
        code: 'admin03',
        password: 'hamza@815',
      });
      // console.log(cookies, ' Cookies');

      // console.log(sapPayload, ' SAP Payload');
      const attachmentABS = await this.sapSercice.addAttachments(files);
      const { AbsoluteEntry, data } = attachmentABS;
      // console.log({
      //   ...sapPayload,
      //   AttachmentEntry: AbsoluteEntry,
      // });
      return await axios
        .post(
          'https://sap.dfl.com.pk:50000/b1s/v1/Drafts',
          { ...payload, AttachmentEntry: AbsoluteEntry },
          {
            withCredentials: true,
            httpsAgent: new Agent({
              rejectUnauthorized: false,
            }),
            headers: {
              // cookies: `B1SESSION=${cookies['B1SESSION']},ROUTEID=${cookies['ROUTEID']}`,
              cookies: cookies.fullCookie.join(','),
              cookie: `${cookies['setCookies']}`,
            },
          },
        )
        .then((res) => {
          // console.log(res.data, ' SAP ENTRY');
          // return { message: 'GRPO And Invoice Created' };
          return res.data;
        })
        .catch((e) => {
          console.log(e?.response?.data?.error?.message?.value, ' SAP ERROR');
          throw new Error(e?.response?.data?.error?.message?.value);
        });
    } catch (e) {
      console.log(e.message);
      throw new Error(e.message);
    }
  }
  /**
   * Uploads an array of files to a specific directory.
   * @param files - An array of files to upload.
   * @returns A Promise that resolves to 'files uploaded' if all files were uploaded successfully.
   * @throws HttpException if any error occurs during the upload process.
   */
  async uploadFiles(files: Express.Multer.File[]): Promise<any> {
    try {
      let uploadFiles = 0;
      return await new Promise(async (resolve, reject) => {
        files.forEach(async (file) => {
          console.log(file);
          await writeFile(
            `${
              true
                ? process.env.SHARE_FOLDER_PATH
                : '\\\\192.168.5.191\\Backup\\ZAINWEBSITETESTING\\SRM\\attachments\\'
              // ? '\\\\192.168.5.182\\SAP-Share\\'
            }${file.originalname}`,
            file.buffer,
          )
            .then(() => {
              uploadFiles++;
              if (files.length === uploadFiles) {
                resolve('files uploaded');
              }
            })
            .catch((err) => {
              console.log(err, ' upload Files');
              console.log(err.message);
              if (err.code === 'ENOENT') {
                reject('Share Folder Not Found');
              }
              if (err.code === 'EACCES') {
                reject('No Access to Share Folder');
              }
              if (err.code === 'EEXIST') {
                reject('File Already Exists');
              } else reject(err.message);
              if (err.code === 'EPERM') {
                // reject('No Access to Share Folder');
                reject(
                  'File Already Exists. Please Re-upload the file with a different name',
                );
              }
            });
        });
      })
        .then((res) => res)
        .catch((err) => {
          throw new HttpException(err.message, 500);
        });
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }
  async markGrpoAsReady() {
    return 'marked as ready';
  }
  async markGrpoAsCompleted() {
    return 'marked as completed';
  }
  /**
   * Downloads an attachment for a given GRPO ID.
   * @param id The ID of the GRPO.
   * @returns A Promise that resolves to an object containing the attachment data and name.
   * @throws HttpException if the attachment is not found or if there is an error while reading the file.
   */
  async downloadAttachment(
    id: MyReadyGRPOSByID['id'],
    res: Response,
  ): Promise<{ data: any; ATTACHMENTNAME: string; contentType: string }> {
    try {
      const result: Result<{ LINK: string; ATTACHMENTNAME: string }> =
        await executeAndReturnResult(
          `SELECT "LINK","ATTACHMENTNAME" FROM "SRM_GRPO2" WHERE "ID" = TRIM('${id}');`,
        );
      // const result: Result<{ LINK: string; ATTACHMENTNAME: string }> =
      //   await createStatementAndExecute(
      //     `SELECT "LINK","ATTACHMENTNAME" FROM "SRM_GRPO2" WHERE "ID" = ?`,
      //     [id],
      //   );
      if (result.count !== 0) {
        const filePath =
          result[0].LINK + String(result[0]['ATTACHMENTNAME']).trim();
        return await readFile(filePath)
          .then((data) => {
            // console.log(data);
            // return res.send(data);
            return {
              data,
              ATTACHMENTNAME: result[0]['ATTACHMENTNAME'],
              contentType: mime.lookup(filePath),
            };
          })
          .catch((e) => {
            console.log(e);
            throw new Error('Error Retreiving File');
          });
      } else {
        throw new HttpException('No Attachments found', 404);
      }
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }
  /**
   * Retrieves all invoices from the SRM_OGRPO table if the user is an admin.
   * @param user - The user dashboard object.
   * @returns An object containing the fetched data and a message.
   * @throws HttpException if the user is not an admin or if there is an error while fetching the data.
   */
  async getAllInvoicesFromGrpos(user: UserDashboard) {
    try {
      if (user.ROLE !== 'admin') {
        throw new HttpException('Unauthorized', 401);
      } else {
        const result = await executeAndReturnResult(
          `SELECT "DOCENTRY","BILLNO",TO_VARCHAR(TO_DATE("BILLDATE"),'DD-MM-YYYY') AS "BILLDATE",V."CardName" AS "VENDOR",CASE WHEN "STATUS" = 'completed' AND DRAFTID IS NULL THEN 'defected' ELSE "STATUS" END
           AS "STATUS",TO_VARCHAR(TO_DATE("CREATEDAT"),'DD-MM-YYYY') AS "CREATEDAT","DRAFTID"  FROM "SRM_OGRPO" G
          INNER JOIN "OCRD" V ON G."VENDORCODE" = V."CardCode"
          ;`,
        );
        // const result = await createStatementAndExecute(
        //   ` SELECT "DOCENTRY","BILLNO",TO_VARCHAR(TO_DATE("BILLDATE"),'DD-MM-YYYY') AS "BILLDATE","VENDORCODE","STATUS",TO_VARCHAR(TO_DATE("CREATEDAT"),'DD-MM-YYYY') AS "CREATEDAT"  FROM "SRM_OGRPO"`,
        //   [],
        // );
        if (result.count !== 0) {
          return { data: result, message: 'Fetched' };
        } else {
          return { data: [], message: 'No GRPOs found' };
        }
      }
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }
  /**
   * Retrieves the invoice details for a given GRPO ID.
   * @param user - The user dashboard object.
   * @param id - The GRPO ID to retrieve invoice details for.
   * @returns An object containing the header, items, and attachments of the invoice, or an empty array and a message if no GRPOs were found.
   */
  async getInvoiceDetails(user: UserDashboard, id: string) {
    const result = { header: null, items: null, attachments: null };
    const header = await executeAndReturnResult(
      `SELECT "DOCENTRY","BILLNO",TO_VARCHAR(TO_DATE("BILLDATE"),'DD-MM-YYYY') AS "BILLDATE",V."CardName" AS "VENDOR", CASE WHEN "STATUS"='ready' THEN 'Draft' WHEN "STATUS" = 'completed' THEN 'Finalized' END AS "STATUS" ,TO_VARCHAR(TO_DATE("CREATEDAT"),'DD-MM-YYYY') AS "CREATEDAT"  FROM "SRM_OGRPO" T0 
      INNER JOIN "OCRD" V ON T0."VENDORCODE" = V."CardCode"
      WHERE T0."DOCENTRY" = TRIM('${id}');`,
    );
    // const header = await createStatementAndExecute(
    //   ` SELECT "DOCENTRY","BILLNO",TO_VARCHAR(TO_DATE("BILLDATE"),'DD-MM-YYYY') AS "BILLDATE","VENDORCODE","STATUS",TO_VARCHAR(TO_DATE("CREATEDAT"),'DD-MM-YYYY') AS "CREATEDAT"  FROM "SRM_OGRPO" T0 WHERE T0."DOCENTRY" = ?`,
    //   [id],
    // );
    if (header.count !== 0) {
      result.header = header[0];
      const items = await executeAndReturnResult(
        `SELECT "DOCENTRY","PONO","GRPONO","PODATE","ITEMCODE","ITEMDSC","SHIPDATE",
        PR1."Price"AS "Actual Price",
        "PRICE" AS "Vendor Price",
        "BILLQTY" 
        FROM "SRM_GRPO1" T0 
        LEFT JOIN "OPDN" PR ON T0."GRPONO" = PR."DocNum"
        LEFT JOIN "PDN1" PR1 on T0."ITEMCODE" = PR1."ItemCode" AND PR1."DocEntry" = PR."DocEntry" AND T0."LINENUM" = PR1."LineNum" WHERE T0."DOCENTRY" = TRIM('${id}');`,
      );
      // const items = await createStatementAndExecute(
      //   ` SELECT "DOCENTRY","LINEID","PONO","GRPONO","PODATE","ITEMCODE","ITEMDSC","SHIPDATE","RECEIVEDQTY","BILLQTY" FROM "SRM_GRPO1" T0 WHERE T0."DOCENTRY" = ?`,
      //   [id],
      // );
      if (items.count !== 0) {
        result.items = items;
      }
      const attachments = await executeAndReturnResult(
        `SELECT "ID","DOCENTRY","ATTACHMENTNAME","LINK" FROM "SRM_GRPO2" T0 WHERE T0."DOCENTRY" = TRIM('${id}');`,
      );
      // const attachments = await createStatementAndExecute(
      //   ` SELECT "ID","DOCENTRY","ATTACHMENTNAME","LINK" FROM "SRM_GRPO2" T0 WHERE T0."DOCENTRY" = ?`,
      //   [id],
      // );
      if (attachments.count !== 0) {
        result.attachments = attachments;
      }
      return { data: result };
    } else {
      return { data: [], message: 'No GRPOs found' };
    }
  }
  async updateGrpo(
    user: UserDashboard,
    files: Express.Multer.File[],
    body: any,
  ) {
    // console.log(files, ' files');
    // console.log(body, ' body');
    let {
      header,
      // : headerString,
      items,
      // : ItemsString,
      attachments,
      // : attachmentString,
    } = body;
    // const header = JSON.parse(headerString);
    // const items = JSON.parse(ItemsString);
    // const attachments = JSON.parse(attachmentString);
    console.log(header, items, attachments);
    header = JSON.parse(header);
    items = JSON.parse(items);
    attachments = Array.isArray(attachments)
      ? attachments
      : JSON.parse(attachments);
    if (files && files?.length > 0) {
      const uploadFiles = await this.uploadFiles(files);
      if (uploadFiles) {
        await global.connection.beginTransaction();
        return executeAndReturnResult(
          `UPDATE "SRM_OGRPO" SET "BILLNO"=TRIM('${
            header.BILLNO
          }'),"BILLDATE"='${moment(header.BILLDATE, 'DD-MM-YYYY').format(
            'YYYY-MM-DD',
          )}' WHERE "DOCENTRY"= TRIM('${header.DRAFTNO}')`,
          true,
        )
          .then(async () => {
            return await new Promise(async (res, rej) => {
              let count = 0;
              console.log(items);
              await items.forEach(async (item) => {
                if (item.toDelete && item.ID !== null) {
                  await executeAndReturnResult(
                    `DELETE FROM "SRM_GRPO1" WHERE "ID"= TRIM('${item.ID}')`,
                    true,
                  )
                    .then(() => {
                      count++;
                      if (count == items.length) {
                        res(true);
                      }
                    })
                    .catch((e) => {
                      rej(e);
                    });
                } else if (item.toChange && item.ID !== null) {
                  await executeAndReturnResult(
                    `UPDATE "SRM_GRPO1" SET "BILLQTY"= TRIM('${item.BillQty}') AND "PRICE" = TRIM('${item.Price}') WHERE "ID"= TRIM('${item.ID}')`,
                    true,
                  )
                    .then(() => {
                      count++;
                      if (count == items.length) {
                        res(true);
                      }
                    })
                    .catch((e) => {
                      rej(e);
                    });
                } else if (item.toAdd && item.ID === null) {
                  await executeAndReturnResult(
                    `INSERT INTO "SRM_GRPO1" ("DOCENTRY","LINENUM","PONO","GRPONO","PODATE","ITEMCODE","ITEMDSC","SHIPDATE","BILLQTY","PRICE","LINEDOCENTRY") VALUES (TRIM('${
                      header.DRAFTNO
                    }'),TRIM('${item.LineNum}'),TRIM('${item['PO#']}'),TRIM('${
                      item['GRPO#']
                    }'),'${moment(item.DocDate).format('YYYY-MM-DD')}','${
                      item.ItemCode
                    }','${item['Item Dsc']}','${moment(
                      item.ShipDate,
                      'DD-MM-YYYY',
                    ).format('YYYY-MM-DD')}',TRIM('${item.BillQty}'),TRIM('${
                      item.PRICE
                    }'),TRIM('${item.LineDOCENTRY}'))`,
                    true,
                  )
                    .then(() => {
                      count++;
                      if (count == items.length) {
                        res(true);
                      }
                    })
                    .catch((e) => {
                      rej(e);
                    });
                } else if (!item.toAdd && !item.toChange && !item.toDelete) {
                  count++;
                  if (count == items.length) {
                    res(true);
                  }
                }
              });
            })
              .then(async (res) => {
                if (res) {
                  await new Promise(async (resolve, reject) => {
                    let count = 0;

                    if (attachments && Array.isArray(attachments)) {
                      await attachments.forEach(async (file, index) => {
                        const myFile = JSON.parse(file);
                        if (
                          myFile.toDelete &&
                          !String(myFile.ID).includes('null')
                        ) {
                          return await executeAndReturnResult(
                            `DELETE FROM "SRM_GRPO2" WHERE "ID"= TRIM('${myFile.ID}')`,
                            true,
                          )
                            .catch((e) => {
                              reject(e);
                            })
                            .then(() => {
                              count++;
                              if (count == attachments.length) {
                                resolve(true);
                              }
                            });
                        } else {
                          count++;
                          if (count == attachments.length) {
                            resolve(true);
                          }
                        }
                      });
                    } else {
                      if (
                        attachments.toDelete &&
                        !String(attachments.ID).includes('null')
                      ) {
                        return await executeAndReturnResult(
                          `DELETE FROM "SRM_GRPO2" WHERE "ID"= TRIM('${attachments.ID}')`,
                          true,
                        )
                          .catch((e) => {
                            reject(e);
                          })
                          .then(() => {
                            resolve(true);
                          });
                      } else {
                        resolve(true);
                      }
                    }
                  })
                    .then(async () => {
                      return await new Promise(async (resolve, reject) => {
                        let count = 0;
                        await files.map(async (file, index) => {
                          await executeAndReturnResult(
                            `INSERT INTO SRM_GRPO2 (DOCENTRY, ATTACHMENTNAME, LINK) VALUES ( TRIM('${
                              header.DRAFTNO
                            }'), '${file.originalname}', '${
                              true
                                ? process.env.SHARE_FOLDER_PATH
                                : '\\\\192.168.5.191\\Backup\\ZAINWEBSITETESTING\\SRM\\attachments\\'
                            }');`,
                            true,
                          )
                            .then(() => {
                              count++;
                              if (count == files.length) {
                                resolve(true);
                              }
                            })
                            .catch((e) => {
                              reject(e);
                            });
                        });
                      }).then(async () => {
                        await global.connection.commit();
                        return { data: null, message: 'GRPO Updated' };
                      });
                    })
                    .catch((e) => {
                      throw new Error(e.message);
                    });
                } else {
                  throw new Error('Error updating items');
                }
              })
              .catch((e) => {
                console.log(e);
                throw new HttpException(e.message, 500);
              });
          })
          .catch((e) => {
            console.log(e);
            throw new HttpException(e.message, 500);
          });
      } else {
        throw new HttpException('Files not uploaded', 500);
      }
    } else {
      await global.connection.beginTransaction();
      return executeAndReturnResult(
        `UPDATE "SRM_OGRPO" SET "BILLNO"= TRIM('${
          header.BILLNO
        }'),"BILLDATE"='${moment(header.BILLDATE, 'DD-MM-YYYY').format(
          'YYYY-MM-DD',
        )}' WHERE "DOCENTRY"= TRIM('${header.DRAFTNO}')`,
        true,
      )
        .then(async () => {
          return await new Promise(async (res, rej) => {
            let count = 0;
            await items.forEach(async (item) => {
              if (item.toDelete && item.ID !== null) {
                await executeAndReturnResult(
                  `DELETE FROM "SRM_GRPO1" WHERE "ID"= TRIM('${item.ID}')`,
                  true,
                )
                  .then(() => {
                    count++;
                    if (count == items.length) {
                      res(true);
                    }
                  })
                  .catch((e) => {
                    rej(e);
                  });
              } else if (item.toChange && item.ID !== null) {
                await executeAndReturnResult(
                  `UPDATE "SRM_GRPO1" SET "BILLQTY"= TRIM('${item.BillQty}') AND "PRICE" = TRIM('${item.Price}') WHERE "ID"= TRIM('${item.ID}')`,
                  true,
                )
                  .then(() => {
                    count++;
                    if (count == items.length) {
                      res(true);
                    }
                  })
                  .catch((e) => {
                    rej(e);
                  });
              } else if (item.toAdd && item.ID === null) {
                await executeAndReturnResult(
                  `INSERT INTO "SRM_GRPO1" ("DOCENTRY","LINENUM","PONO","GRPONO","PODATE","ITEMCODE","ITEMDSC","SHIPDATE","BILLQTY","PRICE","LINEDOCENTRY") VALUES (TRIM('${
                    header.DRAFTNO
                  }'),'${item.LineNum}',TRIM('${item['PO#']}'), TRIM('${
                    item['GRPO#']
                  }'),'${moment(item.DocDate).format('YYYY-MM-DD')}','${
                    item.ItemCode
                  }','${item['Item Dsc']}','${moment(
                    item.ShipDate,
                    'DD-MM-YYYY',
                  ).format('YYYY-MM-DD')}', TRIM('${item.BillQty}'), TRIM('${
                    item.PRICE
                  }'),TRIM('${item.LineDOCENTRY}'))`,
                  true,
                )
                  .then(() => {
                    count++;
                    if (count == items.length) {
                      res(true);
                    }
                  })
                  .catch((e) => {
                    rej(e);
                  });
              } else if (!item.toAdd && !item.toChange && !item.toDelete) {
                count++;
                if (count == items.length) {
                  res(true);
                }
              }
            });
          })
            .then(async (res) => {
              if (res) {
                return await new Promise(async (resolve, reject) => {
                  if (attachments && Array.isArray(attachments)) {
                    let count = 0;
                    // console.log(attachments, 'Attacments');
                    await attachments.forEach(async (file, index) => {
                      const myFile = JSON.parse(file);
                      // console.log(myFile, ' MY FILE');
                      if (
                        myFile.toDelete &&
                        !String(myFile.ID).includes('null')
                      ) {
                        return await executeAndReturnResult(
                          `DELETE FROM "SRM_GRPO2" WHERE "ID"= TRIM('${myFile.ID}')`,
                          true,
                        )
                          .catch((e) => {
                            reject(e);
                          })
                          .then(() => {
                            count++;
                            if (count == attachments.length) {
                              resolve(true);
                            }
                          });
                      } else {
                        count++;
                        if (count == attachments.length) {
                          resolve(true);
                        }
                      }
                    });
                  } else {
                    if (
                      attachments.toDelete &&
                      !String(attachments.ID).includes('null')
                    ) {
                      return await executeAndReturnResult(
                        `DELETE FROM "SRM_GRPO2" WHERE "ID"= TRIM('${attachments.ID}')`,
                        true,
                      )
                        .catch((e) => {
                          reject(e);
                        })
                        .then(() => {
                          resolve(true);
                        });
                    } else {
                      resolve(true);
                    }
                  }
                })
                  .then(async () => {
                    await global.connection.commit();
                    return { data: null, message: 'GRPO Updated' };
                  })
                  .catch((e) => {
                    throw new Error(e.message);
                  });
              } else {
                throw new Error('Error updating items');
              }
            })
            .catch((e) => {
              console.log(e);
              throw new HttpException(e.message, 500);
            });
        })
        .catch((e) => {
          console.log(e);
          throw new HttpException(e.message, 500);
        });
    }
  }
  // async saveGrpoAsDraft(
  //   user: UserDashboard,
  //   files: Express.Multer.File[],
  //   body: {
  //     BILLNO: string;
  //     BILLDATE: string;
  //     ITEMS: string;
  //     STATUS: 'ready' | 'completed';
  //     SERIES: number;
  //   },
  // ) {
  //   try {
  //     const { BILLNO, BILLDATE, ITEMS } = body;
  //     const GrpoItems: Array<DataProps> = JSON.parse(ITEMS);
  //     await this.uploadFiles(files)
  //       .then(async () => {
  //         const CurrentDocEntry: Result<{ DOCENTRY: string }> =
  //           await executeAndReturnResult(
  //             `SELECT IFNULL(MAX("DOCENTRY"),0) AS "DOCENTRY" FROM "SRM_OGRPO";`,
  //           );
  //         if (CurrentDocEntry.count !== 0) {
  //           const DocEntry = JSON.parse(CurrentDocEntry[0].DOCENTRY) + 1;
  //           await global.connection.beginTransaction();
  //           console.log(
  //             `INSERT INTO SRM_OGRPO (DOCENTRY, BILLNO, BILLDATE, VENDORCODE, STATUS,SERIES) VALUES ('${DocEntry}', '${BILLNO}', '${BILLDATE}', '${user.CODE}', '${body.STATUS}','${body.SERIES}');`,
  //           );
  //           const result = await executeAndReturnResult(
  //             `INSERT INTO SRM_OGRPO (DOCENTRY, BILLNO, BILLDATE, VENDORCODE, STATUS,SERIES) VALUES ('${DocEntry}', '${BILLNO}', '${BILLDATE}', '${user.CODE}', '${body.STATUS}','${body.SERIES}');`,
  //             true,
  //           )
  //             // const result = await createStatementAndExecute(
  //             //   `INSERT INTO SRM_OGRPO (DOCENTRY, BILLNO, BILLDATE, VENDORCODE, STATUS) VALUES (?,?,?,?,?)`,
  //             //   [DocEntry, BILLNO, BILLDATE, user.CODE, body.STATUS],
  //             // )
  //             .then(async () => {
  //               await new Promise(async (res, rej) => {
  //                 let count = 0;
  //                 await GrpoItems.forEach(async (item) => {
  //                   await executeAndReturnResult(
  //                     `INSERT INTO SRM_GRPO1 (DOCENTRY, LINEID, PONO, GRPONO ,PODATE, ITEMCODE, ITEMDSC, SHIPDATE, RECEIVEDQTY, BILLQTY) VALUES ('${DocEntry}', '${item.LineNum}', '${item['PO#']}', '${item['GRPO#']}', '${item.DocDate}', '${item.ITEMCODE}', '${item['Item Dsc']}', '${item.ShipDate}', '${item.ReceivedQty}', '${item.BillQty}');`,
  //                     true,
  //                   )
  //                     // await createStatementAndExecute(
  //                     //   `INSERT INTO SRM_GRPO1 (DOCENTRY, LINEID, PONO, GRPONO ,PODATE, ITEMCODE, ITEMDSC, SHIPDATE, RECEIVEDQTY, BILLQTY) VALUES (?,?,?,?,?,?,?,?,?,?)`,
  //                     //   [
  //                     //     DocEntry,
  //                     //     item.LineNum,
  //                     //     item['PO#'],
  //                     //     item['GRPO#'],
  //                     //     item.DocDate,
  //                     //     item.ItemCode,
  //                     //     item['Item Dsc'],
  //                     //     item.ShipDate,
  //                     //     item.ReceivedQty,
  //                     //     item.BillQty,
  //                     //   ],
  //                     // )
  //                     .then(() => {
  //                       count++;
  //                       if (count == GrpoItems.length) {
  //                         res(true);
  //                       }
  //                     })
  //                     .catch(async (e) => {
  //                       rej(e);
  //                     });
  //                 });
  //               })
  //                 .then(async (res: boolean) => {
  //                   if (res) {
  //                     await new Promise(async (resolve, reject) => {
  //                       let count = 0;
  //                       await files.forEach(async (file, index) => {
  //                         const fileInsert = await executeAndReturnResult(
  //                           `INSERT INTO SRM_GRPO2 (DOCENTRY, ATTACHMENTNAME, LINK) VALUES ('${DocEntry}', '${
  //                             file.originalname
  //                           }', '${
  //                             true
  //                               ? process.env.SHARE_FOLDER_PATH
  //                               : '\\\\192.168.5.191\\Backup\\ZAINWEBSITETESTING\\SRM\\attachments\\'
  //                           }');
  //                   `,
  //                           true,
  //                         )
  //                           // const fileInsert = await createStatementAndExecute(
  //                           //   ` INSERT INTO SRM_GRPO2 (DOCENTRY, ATTACHMENTNAME, LINK) VALUES (?,?,?)`,
  //                           //   [
  //                           //     DocEntry,
  //                           //     file.originalname,
  //                           //     '\\\\192.168.5.191\\Backup\\ZAINWEBSITETESTING\\SRM\\attachments\\',
  //                           //   ],
  //                           // )
  //                           .then(() => {
  //                             count++;
  //                             if (count == files.length) {
  //                               resolve(true);
  //                             }
  //                           })
  //                           .catch(async (e) => {
  //                             await global.connection.rollback();
  //                             reject(e);
  //                           });
  //                       });
  //                     })
  //                       .then(async () => {
  //                         await global.connection.commit();
  //                         return { message: 'GRPO created successfully' };
  //                       })
  //                       .catch(async (e) => {
  //                         await global.connection.rollback();
  //                         // return { message: e.message };
  //                         throw new Error(e.message);
  //                       });
  //                   } else {
  //                     await global.connection.rollback();
  //                     return { message: 'Error inserting items' };
  //                   }
  //                 })
  //                 .catch(async (e) => {
  //                   await global.connection.rollback();
  //                   throw new Error(e.message);
  //                 });
  //             });
  //           return result;
  //         }
  //       })
  //       .catch((e) => {
  //         throw new Error(e.message || 'Files not uploaded');
  //       });
  //   } catch (e) {
  //     throw new HttpException(e.message, 500);
  //   }
  // }
  async updateGrpoAndGenerateInvoice(user, files, body) {
    try {
      const saveGrpoAsDraft = await this.updateGrpo(user, files, body);
      const header = JSON.parse(body.header);
      if (saveGrpoAsDraft) {
        await global.connection.beginTransaction();
        const updateStatus = await executeAndReturnResult(
          `
          UPDATE "SRM_OGRPO" SET "STATUS" = 'completed' WHERE "DOCENTRY" = TRIM('${header.DRAFTNO}');
        `,
          true,
        );
        if (updateStatus.count !== 0) {
          const actualDetails = await executeAndReturnResult(`
          SELECT * FROM "SRM_OGRPO" WHERE "DOCENTRY" = TRIM('${header.DRAFTNO}');
        `);
          if (actualDetails.count !== 0) {
            const itemData = await executeAndReturnResult(`
            SELECT *,T1."DocEntry" AS "GRPOBASE" FROM "SRM_GRPO1" T0
            LEFT JOIN "OPDN" T1 ON T0."GRPONO" = T1."DocNum"
            WHERE "DOCENTRY" = TRIM('${header.DRAFTNO}');
            `);
            if (itemData.count !== 0) {
              const attachmentsDetails = await executeAndReturnResult(`
              SELECT * FROM "SRM_GRPO2" WHERE "DOCENTRY" = TRIM('${header.DRAFTNO}');
              `);
              if (attachmentsDetails.count !== 0) {
                const sapPayload = {
                  CardCode: actualDetails[0].VENDORCODE,
                  DocObjectCode: 'oPurchaseInvoices',
                  BPL_IDAssignedToInvoice: actualDetails[0].BPLID,
                  NumAtCard: actualDetails[0].BILLNO,
                  DocumentLines: itemData.map((item, index) => {
                    return {
                      LineNum: index,
                      ItemCode: item.ITEMCODE,
                      Quantity: item.BILLQTY,
                      BaseType: 20,
                      BaseEntry: item.GRPOBASE,
                      BaseLine: item.LINENUM,
                    };
                  }),
                };
                console.log(sapPayload, ' SAP PAYLOAD');
                const sapResponse = await this.generateMyInvoice(
                  sapPayload,
                  attachmentsDetails.map((file) => ({
                    originalname: file.ATTACHMENTNAME,
                  })) as any,
                );
                if (sapResponse) {
                  const { DocEntry: SuccessDocEntry } = sapResponse;
                  // Update SRM_GRPO DRAFTID
                  await global.connection.beginTransaction();
                  await executeAndReturnResult(
                    `UPDATE SRM_OGRPO SET DRAFTID= TRIM('${SuccessDocEntry}') WHERE DOCENTRY= TRIM('${header.DRAFTNO}');`,
                    true,
                  ).then(async () => {
                    await global.connection.commit();
                  });

                  return { message: 'GRPO And Invoice Created', data: null };
                } else {
                  throw new HttpException('Error Creating Invoice', 500);
                }
              } else {
                throw new HttpException('No Attachments Found', 404);
              }
            } else {
              throw new HttpException('No Items Found', 404);
            }
          } else {
            throw new HttpException('No GRPO Found', 404);
          }
        }
      } else {
        throw new HttpException('Error Updating GRPO', 500);
      }
    } catch (e: any) {
      throw new HttpException(e.message, 500);
    }
  }
  async deleteGrpo(id: string) {
    try {
      // console.log('INSIDE DELETE', id);
      await global.connection.beginTransaction();

      const deleteItems = await executeAndReturnResult(
        `
        DELETE FROM "SRM_GRPO1" WHERE "DOCENTRY" = TRIM('${id}');
        `,
        true,
      );
      if (deleteItems.count != 0) {
        const deleteAttachments = await executeAndReturnResult(
          `
          DELETE FROM "SRM_GRPO2" WHERE "DOCENTRY" = TRIM('${id}');
          `,
          true,
        );
        if (deleteAttachments.count != 0) {
          const result = await executeAndReturnResult(
            `
            DELETE FROM "SRM_OGRPO" WHERE "DOCENTRY" = TRIM('${id}');
            `,
            true,
          );
          if (result.count !== 0) {
            await global.connection.commit();
            return { data: null, message: 'GRPO Deleted' };
          } else {
            throw new HttpException('Error Deleting GRPO', 500);
          }
        } else {
          throw new HttpException('Error Deleting Attachments', 500);
        }
      } else {
        throw new HttpException('Error Deleting Items', 500);
      }
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }
}
