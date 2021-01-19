import {
  ApiRes,
  AuthState,
  IPerson,
  PasswordLoginReq,
  PasswordLoginRes,
  RootState,
} from '../types';
import { ActionContext, Getter } from 'vuex';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import store from '../store';
import router from '@/router';
import { ThreadID, PrivateKey } from '@textile/hub';
import CryptoJS from 'crypto-js';
import {
  encrypt,
  decrypt,
  storePersistentAuthData,
  storeNonPersistentAuthData,
  testKeyPair,
  rehydratePrivateKey,
  setQueriesForSocialMediaRedirect,
  getQueriesForSocialMediaRedirect,
} from './utils';
import {
  API_URL_ROOT,
  DEV_API_URL_ROOT,
  PASSWORD_LOGIN,
  FACEBOOK_AUTH,
  GOOGLE_AUTH,
  DOTWALLET_AUTH,
} from '../config';
// import { connectClient } from '../store/textileHelpers';
// import localForage from 'localforage';
import Vue from 'vue';
import Vuecookies from 'vue-cookies';
Vue.use(Vuecookies);

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
  namespaced: true as const,
  state: getDefaultState(),
  getters: {
    cookies: () => Vue.$cookies.get('koa.sess'),
    loggedIn: (state: AuthState): boolean => state.loggedIn,
    syncing: (state: AuthState): boolean => state.syncing,
  },
  mutations: {
    CLEAR_STATE(state: AuthState): void {
      Object.assign(state, getDefaultState());
    },
    RESET_STATE(state: AuthState, newstate: AuthState): void {
      Object.assign(state, newstate);
    },

    LOGGEDIN(state: AuthState, bool: boolean): void {
      state.loggedIn = bool;
    },
    SYNCING(state: AuthState, bool: boolean): void {
      state.syncing = bool;
    },
    KEYPAIR(state: AuthState, keyPair: PrivateKey | undefined): void {
      state.keyPair = keyPair;
    },
    JWT(state: AuthState, jwt: string | undefined): void {
      state.jwt = jwt;
    },
    // These four are the ones we need to rehydrate. store in local storage in case vuexpersist is sketchy
    AUTHTYPE(
      state: AuthState,
      type: 'google' | 'facebook' | 'dotwallet' | 'password' | 'metamask' | undefined,
    ): void {
      if (type) localStorage.setItem('authType', type);
      state.authType = type;
    },
    PUBKEY(state: AuthState, key: string | undefined): void {
      if (key) localStorage.setItem('pubKey', key);
      state.pubKey = key;
    },
    PW_ENCRYPTED_KEYPAIR(state: AuthState, pwEncryptedKeyPair: string | undefined): void {
      if (pwEncryptedKeyPair) localStorage.setItem('pwEncryptedKeyPair', pwEncryptedKeyPair);
      state.pwEncryptedKeyPair = pwEncryptedKeyPair;
    },
    JWT_ENCRYPTED_KEYPAIR(state: AuthState, jwtEncryptedKeyPair: string | undefined): void {
      if (jwtEncryptedKeyPair) localStorage.setItem('jwtEncryptedKeyPair', jwtEncryptedKeyPair);
      state.jwtEncryptedKeyPair = jwtEncryptedKeyPair;
    },
    THREAD_ID_STR(state: AuthState, ID: string | undefined): void {
      if (ID) localStorage.setItem('threadIDStr', ID);
      state.threadIDStr = ID;
    },
    THREAD_ID(state: AuthState, ID: ThreadID | undefined): void {
      state.threadID = ID;
    },
    BUCKET_KEY(state: AuthState, key: string | undefined): void {
      state.bucketKey = key;
    },
    BUCKET_URL(state: AuthState, url: string | undefined): void {
      state.bucketUrl = url;
    },

    CODE(state: AuthState, code: string | undefined): void {
      state.code = code;
    },
    REDIRECT_URL(state: AuthState, url: string | undefined): void {
      state.redirectURL = url;
    },
  },
  actions: {
    async pwLogin(
      { state }: ActionContext<AuthState, RootState>,
      payload: {
        password: string;
        accountID: string;
        redirectURL?: string;
        code?: string;
      },
    ): Promise<string | undefined> {
      try {
        console.log('API url ==========,', state.API_URL + state.PASSWORD_LOGIN);
        // new person info. generate each time, even if they are a returning person. if they are a returning person the server will just ignore this info. this lets us have a single endpoint for login/signup
        const keyPair = await PrivateKey.fromRandom();
        const pubKey = keyPair.public.toString();
        const pwEncryptedKeyPair = encrypt(keyPair.toString(), payload.password);
        const newThreadID = ThreadID.fromRandom();

        const loginData: PasswordLoginReq = {
          accountID: payload.accountID,
          password: CryptoJS.SHA256(payload.password).toString(),
          threadIDStr: newThreadID.toString(),
          pwEncryptedKeyPair: pwEncryptedKeyPair,
          pubKey: pubKey,
        };

        const options: AxiosRequestConfig = {
          url: state.API_URL + state.PASSWORD_LOGIN,
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'X-Forwarded-Proto': 'https',
          },
          method: 'POST',
          data: loginData,
        };

        const response = await axios(options);
        const responseData = response.data;
        console.log('login cookie: ' + JSON.stringify(Vue.$cookies.get('koa.sess')));
        console.log('login/signup data: ' + JSON.stringify(responseData));
        if (responseData.code !== 200) {
          if (responseData.message) return responseData.message;
          else return 'Unable to connect to database';
        } else {
          const loginRes: PasswordLoginRes = responseData.data;
          console.log('login result Data', loginRes);
          const retrievedKeyStr = decrypt(loginRes.pwEncryptedKeyPair, payload.password);
          if (!retrievedKeyStr) return 'Could not decrypt KeyPair';
          const retrievedKey = await rehydratePrivateKey(retrievedKeyStr);
          if (!retrievedKey || !testKeyPair(retrievedKey, loginRes.pubKey))
            return 'Could not retrieve KeyPair';
          const jwts = await store.dispatch.authMod.getJwt();
          if (!jwts || !jwts.jwt) return 'coud not get JWT';
          storePersistentAuthData(
            encrypt(retrievedKeyStr, jwts.jwt),
            loginRes.pwEncryptedKeyPair,
            loginRes.threadIDStr,
            loginRes.pubKey,
            'password',
          );
          if (payload.redirectURL && payload.code) {
            const codeEncryptedKey = encrypt(retrievedKeyStr, payload.code);
            const outRedirectURL = payload.redirectURL + `?key_pair=${codeEncryptedKey}`;
            console.log(outRedirectURL);
            window.location.href = outRedirectURL;
          } else {
            storeNonPersistentAuthData(
              retrievedKey,
              jwts.jwt,
              ThreadID.fromString(loginRes.threadIDStr),
            );
            router.push('/home');
          }
          return 'Success';
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
      // store.commit.decksMod.CLEAR_STATE();
      // console.log(store.state.decksMod);
      // localStorage.setItem('vuex', '');
      router.push('/login/');
    },

    /** A quick ping to the server to see if the cookie is valid */
    async serverCheckAuth({
      state,
    }: ActionContext<AuthState, RootState>): Promise<boolean | undefined> {
      try {
        const options: AxiosRequestConfig = {
          url: state.API_URL + '/auth-check',
          headers: {
            'X-Forwarded-Proto': 'https',
          },
          method: 'GET',
          withCredentials: true,
        };
        const cookie = store.getters.authMod.cookies;
        console.log('check auth cookie:', cookie);
        if (!cookie) return false;
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

    async loadingPageAuthCheck(): Promise<null | undefined> {
      // possibilities:
      // case 1) has keypair (unlikely), case 2) has cookie and jwtEncryptedKeyPair. case 3) only has cookie. case 4) has neither
      // case 1)
      //  redirect to home or to external with key
      // problem. facebook redirect is going straight back to the eduvault app homepage without queries
      // case 2) from facebook login redirect or somehow otherwise has cookie but not jwtEncryptedKeyPair:
      //    use cookie to get keys, then redirect to home or external
      //                if not social media, can't decrypt keys. redirect to /login

      // case 3) returning:
      // if has jwtEncryptedKeyPair and cookie:
      //    if fromExternal: get jwt, decrypt and redirect
      //    if not: get person, full dehydrate, redirect home

      // case 4)
      // first time: no cookie, nothing --> redirect to /login

      // set up variables
      const queries = router.currentRoute.query;
      let [redirectURL, code] = [
        typeof queries.redirect_url === 'string' ? queries.redirect_url : undefined,
        typeof queries.code === 'string' ? queries.code : undefined,
      ];
      if (!redirectURL && !code) {
        const queriesSavedFromSocialMediaLogin = getQueriesForSocialMediaRedirect();
        if (queriesSavedFromSocialMediaLogin) {
          [redirectURL, code] = queriesSavedFromSocialMediaLogin;
          console.log('got redirect queries from local storage', { redirectURL, code });
        }
      }
      const fromExternal = !!redirectURL && !!code;
      const keyPair = store.state.authMod.keyPair;
      const jwtEncryptedKeyPair =
        store.state.authMod.jwtEncryptedKeyPair || localStorage.getItem('jwtEncryptedKeyPair');
      const threadIDStr = store.state.authMod.threadIDStr || localStorage.getItem('threadIDStr');
      const pubKey = store.state.authMod.pubKey || localStorage.getItem('pubKey');
      const pwEncryptedKeyPair =
        store.state.authMod.pwEncryptedKeyPair || localStorage.getItem('pwEncryptedKeyPair');
      const cookie = store.getters.authMod.cookies || Vue.$cookies.get('koa.sess');
      const toLoginPath = fromExternal
        ? `/login/?redirect_url=${redirectURL}&code=${code}`
        : '/login/';
      const toExternalPath = (keyPair: PrivateKey, threadIDStr: string) => {
        if (redirectURL && code)
          return `${redirectURL}/?key=${encrypt(
            keyPair.toString(),
            code,
          )}&thread_id=${threadIDStr}`;
        else return '';
      };
      console.log('loadingPageAuthCheck', {
        queries,
        state: store.state.authMod,
        keyPair,
        fromExternal,
        redirectURL,
        code,
        jwtEncryptedKeyPair,
        cookie,
        toLoginPath,
      });
      const hasKeyPair = (keyPair: PrivateKey, threadIDStr: string) => {
        console.log('case 1: has keyPair');
        if (fromExternal) {
          window.location.href = toExternalPath(keyPair, threadIDStr);
          return null;
        } else {
          // get person
          router.push('/home');
          return null;
        }
      };
      const onlyCookie = async () => {
        // if not social media, can't decrypt keys. redirect to /login
        // later we need to implement: person uses password to unlock locally stored
        console.log('case 2: only has valid cookie');
        if (store.state.authMod.authType == ('password' || 'metamask')) {
          router.push(toLoginPath);
          return null;
        }
        //    use cookie to get keys, then redirect to home or external
        const jwts = await store.dispatch.authMod.getJwt();
        if (jwts && jwts.jwt) store.commit.authMod.JWT(jwts.jwt);
        else {
          console.log('no jwts');
          router.push(toLoginPath);
          return null;
        }
        const person = await store.dispatch.authMod.getPerson();
        // once we have ability to rehydrate with password locally, insert here and get rid of check for socialMediaKeyPair
        if (person && person.socialMediaKeyPair && person.pubKey && person.threadIDStr) {
          await store.commit.personMod.PERSON(person);
          // decrypt and save keys
          const socialMediatype = person.dotwallet
            ? 'dotwallet'
            : person.facebook
            ? 'facebook'
            : person.google
            ? 'google'
            : undefined;
          const id = person.dotwallet?.person_open_id || person.facebook?.id || person.google?.id;
          if (id) {
            console.log({ socialMediaKeyPair: person.socialMediaKeyPair, id });

            const keyStr = decrypt(person.socialMediaKeyPair, id);
            if (!keyStr) {
              router.push(toLoginPath);
              return null;
            }
            const keys = await rehydratePrivateKey(keyStr);
            if (keys && testKeyPair(keys, person.pubKey)) {
              // success!
              storePersistentAuthData(
                encrypt(keyStr, jwts.jwt),
                undefined,
                person.threadIDStr,
                person.pubKey,
                socialMediatype,
              );
              if (fromExternal) {
                window.location.href = toExternalPath(keys, person.threadIDStr);
                return null;
              } else {
                storeNonPersistentAuthData(keys, jwts.jwt, ThreadID.fromString(person.threadIDStr));
                router.push('/home');
                return null;
              }
            } else {
              router.push(toLoginPath);
              return null;
            }
          } else {
            console.log('ID not found');
            router.push(toLoginPath);
            return null;
          }
        } else {
          console.log('could not get Person');
          router.push(toLoginPath);
          return null;
        }
      };
      const hasAllPersistentData = async (
        jwtEncryptedKeyPair: string,
        threadIDStr: string,
        pubKey: string,
      ) => {
        console.log('case 3: hasAllPersistentData');
        //    if fromExternal: get jwt, decrypt and redirect
        const jwts = await store.dispatch.authMod.getJwt();
        //save jwt
        if (jwts?.jwt) store.commit.authMod.JWT(jwts.jwt);
        //    if not: get person, full dehydrate, redirect home
        if (jwts && jwts.jwt) {
          // get jwt
          // try to decrypt
          console.log({ jwtEncryptedKeyPair, jwts });
          const keyStr = decrypt(jwtEncryptedKeyPair, jwts.jwt);
          if (!keyStr) {
            onlyCookie();
            return null;
          }
          let keys = await rehydratePrivateKey(keyStr);

          if (!keys && jwts.oldJwt) keys = await rehydratePrivateKey(keyStr);
          console.log({ keys });

          //should we test the keys better? might require getting ID
          if (keys && testKeyPair(keys, pubKey)) {
            storePersistentAuthData(encrypt(keyStr, jwts.jwt));
            if (fromExternal) {
              // success - redirect out
              window.location.href = toExternalPath(keys, threadIDStr);
              return null;
            } else {
              // check to make sure person isn't already there?
              const person = await store.dispatch.authMod.getPerson();
              if (person && person.accountID) {
                await store.commit.personMod.PERSON(person);
                storeNonPersistentAuthData(keys, jwts.jwt, ThreadID.fromString(threadIDStr));
                router.push('/home');
                return null;
              } else {
                router.push(toLoginPath);
                return null;
              }
            }
          } else {
            // failure, maybe it's a problem with the jwt decryption, we can fallback and try case 2
            onlyCookie();
            return null;
          }
        } else {
          router.push(toLoginPath);
          return null;
        }
      };
      try {
        if (keyPair && keyPair.canSign() && threadIDStr) hasKeyPair(keyPair, threadIDStr);
        else if (!jwtEncryptedKeyPair && cookie) onlyCookie();
        else if (jwtEncryptedKeyPair && cookie && threadIDStr && pubKey)
          hasAllPersistentData(jwtEncryptedKeyPair, threadIDStr, pubKey);
        // case 3.5) pwEncryptedKeyPair exists. prompt user to unlock with that.
        else if (!jwtEncryptedKeyPair && !cookie) {
          console.log('case 4');
          router.push(toLoginPath);
          return null;
        }
        // 5...
        else {
          console.log('mysterious case 5!');
          router.push(toLoginPath);
        }
      } catch (error) {
        console.log('error: ', error);
        router.push(toLoginPath);
      }
    },
    /** Get JWT and person info */
    async getPerson({ state }: ActionContext<AuthState, RootState>): Promise<IPerson | null> {
      try {
        const options: AxiosRequestConfig = {
          url: state.API_URL + '/get-person',
          headers: {
            'X-Forwarded-Proto': 'https',
          },
          method: 'GET',
          withCredentials: true,
        };
        const res = await axios(options);
        // console.log({ res });
        const resData: ApiRes<IPerson> = res.data;
        if (!resData || !resData.data.accountID) return null;
        else return resData.data;
      } catch (err) {
        console.log(err);
        return null;
      }
    } /** Get JWT and person info */,
    async getJwt({
      state,
    }: ActionContext<AuthState, RootState>): Promise<{
      jwt: string;
      oldJwt: string | null;
    } | null> {
      try {
        const options: AxiosRequestConfig = {
          url: state.API_URL + '/get-jwt',
          headers: {
            'X-Forwarded-Proto': 'https',
          },
          method: 'GET',
          withCredentials: true,
        };
        const res = await axios(options);
        const resData: ApiRes<{
          jwt: string;
          oldJwt: string | null;
        }> = res.data;
        console.log('get-jwt', res.data);
        if (!resData || !resData.data || !resData.data.jwt) return null;
        else return resData.data;
      } catch (err) {
        console.log(err);
        return null;
      }
    },

    openOAuthLink({ state }: ActionContext<AuthState, RootState>, authType: AuthState['authType']) {
      store.commit.authMod.AUTHTYPE(authType);
      // Google and facebook will cannot redirect back to the login app with the third party external app redirect info. Save in local storage for that case.
      setQueriesForSocialMediaRedirect();
      let authLink;
      switch (authType) {
        case 'facebook':
          authLink = FACEBOOK_AUTH;
          break;
        case 'google':
          authLink = GOOGLE_AUTH;
          break;
      }
      window.location.href =
        process.env.NODE_ENV === 'production'
          ? `https://${API_URL_ROOT}${authLink}`
          : `http://${DEV_API_URL_ROOT}${authLink}`;
    },
    // async initializeDB(
    //   { state }: ActionContext<AuthState, RootState>,
    //   payload: {
    //     jwt: string;
    //     keyPair: PrivateKey;
    //     threadID: ThreadID;
    //     retry: number;
    //   },
    // ) {
    //   console.log('payload.retry', payload.retry);
    //   if (payload.retry > 1) {
    //     alert('Error connecting to database');
    //   } else if (payload.jwt && payload.keyPair && payload.threadID) {
    //     try {
    //       const client = await startDB(
    //         state.API_WS_URL + '/ws/auth',
    //         payload.jwt,
    //         payload.keyPair,
    //         payload.threadID,
    //       );
    //       if (client) {
    //         // await store.commit.decksMod.CLIENT(client);
    //         // await store.dispatch.decksMod.setUpListening();
    //         // sync all remote instances with our local ones
    //         // await store.dispatch.decksMod.deckMergeToThread(store.state.decksMod.decks);
    //       } else throw 'unable to connect to Threads DB';
    //     } catch (err) {
    //       if (
    //         err == 'unable to connect to Threads DB' ||
    //         err == 'error connecting to ThreadDB client'
    //       ) {
    //         payload.retry++;
    //         store.dispatch.authMod.initializeDB(payload);
    //       }
    //       console.log(err);
    //     }
    //   } else {
    //     payload.retry++;
    //     store.dispatch.authMod.initializeDB(payload);
    //   }
    // },
  },
};
