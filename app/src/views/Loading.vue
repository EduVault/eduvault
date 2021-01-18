<template>
  <div id="loading">
    <img src="@/assets/eduvault-logo-word-bw.png" alt="EduVault" />
  </div>
</template>

<script lang="ts">
import { reactive, defineComponent } from '@vue/composition-api';
import store from '../store';
export default defineComponent({
  setup() {
    console.log('in Loading: calling loadingPageAuthCheck');
    store.dispatch.authMod.loadingPageAuthCheck();

    // const state = reactive({
    //   thing: 2,
    // });
    return {
      // state
    };
  },
});
</script>

<style lang="scss" scoped>
@import '../styles/_variables.scss';

#loading {
  background-color: $secondary;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>