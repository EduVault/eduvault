import EduVault, { Buckets, Database, JSONSchema, CollectionConfig } from '@eduvault/eduvault-js';

/** @param accountID will be an email for local scheme, for google and facebook will be email if available or id if not */
export interface Person {
  accountID: string;
  password?: string;
  pwEncryptedPrivateKey?: string;
  socialMediaPrivateKey?: string;
  pubKey?: string;
  threadIDStr?: string;
  DbInfo?: string;
  facebook?: SocialMediaAccount;
  google?: SocialMediaAccount;
  dotwallet?: DotwalletProfile;
  jwt?: string;
}
interface DotwalletProfile {
  pay_status: number;
  pre_amount: number;
  total_amount: number;
  person_address: string;
  person_avatar: string;
  person_name: string;
  person_open_id: string;
}
interface SocialMediaAccount {
  id?: string;
  token?: string;
  email?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
}
/** @param ttl Time To Live. Please set at now plus 1.5e10 (half year)  Unix epoch date at which can we safely delete the card without worrying about sync issues */
export interface Card {
  _id: string;
  frontText: string;
  backText: string;
  updatedAt: number;
  deleted?: boolean;
  ttl?: number;
}

/** @param ttl Time To Live. Please set at now plus 1.5e10 (half year)  Unix epoch date at which can we safely delete the card without worrying about sync issues */
export interface Deck {
  _id: string;
  cards: Card[];
  title: string;
  updatedAt: number;
  deleted?: boolean;
  ttl?: number;
}
export const deckSchemaOld = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  id: 'https://github.com/Jewcub/textile-app',
  title: 'Deck',
  type: 'object',
  required: ['_id'],

  definitions: {
    card: {
      title: 'Card',
      type: 'object',
      properties: {
        _id: { type: 'string' },
        frontText: { type: 'string' },
        backText: { type: 'string' },
        updatedAt: { type: 'integer' },
      },
    },
  },
  properties: {
    _id: { type: 'string' },
    title: { type: 'string' },
    updatedAt: { type: 'integer' },
    cards: {
      type: 'array',
      items: { $ref: '#/definitions/card' },
      default: [],
    },
  },
};

export interface EditCardPayload {
  card: Card;
  deckId: string;
}

export interface DecksState {
  decks: Deck[];
}

export interface DBState {
  eduvault?: EduVault;
  appID?: string;
  remoteReady?: boolean;
  localReady?: boolean;
}

export interface RootState {
  decksMod: DecksState;
  dbMod: DBState;
}

export const cardSchema: JSONSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Card',
  type: 'object',
  properties: {
    _id: { type: 'string' },
    frontText: { type: 'string' },
    backText: { type: 'string' },
    updatedAt: { type: 'integer' },
  },
};
export const deckSchema: JSONSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Deck',
  type: 'object',
  properties: {
    _id: { type: 'string' },
    title: { type: 'string' },
    updatedAt: { type: 'integer' },
    cards: {
      type: 'array',
      items: [cardSchema],
    },
  },
};
export const deckSchemaConfig: CollectionConfig = {
  name: 'Decks',
  schema: deckSchema,
};
