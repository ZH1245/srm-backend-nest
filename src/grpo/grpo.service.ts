// -------------------------------------------------------------------------
import { HttpException, Injectable } from '@nestjs/common';
import { writeFile, readFile } from 'fs/promises';
import { Result } from 'odbc';
import { UserDashboard } from 'src/dashboard/dashboard.controller';
import { validateSQL } from 'src/utils/checkSQL';
import { MyReadyGRPOSByID } from './validators';
import { executeAndReturnResult } from 'src/utils/executeAndReturnResult';
// -------------------------------------------------------------------------
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
// -------------------------------------------------------------------------
@Injectable()
export class GrpoService {
  /**
   * Retrieves pending GRPOs for a given user.
   * @param me - The user object.
   * @returns A Promise that resolves to an array of pending GRPOs.
   * @throws HttpException if the user's code is invalid or no GRPOs are found.
   */
  async getMyPendingGrpos(me: any) {
    try {
      const doesCodeContainSQL = validateSQL(me.CODE);
      if (!doesCodeContainSQL) {
        // const result = await executeAndReturnResult(
        //   `SELECT
        //       P1."BaseRef" AS "PO#",
        //       TO_VARCHAR(TO_DATE(PR."DocDate"),'DD-MM-YYYY') AS "DocDate",
        //       "Quantity" AS "ReceivedQty",
        //       "Quantity" AS "BillQty",
        //       P1."U_QtyFail" AS "RejectedQty",
        //       TO_VARCHAR(TO_DATE(P1."ShipDate"),'DD-MM-YYYY') AS "ShipDate",
        //       P1."ItemCode",P1."Dscription" AS "Item Dsc",
        //       GP."U_DANo" AS "Bill#",
        //       P1."LineNum" AS "LineNum",
        //       P."DocNum" AS "GRPO#",
        //       TO_VARCHAR(TO_DATE(P."DocDate"),'DD-MM-YYYY') AS "BillDate"
        //     FROM "PDN1" P1
        //     INNER JOIN "OPDN" P on P1."DocEntry" = P."DocEntry" AND P."CardCode" = '${me.CODE}'
        //     INNER JOIN "OPOR" PR ON TO_VARCHAR(PR."DocNum") = TO_VARCHAR(P1."BaseRef")
        //     LEFT JOIN "@OIGP" GP ON TO_VARCHAR(P."U_GPN") = TO_VARCHAR(GP."DocNum")
        //     WHERE P."DocDate" >= '2023-01-01' AND P."U_GPN" IS NOT NULL
        //     AND P1."ItemCode" NOT IN
        //       (
        //         SELECT "ItemCode"  FROM "PCH1" AP1
        //         INNER JOIN "OPCH" AP ON AP."DocEntry" = AP1."DocEntry"
        //         WHERE TO_VARCHAR(AP1."BaseRef") = TO_VARCHAR(P."DocNum") AND AP."DocStatus" <> 'C'
        //       );`,
        // );
        const result = await executeAndReturnResult(
          `SELECT
          P1."BaseRef" AS "PO#",
          TO_VARCHAR(TO_DATE(PR."DocDate"),'DD-MM-YYYY') AS "DocDate",
          "Quantity" AS "ReceivedQty",
          "Quantity" AS "BillQty",
          P1."U_QtyFail" AS "RejectedQty",
          TO_VARCHAR(TO_DATE(P1."ShipDate"),'DD-MM-YYYY') AS "ShipDate",
          P1."ItemCode",P1."Dscription" AS "Item Dsc",
          GP."U_DANo" AS "Bill#",
          P1."LineNum" AS "LineNum",
          P."DocNum" AS "GRPO#",
          TO_VARCHAR(TO_DATE(P."DocDate"),'DD-MM-YYYY') AS "BillDate"
        FROM "PDN1" P1
        INNER JOIN "OPDN" P on P1."DocEntry" = P."DocEntry" AND P."CardCode" = '${me.CODE}'
        INNER JOIN "OPOR" PR ON TO_VARCHAR(PR."DocNum") = TO_VARCHAR(P1."BaseRef")
        LEFT JOIN "@OIGP" GP ON TO_VARCHAR(P."U_GPN") = TO_VARCHAR(GP."DocNum")
        WHERE P."DocDate" >= '2023-01-01' AND P."U_GPN" IS NOT NULL
        AND P1."ItemCode" NOT IN 
          (
            SELECT "ItemCode"  FROM "PCH1" AP1
            INNER JOIN "OPCH" AP ON AP."DocEntry" = AP1."DocEntry"
            WHERE TO_VARCHAR(AP1."BaseRef") = TO_VARCHAR(P."DocNum") AND AP."DocStatus" <> 'C'
          )
        AND P1."ItemCode" NOT IN (
          SELECT "ItemCode" FROM "SRM_OGRPO" WHERE "VENDORCODE" = '${me.CODE}' AND "BILLNO" = GP."U_DANo"
        );`,
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
        `SELECT "DOCENTRY","BILLNO",TO_VARCHAR(TO_DATE("BILLDATE"),'DD-MM-YYYY') AS "BILLDATE","VENDORCODE",TO_VARCHAR(TO_DATE("CREATEDAT"),'DD-MM-YYYY') AS "CREATEDAT"  FROM "SRM_OGRPO" WHERE "VENDORCODE" ='${user.CODE}' AND "STATUS" = 'completed';`,
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
        `SELECT "DOCENTRY","BILLNO",TO_VARCHAR(TO_DATE("BILLDATE"),'DD-MM-YYYY') AS "BILLDATE","VENDORCODE","STATUS",TO_VARCHAR(TO_DATE("CREATEDAT"),'DD-MM-YYYY') AS "CREATEDAT"  FROM "SRM_OGRPO" WHERE "VENDORCODE" ='${user.CODE}' AND "STATUS" = 'ready';`,
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
        `SELECT "DOCENTRY","BILLNO",TO_VARCHAR(TO_DATE("BILLDATE"),'DD-MM-YYYY') AS "BILLDATE","VENDORCODE","STATUS",TO_VARCHAR(TO_DATE("CREATEDAT"),'DD-MM-YYYY') AS "CREATEDAT"  FROM "SRM_OGRPO" T0 WHERE T0."VENDORCODE" ='${user.CODE}' AND "STATUS" = 'ready' AND T0."DOCENTRY" = '${id}';`,
      );
      // const header = await createStatementAndExecute(
      //   ` SELECT "DOCENTRY","BILLNO",TO_VARCHAR(TO_DATE("BILLDATE"),'DD-MM-YYYY') AS "BILLDATE","VENDORCODE","STATUS",TO_VARCHAR(TO_DATE("CREATEDAT"),'DD-MM-YYYY') AS "CREATEDAT"  FROM "SRM_OGRPO" T0 WHERE T0."VENDORCODE" = ? AND "STATUS" = ? AND T0."DOCENTRY" = ?`,
      //   [user.CODE, 'ready', id],
      // );
      if (header.count !== 0) {
        result.header = header;
        const items = await executeAndReturnResult(
          `SELECT "DOCENTRY","LINEID","PONO","GRPONO","PODATE","ITEMCODE","ITEMDSC","SHIPDATE","RECEIVEDQTY","BILLQTY" FROM "SRM_GRPO1" T0 WHERE T0."DOCENTRY" = '${id}';`,
        );
        // const items = await createStatementAndExecute(
        //   `SELECT "DOCENTRY","LINEID","PONO","GRPONO","PODATE","ITEMCODE","ITEMDSC","SHIPDATE","RECEIVEDQTY","BILLQTY" FROM "SRM_GRPO1" T0 WHERE T0."DOCENTRY" = ?`,
        //   [id],
        // );
        if (items.count !== 0) {
          result.items = items;
        }
        const attachments = await executeAndReturnResult(
          `SELECT "ID","DOCENTRY","ATTACHMENTNAME","LINK" FROM "SRM_GRPO2" T0 WHERE T0."DOCENTRY" = '${id}';`,
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
        `SELECT "DOCENTRY","BILLNO",TO_VARCHAR(TO_DATE("BILLDATE"),'DD-MM-YYYY') AS "BILLDATE","VENDORCODE","STATUS",TO_VARCHAR(TO_DATE("CREATEDAT"),'DD-MM-YYYY') AS "CREATEDAT"  FROM "SRM_OGRPO" T0 WHERE T0."VENDORCODE" ='${user.CODE}' AND "STATUS" = 'completed' AND T0."DOCENTRY" = '${id}';`,
      );
      // const header = await createStatementAndExecute(
      //   `SELECT "DOCENTRY","BILLNO",TO_VARCHAR(TO_DATE("BILLDATE"),'DD-MM-YYYY') AS "BILLDATE","VENDORCODE","STATUS",TO_VARCHAR(TO_DATE("CREATEDAT"),'DD-MM-YYYY') AS "CREATEDAT"  FROM "SRM_OGRPO" T0 WHERE T0."VENDORCODE" = ? AND "STATUS" = ? AND T0."DOCENTRY" = ?`,
      //   [user.CODE, 'completed', id],
      // );
      if (header.count !== 0) {
        result.header = header;
        const items = await executeAndReturnResult(
          `SELECT "DOCENTRY","LINEID","PONO","GRPONO","PODATE","ITEMCODE","ITEMDSC","SHIPDATE","RECEIVEDQTY","BILLQTY" FROM "SRM_GRPO1" T0 WHERE T0."DOCENTRY" = '${id}';`,
        );
        // const items = await createStatementAndExecute(
        //   `SELECT "DOCENTRY","LINEID","PONO","GRPONO","PODATE","ITEMCODE","ITEMDSC","SHIPDATE","RECEIVEDQTY","BILLQTY" FROM "SRM_GRPO1" T0 WHERE T0."DOCENTRY" = ?`,
        //   [id],
        // );
        if (items.count !== 0) {
          result.items = items;
        }
        const attachments = await executeAndReturnResult(
          `SELECT "ID","DOCENTRY","ATTACHMENTNAME","LINK" FROM "SRM_GRPO2" T0 WHERE T0."DOCENTRY" = '${id}';`,
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
    try {
      const { BILLNO, BILLDATE, ITEMS } = body;
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
            `INSERT INTO SRM_OGRPO (DOCENTRY, BILLNO, BILLDATE, VENDORCODE, STATUS) VALUES ('${DocEntry}', '${BILLNO}', '${BILLDATE}', '${user.CODE}', '${body.STATUS}');`,
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
                    `INSERT INTO SRM_GRPO1 (DOCENTRY, LINEID, PONO, GRPONO ,PODATE, ITEMCODE, ITEMDSC, SHIPDATE, RECEIVEDQTY, BILLQTY) VALUES ('${DocEntry}', '${item.LineNum}', '${item['PO#']}', '${item['GRPO#']}', '${item.DocDate}', '${item.ItemCode}', '${item['Item Dsc']}', '${item.ShipDate}', '${item.ReceivedQty}', '${item.BillQty}');`,
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
                          `INSERT INTO SRM_GRPO2 (DOCENTRY, ATTACHMENTNAME, LINK) VALUES ('${DocEntry}', '${
                            file.originalname
                          }', '${'\\\\192.168.5.191\\Backup\\ZAINWEBSITETESTING\\SRM\\attachments\\'}');
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
  ): Promise<{ data: any; ATTACHMENTNAME: string }> {
    try {
      const result: Result<{ LINK: string; ATTACHMENTNAME: string }> =
        await executeAndReturnResult(
          `SELECT "LINK","ATTACHMENTNAME" FROM "SRM_GRPO2" WHERE "ID" = '${id}';`,
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
            return { data: data, ATTACHMENTNAME: result[0]['ATTACHMENTNAME'] };
          })
          .catch((e) => {
            throw new HttpException(e.message, 500);
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
          `SELECT "DOCENTRY","BILLNO",TO_VARCHAR(TO_DATE("BILLDATE"),'DD-MM-YYYY') AS "BILLDATE","VENDORCODE","STATUS",TO_VARCHAR(TO_DATE("CREATEDAT"),'DD-MM-YYYY') AS "CREATEDAT"  FROM "SRM_OGRPO";`,
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
      `SELECT "DOCENTRY","BILLNO",TO_VARCHAR(TO_DATE("BILLDATE"),'DD-MM-YYYY') AS "BILLDATE","VENDORCODE","STATUS",TO_VARCHAR(TO_DATE("CREATEDAT"),'DD-MM-YYYY') AS "CREATEDAT"  FROM "SRM_OGRPO" T0 WHERE T0."DOCENTRY" = '${id}';`,
    );
    // const header = await createStatementAndExecute(
    //   ` SELECT "DOCENTRY","BILLNO",TO_VARCHAR(TO_DATE("BILLDATE"),'DD-MM-YYYY') AS "BILLDATE","VENDORCODE","STATUS",TO_VARCHAR(TO_DATE("CREATEDAT"),'DD-MM-YYYY') AS "CREATEDAT"  FROM "SRM_OGRPO" T0 WHERE T0."DOCENTRY" = ?`,
    //   [id],
    // );
    if (header.count !== 0) {
      result.header = header;
      const items = await executeAndReturnResult(
        `SELECT "DOCENTRY","LINEID","PONO","GRPONO","PODATE","ITEMCODE","ITEMDSC","SHIPDATE","RECEIVEDQTY","BILLQTY" FROM "SRM_GRPO1" T0 WHERE T0."DOCENTRY" = '${id}';`,
      );
      // const items = await createStatementAndExecute(
      //   ` SELECT "DOCENTRY","LINEID","PONO","GRPONO","PODATE","ITEMCODE","ITEMDSC","SHIPDATE","RECEIVEDQTY","BILLQTY" FROM "SRM_GRPO1" T0 WHERE T0."DOCENTRY" = ?`,
      //   [id],
      // );
      if (items.count !== 0) {
        result.items = items;
      }
      const attachments = await executeAndReturnResult(
        `SELECT "ID","DOCENTRY","ATTACHMENTNAME","LINK" FROM "SRM_GRPO2" T0 WHERE T0."DOCENTRY" = '${id}';`,
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
}
