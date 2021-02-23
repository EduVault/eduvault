<template>
  <div>
    <div class="splash-page">
      <b-img class="landing-img" src="/img/icons/flashy-cards-cover-square.png" />
      <font-awesome-icon class="m-5" size="6x" icon="spinner" spin></font-awesome-icon>
    </div>
  </div>
</template>

<script lang="ts">
import { reactive, onMounted } from '@vue/composition-api';
import { BImg } from 'bootstrap-vue';
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
