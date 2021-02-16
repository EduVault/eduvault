import mongoose, { Schema, Document } from 'mongoose';

/** @param accountID will be an email for local scheme, for google and facebook will be email if available or id if not */
interface Dotwallet extends DotwalletProfile {
  token: string;
}
export interface IPerson extends Document {
  accountID: string;
  password?: string;
  pwEncryptedPrivateKey?: string;
  socialMediaPrivateKey?: string;
  pubKey?: string;
  threadIDStr?: string;
  DbInfo?: string;
  facebook?: SocialMediaAccount;
  google?: SocialMediaAccount;
  dotwallet?: Dotwallet;
  dev?: Dev;
}
interface SocialMediaAccount {
  id?: string;
  token?: string;
  email?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
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
export interface Dev {
  isVerified: boolean;
  apps?: string[];
}
/* Mongoose will complain about duplicate keys if we set any of these as unique, 
because we don't use them in all situations. So we should manually check if these are unique. 
*/
const PersonSchema = new Schema(
  {
    accountID: { type: String, unique: true, required: false },
    password: { type: String, unique: false, required: false },
    pwEncryptedPrivateKey: { type: String, unique: false, required: false },
    socialMediaPrivateKey: { type: String, unique: false, required: false },
    pubKey: { type: String, unique: false, required: false },
    threadIDStr: { type: String, unique: false, required: false },
    DbInfo: { type: String, unique: false, required: false },
    google: {
      id: { type: String, unique: false, required: false },
      token: { type: String, unique: false, required: false },
      email: { type: String, unique: false, required: false },
      givenName: { type: String, unique: false, required: false },
      familyName: { type: String, unique: false, required: false },
      picture: { type: String, unique: false, required: false },
    },
    facebook: {
      id: { type: String, unique: false, required: false },
      token: { type: String, unique: false, required: false },
      email: { type: String, unique: false, required: false },
      givenName: { type: String, unique: false, required: false },
      familyName: { type: String, unique: false, required: false },
      picture: { type: String, unique: false, required: false },
    },
    dotwallet: {
      token: { type: String, unique: false, required: false },
      pay_status: { type: Number, unique: false, required: false },
      pre_amount: { type: Number, unique: false, required: false },
      total_amount: { type: Number, unique: false, required: false },
      person_address: { type: String, unique: false, required: false },
      person_avatar: { type: String, unique: false, required: false },
      person_name: { type: String, unique: false, required: false },
      person_open_id: { type: String, unique: false, required: false },
    },
    dev: {
      isVerified: { type: Boolean, unique: false, required: false },
      apps: [{ type: String, unique: false, required: false }],
    },
  },
  {
    collection: 'person',
    timestamps: true,
  },
);

export default mongoose.model<IPerson>('person', PersonSchema);
