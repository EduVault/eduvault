<template>
  <div class="d-flex">
    <h2 class="mr-3">Deck</h2>
    <font-awesome-icon
      class="button primary"
      icon="plus-square"
      size="2x"
      @click="$emit('newDeck')"
    ></font-awesome-icon>
  </div>
</template>

<script>
export default {};
</script>
