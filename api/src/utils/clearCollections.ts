// import mongoose from 'mongoose';
import Person from '../models/person';
import App from '../models/person';

export async function clearCollections() {
  try {
    const personsBefore = await Person.find({});
    console.log({ personsBefore });
    await Person.remove({});
    const personsAfter = await Person.find({});
    console.log({ personsAfter });
    const appsBefore = await App.find({});
    console.log({ appsBefore });
    await App.remove({});
    const appsAfter = await App.find({});
    console.log({ appsBefore });
    // mongoose.connection.collections['person'].drop(async function (err: any) {
    //   console.log('+++++1person collection dropped++++', err);

    // });
    // mongoose.connection.collections['app'].drop(function (err: any) {
    //   console.log('+++++1app collection dropped++++', err);
    // });
  } catch (error) {
    console.log({ error });
  }
}
