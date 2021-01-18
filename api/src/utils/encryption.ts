import CryptoJS from 'crypto-js';
export function encrypt(content: string, encryptKey: string) {
  console.log('encrypting', { content, encryptKey });
  const encrypted = CryptoJS.AES.encrypt(content, encryptKey).toString();
  console.log({ encrypted });
  return encrypted;
}

export function decrypt(content: string, decryptKey: string) {
  console.log('decrypting', { content, decryptKey });
  try {
    const decrypted = CryptoJS.AES.decrypt(content, decryptKey).toString(CryptoJS.enc.Utf8);
    console.log({ decrypted });
    return decrypted;
  } catch (error) {
    console.log('decryption error', error);
    return false;
  }
}
