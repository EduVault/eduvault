<template>
  <b-navbar class="navbar__navbar" ref="navbarMain" toggleable="xs" type="dark" variant="secondary">
    <b-navbar-toggle target="nav-collapse" />

    <font-awesome-layers v-if="loggedIn" class="nav-icon__layers fa-lg">
      <font-awesome-icon class="nav-icon__cloud fa-lg primary" icon="cloud" />
      <font-awesome-icon class="nav-icon__sync fa-xs secondary" :spin="syncing" icon="sync" />
    </font-awesome-layers>
    <b-img height="20px" width="20px" src="/img/icons/flashy-cards-logo-white.svg"></b-img>
    <b-collapse class="pt-3" id="nav-collapse" is-nav>
      <!-- <b-link v-if="$router.currentRoute.name == 'Login'" class="nav__link mt-3" to="/home"
        >Home</b-link
      >
      <b-link v-else-if="loggedIn" to="/login" class="nav__link mt-3" @click="logout()"
        >Logout</b-link
      > -->
      <!-- <b-link v-else class="nav__link" to="/login">Login</b-link> -->
      <b-navbar-nav>
        <!-- <b-link class="mt-3" to="/txlist">View my saved cards transactions</b-link> -->

        <b-nav-text v-if="devEnv" @click="wipeLocal" class="mt-3 pointer">wipe local DB</b-nav-text>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>
<script lang="ts">
import {
  BLink,
  BNavbar,
  BNavbarNav,
  BNavbarBrand,
  BImg,
  // BNavForm,
  // BFormInput,
  BNavbarToggle,
  BNavText,
  // BNavItem,
  BCollapse,
} from 'bootstrap-vue';
import { computed, defineComponent, reactive } from '@vue/composition-api';
// import store from '../store';
import axios from 'axios';
import EduVault from '@eduvault/eduvault-js/dist/main';
import localForage from 'localforage';
// import router from '../router';
export default defineComponent({
  name: 'Navbar',
  components: {
    // BLink,
    BNavbar,
    BNavbarNav,
    BImg,
    // BNavForm,
    // BFormInput,
    BNavbarToggle,
    BNavText,
    // BNavItem,
    BCollapse,
  },
  props: {
    eduvault: { type: Object as () => EduVault },
  },
  setup({ eduvault }) {
    const devEnv = computed(() => process.env.NODE_ENV === 'development');

    const wipeLocal = () => {
      console.log('wiping local');
      localStorage.clear();
      localForage.clear();
      if (eduvault) eduvault.db?.delete();
    };
    // const decks = computed(() => store.state.decksMod.decks);

    const openBucket = (link: string) => {
      // const bucketLink = store.state.dbMod.bucketUrl;
      // console.log('bucketlink', bucketLink);
      // window.open(bucketLink, '_blank');
    };
    const viewDeck = (deckID: string) => {
      // const threadView = `https://${store.state.dbMod.threadIDStr}.thread.hub.textile.io/Deck/`;
      // window.open(threadView + deckID);
    };
    const loggedIn = false;
    // const loggedIn = computed(() => store.getters.dbMod.loggedIn);
    // const syncing = computed(() => store.getters.dbMod.syncing);
    const logout = () => {
      // store.dispatch.dbMod.logout();
      // store.commit.dbMod.LOGGEDIN(false);
    };

    return { wipeLocal, devEnv, logout, openBucket, viewDeck, loggedIn };
  },
});
</script>
<style lang="scss" scoped>
.nav-icon__sync {
  margin: 4px 0px 0px 9px;
}
</style>
