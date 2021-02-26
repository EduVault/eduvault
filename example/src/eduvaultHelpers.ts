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

export async function loadDecks(eduvault: EduVault) {
  async function findDecks(eduvault: EduVault) {
    try {
      const instances = eduvault.db?.collection<Deck>('deck')?.find({});
      const instanceArray = await instances?.sortBy('_id');
      if (instanceArray) return instanceArray;
      else return [];
    } catch (error) {
      return { error };
    }
  }
  async function insertDefaultDeck(eduvault: EduVault) {
    try {
      const deckCollect = eduvault.db?.collection<Deck>('deck');
      // console.log({ deckCollect });
      if (deckCollect) {
        const savedDeck = await deckCollect.insert(defaultDeck);
        // console.log({ savedDeck });
      } else return { error: 'no decks collection' };
      return await findDecks(eduvault);
    } catch (error) {
      return { error: 'no decks collection' };
    }
  }
  try {
    if (!eduvault.db) return { error: 'db not found' };
    const decksArray = await findDecks(eduvault);
    if ('error' in decksArray) return { error: decksArray.error };
    console.log({ decksArray, length: decksArray.length });
    if (decksArray.length === 0) {
      return await insertDefaultDeck(eduvault);
    } else return decksArray;
  } catch (error) {
    console.log('load decks error', { error });
    return { error };
  }
}
