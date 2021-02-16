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
  let error: string | null = '';
  if (!options.password) error += 'no password provided ';
  if (!options.accountID) error += 'no accountID provided ';
  let pwEncryptedPrivateKey;
  if (options.accountID && options.password)
    pwEncryptedPrivateKey = encrypt(privateKey.toString(), options.password);
  if (!pwEncryptedPrivateKey) error += 'could not encrypt private key with password';

  const personAuthReq: types.PasswordLoginReq = {
    accountID: options.accountID,
    password: options.password ? hash(options.password) : undefined,
    pwEncryptedPrivateKey: pwEncryptedPrivateKey || undefined,
    threadIDStr,
    pubKey,
    redirectURL: options.redirectURL,
    appID: options.appID,
    error: error === '' ? undefined : error,
  };

  return personAuthReq;
};
