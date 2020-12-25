<template>
  <div>
    <div id="login-body">
      <img class="m-2" src="@/assets/eduvault-logo-word-bw.png" alt="" width="100px" />
      <h4>
        With EduVault, have true ownership of your data, and carry it with you between learning
        apps.
        <a class="secondary learn-more" href="">Learn more</a>
      </h4>
      <img class="security-option" src="@/assets/most-secure.png" width="150px" />
      <login-dotwallet></login-dotwallet>
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
        @login="loginOrSignup(false)"
        @signup="loginOrSignup(true)"
      ></login-signup-buttons>
      <img class="security-option" src="@/assets/less-secure.png" width="150px" />

      <login-google></login-google>
      <login-facebook></login-facebook>
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
import LoginDotwallet from '../components/LoginDotwallet.vue';
import store from '../store';
export default {
  name: 'Login',
  components: {
    LoginPassword,
    LoginSignupButtons,
    BAlert,
    // BImg,
    LoginGoogle,
    LoginFacebook,
    LoginMetamask,
    LoginDotwallet,
  },
  setup() {
    const state = reactive({
      email: '' as string,
      password: '' as string,
      emailValidation: false as boolean,
      passwordValidation: false as boolean,

      apiErrorMsg: '' as string,
      failedLogin: false as boolean,
      dismissSecs: 5 as number,
      dismissCountDown: 0 as number,

      makingRequest: false as boolean,

      showSignup: false as boolean,
    });

    async function showAlert() {
      state.dismissCountDown = state.dismissSecs;
    }
    watch(
      () => state.failedLogin,
      newValue => {
        if (newValue) showAlert();
      }
    );
    const loginOrSignup = async function(signup: boolean) {
      state.makingRequest = true;
      state.failedLogin = false;
      const response = await store.dispatch.authMod.passwordAuth({
        password: state.password,
        username: state.email,
        signup,
      });
      if (response !== 'success') {
        state.makingRequest = false;
        state.failedLogin = true;
        state.apiErrorMsg = response;
      }
    };
    async function countDownChanged(dismissCountDown: number) {
      state.dismissCountDown = dismissCountDown;
    }

    return {
      state,
      loginOrSignup,
      countDownChanged,
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
  max-width: 370px;
  overflow-y: auto;
}
</style>
