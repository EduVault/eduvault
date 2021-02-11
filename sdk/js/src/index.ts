import { PrivateKey, ThreadID, Database, JSONSchema } from '@textile/threaddb';
import { Buckets } from '@textile/hub';

import { appRegister, devVerify } from './lib/devManage';
import {
  pageLoadChecks,
  setupButton,
  startLocalDB,
  startRemoteDB,
  syncChanges,
} from './lib/landingPageAuth';

import { dummyCollections } from './types';

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
export interface initOptions {
  appID: string;
  buttonID?: string;
  autoRedirect?: boolean;
  redirectURL?: string;
  log?: boolean;
  onReady?: (db: Database) => any;
}
class EduVault {
  devVerify = devVerify;
  appRegister = appRegister;
  pageLoadChecks = pageLoadChecks;
  setupButton = setupButton;
  startLocalDB = startLocalDB;
  startRemoteDB = startRemoteDB;
  syncChanges = syncChanges;
  onReady?: (db: Database) => any;
  buttonID?: string;
  redirectURL?: string;
  autoRedirect = false;
  privateKey?: PrivateKey;
  threadID?: ThreadID | null;
  appID?: string;
  jwt?: string;
  db?: Database;
  remote?: Database['remote'];
  dbToken?: string;
  log? = false;
  load() {
    window.addEventListener('load', this.init);
  }
  async init() {
    if (this.buttonID)
      this.setupButton(this.buttonID, this.redirectURL, this.appID, this.log);
    const loadResult = await this.pageLoadChecks({
      autoRedirect: this.autoRedirect,
      appID: this.appID,
      redirectURL: this.redirectURL,
      log: this.log,
    });
    if (this.log) console.log({ loadResult: loadResult });
    if (loadResult.error) {
      return;
    }
    if (loadResult.privateKey && loadResult.threadID && loadResult.jwt) {
      this.privateKey = loadResult.privateKey;
      this.threadID = loadResult.threadID;
      this.jwt = loadResult.jwt;
    }
    if (this.threadID && this.jwt && this.privateKey) {
      this.db = await this.startLocalDB(dummyCollections);
      if (this.db) {
        const remoteStart = await startRemoteDB(
          this.db,
          this.threadID,
          this.jwt,
          this.privateKey
        );
        this.remote = remoteStart.remote;
        this.dbToken = remoteStart.token;
        if (this.onReady) this.onReady(this.db);
      }
    }
  }

  constructor(options?: initOptions) {
    this.appID = options?.appID;
    this.buttonID = options?.buttonID;
    this.autoRedirect = options?.autoRedirect || false;
    this.redirectURL = options?.redirectURL;
    this.log = options?.log;
    this.onReady = options?.onReady;
    if (options?.log) console.log({ options });
    if (options) this.init();
  }
}
export default EduVault;
export {
  EduVault,
  Database,
  Buckets,
  JSONSchema,
  appRegister,
  devVerify,
  pageLoadChecks,
  setupButton,
  startLocalDB,
  startRemoteDB,
  syncChanges,
};
