<template>
  <div>
    <div class="splash-page">
      <b-img class="landing-img" src="/img/icons/flashy-cards-cover-square.png" />
    </div>
  </div>
</template>

<script lang="ts">
// import EduVault from 'eduvault-js';
// import EduVault from 'eduvault-js';
import { reactive, onMounted } from '@vue/composition-api';
import { BImg } from 'bootstrap-vue';
// import router from '../router';
// import store from '../store';
// import axios from 'axios'

// import { v4 as uuid } from 'uuid';
export default {
  name: 'Login',
  components: { BImg },

  setup() {
    // const eduvault = new EduVault();
    onMounted(() => {
      // eduvault.loadCredentials({ autoRedirect: true });
      // const db = eduvault.connectDB()
    });
    const state = reactive({
      //
    });

    const THIS_SITE_URL = 'http://localhost:8082';
    const redirectURL = `${THIS_SITE_URL}/home`;

    return {
      state,
    };
  },
};
</script>

<style scoped>
.eduvault-button {
  margin-bottom: auto;
}

.splash-page {
  display: flex;
  align-items: center;
  flex-direction: column;
}
.landing-img {
  width: 90%;
  object-fit: scale-down;
  margin: auto;
  max-width: fit-content;
}
#login-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: auto;
  max-width: 370px;
  overflow-y: auto;
}
</style>
