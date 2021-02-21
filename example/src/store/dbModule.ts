/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { DBState, RootState, deckSchemaConfig, Deck } from '../types';
import { ActionContext } from 'vuex';
import router from '../router';
import EduVault, {
  Database,
  personRegister,
  devVerify,
  appRegister,
  Buckets,
} from '@eduvault/eduvault-js';
import defaultDeck from '../assets/defaultDeck.json';
import { APP_SECRET } from '../config';

const defaultState: DBState = {
  eduvault: undefined,
  appID: undefined,
  remoteReady: false,
};
const getDefaultState = () => {
  return defaultState;
};
export default {
  namespaced: true as const,
  state: getDefaultState(),
  getters: {},
  mutations: {
    CLEAR_STATE(state: DBState) {
      Object.assign(state, getDefaultState());
    },
    EDUVAULT(state: DBState, eduvault: EduVault) {
      state.eduvault = eduvault;
    },
    APP_ID(state: DBState, appID: string) {
      state.appID = appID;
    },
    REMOTE_READY(state: DBState, isReady: boolean) {
      state.remoteReady = isReady;
    },
    LOCAL_READY(state: DBState, isReady: boolean) {
      state.localReady = isReady;
    },
  },
  actions: {
    isLocalLoaded({ state }: ActionContext<DBState, RootState>) {
      // console.log(
      //   'db loaded, ',
      //   state.eduvault,
      //   state.eduvault?.db,
      //   state.eduvault?.db?.collections(),
      //   state.eduvault?.db?.collections().size.valueOf(),
      // );
      return (
        state.eduvault?.db?.collections()?.size.valueOf() &&
        state.eduvault?.db?.collections()?.size.valueOf() > 0
      );
      // also add a check for the deck content
    },
    isRemoteLoaded({ state }: ActionContext<DBState, RootState>) {
      // how to check
    },
    isAuthValid({ state }: ActionContext<DBState, RootState>) {
      console.log('auth valid', state.eduvault, state.eduvault?.privateKeyValid());
      const valid = state.eduvault && state.eduvault?.privateKeyValid() ? true : false;
      return valid;
    },

    async startLocal(context: ActionContext<DBState, RootState>) {
      console.log('starting local DB');
      if (await context.dispatch('isLocalLoaded')) return { error: 'db already loaded' };
      else {
        const eduvault = context.state.eduvault || new EduVault();
        const localDB = await eduvault.startLocalDB({
          collectionConfig: deckSchemaConfig,
          version: 1,
        });
        if ('error' in localDB) return { error: localDB.error };
        else {
          console.log('commiting eduvault', eduvault);
          context.commit('EDUVAULT', eduvault);
        }
        return localDB;
      }
    },
    async startRemote(context: ActionContext<DBState, RootState>) {
      try {
        console.log('starting remote DB');
        let eduvault: EduVault;
        if (context.state.eduvault && (await context.dispatch('isLocalLoaded')))
          eduvault = context.state.eduvault;
        else {
          const loadlLocalDB = await context.dispatch('startLocal');
          if ('error' in loadlLocalDB && loadlLocalDB.error !== 'db already loaded')
            return { error: loadlLocalDB.error };
          if (context.state.eduvault) {
            eduvault = context.state.eduvault;
          } else return { error: 'error loading local DB' };
        }
        const appID = context.state.appID || (await context.dispatch('setupApp'));
        if (!appID) {
          const error = 'unable to get appID, cannot start EduVault';
          console.log({ error });
          return { error };
        }
        const { privateKey, jwt, threadID, error } = await eduvault.loadCredentials({
          appID,
          log: true,
        });
        if (error || !privateKey || !jwt || !threadID || !eduvault.db) return { error };
        else {
          const remoteDBStart = await eduvault.startRemoteDB({
            db: eduvault.db,
            threadID,
            jwt,
            privateKey,
          });
          console.log({ remoteDBStart });
          if ('error' in remoteDBStart) return { error: remoteDBStart.error };
          else {
            context.commit('EDUVAULT', eduvault);
            return eduvault.db;
          }
        }
      } catch (error) {
        console.log({ error });
        return { error };
      }
    },
    /** This will not be needed in a real app, as the developer just needs to register their app one time */
    async setupApp(context: ActionContext<DBState, RootState>) {
      const accountID = 'person@email.com';
      const password = 'Password123';
      // console.log({ APP_SECRET });
      if (!APP_SECRET) return null;
      // to do: appregister req/res types
      const devPersonRegister = await personRegister({ accountID, password });
      console.log({ devPersonRegister });
      const dev = await devVerify(APP_SECRET, accountID);
      console.log({ dev });
      const appInfo = await appRegister(accountID, password, 'test app', 'a testing app');
      console.log({ appInfo });
      if (!appInfo) return null;
      if (appInfo.appID) {
        context.commit('APP_ID', appInfo.appID as string);
        return appInfo.appID as string;
      } else return null;
    },
    async loadDecks(context: ActionContext<DBState, RootState>) {
      const db = context.state.eduvault?.db;

      async function findDecks() {
        const decksArray: Deck[] = [];
        if (!db) return { error: 'db not found' };
        db?.collection('Decks')
          ?.find({})
          .each((instance: unknown) => {
            decksArray.push(instance as Deck);
          });
        return decksArray;
      }
      let decks = await findDecks();
      if (!('error' in decks) && decks.length === 0) {
        await db?.collection('Decks')?.create([defaultDeck]).save();
        decks = await findDecks();
      }
      return decks;
    },
  },
};
