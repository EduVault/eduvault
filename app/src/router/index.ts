import Vue from 'vue';
import VueRouter, { RouteConfig, Route, NavigationGuardNext } from 'vue-router';
import store from '../store';
import Login from '../views/Login.vue';
import Loading from '../views/Loading.vue';
import Home from '../views/Home.vue';

import { ifObjectIsEmpty } from './utils';
Vue.use(VueRouter);

/**undocumented bug in vuex-persist with localforage. Hacky fix from issues forum */
async function reHydrateStorage(to: Route, from: Route, next: any) {
  // undocumented bug in vuex-persist with localforage. Hacky fix from issues forum
  // restored is a promise, when fulfilled means state is restored

  // await console.log('rehydrating storage');
  // await console.log(store.state.authMod);
  await (store as any).original.restored;
  next();
}

/**More strict check */
async function routeGuard(to: Route, from: Route, next: any) {
  // might want to do a more strict local check
  if (store.state.authMod.privateKey) {
    next();
  } else {
    // call the server
    if (await store.dispatch.authMod.serverCheckAuth()) {
      next();
    } else next('/login');
  }
}

const routes: Array<RouteConfig> = [
  {
    path: '/home',
    name: 'Home',
    component: Home,
    beforeEnter: async (to: Route, from: Route, next: any) => {
      await reHydrateStorage(to, from, next);
      routeGuard(to, from, next);
    },
  },
  {
    path: '/',
    name: 'Loading',
    component: Loading,
    beforeEnter: async (to: Route, from: Route, next: any) => {
      await reHydrateStorage(to, from, next);
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    beforeEnter: async (to: Route, from: Route, next: any) => {
      await reHydrateStorage(to, from, next);
    },
  },
];

const router = new VueRouter({
  mode: 'history',
  base: '/',
  routes,
});
export default router;
