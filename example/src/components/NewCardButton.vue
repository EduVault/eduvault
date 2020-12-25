<template>
  <div class="d-flex">
    <h2 class="mr-3">Card</h2>
    <font-awesome-icon
      class="button primary"
      icon="plus-square"
      size="2x"
      @click="$emit('newCard', emptyPayload)"
    ></font-awesome-icon>
  </div>
</template>

<script>
export default {
  data() {
    return {
      emptyPayload: {
        frontText: '',
        backText: '',
        deckId: '',
        _id: '',
      },
    };
  },
};
</script>

<style></style>
