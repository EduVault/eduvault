import { Database, JSONSchema } from '@textile/threaddb';
import { PrivateKey } from '@textile/crypto';
import { Identity, UserAuth } from '@textile/hub';
import { userAuthChallenge } from './textileHelpers';
const DBName = 'eduvault';
import { deckSchema } from '../types';
const schema = deckSchema as JSONSchema;

const identity = PrivateKey.fromRandom();
// const authCallback = async (message) => {
//   const sig = identity.sign(message);
//   return sig;
// };
//
/*

*/

//

const startDB = async (userID: string) => {
  try {
    const db = new Database(`${DBName}-${userID.slice(-8)}`, {
      name: DBName,
      schema,
    });
    // Open the database for operations
    await db.open(1);
    // Initialize the remote db...
    // this is where we need the server to do this
    // const userAuth = userAuthChallenge('/api/login', jwt);
    // db.remote.setUserAuth();
    // const remote = await db.remote.setKeyInfo({ key: process.env.REACT_APP_HUB_KEY });
    // // If we throw here, our error catcher will grab it later on down the line
    // await remote.authorize(identity, callback);
    // await remote.initialize(uri);
    // // Low-level features of working against the hub... should be simplified
    // remote.config.metadata.set('x-textile-thread-name', db.dexie.name);
    // remote.config.metadata.set('x-textile-thread', db.id);

    // // We'll structure our app to use query parameters to define the thread id
    // if (uri === undefined && window.history.pushState) {
    //   const newURL = new URL(window.location.href);
    //   newURL.search = `?uri=${db.remote.id}`;
    //   window.history.pushState({ path: newURL.href }, '', newURL.href);
    // }
  } catch (e) {
    console.log(e);
  }
};
