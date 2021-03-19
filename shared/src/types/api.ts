export interface ApiRes<T> {
  data: T;
  code: number;
  message: string;
}
export interface PasswordLoginReq {
  username?: string;
  password?: string;
  threadIDStr?: string;
  pwEncryptedPrivateKey?: string;
  pubKey?: string;
  redirectURL?: string;
  appID?: string;
  error?: string;
}

export interface PasswordLoginRes
  extends ApiRes<{
    pwEncryptedPrivateKey: string;
    jwt: string;
    pubKey: string;
    threadIDStr: string;
    appLoginToken?: string;
    decryptToken?: string;
  }> {}

export interface AppAuthReq {
  appLoginToken: string;
  appID: string;
}

export interface AppAuthRes
  extends ApiRes<{
    jwt: string;
    oldJwt: string;
    decryptToken: string;
  }> {}

export interface AppRegisterReq {
  appID?: string;
  username: string;
  password: string;
  name: string;
  description?: string;
}

export interface AppUpdateReq {
  username: string;
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
