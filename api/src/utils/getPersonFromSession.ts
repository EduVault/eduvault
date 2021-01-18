import Person, { IPerson } from '../models/person';

export default async function getPerson(session: any): Promise<IPerson | null> {
  try {
    console.log('session', session);
    const person = await Person.findById(session.passport.user);
    console.log('got person', person);
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
