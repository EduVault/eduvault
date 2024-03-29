import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';

import { LayoutPlugin } from 'bootstrap-vue';
import './styles/main.scss';

import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faTrashAlt,
  faPlusSquare,
  faCheck,
  faEdit,
  faTimes,
  faSpinner,
  faSync,
  faCloud,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome';
library.add(faTrashAlt, faPlusSquare, faCheck, faEdit, faTimes, faSpinner, faSync, faCloud);

Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.component('font-awesome-layers', FontAwesomeLayers);
Vue.config.productionTip = false;

import VueCompositionApi from '@vue/composition-api';

Vue.config.productionTip = false;
Vue.use(VueCompositionApi);
Vue.use(LayoutPlugin);

import VueCookies from 'vue-cookies';
Vue.use(VueCookies);

new Vue({
  router,
  store: store.original,
  render: (h) => h(App),
}).$mount('#app');
