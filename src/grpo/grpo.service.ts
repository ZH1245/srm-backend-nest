import { HttpException, Injectable } from '@nestjs/common';
import { writeFile } from 'fs/promises';
import { UserDashboard } from 'src/dashboard/dashboard.controller';
import { validateSQL } from 'src/utils/checkSQL';

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
  async getMyReadyGrpos() {
    return 'ready';
  }
  async createMyGrpo(files: Express.Multer.File[], body: any) {
    const areFilesUploaded = await this.uploadFiles(files);
    if (areFilesUploaded) {
      return { message: 'Files Uploaded' };
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
