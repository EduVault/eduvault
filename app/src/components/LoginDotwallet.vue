<template>
  <div @click="login()" class="login-component__body mb-1 ">
    <dotwallet-login :app-id="dotwalletAppId" :redirect-url="dotwalletRedirectUrl">
      <img
        class="oauth-login-button"
        src="@/assets/dotwallet-button.png"
        alt="dotwallet login"
        width="256px"
      />
    </dotwallet-login>
  </div>
</template>

<script>
import { DotwalletLogin } from 'dotwallet-vue'; //@ts-ignore
import { DOTWALLET_AUTH, API_URL_ROOT, DOTWALLET_APP_ID } from '@/config';
// import ip from 'ip';
import store from '../store';
export default {
  components: { DotwalletLogin },
  data() {
    return {
      dotwalletAppId: DOTWALLET_APP_ID,
      dotwalletRedirectUrl:
        process.env.NODE_ENV === 'production'
          ? 'https://' + API_URL_ROOT + DOTWALLET_AUTH
          : 'http://' + '172.19.0.3' + ':3003' + DOTWALLET_AUTH, //this doesn't work. need to manually change back to localhost after redirect fails
    };
  },
  methods: {
    login() {
      store.commit.authMod.AUTHTYPE('dotwallet');
    },
  },
};
</script>

<style></style>
