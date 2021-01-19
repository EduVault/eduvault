<template>
  <div class="login-component__body mb-1">
    <img
      class="oauth-login-button"
      src="@/assets/metamask-button.png"
      alt="google login"
      width="250px"
      @click.prevent="openLink"
    />
  </div>
</template>

<script>
import { ethSign } from '../store/ethSign.js';
import store from '../store';
import router from '../router';
export default {
  methods: {
    async openLink() {
      if (typeof window.ethereum !== 'undefined') {
        if (typeof window.ethereum.isMetaMask !== 'undefined') {
          console.log('MetaMask is installed!');
          try {
            const signed = await ethSign();
            if (!signed) {
              alert('unable to connect');
              return null;
            }
            console.log('signed', signed);
            const password = signed.slice(10, 30);
            store.dispatch.authMod.pwLogin({
              password,
              accountID: window.web3.eth.accounts[0],
              redirectURL: router.currentRoute.query.redirect_url,
              code: router.currentRoute.query.code,
            });
          } catch (err) {
            console.log('err.message ', err.message);
          }
        } else window.location.href = 'https://metamask.io/download.html';
      } else window.location.href = 'https://metamask.io/download.html';

      store.commit.authMod.AUTHTYPE('metamask');
    },
  },
};
</script>

<style></style>
