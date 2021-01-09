import Vue from 'vue';
import VueRouter, { RouteConfig, Route, NavigationGuardNext } from 'vue-router';
import store from '../store';
import Login from '../views/Login.vue';
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

/**More strict check */
function checkAuthValid(to: Route, from: Route, next: any) {
  /** Saves the get request queries into vuex, and redirects without them */
  let query;
  if (!ifObjectIsEmpty(to.query)) query = { ...to.query };
  console.log('query', query);
  if (query && store.state.authMod.query != query && !query.checkauth) {
    console.log('commiting query, ', query);
    store.commit.authMod.QUERY(query);
    next('/login/?checkauth=yes');
  } else {
    if (to.query.checkauth == 'no') {
      next();
      return null;
    }
    if (to.query.checkauth == 'yes') {
      next();
      return null;
    }
  }
  // reHydrateStorage(to, from, next).then(() => {
  //   store.dispatch.authMod.checkAuth().then((verified: boolean | undefined) => {
  //     console.log('checking auth');

  //     console.log('verified', verified);
  //     if (verified) {
  //       if (to.path.includes('/login')) next('/home');
  //       else next();
  //       return null;
  //     } else {
  //       next('/login/?checkauth=no');
  //       return null;
  //     }
  //   });
  // });
}

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Root',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: '/',
  routes,
});
router.beforeEach(checkAuthValid);
export default router;
