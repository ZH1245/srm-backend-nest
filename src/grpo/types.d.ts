export type CreateGrpoPayload = {
  BILLDATE: string;
  BILLNO: string;
  attachments: Array<File>;
  ITEMS: string;
  STATUS: 'ready' | 'completed';
};
