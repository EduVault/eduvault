<template>
  <b-form inline class="login-component__body form" style="margin: 0" @submit.stop.prevent>
    <label class="sr-only" for="feedback-email">Email</label>
    <b-form-input
      class="form__input form__item"
      v-model="state.email"
      :state="emailValidation"
      type="email"
      autocomplete="username"
      placeholder="Email"
      @formchange="
        $emit('updateEmail', state.email);
        $emit('emailValidation', emailValidation);
      "
      @keyup="
        $emit('updateEmail', state.email);
        $emit('emailValidation', emailValidation);
      "
    ></b-form-input>
    <b-form-invalid-feedback v-if="state.email" :state="emailValidation">{{
      emailValidationErrorMsg
    }}</b-form-invalid-feedback>
    <!-- <b-form-valid-feedback :state="emailValidation">Looks Good.</b-form-valid-feedback> -->

    <label class="sr-only" for="feedback-password">Password</label>
    <b-form-input
      class="form__input form__item"
      v-model="state.password"
      :state="passwordValidation"
      placeholder="Password"
      type="password"
      autocomplete="current-password"
      @keyup="
        $emit('updatePassword', state.password);
        $emit('passwordValidation', passwordValidation);
      "
    ></b-form-input>
    <b-form-invalid-feedback v-if="state.password" :state="passwordValidation">{{
      passwordValidationErrorMsg
    }}</b-form-invalid-feedback>
    <!-- <b-form-valid-feedback :state="passwordValidation">Looks Good.</b-form-valid-feedback> -->
  </b-form>
</template>

<script lang="ts">
import { reactive, computed } from '@vue/composition-api';
import { BForm, BFormInvalidFeedback, BFormInput } from 'bootstrap-vue';

export default {
  components: { BForm, BFormInvalidFeedback, BFormInput },
  setup() {
    const state = reactive({
      email: '' as string,
      password: '' as string,
    });

    const emailValidation = computed(() => {
      const email = state.email;
      if (email.length <= 5 || email.length >= 64) {
        return false;
      }
      if (!email.includes('@') || !email.includes('.')) {
        return false;
      } else {
        return true;
      }
    });

    const emailValidationErrorMsg = computed(() => {
      const email = state.email;
      if (email.length <= 5 || email.length >= 64) {
        return 'Email must be 5-64 characters long';
      }
      if (!email.includes('@') || !email.includes('.')) {
        return 'Invalid email';
      } else {
        return null;
      }
    });
    const passwordValidation = computed(() => {
      const password = state.password;
      if (password.length < 8 || password.length >= 64) {
        return false;
      } else {
        return true;
      }
    });
    const passwordValidationErrorMsg = computed(() => {
      const password = state.password;
      if (password.length < 8 || password.length >= 64) {
        return 'Password must be 8-64 characters long';
      } else {
        return null;
      }
    });

    return {
      state,
      emailValidation,
      emailValidationErrorMsg,
      passwordValidation,
      passwordValidationErrorMsg,
    };
  },
};
</script>

<style>
</style>
