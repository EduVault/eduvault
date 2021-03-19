import {
  IPerson,
  //  DotwalletProfile
} from '../models/person';
import { Profile as FBProfile } from 'passport-facebook';
import { Profile as GProfile } from 'passport-google-oauth20';
import { utils } from './';
import { ThreadID, PrivateKey } from '@textile/hub';
import { Database } from '@textile/threaddb';
const { encrypt, decrypt } = utils;
export async function createSocialMediaAccount(
  person: IPerson,
  type: 'facebook' | 'google',
  profile: FBProfile | GProfile,
  token: string,
  db: Database,
  done: (error: any, person?: any, info?: any) => void,
) {
  try {
    // console.log('profile', profile);
    const privateKey = await PrivateKey.fromRandom();
    person.socialMediaPrivateKey = encrypt(privateKey.toString(), profile.id);
    person.pubKey = privateKey.public.toString();
    const newThreadID = ThreadID.fromRandom();
    person.threadIDStr = newThreadID.toString();
    person.dev = { isVerified: false, apps: [] };

    person[type].id = profile.id;
    person[type].givenName = profile.name.givenName;
    person[type].familyName = profile.name.familyName;
    person[type].picture = profile.photos[0].value || null;
    person[type].token = token;
    // console.log('person', person);
    const saved = await db.collection<IPerson>('person').insert(person);
    if (saved && saved.length > 0) return done(null, person);
    else return done('unable to save new person social media account');
  } catch (error) {
    done(JSON.stringify(error));
  }
}

export async function createDotwalletAccount(
  person: IPerson,
  // profile: DotwalletProfile,
  token: string,
  done: (error: any, person?: any, info?: any) => void,
) {
  // console.log('person', person);
  // const id = profile.person_open_id;
  // if (!person.username) person.username = id;
  // const privateKey = await PrivateKey.fromRandom();
  // person.socialMediaPrivateKey = encrypt(privateKey.toString(), id);
  // person.pubKey = privateKey.public.toString();
  // const newThreadID = ThreadID.fromRandom();
  // person.threadIDStr = newThreadID.toString();
  // person.dev = { isVerified: false, apps: [] };
  // person.dotwallet = { ...profile, token: token };
  // console.log('person', person);
  // person.save((err) => {
  //   if (err) {
  //     console.log(err);
  //     return done(err);
  //   }
  //   return done(null, person);
  // });
}
