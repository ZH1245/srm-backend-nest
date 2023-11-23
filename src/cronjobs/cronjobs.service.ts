import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GrpoService } from 'src/grpo/grpo.service';
import { executeAndReturnResult } from 'src/utils/executeAndReturnResult';

@Injectable()
export class CronjobsService {
  constructor(private readonly grpoService: GrpoService) {}
  @Cron(CronExpression.EVERY_DAY_AT_11PM)
  async createDefectedInvoices() {
    try {
      const getAllDefectedInvoices = await executeAndReturnResult(`
      SELECT X."DOCENTRY",CASE WHEN IFNULL("DEFECTEDCOUNT",0) > 0 THEN 'defected' WHEN X."STATUS"='ready'THEN 'draft' ELSE X."STATUS" END AS "STATUS"  FROM (
        SELECT
          "DOCENTRY",
         "BILLNO",
         TO_VARCHAR(TO_DATE("BILLDATE"),
         'DD-MM-YYYY') AS "BILLDATE",
         V."CardName" AS "VENDOR",
         TO_VARCHAR(TO_DATE("CREATEDAT"),
         'DD-MM-YYYY') AS "CREATEDAT",
         "STATUS",
       IFNULL((SELECT COUNT("ITEMCODE") FROM "SRM_GRPO1" g1 WHERE "DRAFTID" IS NULL AND G."DOCENTRY" =g1."DOCENTRY" AND G."STATUS" ='completed'  GROUP BY "DOCENTRY" ),0)  AS "DEFECTEDCOUNT" 
       FROM "SRM_OGRPO" G 
       INNER JOIN "OCRD" V ON G."VENDORCODE" = V."CardCode"
       --WHERE G."STATUS" = 'completed'
        )X
        WHERE X."DEFECTEDCOUNT" > 0
        ORDER BY X."CREATEDAT"`);
      if (getAllDefectedInvoices.count !== 0) {
        if (getAllDefectedInvoices.count > 0) {
          await getAllDefectedInvoices.forEach(async (invoice) => {
            await this.grpoService.generateInvoiceFromDraftDocNo(
              invoice['DOCENTRY'],
            );
          });
        } else if (getAllDefectedInvoices.count === 0) {
          await this.grpoService.generateInvoiceFromDraftDocNo(
            getAllDefectedInvoices[0]['DOCENTRY'],
          );
        }
      } else {
        console.log(`No Defected Invoices Found At Date: ${new Date()}`);
      }
    } catch (e) {
      console.error(e, ' Error at cronjob for defected invoices');
    }
  }
}
