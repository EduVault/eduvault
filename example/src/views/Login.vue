<template>
  <div>
    <div v-if="state.landing" class="landing-page">
      <b-img class="landing-img" src="/img/icons/flashy-cards-cover-square.png" />
      <img
        src="@/assets/eduvault-button.png"
        class="oauth-login-button eduvault-button"
        width="256px"
        @click="login()"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { reactive, watch } from '@vue/composition-api';
import { BImg } from 'bootstrap-vue';
import router from '../router';
import store from '../store';
export default {
  name: 'Login',
  components: {},
  setup() {
    const state = reactive({});

    async function login() {
      // ....

      router.push('/home');
    }

    return {
      state,
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
