export const cardSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  id: 'https://github.com/Jewcub/textile-flashcards',
  title: 'Card',
  type: 'object',
  properties: {
    _id: { type: 'string' },
    frontText: { type: 'string' },
    backText: { type: 'string' },
  },
};
