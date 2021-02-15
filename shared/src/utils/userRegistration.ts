import { ThreadID, PrivateKey } from '@textile/hub';
import { encrypt, hash } from './encryption';
import * as types from '../types';

/** formats a request for password authentication. Creates new keys for sign ups */
export const formatPasswordSignIn = async (options: {
  accountID?: string;
  password?: string;
  redirectURL?: string;
  appID?: string;
}) => {
  const privateKey = await PrivateKey.fromRandom();
  const pubKey = await privateKey.public.toString();
  const newThreadID = await ThreadID.fromRandom();
  const threadIDStr = newThreadID.toString();
  const personAuthReq: types.PasswordLoginReq = {
    accountID: options.accountID,
    password: hash(options.password),
    pwEncryptedPrivateKey: encrypt(privateKey.toString(), options.password),
    threadIDStr,
    pubKey,
    redirectURL: options.redirectURL,
    appID: options.appID,
  };

  return personAuthReq;
};
