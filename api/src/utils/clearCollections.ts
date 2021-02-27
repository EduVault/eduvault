import { Database } from '@textile/threaddb';
import { IPerson } from '../models/person';
import { IApp } from '../models/app';

export async function clearCollections(db: Database) {
  try {
    const personCollect = db.collection<IPerson>('person');
    // const personsBefore = await personCollect.find({});
    // console.log({ personsBefore: personsBefore.toArray() });
    await personCollect.clear();
    // const personsAfter = await personCollect.find({});
    // console.log({ personsAfter: personsAfter.toArray() });
    const constAppCollect = db.collection<IApp>('app');
    // const appsBefore = await constAppCollect.find({});
    // console.log({ appsBefore });
    await constAppCollect.clear();
    // const appsAfter = await constAppCollect.find({});
    // console.log({ appsBefore });
  } catch (error) {
    console.log({ error });
  }
}
