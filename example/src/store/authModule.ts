import { AuthState, RootState, Deck } from '../types';
import { ActionContext } from 'vuex';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import store from '../store';
// import { ApiRes } from '../types';
import router from '@/router';
import { Libp2pCryptoIdentity } from '@textile/threads-core';
import { ThreadID } from '@textile/hub';
import CryptoJS from 'crypto-js';
import { saveLoginData, passwordRehydrate, socialMediaRehydrate } from './utils';
import { API_URL_ROOT, DEV_API_URL_ROOT, PASSWORD_LOGIN } from '../config';
import { connectClient } from '../store/textileHelpers';
// import localForage from 'localforage';
import Vue from 'vue';
import VueCookies from 'vue-cookies';
Vue.use(VueCookies);

const defaultState: AuthState = {
  loggedIn: false,
  syncing: false,
  API_URL:
    process.env.NODE_ENV === 'production'
      ? 'https://' + API_URL_ROOT
      : 'http://' + DEV_API_URL_ROOT,
  API_WS_URL:
    process.env.NODE_ENV === 'production' ? 'wss://' + API_URL_ROOT : 'ws://' + DEV_API_URL_ROOT,
  PASSWORD_LOGIN: PASSWORD_LOGIN,
  keyPair: undefined,
  authType: undefined,
  jwt: undefined,
  pubKey: undefined,
  threadID: undefined,
  threadIDStr: undefined,
  jwtEncryptedKeyPair: undefined,
};
const getDefaultState = () => {
  return defaultState;
};

