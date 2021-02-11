import CryptoJS from 'crypto-js';
export { utils } from '@eduvault/shared';
import {
  URL_API,
  //  EDUVAULT_APP_URL
} from '../config';

export const isServerConnected = async () => {
  try {
    const ping = await fetch(URL_API + '/ping');
    return ping.status >= 200 && ping.status < 300; // either true or false
  } catch (err) {
    return false; // definitely offline
  }
};

export function encrypt(content: string, encryptKey: string) {
  console.log('encrypting', { content, encryptKey });
  const encrypted = CryptoJS.AES.encrypt(content, encryptKey).toString();
  console.log({ encrypted });
  return encrypted;
}

export function decrypt(content: string, decryptKey: string) {
  console.log('decrypting', { content, decryptKey });
  try {
    const decrypted = CryptoJS.AES.decrypt(content, decryptKey).toString(
      CryptoJS.enc.Utf8
    );
    console.log({ decrypted });
    return decrypted;
  } catch (error) {
    console.log('decryption error', error);
    return false;
  }
}
export function hash(content: string) {
  return CryptoJS.SHA256(content).toString();
}
