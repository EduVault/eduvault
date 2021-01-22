<template>
  <div>
    <div class="landing-page">
      <b-img class="landing-img" src="/img/icons/flashy-cards-cover-square.png" />
      <a :href="loginLink">
        <img
          id="eduvault-login-button"
          src="@/assets/eduvault-button.png"
          class="oauth-login-button eduvault-button"
          width="256px"
      /></a>
    </div>
  </div>
</template>

<script lang="ts">
import { eduvault } from '../../../sdk/js/build/module/index.js';
// import EduVault from 'eduvault-js';
import { reactive, onMounted } from '@vue/composition-api';
import { BImg } from 'bootstrap-vue';
// import router from '../router';
// import store from '../store';
// import axios from 'axios';
import { v4 as uuid } from 'uuid';
export default {
  name: 'Login',
  components: { BImg },

  setup() {
    onMounted(() => {
      eduvault.checkKeyStorage();
      // const db = eduvault.connectDB()
    });
    console.log(eduvault.thing);
    const state = reactive({
      //
    });

    const EDUVAULT_LOGIN = 'http://localhost:8081';
    const THIS_SITE_URL = 'http://localhost:8082';
    const code = uuid();
    const redirectURL = `${THIS_SITE_URL}/home`;
    const loginLink = `${EDUVAULT_LOGIN}/?code=${code}&redirect_url=${redirectURL}&`;

    return {
      state,
      loginLink,
    };
  },
};
</script>

<style scoped>
.eduvault-button {
  margin-bottom: auto;
}
.learn-more {
  text-decoration: underline;
}
.security-option {
  margin-top: 1.5rem;
}
.landing-page {
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
