<template>
  <div class="home">
    <section class="home-section editing-section">
      <new-deck-button @newDeck="state.showDeckEditor = true"></new-deck-button>
      <new-card-button
        @newCard="
          state.newCard = true;
          state.showCardEditor = true;
        "
      ></new-card-button>
      <deck-editor
        v-if="state.showDeckEditor"
        class="editing-section__deck-input"
        @createDeck="createDeck"
        @closeDeckEditor="state.showDeckEditor = false"
      ></deck-editor>
    </section>
    <section class="home-section display-section">
      <deck-display
        v-for="deck in decks"
        :key="deck._id"
        class="display-section__deck-display"
        :deck="deck"
        @deleteDeck="deleteDeck"
        @deleteCard="deleteCard"
        @openCardEditor="openCardEditor"
      ></deck-display>
    </section>
    <card-editor
      v-if="state.showCardEditor"
      class="display-section__card-editor"
      :decks="decks"
      :selected-deck="state.selectedDeck"
      :new-card="state.newCard"
      :edit-payload="state.editPayload"
      @closeEditor="
        state.showCardEditor = false;
        state.newCard = false;
      "
      @addCard="addNewCard"
      @editCard="editCard"
      @changeSelectedDeck="changeSelectedDeck"
    ></card-editor>
  </div>
</template>

<script lang="ts">
import {
  reactive,
  computed,
  onBeforeMount,
  onMounted,
  onBeforeUnmount,
  ComputedRef,
} from '@vue/composition-api';

import { Deck, EditCardPayload } from '../types';
import store from '../store';
import router from '../router';

import CardEditor from '../components/CardEditor.vue';
import DeckEditor from '../components/DeckEditor.vue';
import DeckDisplay from '../components/DeckDisplay.vue';
import NewCardButton from '../components/NewCardButton.vue';
import NewDeckButton from '../components/NewDeckButton.vue';
import defaultDeck from '../assets/defaultDeck.json';

export default {
  name: 'ComposVuexPersist',
  components: { DeckDisplay, DeckEditor, CardEditor, NewCardButton, NewDeckButton },
  setup() {
    onBeforeUnmount(() => {
      //
    });
    // onMounted(async () => {});
    async function loadDecks() {
      const loadedDecks = await store.dispatch.dbMod.loadDecks();
      console.log({ loadedDecks });
    }
    const db = store.state.dbMod.eduvault;
    if (!db) {
      console.log('local db decks not found');
    }
    const decks = computed(() => {
      if (!db) return [defaultDeck];
      else {
        loadDecks();

        let decksArray: Deck[] = [];
        db.db
          ?.collection('Decks')
          ?.find({})
          .each((instance: unknown) => {
            decksArray.push(instance as Deck);
          });
        return decksArray;
      }
    });

    const emptyPayload = {
      card: { _id: '', updatedAt: 0, frontText: '', backText: '' },
      deckId: '',
    };
    const state = reactive({
      selectedDeck: decks ? (decks.value[0] as Deck) : undefined,
      showCardEditor: false as boolean,
      showDeckEditor: false as boolean,
      editPayload: emptyPayload as EditCardPayload,
      newCard: false as boolean,
    });

    const createDeck = async function (deck: Deck) {
      // await store.dispatch.decksMod.deckMergeToState({ decks: [deck], skipThreadMerge: false });
      state.selectedDeck = deck;
      state.showDeckEditor = false;
    };
    const deleteDeck = (deckId: string) => {
      store.dispatch.decksMod.deleteDeck(deckId);
    };
    const addNewCard = (payload: EditCardPayload) => {
      store.dispatch.decksMod.addCard(payload);
      state.showCardEditor = false;
      state.newCard = false;
    };
    const editCard = (payload: EditCardPayload) => {
      store.dispatch.decksMod.editCard(payload);
      state.showCardEditor = false;
      state.newCard = false;
    };
    const deleteCard = (payload: EditCardPayload) => {
      store.dispatch.decksMod.editCard(payload);
    };
    const changeSelectedDeck = (deckId: string) => {
      console.log('changeSelectedDeck', deckId);
      decks.value.forEach((deck) => {
        if (deck._id === deckId) state.selectedDeck = deck;
      });
    };
    const openCardEditor = (payload: EditCardPayload) => {
      if (!state.newCard) state.editPayload = payload;
      else state.editPayload = emptyPayload;
      state.showCardEditor = true;
    };

    return {
      decks,
      state,
      createDeck,
      deleteDeck,
      addNewCard,
      emptyPayload,
      editCard,
      deleteCard,
      changeSelectedDeck,
      openCardEditor,
    };
  },
};
</script>
