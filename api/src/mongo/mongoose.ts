import mongoose from 'mongoose';
import { MONGO_URI } from '../config';

const connectDb = () => {
  try {
    console.log('connecting');
    const db = mongoose.connection;
    mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    db.on('error', console.error);
    db.on('connected', () => console.log('connected to mongo'));
    db.on('diconnected', () => console.log('Mongo is disconnected'));
    db.on('open', () => console.log('Connection Made!'));
    return db;
  } catch (err) {
    console.log(err);
  }
};
export default connectDb;
