export type CreateGrpoPayload = {
  BILLDATE: string;
  BILLNO: string;
  attachments: Array<File>;
  ITEMS: Array<{
    'Bill#': string;
    BillDate: string;
    DocDate: string;
    'Item Dsc': string;
    ItemCode: string;
    'PO#': string;
    ReceivedQty: string;
    ShipDate: string;
  }>;
};
