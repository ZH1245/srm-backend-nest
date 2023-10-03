export type User = {
  ID: number;
  EMAIL: string;
  PASSWORD: string;
  NAME: string;
  MOBILE: string;
  ISACTIVE: boolean;
  ISVERIFIED: boolean;
};
export type getNotCreatedUsersResult = {
  EMAIL: string;
  NAME: string;
  CODE: string;
  MOBILE: string;
};
export type VerfityEmailDTO = { email: string; id: string; OTPCODE: string };
export type DisableUserDTO = { EMAIL: string; ID: string };
export type EnableUserDTO = { EMAIL: string; ID: string };
export type DeleteUserDTO = { EMAIL: string; ID: string };
