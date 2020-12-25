import mongoose, { Schema, Document } from 'mongoose';
import { DotwalletProfile } from '../types';

import * as bcrypt from 'bcrypt';

/** @param username will be an email for local scheme, for google and facebook will be email if available or id if not */
interface Dotwallet extends DotwalletProfile {
    token: string;
}
export interface IUser extends Document {
    username: string;
    password?: string;
    encryptedKeyPair?: string;
    socialMediaKeyPair?: string;
    signatureKeyPair?: string;
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
const UserSchema = new Schema(
    {
        username: { type: String, unique: true, required: false },
        password: { type: String, unique: false, required: false },
        encryptedKeyPair: { type: String, unique: false, required: false },
        socialMediaKeyPair: { type: String, unique: false, required: false },
        signatureKeyPair: { type: String, unique: false, required: false },
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
            user_address: { type: String, unique: false, required: false },
            user_avatar: { type: String, unique: false, required: false },
            user_name: { type: String, unique: false, required: false },
            user_open_id: { type: String, unique: false, required: false },
        },
    },
    {
        collection: 'user',
        timestamps: true,
    },
);

export const hashPassword = (password: IUser['password']) =>
    bcrypt.hashSync(password, bcrypt.genSaltSync(10));

export const validPassword = function (
    providedPassword: string,
    storedPassword: IUser['password'],
) {
    return bcrypt.compareSync(providedPassword, storedPassword);
};
export default mongoose.model<IUser>('user', UserSchema);
