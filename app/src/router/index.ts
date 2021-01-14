import Vue from 'vue';
import VueRouter, { RouteConfig, Route, NavigationGuardNext } from 'vue-router';
import store from '../store';
import Login from '../views/Login.vue';
import Splash from '../views/Splash.vue';
import { ifObjectIsEmpty } from './utils';
Vue.use(VueRouter);

/**undocumented bug in vuex-persist with localforage. Hacky fix from issues forum */
async function reHydrateStorage(to: Route, from: Route, next: any) {
  // undocumented bug in vuex-persist with localforage. Hacky fix from issues forum
  // restored is a promise, when fulfilled means state is restored

  // await console.log('rehydrating storage');
  // await console.log(store.state.authMod);
  await (store as any).original.restored;
  return null;
}

function collectQueries(to: Route, from: Route, next: any) {
  console.log('collecting queries', to.query);
  const query = to.query;
  if (query && !ifObjectIsEmpty(query)) {
    console.log('query', query);
    if (query.code) store.commit.authMod.CODE(query.code as string);
    if (query.redirect_url) store.commit.authMod.REDIRECT_URL(query.redirect_url as string);
  }
  next();
}

/**More strict check */
async function routeGuard(to: Route, from: Route, next: any) {
  // might want to do a more strict local check
  if (store.state.authMod.keyPair) {
    next();
  } else {
    // call the server
    if (await store.dispatch.authMod.checkAuth()) {
      next();
    } else next('/login');
  }
}

const routes: Array<RouteConfig> = [
  {
    path: '/loading',
    name: 'Loading',
    component: Splash,
  },
  {
    path: '/home',
    name: 'Home',
    redirect: '/home',
    beforeEnter: routeGuard,
  },
  {
    path: '/',
    name: 'Root',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    beforeEnter: collectQueries,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: '/',
  routes,
});
export default router;
