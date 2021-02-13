import CryptoJS from 'crypto-js';
import * as bcrypt from 'bcryptjs';

export function encrypt(content: string, encryptKey: string) {
  // console.log('encrypting', { content, encryptKey });
  const encrypted = CryptoJS.AES.encrypt(content, encryptKey).toString();
  // console.log({ encrypted });
  return encrypted;
}

export function decrypt(content: string, decryptKey: string) {
  // console.log('decrypting', { content, decryptKey });
  try {
    const decrypted = CryptoJS.AES.decrypt(content, decryptKey).toString(CryptoJS.enc.Utf8);
    // console.log({ decrypted });
    return decrypted;
  } catch (error) {
    console.log('decryption error', error);
    return false;
  }
}

export function hash(content: string) {
  return CryptoJS.SHA256(content).toString();
}

export const hashPassword = (password: string) => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

export const validPassword = function (providedPassword: string, storedPassword: string) {
  // console.log('password compare', providedPassword, storedPassword);
  try {
    return bcrypt.compareSync(providedPassword, storedPassword);
  } catch (error) {
    return false;
  }
};
