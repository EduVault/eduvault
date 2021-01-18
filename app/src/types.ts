import { ThreadID, PrivateKey } from '@textile/hub';
// import { DBInfo } from '@textile/threads';

/** @param accountID will be an email for local scheme, for google and facebook will be email if available or id if not */
export interface IPerson {
  accountID: string;
  password?: string;
  pwEncryptedKeyPair?: string;
  /** Encrypted with facebook.id | dotwallet.id | google.id */
  socialMediaKeyPair?: string;
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

export interface AuthState {
  API_URL: string;
  API_WS_URL: string;
  PASSWORD_LOGIN: string;
  loggedIn: boolean;
  syncing: boolean;
  keyPair?: PrivateKey;
  authType?: 'google' | 'facebook' | 'password' | 'metamask' | 'dotwallet';
  jwt?: string;
  pubKey?: string;
  threadID?: ThreadID;
  threadIDStr?: string;
  bucketKey?: string;
  bucketUrl?: string;
  jwtEncryptedKeyPair?: string;
  pwEncryptedKeyPair?: string;
  code?: string;
  redirectURL?: string;
}

export interface RootState {
  authMod: AuthState;
}

export interface ApiRes<T> {
  data: T;
  code: number;
  message: string;
}

export interface PasswordLoginReq {
  accountID: string;
  password: string;
  threadIDStr: string;
  pwEncryptedKeyPair: string;
  pubKey: string;
}

export interface PasswordLoginRes {
  pwEncryptedKeyPair: string;
  jwt: string;
  pubKey: string;
  threadIDStr: string;
}
