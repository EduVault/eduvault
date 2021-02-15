import { CollectionConfig } from '@textile/threaddb/dist/esm/local/collection';
import { JSONSchema } from '@textile/threaddb';

export const dummyPersonSchema: JSONSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  title: 'person',
  properties: {
    _id: {
      type: 'string',
    },
    accountID: {
      type: 'string',
    },
    birthDay: {
      type: 'number',
    },
  },
  required: ['_id', 'accountID', 'birthDay'],
};

export const dummyCollections: CollectionConfig[] = [
  {
    name: 'Person',
    schema: dummyPersonSchema,
  },
  {
    name: 'Person2',
    schema: dummyPersonSchema,
  },
];
