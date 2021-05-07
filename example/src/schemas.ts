import { Database, JSONSchema } from '@eduvault/eduvault-js';

export const cardSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  id: 'https://github.com/eduvault/textile-flashcards',
  title: 'Card',
  type: 'object',
  properties: {
    _id: { type: 'string' },
    frontText: { type: 'string' },
    backText: { type: 'string' },
  },
};

export const deckSchema: JSONSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  id: 'https://github.com/eduvault/textile-flashcards',
  title: 'Deck',
  type: 'object',
  definitions: {
    card: {
      title: 'Card',
      type: 'object',
      properties: {
        _id: { type: 'string' },
        frontText: { type: 'string' },
        backText: { type: 'string' },
      },
    },
  },
  properties: {
    _id: { type: 'string' },
    title: { type: 'string' },
    cards: {
      type: 'array',
      items: { $ref: '#/definitions/card' },
      default: [],
    },
  },
};
// testClient.newCollection('sdf', { name: 'sdf', schema: deckSchema });
// const testDB = new Database('sdfs', { name: 'sdf', schema: deckSchema });

// complex schema with refs
// doesn't work yet
export const fullSchema: JSONSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  id: 'https://github.com/eduvault/textile-flashcards',
  definitions: {
    card: {
      title: 'Card',
      type: 'object',
      properties: {
        _id: { type: 'string' },
        frontText: { type: 'string' },
        backText: { type: 'string' },
      },
    },
    deck: {
      id: 'https://github.com/eduvault/textile-flashcards/deck',
      title: 'Deck',
      type: 'object',
      properties: {
        _id: { type: 'string' },
        title: { type: 'string' },
        cards: {
          type: 'array',
          items: { $ref: '#/definitions/card' },
          default: [],
        },
      },
    },
  },
  card: {
    title: 'Card',
    type: 'object',
    properties: { $ref: '#/definitions/card' },
  },
  deck: {
    title: 'Deck',
    type: 'object',
    properties: { $ref: '#/definitions/deck' },
  },
  decks: {
    title: 'Deck',
    type: 'array',
    items: { $ref: '#/definitions/deck' },
  },
};
