import { Buckets, PrivateKey } from '@textile/hub';
import { Database, JSONSchema, ThreadID } from '@textile/threaddb';
import {
  Collection,
  CollectionConfig,
} from '@textile/threaddb/dist/cjs/local/collection';

import {
  appRegister,
  devVerify,
  personRegister,
  clearCollections,
} from './lib/APICalls';
import { Credentials, loadCredentials } from './lib/credentials';
import {
  startLocalDB,
  startLocalWrapped,
  startRemoteDB,
  startRemoteWrapped,
  sync,
  debouncedSync,
  syncChanges,
} from './lib/db';
import { init } from './lib/init';
import { setupLoginButton } from './lib/loginButton';
import { initOptions } from './types';
import { checkConnectivityClearBacklog, isServerOnline } from './utils';

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
  clearCollections = clearCollections;
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

  startLocalDB = startLocalWrapped(this);
  onLocalStart?: () => any;
  onLocalReady?: (db: Database) => any;

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
