import mongoose from 'mongoose';
export function dropCollections() {
  try {
    mongoose.connection.collections['person'].drop(function (err: any) {
      console.log('+++++1person collection dropped++++', err);
    });
    mongoose.connection.collections['app'].drop(function (err: any) {
      console.log('+++++1app collection dropped++++', err);
    });
  } catch (error) {
    console.log({ error });
  }
}
