import { Database, JSONSchema } from '@textile/threaddb';
import { PrivateKey, UserAuth as PersonAuth } from '@textile/hub';
import { personAuthChallenge } from './textileHelpers';
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

const startDB = async (personID: string) => {
  try {
    const db = new Database(`${DBName}-${personID.slice(-8)}`, {
      name: DBName,
      schema,
    });
    // Open the database for operations
    await db.open(1);
    // Initialize the remote db...
    // this is where we need the server to do this
    // const personAuth = personAuthChallenge('/api/login', jwt);
    // db.remote.setPersonAuth();
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
