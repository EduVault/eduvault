<template>
  <div class="login-component__body mb-1 ">
    <img
      class="oauth-login-button"
      src="@/assets/facebook-button.png"
      alt="google login"
      width="256px"
      @click="openLink"
    />
  </div>
</template>

<script>
import { API_URL_ROOT, DEV_API_URL_ROOT, FACEBOOK_AUTH } from '../config';
import store from '../store';
export default {
  methods: {
    openLink() {
      store.commit.authMod.AUTHTYPE('facebook');
      window.location.href =
        process.env.NODE_ENV === 'production'
          ? 'https://' + API_URL_ROOT + FACEBOOK_AUTH
          : 'http://' + DEV_API_URL_ROOT + FACEBOOK_AUTH;
    },
  },
};
</script>

<style></style>
