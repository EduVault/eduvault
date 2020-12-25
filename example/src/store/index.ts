import Vue from 'vue';
import Vuex from 'vuex';
import { createDirectStore } from 'direct-vuex';
import VuexPersistence from 'vuex-persist';
import Cookies from 'js-cookie';
import localForage from 'localforage';
import { STORAGE_KEY } from '../config';

import { RootState } from '../types';
import authModule from './authModule';
import decksModule from './decksModule';

// import defaultDeck from '@/assets/defaultDeck.json';

// Hacky fix. For some reason when vuex-persist is combined with direct-vuex,
// the store will get overwritten by default values.
// const setDefault = function(store: any) {
//   for (const deck of store.state.decksMod.decks) {
//     if (deck._id === '123') return null;
//   }
//   store.commit.decksMod.addDeck(defaultDeck);
// };
// const vuexLocalForage = new VuexPersistence<RootState>({
//   key: STORAGE_KEY,
//   storage: localForage,
//   restoreState: async (key, storage) => await localForage.getItem<RootState>(key),
//   reducer: state => ({
//     decksMod: {
//       decks: state.decksMod.decks,
//       backlog: state.decksMod.backlog,
//     },
//   }), // only save decks module
//   // undocumented bug in vuex-persist with localforage. Hacky fix from issues forum
//   // asyncStorage: true,
// });
const vuexLocalStorage = new VuexPersistence<RootState>({
  storage: window.localStorage,
  reducer: state => ({
    decksMod: {
      decks: state.decksMod.decks,
      backlog: state.decksMod.backlog,
    },
    authMod: {
      jwtEncryptedKeyPair: state.authMod.jwtEncryptedKeyPair,
      pubKey: state.authMod.pubKey,
      threadIDStr: state.authMod.threadIDStr,
      authType: state.authMod.authType,
    },
  }),
});
// const vuexCookie = new VuexPersistence<State>({
//   restoreState: (key) => Cookies.getJSON(key),
//   saveState: (key, state) =>
//     Cookies.set(key, state, {
//       expires: 3,
//     }) as void,
//   modules: ['authMod'], //only save user module
//   // filter: mutation => mutation.type == 'logIn' || mutation.type == 'logOut',
// });

Vue.use(Vuex);

const {
  store,
  rootActionContext,
  moduleActionContext,
  rootGetterContext,
  moduleGetterContext,
} = createDirectStore({
  modules: {
    authMod: authModule,
    decksMod: decksModule,
  },
  plugins: [
    // vuexLocalForage.plugin,
    vuexLocalStorage.plugin,
    // vuexCookie.plugin,
  ],
});
//
// setDefault(store);
// Export the direct-store instead of the classic Vuex store.
export default store;

// The following exports will be used to enable types in the
// implementation of actions and getters.
export { rootActionContext, moduleActionContext, rootGetterContext, moduleGetterContext };

// The following lines enable types in the injected store '$store'.
export type AppStore = typeof store;
declare module 'vuex' {
  interface Store<S> {
    direct: AppStore;
  }
}
