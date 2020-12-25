<template>
  <b-form class="login-component__body">
    <!-- <p v-if="state.showSignup" class="m-0">
      Sign up now!
    </p>
    <p v-else class="m-0">
      Welcome back!
    </p> -->
    <span>
      <b-button
        v-if="state.showSignup"
        :disabled="loginButtonDisable"
        type="submit"
        variant="primary"
        @click.prevent="$emit('signup')"
      >
        <font-awesome-icon v-show="state.makingRequest" icon="spinner" spin />
        Sign up</b-button
      >
      <b-button
        v-else
        :disabled="loginButtonDisable"
        type="submit"
        variant="primary"
        @click.prevent="$emit('login')"
      >
        <font-awesome-icon v-show="state.makingRequest" icon="spinner" spin />
        Log in</b-button
      >

      <a
        v-if="state.showSignup"
        class="m-3"
        type="submit"
        variant="secondary"
        @click="state.showSignup = !state.showSignup"
      >
        Log in
      </a>
      <a
        v-else
        class="m-3"
        type="submit"
        variant="secondary"
        @click="state.showSignup = !state.showSignup"
      >
        Sign up
      </a>
    </span>
  </b-form>
</template>
<script lang="ts">
import { BForm, BButton } from 'bootstrap-vue';
import { reactive, computed } from '@vue/composition-api';
export default {
  components: { BForm, BButton },
  props: { emailValidation: Boolean, passwordValidation: Boolean, makingRequest: Boolean },
  setup(props: any) {
    const state = reactive({
      showSignup: false,
    });
    const loginButtonDisable = computed(() => {
      if (!props.emailValidation || !props.passwordValidation || props.makingRequest) {
        return true;
      } else {
        return false;
      }
    });
    return { props, state, loginButtonDisable };
  },
};
</script>

<style></style>
