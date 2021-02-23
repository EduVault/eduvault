import { APP_SECRET } from './config';
import { Deck } from './types';
import defaultDeck from './assets/defaultDeck.json';
import EduVault, {
  Database,
  personRegister,
  devVerify,
  appRegister,
  Buckets,
} from '@eduvault/eduvault-js';

/** This will not be needed in a real app, as the developer just needs to register their app one time */
export async function setupApp() {
  const accountID = 'person@email.com';
  const password = 'Password123';
  // console.log({ APP_SECRET });
  if (!APP_SECRET) return null;
  // to do: appregister req/res types
  const devPersonRegister = await personRegister({ accountID, password });
  console.log({ devPersonRegister });
  const dev = await devVerify(APP_SECRET, accountID);
  console.log({ dev });
  const appInfo = await appRegister(accountID, password, 'test app', 'a testing app');
  console.log({ appInfo });
  if (!appInfo) return null;
  if (appInfo.appID) {
    localStorage.setItem('APP_ID', appInfo.appID);
    return appInfo.appID as string;
  } else return null;
}

export async function loadDecks(db: EduVault['db']) {
  if (!db) return { error: 'db not found' };
  let decksArray = await findDecks();
  if ('error' in decksArray) return { error: decksArray.error };
  console.log({ decksArray, length: decksArray.length });
  if (decksArray.length === 0) {
    const deckCollect = db.collection('deck');
    const insertion = await deckCollect?.insert(defaultDeck);
    console.log({ insertion });
    decksArray = await findDecks();
  }
  return decksArray;

  async function findDecks() {
    const decksArray: Deck[] = [];
    if (!db) return { error: 'db not found' };
    const instances = db.collection('deck')?.find({});
    // console.log({ instances });
    if (instances)
      await instances.each(async (instance) => {
        console.log({ instance });
        decksArray.push(instance as any);
      });
    return decksArray;
  }
}
