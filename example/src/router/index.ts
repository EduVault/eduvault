import Vue from 'vue';
import VueRouter, { RouteConfig, Route, NavigationGuard } from 'vue-router';
import store from '../store';
import Login from '../views/Login.vue';
import Splash from '../views/Splash.vue';
import Home from '../views/Home.vue';
import EduVault, { appRegister, devVerify, personRegister, Database } from '@eduvault/eduvault-js';
Vue.use(VueRouter);
import { APP_SECRET } from '../config';

/**undocumented bug in vuex-persist with localforage. Hacky fix from issues forum */
async function reHydrateStorage() {
  // undocumented bug in vuex-persist with localforage. Hacky fix from issues forum
  // restored is a promise, when fulfilled means state is restored
  // await console.log('rehydrating storage');
  // await console.log(store.state.dbMod);
  await (store as any).original.restored;
}

const beforeEach: NavigationGuard = async (to, from, next) => {
  // await reHydrateStorage();
  const isAuthValid = await store.dispatch.dbMod.isAuthValid();
  const isDBLoaded = await store.dispatch.dbMod.isLocalLoaded();

  console.log({ isAuthValid, isDBLoaded, to: to.path });
  if (isAuthValid && isDBLoaded) {
    if (to.path === '/login') next('/home');
    else next();
  } else {
    const localStart = await store.dispatch.dbMod.startLocal();
    console.log({ localStart });
    // if on login page, wait for remote start
    if (to.path === '/login') {
      const remoteStart = await store.dispatch.dbMod.startRemote();
      console.log({ remoteStart });
      if ('error' in remoteStart) next();
      else next('/home');
    } else {
      next();
      const remoteStart = await store.dispatch.dbMod.startRemote();
      console.log({ remoteStart });
      if ('error' in remoteStart) next('/login');
    }
  }
};

const routes: Array<RouteConfig> = [
  {
    path: '/',
    redirect: '/login',
    component: Splash,
  },
  {
    path: '/splash',
    name: 'Splash',
    component: Splash,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: '/',
  routes,
});
router.beforeEach(beforeEach);
export default router;
