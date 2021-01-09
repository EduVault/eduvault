import { createAPISig, Client } from '@textile/hub';
import { TEXTILE_USER_API_KEY, TEXTILE_USER_API_SECRET } from '../config';
import { UserAuth } from '@textile/security';
import { PrivateKey, Identity } from '@textile/crypto';
const newClientDB = async () => {
  const db = await Client.withKeyInfo({
    key: TEXTILE_USER_API_KEY,
    secret: TEXTILE_USER_API_SECRET,
  });
  return db;
};

/** @param seconds (300) time until the sig expires */
const getAPISig = async (seconds: number = 300) => {
  try {
    await console.log('getting API sig');
    const expiration = await new Date(Date.now() + 1000 * seconds);
    console.log('expiration', expiration);
    const signature = await createAPISig(TEXTILE_USER_API_KEY, expiration);
    return signature;
  } catch (err) {
    console.log(err.message);
    throw err;
  }
};

const localChallengHandler = (id: Identity) => {
  const challengeFunc = async (challenge: Uint8Array): Promise<Uint8Array> => {
    return await id.sign(challenge);
  };
  return challengeFunc;
};

const generateIdentity = async (): Promise<Identity> => {
  return await PrivateKey.fromRandom();
};

const generateUserAuth = async (
  pubkey: string,
  challengeHandler: (challenge: Uint8Array) => Uint8Array | Promise<Uint8Array>,
): Promise<UserAuth> => {
  const db = await newClientDB();
  const token = await db.getTokenChallenge(pubkey, challengeHandler);
  const signature = await getAPISig();
  return {
    ...signature,
    token: token,
    key: TEXTILE_USER_API_KEY,
  } as UserAuth;
};

const localUserAuth = async (id: Identity) => {
  return await generateUserAuth(id.public.toString(), localChallengHandler(id));
};

export {
  newClientDB,
  getAPISig,
  generateIdentity,
  localChallengHandler,
  generateUserAuth,
  localUserAuth,
};
