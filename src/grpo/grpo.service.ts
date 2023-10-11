import { HttpException, Injectable } from '@nestjs/common';
import { writeFile, readFile } from 'fs/promises';

import { Result } from 'odbc';
import path from 'path';
import { UserDashboard } from 'src/dashboard/dashboard.controller';
import { validateSQL } from 'src/utils/checkSQL';
import { createStatementAndExecute } from 'src/utils/createStatementAndExecute';
import { MyReadyGRPOSByID } from './validators';
export type DataProps = {
  'PO#': number;
  DocDate: string;
  ReceivedQty: number;
  BillQty: number;
  ShipDate: string;
  ItemCode: string;
  'Item Dsc': string;
  'Bill#': string;
  BillDate: string;
  LineNum: number;
  'GRPO#': number;
};
@Injectable()
export class GrpoService {
  async getMyPendingGrpos(me: any) {
    const doesCodeContainSQL = validateSQL(me.CODE);
    if (!doesCodeContainSQL) {
      const result = await global.connection
        .query(
          `
            SELECT
              P1."BaseRef" AS "PO#",
              TO_DATE(PR."DocDate") AS "DocDate",
              "Quantity" AS "ReceivedQty",
              "Quantity" AS "BillQty",
              TO_DATE(P1."ShipDate") AS "ShipDate",
              P1."ItemCode",P1."Dscription" AS "Item Dsc",
              P."U_BLNo" AS "Bill#",
              P1."LineNum" AS "LineNum",
              P."DocNum" AS "GRPO#",
              P."U_BLDate" AS "BillDate"
            FROM "PDN1" P1
            INNER JOIN "OPDN" P on P1."DocEntry" = P."DocEntry" AND P."CardCode" = '${me.CODE}'
            INNER JOIN "OPOR" PR ON TO_VARCHAR(PR."DocNum") = TO_VARCHAR(P1."BaseRef")

      `,
        )
        .catch((e) => {
          throw new HttpException(e.message, 400);
        });
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
  }
  async getMyCompletedGrpos(user: UserDashboard) {
    const result = await global.connection
      .query(
        `
    SELECT "DOCENTRY","BILLNO",TO_VARCHAR(TO_DATE("BILLDATE"),'DD-MM-YYYY') AS "BILLDATE","VENDORCODE","STATUS",TO_VARCHAR(TO_DATE("CREATEDAT"),'DD-MM-YYYY') AS "CREATEDAT"  FROM "SRM_OGRPO" WHERE "VENDORCODE" ='${user.CODE}' AND "STATUS" = 'completed';
    `,
      )
      .catch((e) => {
        throw new HttpException(e.message, 400);
      });
    // const result = await createStatementAndExecute(
    //   'SELECT "DOCENTRY","BILLNO",TO_VARCHAR(TO_DATE("BILLDATE"),\'DD-MM-YYYY\') AS "BILLDATE","VENDORCODE","STATUS",TO_VARCHAR(TO_DATE("CREATEDAT"),\'DD-MM-YYYY\') AS "CREATEDAT"  FROM "SRM_OGRPO" WHERE "VENDORCODE" = ? AND "STATUS" = ?',
    //   [user.CODE, 'completed'],
    // );
    if (result.count !== 0) {
      return { data: result, message: 'Fetched' };
    } else {
      return { data: [], message: 'No GRPOs found' };
    }
  }
  async getMyReadyGrpos(user: UserDashboard) {
    const result = await global.connection
      .query(
        `
    SELECT "DOCENTRY","BILLNO",TO_VARCHAR(TO_DATE("BILLDATE"),'DD-MM-YYYY') AS "BILLDATE","VENDORCODE","STATUS",TO_VARCHAR(TO_DATE("CREATEDAT"),'DD-MM-YYYY') AS "CREATEDAT"  FROM "SRM_OGRPO" WHERE "VENDORCODE" ='${user.CODE}' AND "STATUS" = 'ready';
    `,
      )
      .catch((e) => {
        throw new HttpException(e.message, 400);
      });
    // const result = await createStatementAndExecute(
    //   'SELECT "DOCENTRY","BILLNO",TO_VARCHAR(TO_DATE("BILLDATE"),\'DD-MM-YYYY\') AS "BILLDATE","VENDORCODE","STATUS",TO_VARCHAR(TO_DATE("CREATEDAT"),\'DD-MM-YYYY\') AS "CREATEDAT"  FROM "SRM_OGRPO" WHERE "VENDORCODE" = ? AND "STATUS" = ?',
    //   [user.CODE, 'ready'],
    // );
    if (result.count !== 0) {
      return { data: result, message: 'Fetched' };
    } else {
      return { data: [], message: 'No GRPOs found' };
    }
  }
  async getMyReadyGrposByDocEntry(user: UserDashboard, id: string) {
    const result = { header: null, items: null, attachments: null };

    const header = await global.connection
      .query(
        `
    SELECT "DOCENTRY","BILLNO",TO_VARCHAR(TO_DATE("BILLDATE"),'DD-MM-YYYY') AS "BILLDATE","VENDORCODE","STATUS",TO_VARCHAR(TO_DATE("CREATEDAT"),'DD-MM-YYYY') AS "CREATEDAT"  FROM "SRM_OGRPO" T0 WHERE T0."VENDORCODE" ='${user.CODE}' AND "STATUS" = 'ready' AND T0."DOCENTRY" = '${id}';
    `,
      )
      .catch((e) => {
        throw new HttpException(e.message, 400);
      });
    // const header = await createStatementAndExecute(
    //   ` SELECT "DOCENTRY","BILLNO",TO_VARCHAR(TO_DATE("BILLDATE"),'DD-MM-YYYY') AS "BILLDATE","VENDORCODE","STATUS",TO_VARCHAR(TO_DATE("CREATEDAT"),'DD-MM-YYYY') AS "CREATEDAT"  FROM "SRM_OGRPO" T0 WHERE T0."VENDORCODE" = ? AND "STATUS" = ? AND T0."DOCENTRY" = ?`,
    //   [user.CODE, 'ready', id],
    // );
    if (header.count !== 0) {
      result.header = header;
      const items = await global.connection
        .query(
          `
      SELECT "DOCENTRY","LINEID","PONO","GRPONO","PODATE","ITEMCODE","ITEMDSC","SHIPDATE","RECEIVEDQTY","BILLQTY" FROM "SRM_GRPO1" T0 WHERE T0."DOCENTRY" = '${id}';
      `,
        )
        .catch((e) => {
          throw new HttpException(e.message, 400);
        });
      // const items = await createStatementAndExecute(
      //   `SELECT "DOCENTRY","LINEID","PONO","GRPONO","PODATE","ITEMCODE","ITEMDSC","SHIPDATE","RECEIVEDQTY","BILLQTY" FROM "SRM_GRPO1" T0 WHERE T0."DOCENTRY" = ?`,
      //   [id],
      // );
      if (items.count !== 0) {
        result.items = items;
      }
      const attachments = await global.connection
        .query(
          `
      SELECT "ID","DOCENTRY","ATTACHMENTNAME","LINK" FROM "SRM_GRPO2" T0 WHERE T0."DOCENTRY" = '${id}';
      `,
        )
        .catch((e) => {
          throw new HttpException(e.message, 400);
        });
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
  }

  async getMyCompletedGrposByDocEntry(user: UserDashboard, id: string) {
    const result = { header: null, items: null, attachments: null };

    const header = await global.connection
      .query(
        `
    SELECT "DOCENTRY","BILLNO",TO_VARCHAR(TO_DATE("BILLDATE"),'DD-MM-YYYY') AS "BILLDATE","VENDORCODE","STATUS",TO_VARCHAR(TO_DATE("CREATEDAT"),'DD-MM-YYYY') AS "CREATEDAT"  FROM "SRM_OGRPO" T0 WHERE T0."VENDORCODE" ='${user.CODE}' AND "STATUS" = 'completed' AND T0."DOCENTRY" = '${id}';
    `,
      )
      .catch((e) => {
        throw new HttpException(e.message, 400);
      });
    // const header = await createStatementAndExecute(
    //   `SELECT "DOCENTRY","BILLNO",TO_VARCHAR(TO_DATE("BILLDATE"),'DD-MM-YYYY') AS "BILLDATE","VENDORCODE","STATUS",TO_VARCHAR(TO_DATE("CREATEDAT"),'DD-MM-YYYY') AS "CREATEDAT"  FROM "SRM_OGRPO" T0 WHERE T0."VENDORCODE" = ? AND "STATUS" = ? AND T0."DOCENTRY" = ?`,
    //   [user.CODE, 'completed', id],
    // );
    if (header.count !== 0) {
      result.header = header;
      const items = await global.connection
        .query(
          `
      SELECT "DOCENTRY","LINEID","PONO","GRPONO","PODATE","ITEMCODE","ITEMDSC","SHIPDATE","RECEIVEDQTY","BILLQTY" FROM "SRM_GRPO1" T0 WHERE T0."DOCENTRY" = '${id}';
      `,
        )
        .catch((e) => {
          throw new HttpException(e.message, 400);
        });
      // const items = await createStatementAndExecute(
      //   `SELECT "DOCENTRY","LINEID","PONO","GRPONO","PODATE","ITEMCODE","ITEMDSC","SHIPDATE","RECEIVEDQTY","BILLQTY" FROM "SRM_GRPO1" T0 WHERE T0."DOCENTRY" = ?`,
      //   [id],
      // );
      if (items.count !== 0) {
        result.items = items;
      }
      const attachments = await global.connection
        .query(
          `
      SELECT "ID","DOCENTRY","ATTACHMENTNAME","LINK" FROM "SRM_GRPO2" T0 WHERE T0."DOCENTRY" = '${id}';
      `,
        )
        .catch((e) => {
          throw new HttpException(e.message, 400);
        });
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
  async createMyGrpo(
    user: UserDashboard,
    files: Express.Multer.File[],
    body: {
      BILLNO: string;
      BILLDATE: string;
      ITEMS: string;
      STATUS: 'ready' | 'completed';
    },
  ) {
    const { BILLNO, BILLDATE, ITEMS } = body;
    const GrpoItems: Array<DataProps> = JSON.parse(ITEMS);
    const areFilesUploaded = await this.uploadFiles(files);
    if (areFilesUploaded) {
      const CurrentDocEntry: Result<{ DOCENTRY: string }> =
        await global.connection
          .query(
            `
          SELECT IFNULL(MAX("DOCENTRY"),0) AS "DOCENTRY" FROM "SRM_OGRPO";
        `,
          )
          .catch((e) => {
            throw new HttpException(e.message, 500);
          });
      // const CurrentDocEntry = await createStatementAndExecute(
      //   ` SELECT IFNULL(MAX("DOCENTRY"),0) AS "DOCENTRY" FROM "SRM_OGRPO"`,
      //   [],
      // );
      if (CurrentDocEntry.count !== 0) {
        const DocEntry = JSON.parse(CurrentDocEntry[0].DOCENTRY) + 1;
        await global.connection.beginTransaction();
        const result = await global.connection
          .query(
            `
            INSERT INTO SRM_OGRPO (DOCENTRY, BILLNO, BILLDATE, VENDORCODE, STATUS) VALUES ('${DocEntry}', '${BILLNO}', '${BILLDATE}', '${user.CODE}', '${body.STATUS}');
            `,
          )
          // const result = await createStatementAndExecute(
          //   `INSERT INTO SRM_OGRPO (DOCENTRY, BILLNO, BILLDATE, VENDORCODE, STATUS) VALUES (?,?,?,?,?)`,
          //   [DocEntry, BILLNO, BILLDATE, user.CODE, body.STATUS],
          // )
          .then(async () => {
            await new Promise(async (res, rej) => {
              let count = 0;
              await GrpoItems.forEach(async (item) => {
                await global.connection
                  .query(
                    `
                    INSERT INTO SRM_GRPO1 (DOCENTRY, LINEID, PONO, GRPONO ,PODATE, ITEMCODE, ITEMDSC, SHIPDATE, RECEIVEDQTY, BILLQTY) VALUES ('${DocEntry}', '${item.LineNum}', '${item['PO#']}', '${item['GRPO#']}', '${item.DocDate}', '${item.ItemCode}', '${item['Item Dsc']}', '${item.ShipDate}', '${item.ReceivedQty}', '${item.BillQty}');
              `,
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
                      const fileInsert = await global.connection
                        .query(
                          `
                      INSERT INTO SRM_GRPO2 (DOCENTRY, ATTACHMENTNAME, LINK) VALUES ('${DocEntry}', '${
                            file.originalname
                          }', '${'\\\\192.168.5.191\\Backup\\ZAINWEBSITETESTING\\SRM\\attachments\\'}');
                      `,
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
                      return { message: e.message };
                    });
                } else {
                  await global.connection.rollback();
                  return { message: 'Error inserting items' };
                }
              })
              .catch(async (e) => {
                await global.connection.rollback();
                throw new HttpException(e.message, 500);
              });
          })
          .catch(async (e) => {
            await global.connection.rollback();
            throw new HttpException(e.message, 500);
          });
        return result;
      }
    } else {
      throw new HttpException('Files not uploaded', 500);
    }
  }
  async uploadFiles(files: Express.Multer.File[]): Promise<any> {
    let uploadFiles = 0;
    return await new Promise(async (resolve, reject) => {
      files.forEach(async (file) => {
        await writeFile(
          `${'\\\\192.168.5.191\\Backup\\ZAINWEBSITETESTING\\SRM\\attachments\\'}${
            file.originalname
          }`,
          file.buffer,
        )
          .then(() => {
            uploadFiles++;
            if (files.length === uploadFiles) {
              resolve('files uploaded');
            }
          })
          .catch((err) => {
            reject(err.message);
          });
      });
    })
      .then((res) => res)
      .catch((err) => {
        throw new HttpException(err.message, 500);
      });
  }
  async markGrpoAsReady() {
    return 'marked as ready';
  }
  async markGrpoAsCompleted() {
    return 'marked as completed';
  }
  async downloadAttachment(
    id: MyReadyGRPOSByID['id'],
  ): Promise<{ data: any; ATTACHMENTNAME: string }> {
    const result: Result<{ LINK: string; ATTACHMENTNAME: string }> =
      await global.connection
        .query(
          `
    SELECT "LINK","ATTACHMENTNAME" FROM "SRM_GRPO2" WHERE "ID" = '${id}';
    `,
        )
        .catch((e) => {
          throw new HttpException(e.message, 500);
        });
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
          return { data: data, ATTACHMENTNAME: result[0]['ATTACHMENTNAME'] };
        })
        .catch((e) => {
          throw new HttpException(e.message, 500);
        });
    } else {
      throw new HttpException('No Attachments found', 404);
    }
  }
  async getAllInvoicesFromGrpos(user: UserDashboard) {
    if (user.ROLE !== 'admin') {
      throw new HttpException('Unauthorized', 401);
    } else {
      const result = await global.connection
        .query(
          `
      SELECT "DOCENTRY","BILLNO",TO_VARCHAR(TO_DATE("BILLDATE"),'DD-MM-YYYY') AS "BILLDATE","VENDORCODE","STATUS",TO_VARCHAR(TO_DATE("CREATEDAT"),'DD-MM-YYYY') AS "CREATEDAT"  FROM "SRM_OGRPO";
      `,
        )
        .catch((e) => {
          throw new HttpException(e.message, 500);
        });
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
  }
  async getInvoiceDetails(user: UserDashboard, id: string) {
    const result = { header: null, items: null, attachments: null };
    const header = await global.connection
      .query(
        `
    SELECT "DOCENTRY","BILLNO",TO_VARCHAR(TO_DATE("BILLDATE"),'DD-MM-YYYY') AS "BILLDATE","VENDORCODE","STATUS",TO_VARCHAR(TO_DATE("CREATEDAT"),'DD-MM-YYYY') AS "CREATEDAT"  FROM "SRM_OGRPO" T0 WHERE T0."DOCENTRY" = '${id}';
    `,
      )
      .catch((e) => {
        throw new HttpException(e.message, 500);
      });
    // const header = await createStatementAndExecute(
    //   ` SELECT "DOCENTRY","BILLNO",TO_VARCHAR(TO_DATE("BILLDATE"),'DD-MM-YYYY') AS "BILLDATE","VENDORCODE","STATUS",TO_VARCHAR(TO_DATE("CREATEDAT"),'DD-MM-YYYY') AS "CREATEDAT"  FROM "SRM_OGRPO" T0 WHERE T0."DOCENTRY" = ?`,
    //   [id],
    // );
    if (header.count !== 0) {
      result.header = header;
      const items = await global.connection
        .query(
          `
      SELECT "DOCENTRY","LINEID","PONO","GRPONO","PODATE","ITEMCODE","ITEMDSC","SHIPDATE","RECEIVEDQTY","BILLQTY" FROM "SRM_GRPO1" T0 WHERE T0."DOCENTRY" = '${id}';
      `,
        )
        .catch((e) => {
          throw new HttpException(e.message, 500);
        });
      // const items = await createStatementAndExecute(
      //   ` SELECT "DOCENTRY","LINEID","PONO","GRPONO","PODATE","ITEMCODE","ITEMDSC","SHIPDATE","RECEIVEDQTY","BILLQTY" FROM "SRM_GRPO1" T0 WHERE T0."DOCENTRY" = ?`,
      //   [id],
      // );
      if (items.count !== 0) {
        result.items = items;
      }
      const attachments = await global.connection
        .query(
          `
      SELECT "ID","DOCENTRY","ATTACHMENTNAME","LINK" FROM "SRM_GRPO2" T0 WHERE T0."DOCENTRY" = '${id}';
      `,
        )
        .catch((e) => {
          throw new HttpException(e.message, 500);
        });
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
}
