<template>
  <div>
    <div class="login-page">
      <b-img class="landing-img" src="/img/icons/flashy-cards-cover-square.png" />
      <a id="eduvault-login-button">
        <img src="@/assets/eduvault-button.png" class="eduvault-button" width="256px"
      /></a>
    </div>
  </div>
</template>

<script lang="ts">
import { setupLoginButton } from '@eduvault/eduvault-js/dist/main';
import { setupApp } from '../eduvaultHelpers';
import { reactive, onMounted } from '@vue/composition-api';
import { BImg } from 'bootstrap-vue';

export default {
  name: 'Login',
  components: { BImg },

  setup() {
    onMounted(async () => {
      const buttonID = 'eduvault-login-button';
      const THIS_SITE_URL = 'http://localhost:8082';
      const redirectURL = `${THIS_SITE_URL}`;

      const appID = localStorage.getItem('APP_ID') ?? (await setupApp());

      /** appID would be hard coded, thus faster in a real app */
      // const appID = store.state.dbMod.appID || (await store.dispatch.dbMod.setupApp());
      // if (!appID) {
      //   console.log('unable to get appID, cannot start EduVault');
      //   return null;
      // }
      const onSuccess = (loginURL: string) => {
        console.log('button set up. redirect url: ' + loginURL);
      };
      if (appID) setupLoginButton({ buttonID, appID, redirectURL, onSuccess });
    });
    const state = reactive({
      //
    });

    return {
      state,
    };
  },
};
</script>

<style scoped>
.eduvault-button {
  margin-bottom: auto;

  box-shadow: 1px 1px 3px 1px #00000063;
  border-radius: 5px;
}
.eduvault-button:hover {
  box-shadow: 1px 1px 3px 1px #000000a8;
  cursor: pointer;
}
.login-page {
  display: flex;
  align-items: center;
  flex-direction: column;
}
.landing-img {
  width: 90%;
  object-fit: scale-down;
  margin: auto;
  max-width: fit-content;
}
#login-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: auto;
  max-width: 370px;
  overflow-y: auto;
}
</style>
