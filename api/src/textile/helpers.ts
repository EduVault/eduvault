import { createAPISig, Client, UserAuth as PersonAuth, PrivateKey } from '@textile/hub';
import { config, TEXTILE_USER_API_SECRET } from '../config';

const newClientDB = async () => {
  const db = await Client.withKeyInfo({
    key: config.TEXTILE_USER_API_KEY,
    secret: TEXTILE_USER_API_SECRET,
  });
  return db;
};

/** @param seconds (300) time until the sig expires */
const getAPISig = async (seconds: number = 300) => {
  try {
    // await console.log('getting API sig');
    const expiration = await new Date(Date.now() + 1000 * seconds);
    // console.log('API sig expiration', expiration);
    const signature = await createAPISig(config.TEXTILE_USER_API_KEY, expiration);
    return signature;
  } catch (err) {
    console.log(err.message);
    throw err;
  }
};

const localChallengHandler = (id: PrivateKey) => {
  const challengeFunc = async (challenge: Uint8Array): Promise<Uint8Array> => {
    return await id.sign(challenge);
  };
  return challengeFunc;
};

const generatePrivateKey = async (): Promise<PrivateKey> => {
  return await PrivateKey.fromRandom();
};

const generatePersonAuth = async (
  pubkey: string,
  challengeHandler: (challenge: Uint8Array) => Uint8Array | Promise<Uint8Array>,
): Promise<PersonAuth> => {
  const db = await newClientDB();
  const token = await db.getTokenChallenge(pubkey, challengeHandler);
  const signature = await getAPISig();
  return {
    ...signature,
    token: token,
    key: config.TEXTILE_USER_API_KEY,
  } as PersonAuth;
};

const localPersonAuth = async (id: PrivateKey) => {
  return await generatePersonAuth(id.public.toString(), localChallengHandler(id));
};

export {
  newClientDB,
  getAPISig,
  generatePrivateKey,
  localChallengHandler,
  generatePersonAuth,
  localPersonAuth,
};
