import { IPerson } from '../models/person';
import { Profile as FBProfile } from 'passport-facebook';
import { Profile as GProfile } from 'passport-google-oauth20';
import { encrypt, decrypt } from './encryption';
import { ThreadID, PrivateKey } from '@textile/hub';
import { DotwalletProfile } from '../types';

export async function createSocialMediaAccount(
  person: IPerson,
  type: 'facebook' | 'google',
  profile: FBProfile | GProfile,
  token: string,
  done: (error: any, person?: any, info?: any) => void,
) {
  console.log('profile', profile);
  const email = profile.emails ? profile.emails[0].value.toLowerCase() || null : null;
  if (!person.accountID) person.accountID = email || profile.id;
  const keyPair = await PrivateKey.fromRandom();
  person.socialMediaKeyPair = encrypt(keyPair.toString(), profile.id);
  person.pubKey = keyPair.public.toString();
  const newThreadID = ThreadID.fromRandom();
  person.threadIDStr = newThreadID.toString();

  person[type].id = profile.id;
  person[type].givenName = profile.name.givenName;
  person[type].familyName = profile.name.familyName;
  person[type].picture = profile.photos[0].value || null;
  person[type].token = token;
  console.log('person', person);
  person.save((err) => {
    if (err) {
      console.log(err);
      return done(err);
    }
    return done(null, person);
  });
}

export async function createDotwalletAccount(
  person: IPerson,
  profile: DotwalletProfile,
  token: string,
  done: (error: any, person?: any, info?: any) => void,
) {
  console.log('person', person);

  const id = profile.person_open_id;
  if (!person.accountID) person.accountID = id;
  const keyPair = await PrivateKey.fromRandom();
  person.socialMediaKeyPair = encrypt(keyPair.toString(), id);
  person.pubKey = keyPair.public.toString();
  const newThreadID = ThreadID.fromRandom();
  person.threadIDStr = newThreadID.toString();
  person.dotwallet = { ...profile, token: token };
  console.log('person', person);
  person.save((err) => {
    if (err) {
      console.log(err);
      return done(err);
    }
    return done(null, person);
  });
}
