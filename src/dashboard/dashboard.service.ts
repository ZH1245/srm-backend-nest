import { Injectable } from '@nestjs/common';
import { UserDashboard } from './dashboard.controller';
import { GrpoService } from 'src/grpo/grpo.service';
import { Result } from 'odbc';

@Injectable()
export class DashboardService {
  async getVendorDashboard(authUser: UserDashboard) {
    const counts = { pending: 0, completed: 0, ready: 0 };
    const result: Result<{ COUNT: string }> = await global.connection.query(`
      SELECT COUNT(P."DocNum") AS "COUNT"  FROM "PDN1" P1
      INNER JOIN "OPDN" P on P1."DocEntry" = P."DocEntry" AND P."CardCode" = '${authUser.CODE}'
`);
    if (result.count !== 0) {
      counts.pending = JSON.parse(result[0].COUNT);
    } else {
      counts.pending = 0;
    }
    return counts;
  }
  async getAdminDashboard() {
    return 'admin-dashboard';
  }
}
