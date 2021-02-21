import { types } from '@eduvault/shared';
import { Database } from '@textile/threaddb';

export * from './model';
export { types };

export interface initOptions {
  appID: string;
  buttonID?: string;
  redirectURL?: string;
  log?: boolean;
  onPageLoadStart?: (db: Database) => any;
  onPageLoadReady?: () => any;
  onLocalStart?: () => any;
  onLocalReady?: (db: Database) => any;
  onRemoteStart?: () => any;
  onRemoteReady?: (db: Database) => any;
}
