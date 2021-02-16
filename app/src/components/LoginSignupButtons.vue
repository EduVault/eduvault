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
        class="form__item btn__login-signup"
        :disabled="loginButtonDisable"
        type="submit"
        variant="outline-primary"
        @click.prevent="$emit('login')"
      >
        <font-awesome-icon v-show="state.makingRequest" icon="spinner" spin />
        Continue With Password</b-button
      >
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
