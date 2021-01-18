import { IPerson } from '../types';

// import localForage from 'localforage';
import Vue from 'vue';
import Vuecookies from 'vue-cookies';
Vue.use(Vuecookies);

export default {
  namespaced: true as const,
  state: {} as IPerson,
  getters: {
    person: (state: IPerson): IPerson => state,
  },
  mutations: {
    CLEAR_STATE(state: IPerson): void {
      Object.assign(state, {});
    },
    PERSON(state: IPerson, person: IPerson): void {
      state = person;
    },
  },
  actions: {
    //
  },
};
