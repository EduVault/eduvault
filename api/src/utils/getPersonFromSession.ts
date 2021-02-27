import { Database } from '@textile/threaddb';
import { IPerson } from '../models/person';

export default async function getPerson(session: any, db: Database): Promise<IPerson | null> {
  try {
    // console.log('session', session);
    const person = await db.collection<IPerson>('person').findById(session.passport.user);
    // console.log('got person', person);
    if (person) {
      return person;
    } else {
      return null;
    }
  } catch (err) {
    console.log('err', err);
    return null;
  }
}
