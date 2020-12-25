<template>
  <div class="deck-display">
    <div class="deck-display__title-div d-flex justify-content-center">
      <h2 class="deck-display__title title">
        {{ deck.title }}
      </h2>
      <div>
        <b-dropdown
          id="deck-dropdown"
          text=""
          size="md"
          variant="outline"
          class="deck-display__title dropdown ml-2"
        >
          <b-dropdown-item @click="$emit('deleteDeck', deck._id)">Delete Deck</b-dropdown-item>
          <!-- <b-dropdown-item>Rename</b-dropdown-item>
          <b-dropdown-item>Share to Co-Edit</b-dropdown-item>
          <b-dropdown-item>Share as Copy</b-dropdown-item> -->
        </b-dropdown>
      </div>
    </div>

    <div v-for="card in cards" :key="card._id" class="deck-display__card-container card-container">
      <flashcard
        class="deck-display__flashcard"
        :front="card.frontText"
        :back="card.backText"
      ></flashcard>
      <div class="deck-display__buttons-col buttons-col">
        <font-awesome-icon
          class="buttons-col__button buttons-col__button--edit button"
          size="2x"
          icon="edit"
          @click="
            $emit('openCardEditor', {
              frontText: card.frontText,
              backText: card.backText,
              _id: card._id,
              deckId: deck._id,
            })
          "
        ></font-awesome-icon>
        <font-awesome-icon
          class="buttons-col__button buttons-col__button--delete button"
          size="2x"
          icon="trash-alt"
          @click="
            $emit('deleteCard', {
              card: {
                frontText: card.frontText,
                backText: card.backText,
                _id: card._id,
                deleted: true,
                ttl: new Date().getTime() + 1.5e10,
              },

              deckId: deck._id,
            })
          "
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import TheFlashcard from '@/components/TheFlashcard.vue';
import { BDropdown, BDropdownItem } from 'bootstrap-vue';
import { Card, Deck } from '@/types';
export default Vue.extend({
  components: { flashcard: TheFlashcard, BDropdown, BDropdownItem },
  props: {
    deck: {
      type: Object as () => Deck, // https://frontendsociety.com/using-a-typescript-interfaces-and-types-as-a-prop-type-in-vuejs-508ab3f83480
      default() {
        return {
          cards: [] as Card[],
          title: 'Default Deck',
          _id: '',
          deleted: true,
          ttl: 1596161096048,
        };
      },
    },
  },
  computed: {
    cards() {
      return this.deck.cards.filter(card => !card.deleted);
    },
  },
});
</script>

<style lang="scss">
.deck-display {
  text-align: center;
  border-left: 1px dashed #868686;
  padding: 15px;
  border-right: 1px dashed #868686;
}
.deck-display__card-container {
  margin: auto;
}
.deck-display__flashcard {
  margin: 20px;
}
.card-container {
  display: flex;
  max-width: 600px;
}
.buttons-col {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}
</style>
