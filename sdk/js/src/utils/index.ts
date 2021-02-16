export { utils } from '@eduvault/shared';
import { PrivateKey } from '@textile/threaddb';

import {
  URL_API,
  //  EDUVAULT_APP_URL
} from '../config';

export const isServerConnected = async () => {
  try {
    // console.log('URL_API', URL_API);
    const ping = await fetch(URL_API + '/ping');
    // console.log({ ping });
    return ping.status >= 200 && ping.status < 300; // either true or false
  } catch (err) {
    console.log({ err });

    return false; // definitely offline
  }
};

export async function rehydratePrivateKey(keyStr: string) {
  try {
    return await PrivateKey.fromString(keyStr);
  } catch (error) {
    console.log('rehydratePrivateKey error', error);
    return false;
  }
}

/** Rehydrate keys from string and test if they match the provided public key */
export function testPrivateKey(
  privateKey: PrivateKey,
  pubKey: string
): boolean {
  const testMatching = privateKey.public.toString() === pubKey;
  const testWorking = privateKey.canSign();
  console.log('key test result: ', testMatching, testWorking);
  if (!testMatching || !testWorking) return false;
  return true;
}
