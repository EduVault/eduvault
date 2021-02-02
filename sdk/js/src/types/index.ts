import { CollectionConfig } from '@textile/threaddb/dist/esm/local/collection';
import { JSONSchema } from '@textile/threaddb';

export interface AppRegisterReq {
  accountID: string;
  password: string;
  name: string;
  description?: string;
}

export interface AppUpdateReq {
  accountID: string;
  password: string;
  appID: string;
  name?: string;
  description?: string;
  authorizedDomains?: string[];
  persons?: string[];
}
export interface DevVerifyReq {
  appSecret: string;
  devID: string;
}

export interface ApiRes<T> {
  data: T;
  code: number;
  message: string;
}
export interface AppAuthRes {
  jwt: string;
  oldJwt: string;
  decryptToken: string;
}
export interface AppAuthReq {
  appLoginToken: string;
  appID: string;
}

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
