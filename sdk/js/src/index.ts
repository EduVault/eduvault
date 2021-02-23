import { Buckets, PrivateKey } from '@textile/hub';
import { Database, JSONSchema, ThreadID } from '@textile/threaddb';
import {
  Collection,
  CollectionConfig,
} from '@textile/threaddb/dist/cjs/local/collection';

import { appRegister, devVerify, personRegister } from './lib/APICalls';
import { Credentials, loadCredentials } from './lib/credentials';
import {
  startLocalDB,
  StartLocalDBOptions,
  startRemoteDB,
  StartRemoteDBOptions,
  sync,
  syncChanges,
} from './lib/db';
import { setupLoginButton } from './lib/loginButton';
import { deckSchemaConfig } from './types';
import { initOptions } from './types';
import { checkConnectivityClearBacklog, isServerOnline } from './utils';

/** Starts EduVault.
 * 1. If passed a buttonID, will call setupLoginButton() on the provided element ID
 * 2. Checks localStorage for person database credentials. If there is an error (credentials not found) you should redirect person to login page
 *  2a. Checks queries to see if returning from a login. If so, starts DB
 *  2b. If credentials were found, starts DB
 * */
const init = async (self: EduVault, options: initOptions) => {
  self.appID = options.appID;
  self.buttonID = options.buttonID;
  self.redirectURL = options.redirectURL;
  self.log = options.log;
  self.onLoadCredentialsStart = options.onLoadCredentialsStart;
  self.onLoadCredentialsReady = options.onLoadCredentialsReady;
  self.onLoadCredentialsError = options.onLoadCredentialsError;
  self.onLocalReady = options.onLocalReady;
  self.onLocalStart = options.onLocalStart;
  self.onRemoteStart = options.onRemoteStart;
  self.onRemoteReady = options.onRemoteReady;
  if (options.log) console.log({ options });
  if (self.buttonID) {
    self.setupLoginButton({
      buttonID: self.buttonID,
      redirectURL: self.redirectURL,
      appID: self.appID,
      log: self.log,
    });
  }
  const loadResult = await self.loadCredentials({
    onStart: () => {
      self.loadingStatus = 'Getting credentials';
      if (self.onLoadCredentialsStart) self.onLoadCredentialsStart();
    },
    onReady: (credentials) => {
      self.loadingStatus = 'Got database credentials';
      if (self.onLoadCredentialsReady) self.onLoadCredentialsReady(credentials);
    },
    onError: (error) => {
      if (self.onLoadCredentialsError) self.onLoadCredentialsError(error);
    },
    appID: self.appID,
    redirectURL: self.redirectURL,
    log: self.log,
  });
  if (self.log) console.log({ loadResult });
  if (loadResult.error) {
    return { error: loadResult.error };
  }
  if (loadResult.privateKey && loadResult.threadID && loadResult.jwt) {
    self.privateKey = loadResult.privateKey;
    self.threadID = loadResult.threadID;
    self.jwt = loadResult.jwt;

    const db = await self.startLocalDB({
      onStart: () => {
        self.loadingStatus = 'Starting local database';
        if (self.onLocalStart) self.onLocalStart();
      },
      onReady: (db) => {
        self.loadingStatus = 'Local database ready';
        if (self.onLocalReady) self.onLocalReady(db);
      },
      collectionConfig: deckSchemaConfig,
    });
    if ('error' in db) return { error: db.error };
    else {
      self.db = db;
      self.isLocalReady = true;
      const remoteStart = await startRemoteDB({
        onStart: () => {
          self.loadingStatus = 'Starting remote database';
          if (self.onRemoteStart) self.onRemoteStart();
        },
        onReady: (db) => {
          self.loadingStatus = 'Remote database ready';
          if (self.onRemoteReady) self.onRemoteReady(db);
        },
        db: self.db,
        threadID: self.threadID,
        jwt: self.jwt,
        privateKey: self.privateKey,
      });
      console.log({ remoteStart });
      if ('error' in remoteStart) return { error: remoteStart.error };
      else {
        self.db = remoteStart.db;
        self.remoteToken = remoteStart.token;
        console.log({ remoteToken: self.remoteToken });
        return self.db;
      }
    }
  } else return { error: loadResult };
};

class EduVault {
  log? = false;
  isBrowserOnline = () => navigator.onLine;
  isServerOnline = isServerOnline;
  isOnline = () => this.isServerOnline() && this.isServerOnline();

  privateKeyValid = () => {
    return this.privateKey?.canSign();
  };

  personRegister = personRegister;
  devVerify = devVerify;
  appRegister = appRegister;
  appID?: string;

  setupLoginButton = setupLoginButton;
  buttonID?: string;
  redirectURL?: string;

  db?: Database;
  loadingStatus = 'not started';
  isLocalReady = false;
  isRemoteReady = false;
  loadCredentials = loadCredentials;
  onLoadCredentialsStart?: () => any;
  onLoadCredentialsReady?: (credentials: Credentials) => any;
  onLoadCredentialsError?: (error: string) => any;
  privateKey?: PrivateKey;
  threadID?: ThreadID | null;
  jwt?: string;
  remoteToken?: string;

  startLocalDB = async (options: StartLocalDBOptions) => {
    const db = await startLocalDB(options);
    if ('error' in db) return { error: db.error };
    else {
      this.db = db;
      return db;
    }
  };
  onLocalStart?: () => any;
  onLocalReady?: (db: Database) => any;

  startRemoteDB = async (options: StartRemoteDBOptions) => {
    const remoteStart = await startRemoteDB(options);
    if ('error' in remoteStart) return { error: remoteStart.error };
    else {
      this.remoteToken = remoteStart.token;
      this.db = remoteStart.db;
      return this.db;
    }
  };
  onRemoteStart?: () => any;
  onRemoteReady?: (db: Database) => any;

  backlog: string | undefined;
  syncChanges = syncChanges(this);
  checkConnectivityClearBacklog = checkConnectivityClearBacklog(this);
  sync = sync(this);

  constructor(options?: initOptions) {
    if (options) {
      init(this, options);
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
  Collection,
  isServerOnline,
  appRegister,
  devVerify,
  loadCredentials,
  setupLoginButton,
  startLocalDB,
  startRemoteDB,
  syncChanges,
  personRegister,
};
