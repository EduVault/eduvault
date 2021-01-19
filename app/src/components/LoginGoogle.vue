<template>
  <div class="login-component__body mb-1">
    <img
      class="oauth-login-button"
      src="@/assets/google-button.png"
      alt="google login"
      width="250px"
      @click="openLink"
    />
  </div>
</template>

<script>
import store from '../store';
export default {
  methods: {
    openLink() {
      store.dispatch.authMod.openOAuthLink('google');
    },
  },
};
</script>

<style></style>
