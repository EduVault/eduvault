<template>
  <div class="app u-scroller">
    <AlertUpdatePWA></AlertUpdatePWA>
    <transition name="fade">
      <router-view class="app_router-view" />
    </transition>
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
