full flow of encrypting/decrypting ID key pairs

```js
const keyPair = await Libp2pCryptoIdentity.fromRandom();
const pubKey = keyPair.public.toString();
const encrypedKeyPair = CryptoJS.AES.encrypt(keyPair.toString(), payload.password);
const encrypedKeyPairString = CryptoJS.AES.encrypt(keyPair.toString(), payload.password).toString();
// can decrypt from the object or the string
const decryptedKeyPairBytes = CryptoJS.AES.decrypt(
  encrypedKeyPair | encrypedKeyPairString,
  payload.password
);
const decryptedKeyPairString = decryptedKeyPairBytes.toString(CryptoJS.enc.Utf8);
const rehydratedKeyPair = await Libp2pCryptoIdentity.fromString(decryptedKeyPairString);
const testPubKey = rehydratedKeyPair.public.toString();
console.log(testPubKey === pubKey);
```

### Code we don't need unless we use the `Databse`

```ts
const connectDB = async (
  API_URL_ROOT: string,
  jwt: string,
  keyPair: Libp2pCryptoIdentity,
  DbInfo: DBInfo
): Promise<Database> => {
  // console.log(API_URL_ROOT, jwt, keyPair, threadID.toString());
  const loginCallback = loginWithChallenge(API_URL_ROOT, jwt, keyPair);
  const db = await Database.withUserAuth(await loginCallback(), 'eduvault.mvp.flashcards');
  await console.log('created db', db);
  //@ts-ignore
  console.log(DbInfo);
  if (!DbInfo) {
    const data = await store.dispatch.authMod.getUser();
    DbInfo = data.DbInfo;
  }
  if (!DbInfo) {
    await db.start(keyPair);
    console.log(db.threadID?.toString());
    const info = await db.getDBInfo(true);
    await console.log('DB INFO', info);
    console.log('start db', db);
    store.dispatch.authMod.uploadDBInfo(DbInfo);
  } else {
    await console.log('old Info present', DbInfo);
    //@ts-ignore
    await db.startFromInfo(keyPair, DBInfo);
    const info = await db.getDBInfo(true);
    await console.log('restored db info', info);
    await console.log('started db from old info', db);
  }
  const { collections } = await db;
  await console.log('collections', collections);
  await store.commit.authMod.DB(db);
  await console.log(`collections.has('Deck')`, await collections.has('Deck'));
  await console.log(
    `collections.get('Deck')?.toString()`,
    await collections.get('Deck')?.toString()
  );

  let deckCollection: Collection<Deck>;
  if (await collections.has('Deck')) {
    console.log('Deck Collection exists');
    deckCollection = collections.get('Deck') as Collection<Deck>;
  } else {
    console.log('deck collections doesnt exist');
    // const deckCollection = await db.newCollectionFromObject('Deck', defaultDeck);
    deckCollection = await db.newCollection<Deck>('Deck', deckSchema);
  }
  const defaultDeckExists = await deckCollection.has(defaultDeck._id);
  console.log(
    `
    deckCollection = await db.newCollection<Deck>('Deck', deckSchema)
    const defaultDeckExists = await deckCollection.has(defaultDeck._id);
    `,
    defaultDeckExists
  );
  if (!defaultDeckExists) {
    await deckCollection.insert(defaultDeck);
  }
  const defaultDeckSaved = await deckCollection.findById(defaultDeck._id);
  console.log('defaultDeck as looked up in DB', defaultDeckSaved);
  // const info = await db.getDBInfo(true);
  // await console.log('DB INFO', info);

  return db;
};

async function saveThreadIDtoServer(state: AuthState, threadIDStr: string) {
  const options = {
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    data: {
      threadIDStr,
    } as any,
  } as AxiosRequestConfig;
  const result = await axios(state.API_URL_ROOT + '/save-thread-id', options);
  console.log('save threadID', result.data);
  return ThreadID.fromString(result.data.data.threadIDStr);
}

    async uploadDBInfo({ state }: ActionContext<AuthState, RootState>, DbInfo: DBInfo) {
      try {
        const options = {
          url: state.API_URL_ROOT + '/upload-db-info',
          headers: { 'Access-Control-Allow-Origin': '*' },
          method: 'POST',
          withCredentials: true,
          data: { DbInfo: JSON.stringify(DbInfo) },
        } as AxiosRequestConfig;
        const response = await axios(options);
        console.log('dbinfo save results', response.data);
        if (!response.data || !response.data.data || !response.data.data.jwt) return null;
        else return response.data.data;
      } catch (err) {
        console.log(err);
        return null;
      }
    },
```
