<template>
  <b-navbar class="navbar__navbar" ref="navbarMain" toggleable="xs" type="dark" variant="secondary">
    <b-navbar-toggle target="nav-collapse" />

    <font-awesome-layers v-if="loggedIn" class="nav-icon__layers fa-lg ">
      <font-awesome-icon class="nav-icon__cloud fa-lg primary " icon="cloud" />
      <font-awesome-icon
        id="nav-icon__sync"
        class=" fa-xs secondary "
        :spin="syncing"
        icon="sync"
      />
    </font-awesome-layers>
    <b-img height="20px" width="20px" src="/img/icons/flashy-cards-logo-white.svg"></b-img>
    <b-collapse class="pt-3" id="nav-collapse" is-nav>
      <b-link v-if="$router.currentRoute.name == 'Login'" class="nav__link mt-3" to="/home"
        >Home</b-link
      >
      <b-link v-else-if="loggedIn" to="/login" class="nav__link mt-3" @click="logout()"
        >Logout</b-link
      >
      <b-link v-else class="nav__link" to="/login">Login</b-link>
      <b-navbar-nav>
        <b-link class="mt-3" @click="saveToChain()">Save my cards to the BitcoinSV chain</b-link>
        <b-link class="mt-3" to="/txlist">View my saved cards transactions</b-link>
        <b-nav-text class="mt-3">View my data on the IPFS</b-nav-text>
        <b-link
          v-for="(deck, index) in decks"
          :key="index"
          class="ml-2"
          @click="viewDeck(deck._id)"
          >{{ deck.title }}</b-link
        >
        <b-link class="mt-3" @click="openBucket()"
          >View my uploaded photos on the IPFS</b-link
        ></b-navbar-nav
      >
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
import { computed, reactive } from '@vue/composition-api';
import store from '../store';
import axios from 'axios';
// import router from '../router';
export default {
  name: 'Navbar',
  components: {
    BLink,
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
  setup() {
    const decks = computed(() => store.state.decksMod.decks);

    const openBucket = (link: string) => {
      const bucketLink = store.state.authMod.bucketUrl;
      console.log('bucketlink', bucketLink);

      window.open(bucketLink, '_blank');
    };
    const viewDeck = (deckID: string) => {
      const threadView = `https://${store.state.authMod.threadIDStr}.thread.hub.textile.io/Deck/`;

      window.open(threadView + deckID);
    };
    const loggedIn = computed(() => store.getters.authMod.loggedIn);
    const syncing = computed(() => store.getters.authMod.syncing);
    const logout = () => {
      store.dispatch.authMod.logout();
      store.commit.authMod.LOGGEDIN(false);
    };
    const saveToChain = () => {
      store.dispatch.decksMod.saveDecksToChain();
    };

    return { loggedIn, syncing, logout, openBucket, decks, viewDeck, saveToChain };
  },
};
</script>
<style lang="scss" scoped>
#nav-icon__sync {
  margin: 4px 0px 0px 9px;
}

// .app__nav {
//   display: flex;
//   justify-content: space-between;
//   padding: 10px 25px;
//   text-align: center;
//   width: 100%;
//   background-color: $secondary;

//   &__link {
//     font-weight: bold;
//     color: white;
//     padding: 5px 10px;

//     &.router-link-exact-active {
//       color: $primary;
//     }
//   }
// }
</style>
