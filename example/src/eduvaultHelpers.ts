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
  async function findDecks() {
    const decksArray: Deck[] = [];
    if (!db) return { error: 'db not found' };
    const instances = db.collection('deck')?.find({});
    console.log({ instances });
    if (instances)
      try {
        await instances.each(async (instance) => {
          console.log({ instance });
          if (instance._id) decksArray.push(instance as any);
        });
      } catch (error) {
        return decksArray;
      }

    return decksArray;
  }
  try {
    if (!db) return { error: 'db not found' };
    let decksArray = await findDecks();
    if ('error' in decksArray) return { error: decksArray.error };
    console.log({ decksArray, length: decksArray.length, defaultDeck });
    if (decksArray.length === 0) {
      const deckCollect = db.collection('deck');
      console.log({ deckCollect });
      if (deckCollect) {
        // const insertion = await deckCollect.create(defaultDeck);
        // console.log({ insertion });
        const savedDeck = await deckCollect.save(defaultDeck);
        console.log({ savedDeck });
      }

      decksArray = await findDecks();
    }
    return decksArray;
  } catch (error) {
    console.log('load decks error', { error });
    return { error };
  }
}
