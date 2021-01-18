<template>
  <div>
    <h1>Welcome to Eduvault Home</h1>
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
<style scoped>
</style>