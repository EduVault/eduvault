import { ThreadID, PrivateKey } from '@textile/hub';
import { encrypt, hash } from './encryption';
import * as types from '../types';
export const pwAuthReq = async (options: {
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
    password: options.password ? hash(options.password) : null,
    pwEncryptedPrivateKey: encrypt(privateKey.toString(), options.password),
    threadIDStr,
    pubKey,
    redirectURL: options.redirectURL,
    appID: options.appID,
  };
  if (!personAuthReq.password) throw new Error('could not find.generate password');
  return personAuthReq;
};