export default {
  namespaced: true as true,
  state: getDefaultState(),
  getters: {
    loggedIn: (state: AuthState) => state.loggedIn,
    syncing: (state: AuthState) => state.syncing,
  },
  mutations: {
    CLEAR_STATE(state: AuthState) {
      Object.assign(state, getDefaultState());
    },
    RESET_STATE(state: AuthState, newstate: AuthState) {
      Object.assign(state, newstate);
    },
    AUTHTYPE(state: AuthState, type: 'google' | 'facebook' | 'dotwallet' | 'password') {
      state.authType = type;
    },
    LOGGEDIN(state: AuthState, bool: boolean) {
      state.loggedIn = bool;
    },
    SYNCING(state: AuthState, bool: boolean) {
      state.syncing = bool;
    },
    KEYPAIR(state: AuthState, keyPair: Libp2pCryptoIdentity | undefined) {
      state.keyPair = keyPair;
    },
    JWT(state: AuthState, jwt: string | undefined) {
      state.jwt = jwt;
    },
    PUBKEY(state: AuthState, key: string | undefined) {
      state.pubKey = key;
    },
    THREAD_ID(state: AuthState, ID: ThreadID | undefined) {
      state.threadID = ID;
    },
    THREAD_ID_STR(state: AuthState, ID: string | undefined) {
      state.threadIDStr = ID;
    },
    BUCKET_KEY(state: AuthState, key: string | undefined) {
      state.bucketKey = key;
    },
    BUCKET_URL(state: AuthState, url: string | undefined) {
      state.bucketUrl = url;
    },
    JWT_ENCRYPTED_KEYPAIR(state: AuthState, jwtEncryptedKeyPair: string | undefined) {
      state.jwtEncryptedKeyPair = jwtEncryptedKeyPair;
    },
  },
  actions: {
    async passwordAuth(
      { state }: ActionContext<AuthState, RootState>,
      payload: { password: string; username: string; signup: boolean }
    ) {
      try {
        const options = {
          url: state.API_URL + state.PASSWORD_LOGIN,
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'X-Forwarded-Proto': 'https',
          },
          method: 'POST',
          data: {
            username: payload.username,
            password: CryptoJS.SHA256(payload.password).toString(),
          } as any,
        } as AxiosRequestConfig;
        if (payload.signup) {
          const keyPair = await Libp2pCryptoIdentity.fromRandom();
          const pubKey = keyPair.public.toString();
          store.commit.authMod.PUBKEY(pubKey);
          const encryptedKeyPair = CryptoJS.AES.encrypt(
            keyPair.toString(),
            payload.password
          ).toString();
          const newThreadID = ThreadID.fromRandom();
          options.data.threadIDStr = newThreadID.toString();
          options.data.encryptedKeyPair = encryptedKeyPair;
          options.data.pubKey = pubKey;
        }

        const response = await axios(options);
        const responseData = response.data;
        console.log('login cookie: ' + JSON.stringify(Vue.$cookies.get('koa.sess')));
        console.log('login/signup data: ' + JSON.stringify(responseData));
        if (responseData.code !== 200) {
          if (responseData.message) return responseData.message;
          else return 'Unable to connect to database';
        } else {
          const loginData = responseData.data;
          // console.log('loginData', loginData);
          await saveLoginData(loginData, payload.password);
          router.push('/home');
          return 'success';
        }
      } catch (err) {
        console.log(err);
        console.log(err.response);
        if (err.response && err.response.data && err.response.data.message)
          return err.response.data.message;
        else return 'Issue connecting to database';
      }
    },
    async logout({ state }: ActionContext<AuthState, RootState>) {
      const options: AxiosRequestConfig = {
        url: state.API_URL + '/logout',
        method: 'GET',
        headers: {
          'X-Forwarded-Proto': 'https',
        },
        withCredentials: true,
      };
      await axios(options);
      store.commit.authMod.CLEAR_STATE();
      store.commit.authMod.LOGGEDIN(false);
      store.commit.decksMod.CLEAR_STATE();
      console.log(store.state.decksMod);
      // localStorage.setItem('vuex', '');
      router.push('/login/?checkauth=no');
    },
    async rehydrateUser({ state }: ActionContext<AuthState, RootState>) {
      try {
        // const restoredStore = JSON.parse(localStorage.getItem('sourcelink')!);
        // await console.log('store', store);
        const jwt = state.jwt;
        const keyPair = state.keyPair;
        const threadID = state.threadID;
        // console.log('jwt, keyPair, threadID', jwt, keyPair, threadID);
        // console.log(jwt && keyPair && threadID);
        // if we don't have an identity, check for jwt and localstorage,
        if (jwt && keyPair && threadID) {
          try {
            if (!store.state.decksMod.client) throw 'not connected';
            const threadsList = await store.state.decksMod.client.listThreads();
            // console.log('authcheck threadsList', threadsList);
            store.commit.authMod.LOGGEDIN(true);
          } catch (error) {
            store.dispatch.authMod.initialize({
              jwt: jwt,
              keyPair: keyPair,
              threadID: threadID,
              retry: 0,
            });
          }

          return true;
        } else {
          // console.log('state.authType', state.authType);
          if (state.authType === 'password') {
            return await passwordRehydrate(
              state.jwtEncryptedKeyPair,
              state.pubKey,
              state.threadIDStr,
              state.jwt
            );
          } else if (
            state.authType === 'dotwallet' ||
            state.authType === 'google' ||
            state.authType === 'facebook'
          ) {
            return await socialMediaRehydrate(
              state.jwtEncryptedKeyPair,
              state.pubKey,
              state.threadIDStr,
              state.jwt,
              state.authType
            );
          }
        }
      } catch (err) {
        console.log(err);
        console.log('other error: ' + JSON.stringify(err, err.message));
        return false;
      }
    },
    async checkAuth({ state }: ActionContext<AuthState, RootState>): Promise<boolean | undefined> {
      try {
        const options: AxiosRequestConfig = {
          url: state.API_URL + '/auth-check',
          headers: {
            'X-Forwarded-Proto': 'https',
          },
          method: 'GET',
          withCredentials: true,
        };
        // console.log('check auth cookie: ' + JSON.stringify(Vue.$cookies.get('eduvault.sess')));
        const authCheck = await axios(options);
        // console.log(authCheck.data);
        if (authCheck.data.code === 200) {
          store.commit.authMod.LOGGEDIN(true);
          return true;
        } else {
          store.commit.authMod.LOGGEDIN(false);
          console.log('authcheck failed (likely no cookie)');
          return false;
        }
      } catch (err) {
        console.log(err);
        console.log('other error: ' + JSON.stringify(err, err.message));
        return false;
      }
    },

    async getUser({ state }: ActionContext<AuthState, RootState>) {
      try {
        const options: AxiosRequestConfig = {
          url: state.API_URL + '/get-user',
          headers: {
            'X-Forwarded-Proto': 'https',
          },
          method: 'GET',
          withCredentials: true,
        };
        const response = await axios(options);
        console.log('get-user', response.data);
        if (!response.data || !response.data.data || !response.data.data.jwt) return null;
        else return response.data.data;
      } catch (err) {
        console.log(err);
        return null;
      }
    },
    async initialize(
      { state }: ActionContext<AuthState, RootState>,
      payload: {
        jwt: string;
        keyPair: Libp2pCryptoIdentity;
        threadID: ThreadID;
        retry: number;
      }
    ) {
      console.log('payload.retry', payload.retry);
      if (payload.retry > 1) {
        alert('Error connecting to database');
      } else if (payload.jwt && payload.keyPair && payload.threadID) {
        try {
          const client = await connectClient(
            state.API_WS_URL + '/ws/auth',
            payload.jwt,
            payload.keyPair,
            payload.threadID
          );
          if (client) {
            await store.commit.decksMod.CLIENT(client);
            await store.dispatch.decksMod.setUpListening();
            // sync all remote instances with our local ones
            await store.dispatch.decksMod.deckMergeToThread(store.state.decksMod.decks);
          } else throw 'unable to connect to Threads DB';
        } catch (err) {
          if (
            err == 'unable to connect to Threads DB' ||
            err == 'error connecting to ThreadDB client'
          ) {
            payload.retry++;
            store.dispatch.authMod.initialize(payload);
          }
          console.log(err);
        }
      } else {
        payload.retry++;
        store.dispatch.authMod.initialize(payload);
      }
    },
  },
};
