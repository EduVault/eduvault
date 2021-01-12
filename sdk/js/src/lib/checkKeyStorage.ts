import { ulid } from 'ulid';

import { EDUVAULT_API_URL, EDUVAULT_APP_URL } from '../config';
const checkOnlineStatus = async () => {
  try {
    const online = await fetch(EDUVAULT_API_URL + 'ping');
    return online.status >= 200 && online.status < 300; // either true or false
  } catch (err) {
    return false; // definitely offline
  }
};

export async function checkKeyStorage() {
  console.log('checking for keys!');

  const checkAllThings = async () => {
    const online = await checkOnlineStatus();
    const pwEncryptedKeypair = localStorage.getItem('pwEncryptedKeypair');
    const button = document.getElementById('eduvault-login-button');
    return { online, pwEncryptedKeypair, button };
  };

  const continueAuthFlow = async (
    online: boolean,
    pwEncryptedKeypair: string | null,
    button: HTMLElement | null
  ) => {
    console.log(
      'online, pwEncryptedKeypair, button',
      online,
      pwEncryptedKeypair,
      button
    );
    if (!button) console.log('no button found');
    else {
      const code = ulid();
      const redirectURL = window.location.href;
      const loginURL = `${EDUVAULT_APP_URL}/login/?code=${code}&redirect_url=${redirectURL}`;
      if (pwEncryptedKeypair) {
        if (online) {
          window.location.href = loginURL;
        } else {
          // create a password input
          alert('use your password to unlock the database while offline');
        }
      } else {
        button.addEventListener('click', () => {
          window.location.href = loginURL;
        });
      }
    }
  };
  window.addEventListener('load', async () => {
    const { online, pwEncryptedKeypair, button } = await checkAllThings();
    continueAuthFlow(online, pwEncryptedKeypair, button);
  });

  // on page load
  // if pwEncryptedKeypair keys in localstorage:
  //   if internet connection:
  //     redirects to eduvault/app/login/?code=<xxx>&redirect_url=<https://www.example.com>
  //     use the cookie there to get jwt, decrypt keypair
  //     send it back encrypted by code
  //    if no internet:
  //      asks user for password, decrypts localstorage saved pwEncryptedKeys
  //  else if no keys in storage:
  //     display <a> link redirects to eduvault/app/login/?code=<xxx>&redirect_url=<https://www.example.com>
}
