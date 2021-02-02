import { DecksState, RootState, Deck, EditCardPayload, Card } from '../types';
import { ActionContext } from 'vuex';
import store from './index';
import defaultDeck from '../assets/defaultDeck.json';

const defaultState: DecksState = {
  decks: [defaultDeck],
  backlog: [] as Deck[],
  // client: undefined,
};
const getDefaultState = () => {
  return defaultState;
};
export default {
  namespaced: true as const,
  state: getDefaultState(),
  getters: {
    decks: (state: DecksState) => {
      // console.log('decks changed in store');
      return state.decks;
    },
  },
  mutations: {
    CLEAR_STATE(state: DecksState) {
      Object.assign(state, getDefaultState());
    },

    /** Add or update a list of decks */
    DECKS(state: DecksState, decks: Deck[]) {
      decks.forEach((deck) => {
        const exists = state.decks.map((stateDeck) => stateDeck._id).includes(deck._id);
        if (!exists) state.decks.push(deck);
        else
          state.decks.forEach((stateDeck) => {
            if (stateDeck._id === deck._id) {
              state.decks.splice(state.decks.indexOf(stateDeck), 1, deck);
            }
          });
      });
    },
    deleteDeck(state: DecksState, deckId: string) {
      state.decks.forEach((deck) => {
        if (deck._id == deckId) {
          const replaceDeck = { ...deck };
          replaceDeck.deleted = true;
          replaceDeck.ttl = new Date().getTime() + 1.5e10;
          replaceDeck.updatedAt = new Date().getTime();
          state.decks.splice(state.decks.indexOf(deck), 1, replaceDeck);
        }
      });
    },
    addCard(state: DecksState, payload: EditCardPayload) {
      const newCard: Card = payload.card;
      for (const deck of state.decks) {
        if (deck._id === payload.deckId) {
          deck.cards.push(newCard);
          deck.updatedAt = new Date().getTime();
          break;
        }
      }
    },

    editCard(state: DecksState, payload: EditCardPayload) {
      state.decks.forEach((stateDeck) => {
        if (stateDeck._id === payload.deckId) {
          stateDeck.cards.forEach((stateCard) => {
            if (stateCard._id === payload.card._id) {
              const replaceCard = { ...payload.card };
              stateDeck.updatedAt = new Date().getTime();
              stateDeck.cards.splice(stateDeck.cards.indexOf(stateCard), 1, replaceCard);
              return;
            }
          });
          return;
        }
      });
    },
  },
  actions: {
    async init({ state }: ActionContext<DecksState, RootState>) {
      store.commit.decksMod.CLEAR_STATE();
    },
    async addCard({ state }: ActionContext<DecksState, RootState>, payload: EditCardPayload) {
      await store.commit.decksMod.addCard(payload);
    },
    async editCard({ state }: ActionContext<DecksState, RootState>, payload: EditCardPayload) {
      await store.commit.decksMod.editCard(payload);
    },
    async deleteDeck({ state }: ActionContext<DecksState, RootState>, deckId: string) {
      await store.commit.decksMod.deleteDeck(deckId);
    },
  },
};
