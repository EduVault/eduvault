export interface ApiRes<T> {
  data: T;
  code: number;
  message: string;
}
export interface PasswordLoginRes {
  pwEncryptedKeyPair: string;
  jwt: string;
  pubKey: string;
  threadIDStr: string;
}

export interface DotwalletProfile {
  pay_status: number;
  pre_amount: number;
  total_amount: number;
  person_address: string;
  person_avatar: string;
  person_name: string;
  person_open_id: string;
}
export interface DotwalletAccessData {
  access_token: string;
  expires_in: number;
  refresh_token: string;
}
