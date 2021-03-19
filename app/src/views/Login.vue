<template>
  <div>
    <div id="login-body">
      <img class="mt-2" src="@/assets/eduvault-logo-word-bw.png" alt="" width="100px" />
      <p class="mb-0 mx-2">
        Own your data. Sync between learning apps.
        <a class="secondary learn-more" href="https://eduvault.org">Learn more</a>
      </p>
      <img class="security-option" src="@/assets/most-secure.png" width="150px" />
      <!-- <login-dotwallet></login-dotwallet> -->
      <login-metamask></login-metamask>
      <img class="security-option" src="@/assets/secure.png" width="150px" />

      <b-alert
        :show="state.dismissCountDown"
        dismissible
        fade
        variant="warning"
        @dismiss-count-down="countDownChanged"
      >
        {{ state.apiErrorMsg }}
      </b-alert>
      <login-password
        @updatePassword="state.password = $event"
        @updateEmail="state.email = $event"
        @emailValidation="state.emailValidation = $event"
        @passwordValidation="state.passwordValidation = $event"
      ></login-password>
      <login-signup-buttons
        :email-validation="state.emailValidation"
        :password-validation="state.passwordValidation"
        :making-request="state.makingRequest"
        @login="login()"
      ></login-signup-buttons>

      <img class="security-option" src="@/assets/less-secure.png" width="150px" />

      <login-google></login-google>
      <login-facebook></login-facebook>

      <div v-if="state.redirectURL" class="mt-3 text-center">
        <h1>
          <strong>{{ state.redirectURL }}</strong>
        </h1>
        <p>is requesting access to your personal cloud database</p>
        <p>Make sure you trust this site</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { reactive, watch } from '@vue/composition-api';
import {
  BAlert,
  // BImg
} from 'bootstrap-vue';
import LoginPassword from '../components/LoginPassword.vue';
import LoginSignupButtons from '../components/LoginSignupButtons.vue';
import LoginGoogle from '../components/LoginGoogle.vue';
import LoginFacebook from '../components/LoginFacebook.vue';
import LoginMetamask from '../components/LoginMetamask.vue';
// import LoginDotwallet from '../components/LoginDotwallet.vue';
import router from '../router';
import store from '../store';
interface State {
  redirectURL?: string;
  appID?: string;
  email: string;
  password: string;
  emailValidation: boolean;
  passwordValidation: boolean;

  apiErrorMsg: string;
  failedLogin: boolean;
  dismissSecs: number;
  dismissCountDown: number;

  makingRequest: boolean;

  showSignup: boolean;
}
export default {
  name: 'Login',
  components: {
    LoginPassword,
    LoginSignupButtons,
    BAlert,

    LoginGoogle,
    LoginFacebook,
    LoginMetamask,
    // LoginDotwallet,
  },
  setup() {
    const state: State = reactive({
      email: '',
      password: '',
      emailValidation: false,
      passwordValidation: false,

      apiErrorMsg: '',
      failedLogin: false,
      dismissSecs: 5,
      dismissCountDown: 0,

      makingRequest: false,

      showSignup: false,
    });

    async function showAlert() {
      state.dismissCountDown = state.dismissSecs;
    }
    async function countDownChanged(dismissCountDown: number) {
      state.dismissCountDown = dismissCountDown;
    }
    watch(
      () => state.failedLogin,
      (newValue) => {
        if (newValue) showAlert();
      },
    );
    const login = async function () {
      state.makingRequest = true;
      state.failedLogin = false;
      const response = await store.dispatch.authMod.pwLogin({
        password: state.password,
        username: state.email,
      });
      if (!response || response !== 'success') {
        state.makingRequest = false;
        state.failedLogin = true;
        state.apiErrorMsg = response ? response : '';
      }
    };

    return {
      state,
      countDownChanged,
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
  margin: 0.8rem 0 0.2rem;
}
.landing-page {
  background-color: #fdeddb;
  display: flex;
  align-items: center;
  flex-direction: column;
  height: calc(100vh - 37px);
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
  max-width: 4300px;
  overflow-y: auto;
}
</style>
