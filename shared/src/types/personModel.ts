/** @param username will be an email for local scheme, for google and facebook will be email if available or id if not */
export interface IPerson {
  username: string;
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
