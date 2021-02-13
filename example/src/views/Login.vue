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
import EduVault, { appRegister, devVerify, Database } from '@eduvault/eduvault-js/dist/main';
// import EduVault from 'eduvault-js';
import { reactive, onMounted } from '@vue/composition-api';
import { BImg } from 'bootstrap-vue';
import { APP_SECRET } from '../config';
// import { log } from 'util';
// import router from '../router';
// import store from '../store';
// import axios from 'axios'

// import { v4 as uuid } from 'uuid';
let db: Database;

export default {
  name: 'Login',
  components: { BImg },

  setup() {
    const THIS_SITE_URL = 'http://localhost:8082';
    const redirectURL = `${THIS_SITE_URL}/login`;

    onMounted(async () => {
      // if initiated with options, will a
      const connnect = true;

      let appID: string;
      if (connnect) {
        console.log({ APP_SECRET });
        if (!APP_SECRET) return;
        devVerify(APP_SECRET, 'jacobcoro@qq.com');
        const appInfo = await appRegister(
          'jacobcoro@qq.com',
          'Password123',
          'test app',
          'a testing app',
        );
        console.log({ appInfo });
        if (!appInfo) return;
        appID = appInfo.appID;
        const eduvault = new EduVault({
          appID,
          redirectURL,
          buttonID: 'eduvault-login-button',
          log: true,
          onReady: (db) => {
            alert('database ready!');
            state.db = db;
          },
        });
      }
    });
    const state = reactive({
      db,
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
