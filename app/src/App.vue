<template>
  <div class="app u-scroller">
    <AlertUpdatePWA></AlertUpdatePWA>
    <router-view class="app_router-view" />
  </div>
</template>
<script>
import AlertUpdatePWA from './components/AlertUpdatePWA.vue';
// import TheNavbar from './components/TheNavbar.vue';
export default {
  components: {
    AlertUpdatePWA,
    // TheNavbar
  },
};
</script>
<style lang="scss">
@import './styles/_variables.scss';
</style>
