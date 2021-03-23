import { types, AuthState, RootState } from '../types';
import { ActionContext, Getter } from 'vuex';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import store from '../store';
import router from '@/router';
import { ThreadID, PrivateKey } from '@textile/hub';
import {
  storePersistentAuthData,
  storeNonPersistentAuthData,
  testPrivateKey,
  rehydratePrivateKey,
  setQueriesForSocialMediaRedirect,
  getQueriesForSocialMediaRedirect,
  formatOutRedirectURL,
  utils,
} from './utils';
import { ROUTES, URL_API, API_WS, URL_APP } from '../config';
console.log({ URL_API, URL_APP });
// import { connectClient } from '../store/textileHelpers';
// import localForage from 'localforage';
import Vue from 'vue';
import Vuecookies from 'vue-cookies';
Vue.use(Vuecookies);
const { encrypt, decrypt, hash } = utils;

const defaultState: AuthState = {
  loggedIn: false,
  syncing: false,
  privateKey: undefined,
  authType: undefined,
  jwt: undefined,
  pubKey: undefined,
  threadID: undefined,
  threadIDStr: undefined,
  jwtEncryptedPrivateKey: undefined,
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
    PRIVATE_KEY(state: AuthState, privateKey: PrivateKey | undefined): void {
      state.privateKey = privateKey;
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
    PW_ENCRYPTED_PRIVATE_KEY(state: AuthState, pwEncryptedPrivateKey: string | undefined): void {
      if (pwEncryptedPrivateKey)
        localStorage.setItem('pwEncryptedPrivateKey', pwEncryptedPrivateKey);
      state.pwEncryptedPrivateKey = pwEncryptedPrivateKey;
    },
    JWT_ENCRYPTED_PRIVATE_KEY(state: AuthState, jwtEncryptedPrivateKey: string | undefined): void {
      if (jwtEncryptedPrivateKey)
        localStorage.setItem('jwtEncryptedPrivateKey', jwtEncryptedPrivateKey);
      state.jwtEncryptedPrivateKey = jwtEncryptedPrivateKey;
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
        username: string;
      },
    ): Promise<string | undefined> {
      console.log({ url: URL_API + ROUTES.PASSWORD_AUTH });
      try {
        const queries = router.currentRoute.query;
        const [redirectURL, appID] = [
          typeof queries.redirect_url === 'string' ? queries.redirect_url : undefined,
          typeof queries.app_id === 'string' ? queries.app_id : undefined,
        ];
        // new person info. generate each time, even if they are a returning person. if they are a returning person the server will just ignore this info. this lets us have a single endpoint for login/signup
        const privateKey = await PrivateKey.fromRandom();
        const pubKey = privateKey.public.toString();
        const pwEncryptedPrivateKey = encrypt(privateKey.toString(), payload.password);
        if (!pwEncryptedPrivateKey) throw 'error encrypting pwEncryptedPrivateKey';
        const newThreadID = ThreadID.fromRandom();

        const loginData: types.PasswordLoginReq = {
          username: payload.username,
          password: hash(payload.password),
          threadIDStr: newThreadID.toString(),
          pwEncryptedPrivateKey: pwEncryptedPrivateKey,
          pubKey: pubKey,
          redirectURL: redirectURL,
          appID: appID,
        };
        // console.log({ loginData });

        const options: AxiosRequestConfig = {
          url: URL_API + ROUTES.PASSWORD_AUTH,
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'X-Forwarded-Proto': 'https',
          },
          method: 'POST',
          data: loginData,
        };

        const response = await axios(options);
        const responseData: types.PasswordLoginRes = response.data;
        console.log({ responseHeaders: response.headers });
        console.log('login cookie: ' + JSON.stringify(Vue.$cookies.get('koa.sess')));
        console.log('login/signup data: ' + JSON.stringify(responseData));
        if (responseData.code !== 200) {
          if (responseData.message) return responseData.message;
          else return 'Unable to connect to database';
        } else {
          const loginRes = responseData.data;
          console.log('login result Data', loginRes);
          const keyStr = decrypt(loginRes.pwEncryptedPrivateKey, payload.password);
          if (!keyStr) return 'Could not decrypt PrivateKey';
          const retrievedKey = await rehydratePrivateKey(keyStr);
          if (!retrievedKey || !testPrivateKey(retrievedKey, loginRes.pubKey))
            return 'Could not retrieve PrivateKey';
          const jwts = await store.dispatch.authMod.getJwt();
          if (!jwts || !jwts.jwt) return 'could not get JWT';
          const {
            pwEncryptedPrivateKey,
            threadIDStr,
            pubKey,
            appLoginToken,
            decryptToken,
          } = loginRes;
          const jwtEncryptedPrivateKey = encrypt(keyStr, jwts.jwt);
          if (!jwtEncryptedPrivateKey) return 'error encrypting jwtEncryptedPrivateKey';
          storePersistentAuthData(
            jwtEncryptedPrivateKey,
            pwEncryptedPrivateKey,
            threadIDStr,
            pubKey,
            'password',
          );
          if (redirectURL && appID) {
            if (!appLoginToken || !decryptToken) console.log('app auth failed');
            else {
              const encryptedPrivateKey = encrypt(keyStr, decryptToken);
              if (!encryptedPrivateKey) return 'error encrypting encryptedPrivateKey';
              const outRedirectURL = formatOutRedirectURL({
                redirectURL,
                threadIDStr,
                pwEncryptedPrivateKey,
                encryptedPrivateKey,
                appLoginToken,
                pubKey,
              });
              console.log(outRedirectURL);
              window.location.href = outRedirectURL;
            }
          } else {
            storeNonPersistentAuthData(retrievedKey, jwts.jwt, ThreadID.fromString(threadIDStr));
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
        url: URL_API + ROUTES.LOGOUT,
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
          url: URL_API + ROUTES.AUTH_CHECK,
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
      // to do: get appLoginToken from social media login redirect

      // possibilities:
      // case 1) has privateKey (unlikely cause we don't persist it), case 2) has cookie and jwtEncryptedPrivateKey. case 3) only has cookie. case 4) has neither
      // case 1)
      //  redirect to home or to external with key
      // problem. facebook redirect is going straight back to the eduvault app homepage without queries
      // case 2) from facebook login redirect or somehow otherwise has cookie but not jwtEncryptedPrivateKey:
      //    use cookie to get keys, then redirect to home or external
      //                if not social media, can't decrypt keys. redirect to /login

      // case 3) returning:
      // if has jwtEncryptedPrivateKey and cookie:
      //    if fromExternal: get app loginToken and redirect
      //    if not: get person, full dehydrate, redirect home

      // case 4)
      // first time: no cookie, nothing --> redirect to /login

      // set up variables
      const queries = router.currentRoute.query;
      let [redirectURL, appID] = [
        typeof queries.redirect_url === 'string' ? queries.redirect_url : undefined,
        typeof queries.app_id === 'string' ? queries.app_id : undefined,
      ];
      if (!redirectURL && !appID) {
        const queriesSavedFromSocialMediaLogin = getQueriesForSocialMediaRedirect();
        if (queriesSavedFromSocialMediaLogin) {
          [redirectURL, appID] = queriesSavedFromSocialMediaLogin;
          console.log('got redirect queries from local storage', { redirectURL, appID });
        }
      }
      const fromExternal = !!redirectURL && !!appID;
      const privateKey = store.state.authMod.privateKey;
      const jwtEncryptedPrivateKey =
        store.state.authMod.jwtEncryptedPrivateKey ||
        localStorage.getItem('jwtEncryptedPrivateKey');
      const threadIDStr = store.state.authMod.threadIDStr || localStorage.getItem('threadIDStr');
      const pubKey = store.state.authMod.pubKey || localStorage.getItem('pubKey');
      const pwEncryptedPrivateKey =
        store.state.authMod.pwEncryptedPrivateKey || localStorage.getItem('pwEncryptedPrivateKey');
      const cookie = store.getters.authMod.cookies || Vue.$cookies.get('koa.sess');
      const toLoginPath = fromExternal
        ? `/login/?redirect_url=${redirectURL}&app_id=${appID}`
        : '/login/';

      const toExternalPath = (
        privateKey: PrivateKey,
        threadIDStr: string,
        decryptToken: string,
        appLoginToken: string,
      ) => {
        if (redirectURL && appID && pwEncryptedPrivateKey && pubKey) {
          const encryptedPrivateKey = encrypt(privateKey.toString(), decryptToken);
          if (!encryptedPrivateKey) return 'error encrypting encryptedPrivateKey';
          const outRedirectURL = formatOutRedirectURL({
            redirectURL,
            threadIDStr,
            pwEncryptedPrivateKey,
            encryptedPrivateKey,
            appLoginToken,
            pubKey,
          });
          console.log({ outRedirectURL });
          return outRedirectURL;
        } else return null;
      };
      console.log('loadingPageAuthCheck', {
        queries,
        state: store.state.authMod,
        privateKey,
        fromExternal,
        redirectURL,
        appID,
        jwtEncryptedPrivateKey,
        cookie,
        toLoginPath,
      });
      const hasPrivateKey = (privateKey: PrivateKey, threadIDStr: string) => {
        console.log('case 1: has privateKey');
        if (fromExternal) {
          // window.location.href = toExternalPath(privateKey, threadIDStr);
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
        // once we have ability to rehydrate with password locally, insert here and get rid of check for socialMediaPrivateKey
        if (person && person.socialMediaPrivateKey && person.pubKey && person.threadIDStr) {
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
            console.log({ socialMediaPrivateKey: person.socialMediaPrivateKey, id });

            const keyStr = decrypt(person.socialMediaPrivateKey, id);
            if (!keyStr) {
              router.push(toLoginPath);
              return null;
            }
            const keys = await rehydratePrivateKey(keyStr);
            if (keys && testPrivateKey(keys, person.pubKey)) {
              // success!
              const jwtEncryptedPrivateKey = encrypt(keyStr, jwts.jwt);
              if (!jwtEncryptedPrivateKey) return 'error encrypting jwtEncryptedPrivateKey';
              storePersistentAuthData(
                jwtEncryptedPrivateKey,
                undefined,
                person.threadIDStr,
                person.pubKey,
                socialMediatype,
              );
              // TO DO:
              // if (fromExternal) {
              //   window.location.href = toExternalPath(keys, person.threadIDStr);
              //   return null;
              // } else {
              storeNonPersistentAuthData(keys, jwts.jwt, ThreadID.fromString(person.threadIDStr));
              router.push('/home');
              return null;
              // }
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
        jwtEncryptedPrivateKey: string,
        threadIDStr: string,
        pubKey: string,
      ) => {
        console.log('case 3: hasAllPersistentData');

        if (fromExternal) {
          // TO DO!
          // if fromExternal: get appLoginToken and redirect toExternalPath(keys, threadIDStr);
          // need to create a new GetAppLoginToken API endpoint when authing app from here.
          // check that the person has authorized before
          router.push(toLoginPath);
        } else {
          const jwts = await store.dispatch.authMod.getJwt();
          //save jwt
          if (jwts?.jwt) store.commit.authMod.JWT(jwts.jwt);
          //    if not: get person, full dehydrate, redirect home
          if (jwts && jwts.jwt) {
            // get jwt
            // try to decrypt
            console.log({ jwtEncryptedPrivateKey, jwts });
            let keyStr = decrypt(jwtEncryptedPrivateKey, jwts.jwt);
            // use oldJWT if it didn't work
            if (!keyStr && jwts.oldJwt) keyStr = decrypt(jwtEncryptedPrivateKey, jwts.oldJwt);
            if (!keyStr) {
              onlyCookie();
              return null;
            }
            const keys = await rehydratePrivateKey(keyStr);
            console.log({ keys });

            //should we test the keys better? might require getting ID
            if (keys && testPrivateKey(keys, pubKey)) {
              const jwtEncryptedPrivateKey = encrypt(keyStr, jwts.jwt);
              if (!jwtEncryptedPrivateKey) return 'error encrypting jwtEncryptedPrivateKey';
              storePersistentAuthData(jwtEncryptedPrivateKey);
              // check to make sure person isn't already there?
              const person = await store.dispatch.authMod.getPerson();
              if (person && person.username) {
                await store.commit.personMod.PERSON(person);
                storeNonPersistentAuthData(keys, jwts.jwt, ThreadID.fromString(threadIDStr));
                router.push('/home');
                return null;
              } else {
                router.push(toLoginPath);
                return null;
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
        }
      };
      try {
        if (privateKey && privateKey.canSign() && threadIDStr)
          hasPrivateKey(privateKey, threadIDStr);
        else if (!jwtEncryptedPrivateKey && cookie) onlyCookie();
        else if (jwtEncryptedPrivateKey && cookie && threadIDStr && pubKey)
          hasAllPersistentData(jwtEncryptedPrivateKey, threadIDStr, pubKey);
        // case 3.5) pwEncryptedPrivateKey exists. prompt user to unlock with that.
        else if (!jwtEncryptedPrivateKey && !cookie) {
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
    async getPerson({ state }: ActionContext<AuthState, RootState>): Promise<types.IPerson | null> {
      try {
        const options: AxiosRequestConfig = {
          url: URL_API + ROUTES.GET_PERSON,
          headers: {
            'X-Forwarded-Proto': 'https',
          },
          method: 'GET',
          withCredentials: true,
        };
        const res = await axios(options);
        // console.log({ res });
        const resData: types.ApiRes<types.IPerson> = res.data;
        if (!resData || !resData.data.username) return null;
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
          url: URL_API + ROUTES.GET_JWT,
          headers: {
            'X-Forwarded-Proto': 'https',
          },
          method: 'GET',
          withCredentials: true,
        };
        const res = await axios(options);
        const resData: types.ApiRes<{
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
          authLink = ROUTES.FACEBOOK_AUTH;
          break;
        case 'google':
          authLink = ROUTES.GOOGLE_AUTH;
          break;
      }
      window.location.href = `${URL_APP}${authLink}`;
    },
    // async initializeDB(
    //   { state }: ActionContext<AuthState, RootState>,
    //   payload: {
    //     jwt: string;
    //     privateKey: PrivateKey;
    //     threadID: ThreadID;
    //     retry: number;
    //   },
    // ) {
    //   console.log('payload.retry', payload.retry);
    //   if (payload.retry > 1) {
    //     alert('Error connecting to database');
    //   } else if (payload.jwt && payload.privateKey && payload.threadID) {
    //     try {
    //       const client = await startDB(
    //         state.API_WS_URL + '/ws/auth',
    //         payload.jwt,
    //         payload.privateKey,
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
