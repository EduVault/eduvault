<template>
  <div>
    <div class="landing-page">
      <b-img class="landing-img" src="/img/icons/flashy-cards-cover-square.png" />
      <img
        id="eduvault-login-button"
        src="@/assets/eduvault-button.png"
        class="oauth-login-button eduvault-button"
        width="256px"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { eduvault, EduVault } from '../../../sdk/js/build/module/index.js';
// import EduVault from 'eduvault-js';
import { reactive, watch, onMounted } from '@vue/composition-api';
import { BImg } from 'bootstrap-vue';
import router from '../router';
import store from '../store';
import axios from 'axios';
import { v4 as uuid } from 'uuid';
export default {
  name: 'Login',
  components: { BImg },

  setup() {
    onMounted(() => {
      eduvault.checkKeyStorage();
    });
    console.log(eduvault.thing);
    const state = reactive({
      //
    });

    async function login() {
      const HOST = 'http://localhost:8081';
      const code = uuid();
      const redirectURL = `${HOST}/example/home`;
      const loginURL = `${HOST}/app/login/?code=${code}&redirect_url=${redirectURL}&`;
      window.location.href = loginURL;
    }

    return {
      state,
      login,
    };
  },
};
</script>

<style scoped lang="scss">
@import '../styles/_variables.scss';
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
