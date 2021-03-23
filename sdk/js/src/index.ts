import { Buckets, PrivateKey } from '@textile/hub';
import { Database, JSONSchema, ThreadID } from '@textile/threaddb';
import {
  Collection,
  CollectionConfig,
} from '@textile/threaddb/dist/cjs/local/collection';

import {
  appLogin,
  appRegister,
  clearCollections,
  devVerify,
  getJWT,
  personRegister,
} from './lib/APICalls';
import { Credentials, loadCredentials } from './lib/credentials';
import {
  debouncedSync,
  startLocalDB,
  startLocalWrapped,
  startRemoteDB,
  startRemoteWrapped,
  sync,
  syncChanges,
  loginWithChallenge,
} from './lib/db';
import { init } from './lib/init';
import { setupLoginButton } from './lib/loginButton';
import { initOptions } from './types';
import { checkConnectivityClearBacklog, isServerOnline } from './utils';

class EduVault {
  log? = false;
  isBrowserOnline = () => navigator.onLine;
  isServerOnline = isServerOnline(this);
  isOnline = () => this.isServerOnline() && this.isServerOnline();

  privateKeyValid = () => {
    return this.privateKey?.canSign();
  };

  personRegister = personRegister(this);
  devVerify = devVerify(this);
  clearCollections = clearCollections(this);
  appRegister = appRegister(this);
  appLogin = appLogin(this);
  getJWT = getJWT(this);

  appID?: string;

  setupLoginButton = setupLoginButton(this);
  buttonID?: string;
  redirectURL?: string;
  HOST = 'localhost';
  URL_API = 'https://api.localhost';
  URL_APP = 'https://app.localhost';
  WS_API = 'wss://api.localhost';
  db?: Database;
  loadingStatus = 'not started';
  isLocalReady = false;
  isRemoteReady = false;
  loadCredentials = loadCredentials(this);
  onLoadCredentialsStart?: () => any;
  onLoadCredentialsReady?: (credentials: Credentials) => any;
  onLoadCredentialsError?: (error: string) => any;
  privateKey?: PrivateKey;
  threadID?: ThreadID | null;
  jwt?: string;
  remoteToken?: string;

  loginWithChallenge = loginWithChallenge(this);

  startLocalDB = startLocalWrapped(this);
  onLocalStart?: () => any;
  onLocalReady?: (db: Database) => any;

  startRemoteRaw = startRemoteDB(this);
  startRemoteDB = startRemoteWrapped(this);

  onRemoteStart?: () => any;
  onRemoteReady?: (db: Database) => any;

  backlog: string | undefined;
  syncChanges = syncChanges(this);
  checkConnectivityClearBacklog = checkConnectivityClearBacklog(this);
  sync = sync(this);
  debounceTime = 0;
  setDebounceTime = (time: number) => (this.debounceTime = time);
  getDebounceTime = () => this.debounceTime;
  debouncedSync = debouncedSync(this);

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
  clearCollections,
  loadCredentials,
  setupLoginButton,
  startLocalDB,
  startRemoteDB,
  syncChanges,
  personRegister,
};
