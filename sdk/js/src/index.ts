import { Buckets, PrivateKey } from '@textile/hub';
import { Database, JSONSchema, ThreadID } from '@textile/threaddb';
import { CollectionConfig } from '@textile/threaddb/dist/cjs/local/collection';

import { appRegister, devVerify, personRegister } from './lib/APICalls';
import { loadCredentials } from './lib/credentials';
import {
  startLocalDB,
  StartLocalDBOptions,
  startRemoteDB,
  StartRemoteDBOptions,
  syncChanges,
} from './lib/db';
import { setupLoginButton } from './lib/loginButton';
import { deckSchemaConfig } from './types';
import { initOptions } from './types';
import { isServerConnected } from './utils';
/* new problem... 
the client here will also need continual access to the keys.
The keys can't be stored anywhere reproducable client side
It means on 

solutions:
when app verifies, redirect gets sent to the server, server redirects to example with a cookie
use cookie to get unlock token, just like app is doing



for now: 
just try connecting and using the DB and see how its used. I think we need both the keys and a userAuth object. 
lets see how they are used
*/

class EduVault {
  isServerConnected = isServerConnected;
  devVerify = devVerify;
  appRegister = appRegister;
  personRegister = personRegister;
  loadCredentials = loadCredentials;
  setupLoginButton = setupLoginButton;
  startLocalDB = async (options: StartLocalDBOptions) => {
    const db = await startLocalDB(options);
    if ('error' in db) return { error: db.error };
    else {
      this.db = db;
      return db;
    }
  };
  startRemoteDB = async (options: StartRemoteDBOptions) => {
    const remoteStart = await startRemoteDB(options);
    if ('error' in remoteStart) return { error: remoteStart.error };
    else {
      this.remoteToken = remoteStart.token;
      this.db = remoteStart.db;
      return this.db;
    }
  };
  syncChanges = syncChanges;
  onRemoteReady?: (db: Database) => any;
  onLocalReady?: (db: Database) => any;
  loadingStatus = 'not started';
  buttonID?: string;
  redirectURL?: string;
  autoRedirect = false;
  private privateKey?: PrivateKey;
  threadID?: ThreadID | null;
  appID?: string;
  private jwt?: string;
  db?: Database;
  private remoteToken?: string;
  log? = false;
  localReady = false;
  remoteReady = false;
  privateKeyValid = () => {
    return this.privateKey?.canSign();
  };
  /** Starts EduVault.
   * 1. If passed a buttonID, will call setupLoginButton() on the provided element ID
   * 2. Checks localStorage for person database credentials. If there is an error (credentials not found) you should redirect person to login page
   *  2a. Checks queries to see if returning from a login. If so, starts DB
   *  2b. If credentials were found, starts DB
   * */
  init = async (options: initOptions) => {
    this.appID = options.appID;
    this.buttonID = options.buttonID;
    this.redirectURL = options.redirectURL;
    this.log = options.log;
    this.onLocalReady = options.onLocalReady;
    this.onRemoteReady = options.onRemoteReady;
    if (options.log) console.log({ options });
    if (this.buttonID) {
      this.setupLoginButton({
        buttonID: this.buttonID,
        redirectURL: this.redirectURL,
        appID: this.appID,
        log: this.log,
      });
    }
    const loadResult = await this.loadCredentials({
      onStart: () => (this.loadingStatus = 'Getting credentials'),
      onReady: () => (this.loadingStatus = 'Got database credentials'),
      appID: this.appID,
      redirectURL: this.redirectURL,
      log: this.log,
    });
    if (this.log) console.log({ loadResult });
    if (loadResult.error) {
      return { error: loadResult.error };
    }
    if (loadResult.privateKey && loadResult.threadID && loadResult.jwt) {
      this.privateKey = loadResult.privateKey;
      this.threadID = loadResult.threadID;
      this.jwt = loadResult.jwt;

      const db = await this.startLocalDB({
        onStart: () => (this.loadingStatus = 'Starting local database'),
        onReady: (db) => {
          this.loadingStatus = 'Local database ready';
          if (this.onLocalReady) this.onLocalReady(db);
        },
        collectionConfig: deckSchemaConfig,
      });
      if ('error' in db) return { error: db.error };
      else {
        this.db = db;
        this.localReady = true;
        const remoteStart = await startRemoteDB({
          onStart: () => (this.loadingStatus = 'Starting remote database'),
          onReady: (db) => {
            this.loadingStatus = 'Remote database ready';
            this.db = db;
            if (this.onRemoteReady) this.onRemoteReady(db);
          },
          db: this.db,
          threadID: this.threadID,
          jwt: this.jwt,
          privateKey: this.privateKey,
        });
        console.log({ remoteStart });
        if ('error' in remoteStart) return { error: remoteStart.error };
        else {
          this.remoteToken = remoteStart.token;
          console.log({ remoteToken: this.remoteToken });
          return this.db;
        }
      }
    } else return { error: loadResult };
  };

  constructor(options?: initOptions) {
    if (options) {
      this.init(options);
    }
  }
}
export default EduVault;
export {
  EduVault,
  Database,
  Buckets,
  JSONSchema,
  CollectionConfig,
  isServerConnected,
  appRegister,
  devVerify,
  loadCredentials,
  setupLoginButton,
  startLocalDB,
  startRemoteDB,
  syncChanges,
  personRegister,
};
