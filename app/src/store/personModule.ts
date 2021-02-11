import { types } from '../types';
type IPerson = types.IPerson;
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
