<template>
  <div id="splash">
    <img src="@/assets/eduvault-logo-word-bw.png" alt="EduVault" />
  </div>
</template>

<script lang="ts">
import { reactive, defineComponent } from '@vue/composition-api';
export default defineComponent({
  setup() {
    const state = reactive({
      thing: 2,
    });
    return { state };
  },
});
</script>

<style lang="scss" scoped>
@import '../styles/_variables.scss';

#splash {
  background-color: $primary;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>