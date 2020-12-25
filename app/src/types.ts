import { Client, ThreadID, Buckets, Identity } from '@textile/hub';
// import { DBInfo } from '@textile/threads';

/** @param username will be an email for local scheme, for google and facebook will be email if available or id if not */
export interface User {
  username: string;
  password?: string;
  encryptedKeyPair?: string;
  socialMediaKeyPair?: string;
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
  user_address: string;
  user_avatar: string;
  user_name: string;
  user_open_id: string;
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
export const deckSchema = {
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

export interface AuthState {
  API_URL: string;
  API_WS_URL: string;
  PASSWORD_LOGIN: string;
  loggedIn: boolean;
  syncing: boolean;
  keyPair?: Identity;
  authType?: 'google' | 'facebook' | 'password' | 'metamask' | 'dotwallet';
  jwt?: string;
  pubKey?: string;
  threadID?: ThreadID;
  threadIDStr?: string;
  bucketKey?: string;
  bucketUrl?: string;
  jwtEncryptedKeyPair?: string;
}
export interface DecksState {
  decks: Deck[];
  client?: Client;
  buckets?: Buckets;
  backlog?: Deck[];
}
export interface RootState {
  authMod: AuthState;
  decksMod: DecksState;
}

// export interface ApiRes<T> {
//   data: T;
//   code: number;
//   message: string;
// }
// export interface PasswordRes {
//   username: string;
//   _id: string;
//   token: string;
// }
