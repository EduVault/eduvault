import mongoose, { Schema, Document } from 'mongoose';
import { DotwalletProfile } from '../types';

import * as bcrypt from 'bcryptjs';

/** @param accountID will be an email for local scheme, for google and facebook will be email if available or id if not */
interface Dotwallet extends DotwalletProfile {
  token: string;
}
export interface IPerson extends Document {
  accountID: string;
  password?: string;
  pwEncryptedKeyPair?: string;
  socialMediaKeyPair?: string;
  pubKey?: string;
  threadIDStr?: string;
  DbInfo?: string;
  facebook?: SocialMediaAccount;
  google?: SocialMediaAccount;
  dotwallet?: Dotwallet;
}
interface SocialMediaAccount {
  id?: string;
  token?: string;
  email?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
}

/* Mongoose will complain about duplicate keys if we set any of these as unique, 
because we don't use them in all situations. So we should manually check if these are unique. 
*/
const PersonSchema = new Schema(
  {
    accountID: { type: String, unique: true, required: false },
    password: { type: String, unique: false, required: false },
    pwEncryptedKeyPair: { type: String, unique: false, required: false },
    socialMediaKeyPair: { type: String, unique: false, required: false },
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
  },
  {
    collection: 'person',
    timestamps: true,
  },
);

export const hashPassword = (password: IPerson['password']) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(10));

export const validPassword = function (
  providedPassword: string,
  storedPassword: IPerson['password'],
) {
  return bcrypt.compareSync(providedPassword, storedPassword);
};
export default mongoose.model<IPerson>('person', PersonSchema);
