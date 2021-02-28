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
        v-for="deck in state.decks"
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
      :decks="state.decks"
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
  defineComponent,
  reactive,
  ref,
  computed,
  onBeforeMount,
  onMounted,
  onBeforeUnmount,
  ComputedRef,
  PropOptions,
  watch,
  Data,
} from '@vue/composition-api';

import { Card, Deck, EditCardPayload } from '../types';
import EduVault, { Collection } from '@eduvault/eduvault-js/dist/main';

import CardEditor from '../components/CardEditor.vue';
import DeckEditor from '../components/DeckEditor.vue';
import DeckDisplay from '../components/DeckDisplay.vue';
import NewCardButton from '../components/NewCardButton.vue';
import NewDeckButton from '../components/NewDeckButton.vue';

import { loadDecks } from '../eduvaultHelpers';

export default defineComponent({
  name: 'ComposVuexPersist',
  components: { DeckDisplay, DeckEditor, CardEditor, NewCardButton, NewDeckButton },
  props: {
    eduvault: { type: Object as () => EduVault },
    decksProp: { type: Array as () => Deck[] },
    remoteLoaded: { type: Boolean, default: false },
  },

  setup({ decksProp, eduvault, remoteLoaded }) {
    console.log({ decksProp, eduvault, remoteLoaded });
    const Deck = eduvault?.db?.collection<Deck>('deck');
    if (!eduvault || !Deck) return;
    // onMounted(async () => {});
    const emptyPayload = {
      card: { _id: '', updatedAt: 0, frontText: '', backText: '' },
      deckId: '',
    };
    const state = reactive({
      remoteLoaded: remoteLoaded,
      decks: decksProp,
      selectedDeck: decksProp ? decksProp[0] : undefined,
      showCardEditor: false,
      showDeckEditor: false,
      editPayload: emptyPayload,
      newCard: false,
    });

    const refreshLocal = async () => {
      let decks;
      if (eduvault.db) decks = await loadDecks(eduvault);
      if (decks && !('error' in decks)) state.decks = decks;
    };
    const sync = async (collectionName: Collection['name'], debounce = 5000) => {
      const changes = await eduvault.sync<Deck>(collectionName, debounce);
      // const decks = await loadDecks(eduvault);
      await refreshLocal();
      return changes;
    };
    const remoteLoad = ref(remoteLoaded);
    watch(
      () => remoteLoad,
      async () => {
        console.log({ remoteLoaded });
        sync('deck', 0);
      },
    );
    refreshLocal();
    const createDeck = async (deck: Deck) => {
      const newDeck = await Deck?.create(deck).save();
      await refreshLocal();
      const changed = sync(Deck.name);
      // console.log('added deck', { newDeck, changed });
      state.selectedDeck = deck;
      state.showDeckEditor = false;
      // console.log(await Deck?.count({}));
    };
    const deleteDeck = async (deckId: string) => {
      await Deck.delete(deckId);
      await refreshLocal();
      const changed = sync(Deck.name);
      // console.log('deleted deck', { changed });
    };
    const addNewCard = async (payload: EditCardPayload) => {
      state.newCard = false;
      state.showCardEditor = false;
      const deck = await Deck.findOne({ _id: payload.deckId });
      if (!deck) return;
      deck.cards.push(payload.card);
      await Deck.save(deck);
      await refreshLocal();
      const changed = sync(Deck.name);
      // console.log('added Card', { changed });
    };
    const editCard = async (payload: EditCardPayload) => {
      state.newCard = false;
      state.showCardEditor = false;
      const deck = await Deck.findOne({ _id: payload.deckId });
      if (!deck) return;
      for (let card of deck.cards) {
        if (card._id === payload.card._id) {
          deck.cards.slice(deck.cards.indexOf(card), 1);
          deck.cards.unshift(payload.card);
          break;
        }
      }
      await Deck.save(deck);
      await refreshLocal();
      sync(Deck.name);
    };
    const deleteCard = async (payload: EditCardPayload) => {
      // something funky here....

      console.log('delete card', { payload });
      const deck = await Deck.findOne({ _id: payload.deckId });
      console.log({ deck });
      if (!deck) return;
      let replacementCards = deck.cards.filter((card) => card._id !== payload.card._id);
      console.log({ replacementCards });
      deck.cards = replacementCards;
      console.log({ deck });

      await Deck.save(deck);
      await refreshLocal();
      sync(Deck.name);
    };
    const changeSelectedDeck = (deckId: string) => {
      console.log('changeSelectedDeck', deckId);
      state.decks?.forEach((deck) => {
        if (deck._id === deckId) state.selectedDeck = deck;
      });
    };
    const openCardEditor = (payload: EditCardPayload) => {
      if (!state.newCard) state.editPayload = payload;
      else state.editPayload = emptyPayload;
      state.showCardEditor = true;
    };

    return {
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
});
</script>
