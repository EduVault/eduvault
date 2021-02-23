import { types } from '@eduvault/shared';
import { Database } from '@textile/threaddb';
import { Credentials } from '../lib/credentials';

export * from './model';
export { types };

export interface initOptions {
  appID: string;
  buttonID?: string;
  redirectURL?: string;
  log?: boolean;
  onLoadCredentialsStart?: () => any;
  onLoadCredentialsReady?: (credentials: Credentials) => any;
  onLoadCredentialsError?: (error: string) => any;
  onLocalStart?: () => any;
  onLocalReady?: (db: Database) => any;
  onRemoteStart?: () => any;
  onRemoteReady?: (db: Database) => any;
}
