export { types } from '@eduvault/shared';
import { types } from '@eduvault/shared';
export interface AppAndTokenData extends types.IApp {
  id: string;
  decryptToken: string;
}

export interface AppTokenData {
  data: { id: string; decryptToken: string };
  iat: number;
  exp: number;
}
