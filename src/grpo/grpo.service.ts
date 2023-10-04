import { HttpException, Injectable } from '@nestjs/common';
import { UserDashboard } from 'src/dashboard/dashboard.controller';
import { validateSQL } from 'src/utils/checkSQL';

@Injectable()
export class GrpoService {
  async getMyPendingGrpos(me: any) {
    const doesCodeContainSQL = validateSQL(me.CODE);
    if (!doesCodeContainSQL) {
      const result = await global.connection.query(`
      SELECT P."DocNum", TO_DATE(P1."DocDate") AS "DocDate","Quantity" AS "DmQty", "Quantity" AS "AcQty", TO_DATE(P1."ShipDate") AS "ShipDate", P1."ItemCode",P1."Dscription" AS "Item Dsc" FROM "PDN1" P1
      INNER JOIN "OPDN" P on P1."DocEntry" = P."DocEntry" AND P."CardCode" = '${me.CODE}'
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
  async createMyGrpo() {
    return 'new grpo';
  }
  async markGrpoAsReady() {
    return 'marked as ready';
  }
  async markGrpoAsCompleted() {
    return 'marked as completed';
  }
}
