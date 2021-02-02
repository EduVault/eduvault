export interface ApiRes<T> {
  data: T;
  code: number;
  message: string;
}
export interface PasswordLoginReq {
  accountID: string;
  password: string;
  threadIDStr: string;
  pwEncryptedPrivateKey: string;
  pubKey: string;
  redirectURL?: string;
  appID?: string;
}

export interface PasswordLoginRes {
  pwEncryptedPrivateKey: string;
  jwt: string;
  pubKey: string;
  threadIDStr: string;
  appLoginToken?: string;
  decryptToken?: string;
}

export interface AppAuthReq {
  appLoginToken: string;
  appID: string;
}

export interface AppAuthRes {
  jwt: string;
  oldJwt: string;
  decryptToken: string;
}
export interface AppTokenData extends IApp {
  data: { id: string; decryptToken: string };
  iat: number;
  exp: number;
}

export interface AppRegisterReq {
  accountID: string;
  password: string;
  name: string;
  description?: string;
}

export interface AppUpdateReq {
  accountID: string;
  password: string;
  appID: string;
  name?: string;
  description?: string;
  authorizedDomains?: string[];
  persons?: string[];
}
export interface DevVerifyReq {
  appSecret: string;
  devID: string;
}

/** @param accountID will be an email for local scheme, for google and facebook will be email if available or id if not */
export interface IPerson {
  accountID: string;
  password?: string;
  pwEncryptedPrivateKey?: string;
  /** Encrypted with facebook.id | dotwallet.id | google.id */
  socialMediaPrivateKey?: string;
  pubKey: string;
  threadIDStr?: string;
  DbInfo?: string;
  facebook?: SocialMediaAccount;
  google?: SocialMediaAccount;
  dotwallet?: DotwalletProfile;
}
interface DotwalletProfile {
  pay_status: number;
  pre_amount: number;
  total_amount: number;
  person_address: string;
  person_avatar: string;
  person_name: string;
  person_open_id: string;
}
interface SocialMediaAccount {
  id?: string;
  token?: string;
  email?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
}

export interface IApp {
  appID: string;
  devID: string;
  name: string;
  description?: string;
  authorizedDomains?: string[];
  persons?: string[];
}
