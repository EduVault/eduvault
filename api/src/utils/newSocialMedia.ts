import { IUser } from '../models/user';
import CryptoJS from 'crypto-js';
import { Profile as FBProfile } from 'passport-facebook';
import { Profile as GProfile } from 'passport-google-oauth20';

import { ThreadID, Identity } from '@textile/hub';
import { DotwalletProfile } from '../types';

export async function createSocialMediaAccount(
  user: IUser,
  type: 'facebook' | 'google',
  profile: FBProfile | GProfile,
  token: string,
  done: (error: any, user?: any, info?: any) => void,
) {
  // const email = profile.emails ? profile.emails[0].value.toLowerCase() || null : null;
  // if (!user.username) user.username = email || profile.id;
  // const keyPair: Identity = await PrivateKey.fromRandom();
  // const encryptedKeyPair = CryptoJS.AES.encrypt(keyPair.toString(), profile.id).toString();
  // user.socialMediaKeyPair = encryptedKeyPair;
  // user.pubKey = keyPair.public.toString();
  // const newThreadID = ThreadID.fromRandom();
  // user.threadIDStr = newThreadID.toString();

  // user[type].id = profile.id;
  // user[type].givenName = profile.name.givenName;
  // user[type].familyName = profile.name.familyName;
  // user[type].picture = profile.photos[0].value || null;
  // user[type].token = token;
  // console.log('user', user);
  user.save((err) => {
    if (err) {
      console.log(err);
      return done(err);
    }
    return done(null, user);
  });
}

export async function createDotwalletAccount(
  user: IUser,
  profile: DotwalletProfile,
  token: string,
  done: (error: any, user?: any, info?: any) => void,
) {
  // const id = profile.user_open_id;
  // if (!user.username) user.username = id;
  // const keyPair = await PrivateKey.fromRandom();
  // const encryptedKeyPair = CryptoJS.AES.encrypt(keyPair.toString(), id).toString();
  // user.socialMediaKeyPair = encryptedKeyPair;
  // user.pubKey = keyPair.public.toString();
  // const newThreadID = ThreadID.fromRandom();
  // user.threadIDStr = newThreadID.toString();
  // user.dotwallet = { ...profile, token: token };
  // console.log('user', user);
  user.save((err) => {
    if (err) {
      console.log(err);
      return done(err);
    }
    return done(null, user);
  });
}
