import { ThreadID, PrivateKey } from '@textile/hub';
export { types } from '@eduvault/shared';
// import { DBInfo } from '@textile/threads';

export interface AuthState {
  loggedIn: boolean;
  syncing: boolean;
  privateKey?: PrivateKey;
  authType?: 'google' | 'facebook' | 'password' | 'metamask' | 'dotwallet';
  jwt?: string;
  pubKey?: string;
  threadID?: ThreadID;
  threadIDStr?: string;
  bucketKey?: string;
  bucketUrl?: string;
  jwtEncryptedPrivateKey?: string;
  pwEncryptedPrivateKey?: string;
  code?: string;
  redirectURL?: string;
}

export interface RootState {
  authMod: AuthState;
}
