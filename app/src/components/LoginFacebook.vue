<template>
  <div class="login-component__body mb-1">
    <img
      class="oauth-login-button"
      src="@/assets/facebook-button.png"
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
      store.dispatch.authMod.openOAuthLink('facebook')
    },
  },
};
</script>

<style></style>
