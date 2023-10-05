import { HttpException, Injectable } from '@nestjs/common';
import { writeFile } from 'fs/promises';
import { Result } from 'odbc';
import { UserDashboard } from 'src/dashboard/dashboard.controller';
import { validateSQL } from 'src/utils/checkSQL';
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
};
@Injectable()
export class GrpoService {
  async getMyPendingGrpos(me: any) {
    const doesCodeContainSQL = validateSQL(me.CODE);
    if (!doesCodeContainSQL) {
      const result = await global.connection.query(`
      SELECT 
        P1."BaseRef" AS "PO#", 
        TO_DATE(PR."DocDate") AS "DocDate",
        "Quantity" AS "ReceivedQty", 
        "Quantity" AS "BillQty",
        TO_DATE(P1."ShipDate") AS "ShipDate",
        P1."ItemCode",P1."Dscription" AS "Item Dsc", 
        P."U_BLNo" AS "Bill#", 
        P."U_BLDate" AS "BillDate" 
      FROM "PDN1" P1
      INNER JOIN "OPDN" P on P1."DocEntry" = P."DocEntry" AND P."CardCode" = '${me.CODE}'
      INNER JOIN "OPOR" PR ON TO_VARCHAR(PR."DocNum") = TO_VARCHAR(P1."BaseRef")
`);
      if (result.count !== 0) {
        return result;
      } else {
        throw new HttpException('No GRPOs found', 404);
      }
    } else {
      throw new HttpException('Invalid Code', 400);
    }
  }
  async getMyCompletedGrpos() {
    return 'completed';
  }
  async getMyReadyGrpos(user: UserDashboard) {
    const result = await global.connection.query(`
    SELECT * FROM "SRM_OGRPO" WHERE "VENDORCODE" ='${user.CODE}' AND "STATUS" = 'ready'; 
    `);
    if (result.count !== 0) {
      return { data: result, message: 'Fetched' };
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
      const CurrentDocEntry: Result<{ DOCENTRY: string }> = await global
        .connection.query(`
          SELECT IFNULL(MAX("DOCENTRY"),0) AS "DOCENTRY" FROM "SRM_OGRPO";
        `);
      if (CurrentDocEntry.count !== 0) {
        const DocEntry = JSON.parse(CurrentDocEntry[0].DOCENTRY) + 1;
        await global.connection.beginTransaction();
        const result = await global.connection
          .query(
            `
            INSERT INTO SRM_OGRPO (DOCENTRY, BILLNO, BILLDATE, VENDORCODE, STATUS) VALUES ('${DocEntry}', ${BILLNO}, ${BILLDATE}, '${user.CODE}', '${body.STATUS}');
            `,
          )
          .then(async () => {
            await new Promise(async (res, rej) => {
              let count = 0;
              await GrpoItems.forEach(async (item, index) => {
                const itemInsert = await global.connection
                  .query(
                    `
                    INSERT INTO SRM_GRPO1 (DOCENTRY, LINEID, PONO, PODATE, ITEMCODE, ITEMDSC, SHIPDATE, RECEIVEDQTY, BILLQTY) VALUES ('${DocEntry}', '${
                      index + 1
                    }', '${item['PO#']}', '${item.DocDate}', '${
                      item.ItemCode
                    }', '${item['Item Dsc']}', '${item.ShipDate}', '${
                      item.ReceivedQty
                    }', '${item.BillQty}');
              `,
                  )
                  .then(() => {
                    count++;
                    if (count == GrpoItems.length) {
                      res(true);
                    }
                  })
                  .catch((e) => {
                    rej(e);
                  });
              });
            }).then(async (res: boolean) => {
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
            });
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
}
