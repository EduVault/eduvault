<template>
  <div class="app u-scroller">
    <the-navbar></the-navbar>
    <login v-if="needsLogin"></login>
    <splash v-else-if="!needsLogin && isLoading"></splash>
    <home
      v-else-if="!!eduvault && !!decks"
      :eduvault="eduvault"
      :decks-prop="decks"
      :remote-loaded="remoteLoaded"
    ></home>
    <span class="footer">{{ loadingStatus }}...</span>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';

import Home from './views/Home.vue';
import Login from './views/Login.vue';
import Splash from './views/Splash.vue';
import TheNavbar from './components/TheNavbar.vue';
import EduVault from '@eduvault/eduvault-js';
import { setupApp } from './eduvaultHelpers';
import { loadDecks } from './eduvaultHelpers';
import { Deck } from './types';
import defaultDeck from './assets/defaultDeck.json';

export default Vue.extend({
  components: { Home, Login, Splash, TheNavbar },
  // pass decks and eduvault to home. only load after loaded
  data() {
    return {
      decks: [] as Deck[],
      eduvault: undefined as undefined | EduVault,
      loadingStatus: 'Starting',
      isLoading: true,
      needsLogin: false,
      remoteLoaded: false,
    };
  },
  mounted() {
    this.init().then((eduvault) => {
      if (eduvault) this.eduvault = eduvault;
    });
  },
  methods: {
    async init() {
      const appID = localStorage.getItem('APP_ID') || ((await setupApp()) as string);
      if (!appID) return console.log('no APP_ID');
      return new EduVault({
        appID,
        log: true,
        onLoadCredentialsStart: () => (this.loadingStatus = 'Loading Credentials'),
        onLoadCredentialsReady: (creds) => {
          this.loadingStatus = 'Credentials Ready';
          console.log({ creds });
        },
        onLoadCredentialsError: (error) => {
          this.needsLogin = true;
          console.log('credentials error');
          this.loadingStatus = 'Error Loading Credentials: ' + error;
        },
        onLocalStart: () => (this.loadingStatus = 'Loading Local Database'),
        onLocalReady: async (db) => {
          try {
            const decks = await loadDecks(db);
            if (!decks || 'error' in decks) {
              this.decks = [defaultDeck];
              console.log({ deckLoadingError: decks?.error });
              this.isLoading = false;
            } else {
              this.decks = decks;
              this.loadingStatus =
                this.loadingStatus === 'Loading Remote Database'
                  ? 'Loading Remote Database'
                  : 'Local Database Ready';
              this.isLoading = false;
            }
          } catch (error) {
            return { deckLoadingError: error };
          }
        },
        onRemoteStart: () => (this.loadingStatus = 'Loading Remote Database'),
        onRemoteReady: async (db) => {
          if (db?.remote) {
            console.log({ remote: db.remote });
            this.remoteLoaded = true;
          }
          this.loadingStatus = 'Remote Database Ready';
        },
      });
    },
  },
});
</script>
<style lang="scss">
@import './styles/_variables.scss';
.footer {
  width: 100vw;
  background-color: white;
  position: fixed;
  left: 0px;
  bottom: 0px;
  padding: 5px;
}
</style>
