import Vue from 'vue';
import Vuex from 'vuex';
import { createDirectStore } from 'direct-vuex';
import VuexPersistence, { AsyncStorage } from 'vuex-persist';
import localForage from 'localforage';
import { STORAGE_KEY } from '../config';

import { RootState } from '../types';
import dbModule from './dbModule';
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
const vuexLocalForage = new VuexPersistence<RootState>({
  key: STORAGE_KEY,
  storage: localForage as AsyncStorage,
  //@ts-ignore
  restoreState: async (key, storage) => (await localForage.getItem<RootState>(key)) as RootState,
  reducer: (state) => ({
    decksMod: {
      decks: state.decksMod.decks,
    },
    dbMod: {
      appID: state.dbMod.appID,
    },
  }), // only save decks module
  // undocumented bug in vuex-persist with localforage. Hacky fix from issues forum
  asyncStorage: true,
});

Vue.use(Vuex);

const {
  store,
  rootActionContext,
  moduleActionContext,
  rootGetterContext,
  moduleGetterContext,
} = createDirectStore({
  modules: {
    dbMod: dbModule,
    decksMod: decksModule,
  },
  plugins: [vuexLocalForage.plugin],
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
    // eslint-disable-next-line
    direct: AppStore;
  }
}
