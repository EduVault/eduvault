import { types } from '@eduvault/shared';
import { Database, ThreadID, PrivateKey } from '@textile/threaddb';

export * from './model';
export { types };

export interface initOptions {
  appID: string;
  buttonID?: string;
  autoRedirect?: boolean;
  redirectURL?: string;
  log?: boolean;
  onReady?: (db: Database) => any;
}

export interface pageLoadOptions {
  autoRedirect?: boolean;
  redirectURL?: string;
  appID?: string;
  log?: boolean;
}

export interface PageLoadChecksResult {
  threadID?: ThreadID | null;
  privateKey?: PrivateKey;
  jwt?: string;

  error?: string | Error;
}
