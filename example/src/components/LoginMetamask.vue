<template>
  <div class="login-component__body mb-1 ">
    <img
      class="oauth-login-button"
      src="@/assets/metamask-button.png"
      alt="google login"
      width="256px"
      @click.prevent="openLink"
    />
  </div>
</template>

<script>
import { ethSign } from '../store/ethSign.js';
import store from '../store';
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
            const pw = signed.slice(10, 30);
            store.dispatch.authMod.passwordAuth({
              username: window.web3.eth.accounts[0],
              password: pw,
              signup: true,
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
